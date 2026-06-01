// src/routes/sales.ts - Updated with profit tracking
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

const router = Router();

const isAdminOrSales = (user: any) => user && (user.role === 'admin' || user.role === 'sales');

const requireSalesRole = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || !isAdminOrSales(req.user)) {
    return res.status(403).json({ error: 'Sales/admin access required' });
  }
  next();
};

// Helper function to create order from invoice with profit tracking
async function createOrderFromInvoice(invoice: any, user: any) {
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
      paymentMethod: 'cod',
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
// Customers
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

    if (name !== undefined) customer.name = String(name).trim();
    if (email !== undefined) customer.email = typeof email === 'string' ? email.toLowerCase().trim() : undefined;
    if (phone !== undefined) customer.phone = typeof phone === 'string' ? phone.trim() : undefined;
    if (location !== undefined) customer.location = location;
    if (notes !== undefined) customer.notes = notes;
    if (status !== undefined) customer.status = status;

    await customer.save();

    res.json({ customer });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// =====================
// Quotations with Profit Tracking
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

    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed for this customer' });
    }

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
      // tax-exempt categories are forced as non-taxable
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
    const { search, status, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = {};
    if (status) query.status = status;
    
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

    if (status && ['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
      if (status === 'sent' && quotation.status !== 'sent') quotation.sentAt = new Date();
      if (status === 'accepted' && quotation.status !== 'accepted') quotation.acceptedAt = new Date();
      if (status === 'rejected' && quotation.status !== 'rejected') quotation.rejectedAt = new Date();
      quotation.status = status;
    }
    
    if (notes !== undefined) quotation.notes = notes;
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
      } else {
        quotation.transportInfo = undefined;
        quotation.transportCost = 0;
        quotation.transportDescription = '';
      }
    }

    if (items && Array.isArray(items)) {
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
        // tax-exempt categories are forced as non-taxable
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
        // subtotal-after-discount, but excluding tax-exempt categories
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        quotation.tax = taxableAmount * taxRate;
        // NOTE: Since we don't separately subtract exempt-category amounts here,
        // item-level taxPerItem should be used when category exemptions must be accurate.
        // (Kept for backward compatibility with existing taxPerItem=false behavior.)
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

    await QuotationModel.deleteOne({ _id: quotation._id });

    await createAuditLog(req as any, {
      action: 'delete',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation deleted: ${quotation.quoteNumber}`,
      skipIfNoUser: false
    });

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

    // Only allow creating invoice from accepted quotations that may have been edited
    if (quotation.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only create invoice from accepted quotations' });
    }

    // Check if quotation has items
    if (!quotation.items || quotation.items.length === 0) {
      return res.status(400).json({ error: 'Quotation has no items' });
    }

    // Generate new invoice number
    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create new invoice with current quotation data
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

    // Update quotation to reference this new invoice
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
// Invoices
// =====================

router.get('/invoices', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { search, status, paymentStatus, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const query: any = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
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

    res.json({ 
      success: true, 
      message: 'Invoice sent successfully via email'
    });
  } catch (error: any) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to send invoice' });
  }
});

router.post('/invoices/:id/payments', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, method, reference, notes } = req.body;

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

    const transactionId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    // Add payment to invoice payments array
    invoice.payments.push({
      amount: paymentAmount,
      method,
      reference,
      date: new Date(),
      recordedBy: req.user!.userId,
      transactionId: transactionId
    });

    invoice.amountPaid += paymentAmount;
    invoice.balanceDue = invoice.total - invoice.amountPaid;

    // Update payment status
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

    // Try to create transaction (don't fail if it fails)
    try {
      await TransactionModel.create({
        orderId: invoice.orderId || null,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        quotationNumber: invoice.quotationNumber,
        userId: invoice.customerId,
        customerName: invoice.customerName,
        guestEmail: invoice.customerEmail,
        guestPhone: invoice.customerPhone,
        amount: paymentAmount,
        currency: 'KES',
        paymentMethod: method === 'bank_transfer' ? 'bank_transfer' : 
                       method === 'mpesa' ? 'mpesa' : 
                       method === 'card' ? 'card' : 'cash',
        status: 'completed',
        transactionId: transactionId,
        reference: reference || null,
        notes: notes || null,
        recordedBy: req.user!.userId,
        recordedByName: req.user!.name || req.user!.email,
        source: 'order', // Use 'order' instead of 'invoice'
        isPartialPayment: paymentAmount < invoice.balanceDue,
        paidAt: new Date()
      });
    } catch (txError: any) {
      console.error('Transaction creation skipped:', txError.message);
    }

    let createdOrder = null;
    // Auto-create order if fully paid
    if (invoice.paymentStatus === 'paid' && !invoice.orderId) {
      try {
        createdOrder = await createOrderFromInvoice(invoice, req.user);
      } catch (orderError: any) {
        console.error('Auto-create order failed:', orderError.message);
      }
    }

    // ✅ FIXED: Use 'update' instead of 'payment' for audit log action
    try {
      await createAuditLog(req as any, {
        action: 'update',  // This is valid in the enum
        resource: 'invoice',
        resourceId: invoice._id.toString(),
        details: `Payment of KES ${paymentAmount.toLocaleString()} recorded for invoice ${invoice.invoiceNumber}. New payment status: ${invoice.paymentStatus}`,
        severity: 'info',
        status: 'success',
        skipIfNoUser: false
      });
    } catch (auditError: any) {
      console.error('Audit log creation failed:', auditError.message);
      // Don't fail the payment if audit fails
    }

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
      order: createdOrder ? {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        total: createdOrder.total
      } : null
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to record payment' });
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

    const createdOrder = await createOrderFromInvoice(invoice, req.user);

    res.json({
      success: true,
      message: 'Order created successfully from invoice',
      order: createdOrder ? {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
        totalProfit: createdOrder.totalProfit,
        paymentStatus: createdOrder.paymentStatus,
        status: createdOrder.status
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

export default router;