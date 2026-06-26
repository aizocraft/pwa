// src/routes/sales.ts - Complete with all notifications
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
import SalesCustomerModel from '../models/SalesCustomer';
import QuotationModel, { generateQuoteNumber } from '../models/Quotation';
import InvoiceModel, { generateInvoiceNumber } from '../models/Invoice';
import ProductModel from '../models/Product';
import OrderModel from '../models/Order';
import { createAuditLog } from '../middleware/auditMiddleware';
import TransactionModel from '../models/Transaction';
import ShippingAreaModel from '../models/ShippingArea';
import PromoCodeModel from '../models/PromoCode';
import { CompanySettings } from '../models/CompanySettings';
import { sendQuotation, sendInvoice } from '../services/email.service';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';

const router = Router();

const isAdminOrSales = (user: any) => user && (user.role === 'admin' || user.role === 'sales');

const requireSalesRole = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || !isAdminOrSales(req.user)) {
    return res.status(403).json({ error: 'Sales/admin access required' });
  }
  next();
};

// Helper to send notifications to all admins
const notifyAdmins = async (title: string, message: string, actionUrl: string, metadata: any = {}) => {
  try {
    const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
    if (adminUsers.length > 0) {
      await Promise.all(adminUsers.map(admin =>
        createNotification({
          userId: admin._id.toString(),
          type: 'system',
          title,
          message,
          actionUrl,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
          }
        })
      ));
      console.log(`✅ Sales notification sent to ${adminUsers.length} admin(s): ${title}`);
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// Helper function to create order from invoice with profit tracking
async function createOrderFromInvoice(invoice: any, user: any, paymentMethod?: string) {
  try {
    if (invoice.orderId) {
      const existingOrder = await OrderModel.findById(invoice.orderId);
      if (existingOrder) return existingOrder;
    }

    // Check stock availability
    for (const item of invoice.items) {
      const product = await ProductModel.findById(item.productId).lean();
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`);
      }
    }

    // Deduct stock and prepare order items with profit tracking
    let totalCost = 0;
    let totalProfit = 0;
    const orderItems = [];

    for (const item of invoice.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) continue;
      
      const sellingPrice = Number(item.price);
      const buyingPrice = product.buyingPrice || 0;
      const profitPerItem = sellingPrice - buyingPrice;
      const itemCost = buyingPrice * item.qty;
      const itemProfit = profitPerItem * item.qty;
      
      totalCost += itemCost;
      totalProfit += itemProfit;
      
      orderItems.push({
        productId: item.productId,
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
        image: item.image || '',
        sellingPrice: sellingPrice,
        buyingPrice: buyingPrice,
        profit: profitPerItem,
        qty: Number(item.qty),
        description: item.description || ''
      });
      
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    const shippingAddress = {
      fullName: invoice.customerName,
      address1: invoice.customerLocation || 'To be provided',
      address2: '',
      city: 'Nairobi',
      state: 'KE',
      zip: '00000',
      country: 'KE',
      phone: invoice.customerPhone || '',
      email: invoice.customerEmail || ''
    };

    const transportCost = invoice.transportCost || invoice.transportInfo?.cost || 0;

    // ✅ Determine the correct payment method
    let orderPaymentMethod = paymentMethod || 'cod';

    // If no payment method was passed, try to get it from the invoice payments
    if (!paymentMethod && invoice.payments && invoice.payments.length > 0) {
      const lastPayment = invoice.payments[invoice.payments.length - 1];
      if (lastPayment.method) {
        const methodMap: Record<string, string> = {
          'mpesa': 'mpesa',
          'm-pesa': 'mpesa',
          'M-PESA': 'mpesa',
          'cash': 'cash',
          'bank_transfer': 'bank_transfer',
          'bank transfer': 'bank_transfer',
          'card': 'card',
          'credit card': 'card',
          'cheque': 'cheque'
        };
        orderPaymentMethod = methodMap[lastPayment.method.toLowerCase()] || 'cod';
      }
    }

    const order = await OrderModel.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      quotationId: invoice.quotationId,
      quotationNumber: invoice.quotationNumber,
      userId: invoice.customerId,
      salesCustomerId: invoice.customerId,
      items: orderItems,
      subtotal: invoice.subtotal,
      totalCost: totalCost,
      totalProfit: totalProfit,
      shippingCost: transportCost,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      paymentMethod: orderPaymentMethod, // ✅ Now uses the correct payment method
      paymentStatus: invoice.paymentStatus,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      status: invoice.paymentStatus === 'paid' ? 'processing' : 'pending',
      shippingAddress,
      notes: `Order created from invoice ${invoice.invoiceNumber}\n\n${invoice.notes || ''}`,
      createdBy: user?.userId,
      paymentDetails: invoice.amountPaid > 0 ? {
        paidAt: invoice.payments[invoice.payments.length - 1]?.date || new Date(),
        transactionId: invoice.payments[invoice.payments.length - 1]?.transactionId
      } : undefined
    });

    invoice.orderId = order._id;
    invoice.orderCreatedAt = new Date();
    await invoice.save();

    if (invoice.payments.length > 0) {
      for (const payment of invoice.payments) {
        if (payment.transactionId) {
          await TransactionModel.findOneAndUpdate(
            { transactionId: payment.transactionId },
            { orderId: order._id }
          );
        }
      }
    }

    return order;
  } catch (error: any) {
    console.error('Auto-create order error:', error);
    return null;
  }
}

// =====================
// Customers with Notifications
// =====================

router.post('/customers', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, email, phone, location, notes, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : undefined;
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : undefined;

    const existing = await SalesCustomerModel.findOne({
      $or: [
        normalizedEmail ? { email: normalizedEmail } : null,
        normalizedPhone ? { phone: normalizedPhone } : null,
      ].filter(Boolean) as any
    });

    if (existing) {
      return res.status(409).json({ error: 'Customer already exists', customerId: existing._id });
    }

    const customer = await SalesCustomerModel.create({
      user: req.user!.userId,
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      location,
      notes,
      status: status || 'active',
      totalSpent: 0,
      createdBy: req.user!.userId,
    });

    await createAuditLog(req as any, {
      action: 'create',
      resource: 'customer',
      resourceId: customer._id.toString(),
      details: `Sales customer created: ${customer.name}`,
      skipIfNoUser: false,
    });

    // ✅ NOTIFICATION: New customer created
    await notifyAdmins(
      '👤 New Customer Added',
      `${req.user.email || req.user.name} added customer: ${customer.name}`,
      `/dashboard/sales/customers/${customer._id}`,
      {
        action: 'create_customer',
        createdBy: req.user.email || req.user.name,
        customerId: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerLocation: customer.location
      }
    );

    res.status(201).json({ customer });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.get('/customers', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const q: any = {};
    if (status) q.status = status;
    if (search && typeof search === 'string') {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      SalesCustomerModel.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      SalesCustomerModel.countDocuments(q),
    ]);

    res.json({
      customers,
      pagination: { current: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.patch('/customers/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const { name, email, phone, location, notes, status } = req.body;

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const changes: string[] = [];
    if (name !== undefined && name !== customer.name) changes.push(`name: "${customer.name}" → "${name}"`);
    if (email !== undefined && email !== customer.email) changes.push(`email: "${customer.email}" → "${email}"`);
    if (phone !== undefined && phone !== customer.phone) changes.push(`phone: "${customer.phone}" → "${phone}"`);
    if (location !== undefined && location !== customer.location) changes.push(`location updated`);
    if (notes !== undefined && notes !== customer.notes) changes.push(`notes updated`);
    if (status !== undefined && status !== customer.status) changes.push(`status: ${customer.status} → ${status}`);

    if (name !== undefined) customer.name = String(name).trim();
    if (email !== undefined) customer.email = typeof email === 'string' ? email.toLowerCase().trim() : undefined;
    if (phone !== undefined) customer.phone = typeof phone === 'string' ? phone.trim() : undefined;
    if (location !== undefined) customer.location = location;
    if (notes !== undefined) customer.notes = notes;
    if (status !== undefined) customer.status = status;

    await customer.save();

    // ✅ NOTIFICATION: Customer updated
    if (changes.length > 0) {
      await notifyAdmins(
        '✏️ Customer Updated',
        `${req.user.email || req.user.name} updated customer "${customer.name}": ${changes.join(', ')}`,
        `/dashboard/sales/customers/${customer._id}`,
        {
          action: 'update_customer',
          updatedBy: req.user.email || req.user.name,
          customerId: customer._id,
          customerName: customer.name,
          changes
        }
      );
    }

    res.json({ customer });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// =====================
// Quotations with Notifications
// =====================

router.post('/quotations', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const {
      customerId,
      items,
      discount,
      discountType,
      notes,
      terms,
      validUntil,
      taxPerItem,
      transport,
      estimatedDelivery
    } = req.body;

    if (!customerId) return res.status(400).json({ error: 'customerId is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }

    const customer = await SalesCustomerModel.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

   // if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
    //  return res.status(403).json({ error: 'Not allowed for this customer' });
  //  }

    const settings = await CompanySettings.findOne();
    const taxRate = settings?.taxRate ?? 0.16;
    const taxExemptCategories = (settings?.taxExemptCategories || []).map((c: string) => String(c).trim());

    let subtotal = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalItemTax = 0;
    const processedItems = [];

    for (const it of items) {
      const product = await ProductModel.findById(it.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${it.productId}` });
      }
      
      const price = typeof it.customPrice === 'number' ? it.customPrice : (it.price ?? product.price);
      const buyingPrice = product.buyingPrice || 0;
      const qty = Number(it.qty);
      const itemTotal = price * qty;
      const itemCost = buyingPrice * qty;
      const itemProfit = (price - buyingPrice) * qty;
      
      subtotal += itemTotal;
      totalCost += itemCost;
      totalProfit += itemProfit;
      
      let itemTax = 0;
      const productCategory = product.category;
      const isCategoryExempt = productCategory && taxExemptCategories.includes(String(productCategory).trim());
      const isTaxable = it.taxable !== false && !isCategoryExempt;
      if (taxPerItem && isTaxable) {
        itemTax = itemTotal * taxRate;
        totalItemTax += itemTax;
      }
      
      processedItems.push({
        productId: product._id,
        name: it.name && it.name.trim() ? it.name : product.name, 
        slug: product.slug,
        qty,
        price,
        buyingPrice: buyingPrice,
        profitPerItem: price - buyingPrice,
        totalProfit: itemProfit,
        total: itemTotal,
        tax: itemTax,
        customPrice: it.customPrice !== undefined,
        taxable: isTaxable,
        image: product.images && product.images.length > 0 
          ? (product.images[0].url || (product.images[0].fileId ? product.images[0].fileId.toString() : ''))
          : '',
        description: product.description || ''
      });
    }

    const discountAmount = discountType === 'percentage' 
      ? subtotal * (discount / 100)
      : (discount || 0);
    
    let tax = 0;
    if (taxPerItem) {
      tax = totalItemTax;
    } else {
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      tax = taxableAmount * taxRate;
    }
    
    const transportCost = transport?.cost || 0;
    const transportDescription = transport?.description || '';

    const transportInfo = (transportCost > 0 || transportDescription) ? {
      cost: transportCost,
      description: transportDescription
    } : undefined;
    
    const total = subtotal - discountAmount + tax + transportCost;
    const quoteNumber = await generateQuoteNumber();
    const validUntilDate = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const quote = await QuotationModel.create({
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerLocation: customer.location,
      createdBy: req.user!.userId,
      createdByName: req.user!.name || req.user!.email,
      items: processedItems,
      subtotal,
      totalCost,
      totalProfit,
      taxRate,
      tax,
      taxPerItem: taxPerItem || false,
      discount: discountAmount,
      discountType: discountType || 'fixed',
      transportInfo,
      transportCost,
      transportDescription,
      estimatedDelivery,
      total,
      quoteNumber,
      status: 'draft',
      validUntil: validUntilDate,
      notes,
      terms
    });

    await createAuditLog(req as any, {
      action: 'create',
      resource: 'quotation',
      resourceId: quote._id.toString(),
      details: `Quotation created: ${quote.quoteNumber} for ${quote.customerName}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: New quotation created
    await notifyAdmins(
      '📄 New Quotation Created',
      `${req.user.email || req.user.name} created quotation ${quoteNumber} for ${customer.name} (KES ${total.toLocaleString()})`,
      `/dashboard/sales/quotations/${quote._id}`,
      {
        action: 'create_quotation',
        createdBy: req.user.email || req.user.name,
        quotationId: quote._id,
        quoteNumber,
        customerId: customer._id,
        customerName: customer.name,
        total,
        itemCount: processedItems.length
      }
    );

    const populatedQuote = await QuotationModel.findById(quote._id).lean();
    
    res.status(201).json({ success: true, quotation: populatedQuote });
  } catch (error: any) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create quotation' });
  }
});

// GET /api/sales/quotations - List quotations
router.get('/quotations', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { search, status, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [quotations, total] = await Promise.all([
      QuotationModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(l)
        .lean(),
      QuotationModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      quotations,
      pagination: {
        current: p,
        limit: l,
        total,
        pages: Math.ceil(total / l)
      }
    });
  } catch (error: any) {
    console.error('Fetch quotations error:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// GET /api/sales/quotations/:id - Get single quotation
router.get('/quotations/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id).lean();
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, quotation });
  } catch (error: any) {
    console.error('Fetch quotation error:', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
});

// PATCH /api/sales/quotations/:id - Update quotation
router.patch('/quotations/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const { 
      status, notes, terms, items, discount, discountType, validUntil, 
      taxPerItem, transport, estimatedDelivery 
    } = req.body;

    const changes: string[] = [];

    if (status && ['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
      if (status !== quotation.status) {
        changes.push(`status: ${quotation.status} → ${status}`);
      }
      if (status === 'sent' && quotation.status !== 'sent') quotation.sentAt = new Date();
      if (status === 'accepted' && quotation.status !== 'accepted') {
        quotation.acceptedAt = new Date();
      }
      if (status === 'rejected' && quotation.status !== 'rejected') quotation.rejectedAt = new Date();
      quotation.status = status;
    }
    
    if (notes !== undefined && notes !== quotation.notes) changes.push('notes updated');
    if (notes !== undefined) quotation.notes = notes;
    if (terms !== undefined && terms !== quotation.terms) changes.push('terms updated');
    if (terms !== undefined) quotation.terms = terms;
    if (validUntil !== undefined) quotation.validUntil = new Date(validUntil);
    if (discount !== undefined) quotation.discount = discount;
    if (discountType !== undefined) quotation.discountType = discountType;
    if (taxPerItem !== undefined) quotation.taxPerItem = taxPerItem;
    if (estimatedDelivery !== undefined) quotation.estimatedDelivery = estimatedDelivery;
    
    if (transport !== undefined) {
      if (transport.cost > 0 || transport.description) {
        quotation.transportInfo = {
          cost: transport.cost || 0,
          description: transport.description || ''
        };
        quotation.transportCost = transport.cost || 0;
        quotation.transportDescription = transport.description || '';
        changes.push('transport info updated');
      } else {
        quotation.transportInfo = undefined;
        quotation.transportCost = 0;
        quotation.transportDescription = '';
      }
    }

    if (items && Array.isArray(items)) {
      changes.push('items updated');
      const settings = await CompanySettings.findOne();
      const taxRate = settings?.taxRate ?? 0.16;
      const taxExemptCategories = (settings?.taxExemptCategories || []).map((c: string) => String(c).trim());

      const updatedItems = [];
      let subtotal = 0;
      let totalCost = 0;
      let totalProfit = 0;
      let totalItemTax = 0;
      
      for (const it of items) {
        const product = await ProductModel.findById(it.productId);
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${it.productId}` });
        }
        const price = it.customPrice || it.price || product.price;
        const buyingPrice = product.buyingPrice || 0;
        const qty = Number(it.qty);
        const itemTotal = price * qty;
        const itemCost = buyingPrice * qty;
        const itemProfit = (price - buyingPrice) * qty;
        
        subtotal += itemTotal;
        totalCost += itemCost;
        totalProfit += itemProfit;
        
        let itemTax = 0;
        const productCategory = product.category;
        const isCategoryExempt = productCategory && taxExemptCategories.includes(String(productCategory).trim());
        const isTaxable = it.taxable !== false && !isCategoryExempt;
        if (quotation.taxPerItem && isTaxable) {
          itemTax = itemTotal * taxRate;
          totalItemTax += itemTax;
        }
        
        updatedItems.push({
          productId: product._id,
          name: it.name && it.name.trim() ? it.name : product.name, 
          slug: product.slug,
          qty,
          price,
          buyingPrice: buyingPrice,
          profitPerItem: price - buyingPrice,
          totalProfit: itemProfit,
          total: itemTotal,
          tax: itemTax,
          customPrice: it.customPrice !== undefined,
          taxable: isTaxable,
          image: product.images && product.images.length > 0 
            ? (product.images[0].url || (product.images[0].fileId ? product.images[0].fileId.toString() : ''))
            : '',
          description: product.description || ''
        });
      }
      
      quotation.items = updatedItems;
      quotation.subtotal = subtotal;
      quotation.totalCost = totalCost;
      quotation.totalProfit = totalProfit;
      
      const discountAmount = quotation.discountType === 'percentage' 
        ? subtotal * (quotation.discount / 100)
        : quotation.discount;
      
      if (quotation.taxPerItem) {
        quotation.tax = totalItemTax;
      } else {
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        quotation.tax = taxableAmount * taxRate;
      }
      
      const transportCost = quotation.transportCost || 0;
      quotation.total = subtotal - discountAmount + quotation.tax + transportCost;
    }

    await quotation.save();

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation updated: ${quotation.quoteNumber}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Quotation updated (only if significant changes)
    if (changes.length > 0) {
      await notifyAdmins(
        '✏️ Quotation Updated',
        `${req.user.email || req.user.name} updated quotation ${quotation.quoteNumber}: ${changes.join(', ')}`,
        `/dashboard/sales/quotations/${quotation._id}`,
        {
          action: 'update_quotation',
          updatedBy: req.user.email || req.user.name,
          quotationId: quotation._id,
          quoteNumber: quotation.quoteNumber,
          changes
        }
      );
    }

    const updatedQuote = await QuotationModel.findById(quotation._id).lean();
    res.json({ success: true, quotation: updatedQuote });
  } catch (error: any) {
    console.error('Update quotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to update quotation' });
  }
});

// POST /api/sales/quotations/:id/send - Send quotation email
router.post('/quotations/:id/send', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id).lean();
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    if (!quotation.customerEmail) {
      return res.status(400).json({ error: 'Customer has no email address' });
    }

    const emailResult = await sendQuotation({
      to: quotation.customerEmail,
      customerName: quotation.customerName,
      quoteNumber: quotation.quoteNumber,
      quoteTotal: quotation.total,
      validUntil: quotation.validUntil,
      items: quotation.items.map((item: any) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        tax: item.tax,
        description: item.description
      })),
      taxPerItem: quotation.taxPerItem,
      transportInfo: quotation.transportInfo || (quotation.transportCost ? { cost: quotation.transportCost, description: quotation.transportDescription } : undefined),
      estimatedDelivery: quotation.estimatedDelivery,
      discount: quotation.discount,
      discountType: quotation.discountType,
      tax: quotation.tax,
      subtotal: quotation.subtotal,
      notes: quotation.notes,
      terms: quotation.terms
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return res.status(500).json({ error: emailResult.error || 'Failed to send email' });
    }

    if (quotation.status === 'draft') {
      await QuotationModel.updateOne(
        { _id: quotation._id },
        { status: 'sent', sentAt: new Date() }
      );
    }

    await createAuditLog(req as any, {
      action: 'send',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation sent to ${quotation.customerEmail}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Quotation sent
    await notifyAdmins(
      '✉️ Quotation Sent',
      `Quotation ${quotation.quoteNumber} sent to ${quotation.customerEmail} for ${quotation.customerName}`,
      `/dashboard/sales/quotations/${quotation._id}`,
      {
        action: 'send_quotation',
        sentBy: req.user.email || req.user.name,
        quotationId: quotation._id,
        quoteNumber: quotation.quoteNumber,
        customerEmail: quotation.customerEmail,
        customerName: quotation.customerName
      }
    );

    res.json({ 
      success: true, 
      message: 'Quotation sent successfully via email',
      emailResult: { messageId: emailResult.messageId }
    });
  } catch (error: any) {
    console.error('Send quotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to send quotation' });
  }
});

// POST /api/sales/quotations/:id/accept - Accept quotation and create invoice
router.post('/quotations/:id/accept', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    if (quotation.status !== 'sent' && quotation.status !== 'draft') {
      return res.status(400).json({ error: `Cannot accept quotation with status: ${quotation.status}` });
    }

    if (new Date() > new Date(quotation.validUntil)) {
      quotation.status = 'expired';
      await quotation.save();
      
      // ✅ NOTIFICATION: Quotation expired
      await notifyAdmins(
        '⏰ Quotation Expired',
        `Quotation ${quotation.quoteNumber} for ${quotation.customerName} has expired.`,
        `/dashboard/sales/quotations/${quotation._id}`,
        {
          action: 'quotation_expired',
          quotationId: quotation._id,
          quoteNumber: quotation.quoteNumber,
          customerName: quotation.customerName,
          validUntil: quotation.validUntil
        }
      );
      
      return res.status(400).json({ error: 'Quotation has expired' });
    }

    quotation.status = 'accepted';
    quotation.acceptedAt = new Date();
    await quotation.save();

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await InvoiceModel.create({
      quotationId: quotation._id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone,
      customerLocation: quotation.customerLocation,
      createdBy: req.user!.userId,
      createdByName: req.user!.name || req.user!.email,
      items: quotation.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        qty: item.qty,
        price: item.price,
        buyingPrice: item.buyingPrice,
        profitPerItem: item.profitPerItem,
        totalProfit: item.totalProfit,
        total: item.total,
        tax: item.tax,
        taxable: item.taxable,
        description: item.description
      })),
      subtotal: quotation.subtotal,
      totalCost: quotation.totalCost,
      totalProfit: quotation.totalProfit,
      taxRate: quotation.taxRate,
      tax: quotation.tax,
      taxPerItem: quotation.taxPerItem,
      discount: quotation.discount,
      discountType: quotation.discountType,
      transportInfo: quotation.transportInfo,
      transportCost: quotation.transportCost,
      transportDescription: quotation.transportDescription,
      total: quotation.total,
      invoiceNumber,
      status: 'sent',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      balanceDue: quotation.total,
      issueDate: new Date(),
      dueDate,
      notes: `Invoice generated from accepted quotation ${quotation.quoteNumber}\n\n${quotation.notes || ''}`,
      terms: quotation.terms,
      sentAt: new Date()
    });

    await createAuditLog(req as any, {
      action: 'accept',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation ${quotation.quoteNumber} accepted and invoice ${invoiceNumber} created`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Quotation accepted and invoice created
    await notifyAdmins(
      '✅ Quotation Accepted & Invoice Created',
      `${req.user.email || req.user.name} accepted quotation ${quotation.quoteNumber} from ${quotation.customerName}. Invoice ${invoiceNumber} created for KES ${quotation.total.toLocaleString()}`,
      `/dashboard/sales/invoices/${invoice._id}`,
      {
        action: 'accept_quotation',
        acceptedBy: req.user.email || req.user.name,
        quotationId: quotation._id,
        quoteNumber: quotation.quoteNumber,
        invoiceId: invoice._id,
        invoiceNumber,
        customerName: quotation.customerName,
        total: quotation.total
      }
    );

    res.json({
      success: true,
      message: 'Quotation accepted and invoice created',
      quotation: {
        _id: quotation._id,
        quoteNumber: quotation.quoteNumber,
        status: quotation.status,
        acceptedAt: quotation.acceptedAt
      },
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        balanceDue: invoice.balanceDue,
        dueDate: invoice.dueDate
      }
    });
  } catch (error: any) {
    console.error('Accept quotation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to accept quotation',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/sales/quotations/:id - Delete quotation
router.delete('/quotations/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const quoteNumber = quotation.quoteNumber;
    const customerName = quotation.customerName;

    await QuotationModel.deleteOne({ _id: quotation._id });

    await createAuditLog(req as any, {
      action: 'delete',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation deleted: ${quoteNumber}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Quotation deleted
    await notifyAdmins(
      '🗑️ Quotation Deleted',
      `${req.user.email || req.user.name} deleted quotation ${quoteNumber} for ${customerName}`,
      '/dashboard/sales/quotations',
      {
        action: 'delete_quotation',
        deletedBy: req.user.email || req.user.name,
        quotationId: id,
        quoteNumber,
        customerName
      }
    );

    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error: any) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
});

// POST /api/sales/quotations/:id/create-invoice - Create new invoice from edited accepted quotation
router.post('/quotations/:id/create-invoice', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    if (quotation.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only create invoice from accepted quotations' });
    }

    if (!quotation.items || quotation.items.length === 0) {
      return res.status(400).json({ error: 'Quotation has no items' });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await InvoiceModel.create({
      quotationId: quotation._id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone,
      customerLocation: quotation.customerLocation,
      createdBy: req.user!.userId,
      createdByName: req.user!.name || req.user!.email,
      items: quotation.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        qty: item.qty,
        price: item.price,
        buyingPrice: item.buyingPrice || 0,
        profitPerItem: item.profitPerItem || (item.price - (item.buyingPrice || 0)),
        totalProfit: item.totalProfit || ((item.price - (item.buyingPrice || 0)) * item.qty),
        total: item.total || (item.price * item.qty),
        tax: item.tax || 0,
        taxable: item.taxable !== false,
        description: item.description || ''
      })),
      subtotal: quotation.subtotal,
      totalCost: quotation.totalCost || 0,
      totalProfit: quotation.totalProfit || 0,
      taxRate: quotation.taxRate,
      tax: quotation.tax,
      taxPerItem: quotation.taxPerItem || false,
      discount: quotation.discount,
      discountType: quotation.discountType || 'fixed',
      transportInfo: quotation.transportInfo,
      transportCost: quotation.transportCost || 0,
      transportDescription: quotation.transportDescription || '',
      total: quotation.total,
      invoiceNumber,
      status: 'sent',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      balanceDue: quotation.total,
      issueDate: new Date(),
      dueDate,
      notes: `Invoice created from edited accepted quotation ${quotation.quoteNumber}\n\nOriginal quotation was accepted on ${quotation.acceptedAt?.toLocaleDateString()}\n\n${quotation.notes || ''}`,
      terms: quotation.terms,
      sentAt: new Date()
    });

    quotation.invoiceId = invoice._id;
    quotation.invoiceNumber = invoice.invoiceNumber;
    quotation.lastInvoiceCreatedAt = new Date();
    await quotation.save();

    await createAuditLog(req as any, {
      action: 'create',
      resource: 'invoice',
      resourceId: invoice._id.toString(),
      details: `New invoice ${invoiceNumber} created from edited accepted quotation ${quotation.quoteNumber}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: New invoice created from edited quotation
    await notifyAdmins(
      '🧾 New Invoice Created from Quotation',
      `${req.user.email || req.user.name} created invoice ${invoiceNumber} for ${quotation.customerName} from edited accepted quotation ${quotation.quoteNumber} (KES ${quotation.total.toLocaleString()})`,
      `/dashboard/sales/invoices/${invoice._id}`,
      {
        action: 'create_invoice_from_quotation',
        createdBy: req.user.email || req.user.name,
        quotationId: quotation._id,
        quoteNumber: quotation.quoteNumber,
        invoiceId: invoice._id,
        invoiceNumber,
        customerName: quotation.customerName,
        total: quotation.total
      }
    );

    res.json({
      success: true,
      message: 'New invoice created successfully from quotation',
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        balanceDue: invoice.balanceDue,
        dueDate: invoice.dueDate
      },
      quotation: {
        _id: quotation._id,
        quoteNumber: quotation.quoteNumber,
        invoiceId: quotation.invoiceId,
        invoiceNumber: quotation.invoiceNumber
      }
    });
  } catch (error: any) {
    console.error('Create invoice from quotation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create invoice from quotation',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// =====================
// Invoices with Notifications
// =====================

router.get('/invoices', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { search, status, paymentStatus, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate as string);
      if (endDate) query.issueDate.$lte = new Date(endDate as string);
    }
    
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { quotationNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(l)
        .lean(),
      InvoiceModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      invoices,
      pagination: {
        current: p,
        limit: l,
        total,
        pages: Math.ceil(total / l)
      }
    });
  } catch (error: any) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/invoices/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await InvoiceModel.findById(id).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (req.user!.role === 'sales' && invoice.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, invoice });
  } catch (error: any) {
    console.error('Fetch invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.post('/invoices/:id/send', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await InvoiceModel.findById(id).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (req.user!.role === 'sales' && invoice.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    if (!invoice.customerEmail) {
      return res.status(400).json({ error: 'Customer has no email address' });
    }

    const emailResult = await sendInvoice({
      to: invoice.customerEmail,
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      invoiceTotal: invoice.total,
      dueDate: invoice.dueDate,
      items: invoice.items.map((item: any) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        tax: item.tax,
        description: item.description
      })),
      taxPerItem: invoice.taxPerItem,
      transportInfo: invoice.transportInfo ? { cost: invoice.transportCost || 0, description: invoice.transportDescription || '' } : undefined,
      discount: invoice.discount,
      discountType: invoice.discountType,
      tax: invoice.tax,
      subtotal: invoice.subtotal,
      notes: invoice.notes,
      terms: invoice.terms,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return res.status(500).json({ error: emailResult.error || 'Failed to send email' });
    }

    await InvoiceModel.updateOne(
      { _id: invoice._id },
      { sentAt: new Date() }
    );

    await createAuditLog(req as any, {
      action: 'send',
      resource: 'invoice',
      resourceId: invoice._id.toString(),
      details: `Invoice sent to ${invoice.customerEmail}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Invoice sent
    await notifyAdmins(
      '✉️ Invoice Sent',
      `Invoice ${invoice.invoiceNumber} sent to ${invoice.customerEmail} for ${invoice.customerName} (KES ${invoice.total.toLocaleString()})`,
      `/dashboard/sales/invoices/${invoice._id}`,
      {
        action: 'send_invoice',
        sentBy: req.user.email || req.user.name,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerEmail: invoice.customerEmail,
        customerName: invoice.customerName,
        total: invoice.total
      }
    );

    res.json({ 
      success: true, 
      message: 'Invoice sent successfully via email'
    });
  } catch (error: any) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to send invoice' });
  }
});

// Record payment
router.post('/invoices/:id/payments', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, method, reference, notes } = req.body;

    console.log(`📝 Recording payment for invoice ${id}:`, { amount, method, reference });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (req.user!.role === 'sales' && invoice.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    if (paymentAmount > invoice.balanceDue) {
      return res.status(400).json({ 
        error: `Payment amount exceeds balance due. Balance: KES ${invoice.balanceDue.toLocaleString()}` 
      });
    }

    const transactionId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Add payment to invoice
    invoice.payments.push({
      amount: paymentAmount,
      method,
      reference,
      date: new Date(),
      recordedBy: req.user!.userId,
      transactionId: transactionId
    });

    invoice.amountPaid = (invoice.amountPaid || 0) + paymentAmount;
    invoice.balanceDue = Math.max(0, invoice.total - invoice.amountPaid);

    const oldPaymentStatus = invoice.paymentStatus;
    if (invoice.amountPaid === 0) {
      invoice.paymentStatus = 'unpaid';
    } else if (invoice.amountPaid < invoice.total) {
      invoice.paymentStatus = 'partially_paid';
      if (invoice.status === 'sent') {
        invoice.status = 'partially_paid';
      }
    } else if (invoice.amountPaid >= invoice.total) {
      invoice.paymentStatus = 'paid';
      invoice.status = 'paid';
    }

    await invoice.save();

    console.log(`✅ Invoice ${invoice.invoiceNumber} updated: amountPaid=${invoice.amountPaid}, balanceDue=${invoice.balanceDue}, status=${invoice.paymentStatus}`);

    // ✅ Create transaction with source: 'invoice' and include invoiceId
    let createdTransaction = null;
    try {
      const methodMap: Record<string, string> = {
        'mpesa': 'mpesa',
        'm-pesa': 'mpesa',
        'M-PESA': 'mpesa',
        'cash': 'cash',
        'bank_transfer': 'bank_transfer',
        'bank transfer': 'bank_transfer',
        'card': 'card',
        'credit card': 'card',
        'cheque': 'cheque'
      };
      
      const txPaymentMethod = methodMap[method?.toLowerCase()] || 'cash';

      createdTransaction = await TransactionModel.create({
        orderId: invoice.orderId || null,
        invoiceId: invoice._id, // ✅ Now this field exists in the schema
        invoiceNumber: invoice.invoiceNumber,
        quotationNumber: invoice.quotationNumber,
        userId: invoice.customerId,
        customerName: invoice.customerName,
        guestEmail: invoice.customerEmail,
        guestPhone: invoice.customerPhone,
        amount: paymentAmount,
        currency: 'KES',
        paymentMethod: txPaymentMethod,
        status: 'completed',
        transactionId: transactionId,
        reference: reference || null,
        notes: notes || `Payment recorded for invoice ${invoice.invoiceNumber}`,
        recordedBy: req.user!.userId,
        recordedByName: req.user!.name || req.user!.email,
        source: 'invoice', // ✅ Now 'invoice' is valid in the enum
        isPartialPayment: paymentAmount < invoice.balanceDue || paymentAmount < invoice.total,
        paidAt: new Date()
      });

      console.log(`✅ Transaction created: ${transactionId} for invoice ${invoice.invoiceNumber}`);
    } catch (txError: any) {
      console.error('❌ Transaction creation failed:', txError.message);
    }

    // ✅ Create order if invoice is fully paid - PASS THE PAYMENT METHOD
    let createdOrder = null;
    if (invoice.paymentStatus === 'paid' && !invoice.orderId) {
      try {
        // ✅ Pass the payment method to createOrderFromInvoice
        createdOrder = await createOrderFromInvoice(invoice, req.user, method);
        
        if (createdOrder) {
          // ✅ Update the transaction with the orderId
          if (createdTransaction) {
            await TransactionModel.findByIdAndUpdate(createdTransaction._id, {
              orderId: createdOrder._id
            });
          }
          
          await notifyAdmins(
            '📦 Order Created from Paid Invoice',
            `Order ${createdOrder.orderNumber} was automatically created from paid invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
            `/dashboard/orders/${createdOrder._id}`,
            {
              action: 'order_created_from_invoice',
              invoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              orderId: createdOrder._id,
              orderNumber: createdOrder.orderNumber,
              customerName: invoice.customerName,
              total: invoice.total,
              paymentMethod: method // ✅ Include the payment method
            }
          );
        }
      } catch (orderError: any) {
        console.error('Auto-create order failed:', orderError.message);
      }
    }

    try {
      await createAuditLog(req as any, {
        action: 'update',
        resource: 'invoice',
        resourceId: invoice._id.toString(),
        details: `Payment of KES ${paymentAmount.toLocaleString()} recorded for invoice ${invoice.invoiceNumber}. New payment status: ${invoice.paymentStatus}`,
        severity: 'info',
        status: 'success',
        skipIfNoUser: false
      });
    } catch (auditError: any) {
      console.error('Audit log creation failed:', auditError.message);
    }

    const isLargePayment = paymentAmount >= 50000;
    const notificationTitle = isLargePayment ? '💰 Large Payment Received' : '💵 Payment Received';
    
    await notifyAdmins(
      notificationTitle,
      `${isLargePayment ? 'LARGE PAYMENT: ' : ''}${req.user.email || req.user.name} recorded payment of KES ${paymentAmount.toLocaleString()} for invoice ${invoice.invoiceNumber} from ${invoice.customerName}. Payment status: ${invoice.paymentStatus}`,
      `/dashboard/sales/invoices/${invoice._id}`,
      {
        action: 'record_payment',
        recordedBy: req.user.email || req.user.name,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        paymentAmount,
        paymentMethod: method,
        isLargePayment,
        oldPaymentStatus,
        newPaymentStatus: invoice.paymentStatus,
        balanceRemaining: invoice.balanceDue
      }
    );

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        paymentStatus: invoice.paymentStatus,
        amountPaid: invoice.amountPaid,
        balanceDue: invoice.balanceDue
      },
      transaction: createdTransaction ? {
        id: createdTransaction._id,
        transactionId: createdTransaction.transactionId,
        amount: createdTransaction.amount,
        method: createdTransaction.paymentMethod,
        source: createdTransaction.source,
        orderId: createdTransaction.orderId
      } : null,
      order: createdOrder ? {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        total: createdOrder.total,
        paymentMethod: createdOrder.paymentMethod // ✅ Returns the correct payment method
      } : null
    });
  } catch (error: any) {
    console.error('❌ Record payment error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to record payment',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// =====================
// Categories API
// =====================

router.get('/categories', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const categories = await ProductModel.distinct('category');
    const formattedCategories = categories
      .filter(c => c && typeof c === 'string')
      .map(name => ({ _id: name, name, slug: name.toLowerCase().replace(/\s+/g, '-') }));
    
    res.json({ categories: formattedCategories });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// =====================
// Products API
// =====================

router.get('/products', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { search, category, page = '1', limit = '50' } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = {};
    
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category && typeof category === 'string' && category !== 'all') {
      query.category = category;
    }

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(l)
        .select('_id name slug price buyingPrice stock images category description sku profitMargin')
        .lean(),
      ProductModel.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: { current: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create order from invoice
router.post('/invoices/:id/create-order', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'cod' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (req.user!.role === 'sales' && invoice.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    if (invoice.orderId) {
      const existingOrder = await OrderModel.findById(invoice.orderId);
      if (existingOrder) {
        return res.status(409).json({ 
          error: 'Order already exists for this invoice',
          order: {
            _id: existingOrder._id,
            orderNumber: existingOrder.orderNumber
          }
        });
      }
    }

    // ✅ Pass the payment method to createOrderFromInvoice
    const createdOrder = await createOrderFromInvoice(invoice, req.user, paymentMethod);

    if (createdOrder) {
      await notifyAdmins(
        '📦 Order Created from Invoice',
        `${req.user.email || req.user.name} manually created order ${createdOrder.orderNumber} from invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
        `/dashboard/orders/${createdOrder._id}`,
        {
          action: 'manual_order_creation',
          createdBy: req.user.email || req.user.name,
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          orderId: createdOrder._id,
          orderNumber: createdOrder.orderNumber,
          customerName: invoice.customerName,
          total: invoice.total,
          paymentMethod // ✅ Include payment method
        }
      );
    }

    res.json({
      success: true,
      message: 'Order created successfully from invoice',
      order: createdOrder ? {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
        totalProfit: createdOrder.totalProfit,
        paymentStatus: createdOrder.paymentStatus,
        status: createdOrder.status,
        paymentMethod: createdOrder.paymentMethod // ✅ Return the correct payment method
      } : null
    });
  } catch (error: any) {
    console.error('Create order from invoice error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create order from invoice',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ==================== ENHANCED SALES CUSTOMER ENDPOINTS ====================

// GET /api/sales/customers/:id - Get single customer
router.get('/customers/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id).lean();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get customer statistics
    const [orders, quotations, invoices] = await Promise.all([
      OrderModel.find({ salesCustomerId: customer._id }).sort({ createdAt: -1 }).limit(5).lean(),
      QuotationModel.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(5).lean(),
      InvoiceModel.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const orderCount = await OrderModel.countDocuments({ salesCustomerId: customer._id });
    const quotationCount = await QuotationModel.countDocuments({ customerId: customer._id });
    const invoiceCount = await InvoiceModel.countDocuments({ customerId: customer._id });
    const totalRevenue = await OrderModel.aggregate([
      { $match: { salesCustomerId: customer._id, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({ 
      success: true, 
      customer: {
        ...customer,
        stats: {
          orderCount,
          quotationCount,
          invoiceCount,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentOrders: orders,
          recentQuotations: quotations,
          recentInvoices: invoices
        }
      }
    });
  } catch (error: any) {
    console.error('Fetch customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET /api/sales/customers/:id/orders - Get customer orders
router.get('/customers/:id/orders', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = '1', limit = '10', status } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = { salesCustomerId: customer._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      customer: { _id: customer._id, name: customer.name },
      orders,
      pagination: { current: p, limit: l, total, pages: Math.ceil(total / l) }
    });
  } catch (error: any) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/sales/customers/:id/quotations - Get customer quotations
router.get('/customers/:id/quotations', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = '1', limit = '10', status } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = { customerId: customer._id };
    if (status) query.status = status;

    const [quotations, total] = await Promise.all([
      QuotationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      QuotationModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      customer: { _id: customer._id, name: customer.name },
      quotations,
      pagination: { current: p, limit: l, total, pages: Math.ceil(total / l) }
    });
  } catch (error: any) {
    console.error('Fetch customer quotations error:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// GET /api/sales/customers/:id/invoices - Get customer invoices
router.get('/customers/:id/invoices', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = '1', limit = '10', status, paymentStatus } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = { customerId: customer._id };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      InvoiceModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      customer: { _id: customer._id, name: customer.name },
      invoices,
      pagination: { current: p, limit: l, total, pages: Math.ceil(total / l) }
    });
  } catch (error: any) {
    console.error('Fetch customer invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/sales/customers/active - Get active customers
router.get('/customers/active', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { limit = '20', search } = req.query;
    const query: any = { status: 'active' };
    
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await SalesCustomerModel.find(query)
      .sort({ totalSpent: -1 })
      .limit(parseInt(limit as string))
      .lean();

    res.json({ 
      success: true, 
      customers, 
      count: customers.length 
    });
  } catch (error: any) {
    console.error('Fetch active customers error:', error);
    res.status(500).json({ error: 'Failed to fetch active customers' });
  }
});

// GET /api/sales/customers/top - Get top customers by spending
router.get('/customers/top', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    
    const query: any = {};
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    const customers = await SalesCustomerModel.find(query)
      .sort({ totalSpent: -1 })
      .limit(parseInt(limit as string))
      .lean();

    res.json({ 
      success: true, 
      customers, 
      count: customers.length 
    });
  } catch (error: any) {
    console.error('Fetch top customers error:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

// GET /api/sales/customers/stats/overview - Customer statistics
router.get('/customers/stats/overview', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const query: any = {};
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    const [
      totalCustomers,
      activeCustomers,
      totalRevenue,
      avgCustomerValue,
      newCustomersThisMonth
    ] = await Promise.all([
      SalesCustomerModel.countDocuments(query),
      SalesCustomerModel.countDocuments({ ...query, status: 'active' }),
      SalesCustomerModel.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalSpent' } } }
      ]),
      SalesCustomerModel.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$totalSpent' } } }
      ]),
      SalesCustomerModel.countDocuments({
        ...query,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    ]);

    // Customer growth over last 12 months
    const growthData = await SalesCustomerModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers: totalCustomers - activeCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgCustomerValue: avgCustomerValue[0]?.avg || 0,
        newCustomersThisMonth,
        growthData: growthData.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          count: item.count
        }))
      }
    });
  } catch (error: any) {
    console.error('Fetch customer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch customer stats' });
  }
});

// PATCH /api/sales/customers/:id/status - Toggle customer status
router.patch('/customers/:id/status', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const oldStatus = customer.status;
    customer.status = status;
    await customer.save();

    await createAuditLog(req as any, {
      action: 'update_status',
      resource: 'customer',
      resourceId: customer._id.toString(),
      details: `Customer status changed from ${oldStatus} to ${status}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Customer status changed
    await notifyAdmins(
      `${status === 'active' ? '✅' : '⛔'} Customer Status Changed`,
      `${req.user.email || req.user.name} changed customer "${customer.name}" status from ${oldStatus} to ${status}`,
      `/dashboard/sales/customers/${customer._id}`,
      {
        action: 'change_customer_status',
        changedBy: req.user.email || req.user.name,
        customerId: customer._id,
        customerName: customer.name,
        oldStatus,
        newStatus: status
      }
    );

    res.json({ success: true, customer });
  } catch (error: any) {
    console.error('Update customer status error:', error);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// DELETE /api/sales/customers/:id - Delete customer (soft delete)
router.delete('/customers/:id', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await SalesCustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Check if customer has orders
    const orderCount = await OrderModel.countDocuments({ salesCustomerId: customer._id });
    if (orderCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete customer with ${orderCount} linked orders. Archive or reassign orders first.`,
        orderCount
      });
    }

    const customerName = customer.name;
    await SalesCustomerModel.findByIdAndDelete(id);

    await createAuditLog(req as any, {
      action: 'delete',
      resource: 'customer',
      resourceId: customer._id.toString(),
      details: `Customer deleted: ${customerName}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Customer deleted
    await notifyAdmins(
      '🗑️ Customer Deleted',
      `${req.user.email || req.user.name} deleted customer "${customerName}"`,
      '/dashboard/sales/customers',
      {
        action: 'delete_customer',
        deletedBy: req.user.email || req.user.name,
        customerId: id,
        customerName
      }
    );

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;