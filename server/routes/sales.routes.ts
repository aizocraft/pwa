import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
import SalesCustomerModel from '../models/SalesCustomer';
import QuotationModel, { DiscountType, QuotationStatus, generateQuoteNumber, generateInvoiceNumber } from '../models/Quotation';
import ProductModel from '../models/Product';
import OrderModel from '../models/Order';
import { createAuditLog } from '../middleware/auditMiddleware';
import ShippingAreaModel from '../models/ShippingArea';
import PromoCodeModel from '../models/PromoCode';
import { CompanySettings } from '../models/CompanySettings';
import { sendQuotation } from '../services/email.service';
import { PaymentService } from '../services/payment.service';


const router = Router();

const isAdminOrSales = (user: any) => user && (user.role === 'admin' || user.role === 'sales');

const requireSalesRole = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || !isAdminOrSales(req.user)) {
    return res.status(403).json({ error: 'Sales/admin access required' });
  }
  next();
};

// =====================
// Customers
// =====================

// POST /api/sales/customers - admin/sales create customer
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

// GET /api/sales/customers
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

// PATCH /api/sales/customers/:id
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
// Quotations with Tax Per Item & Transport
// =====================

// POST /api/sales/quotations - Create quotation with tax per item and transport
router.post('/quotations', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    console.log('📥 Received quotation data:', JSON.stringify(req.body, null, 2));
    
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

    // Validation
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }

    // Get customer
    const customer = await SalesCustomerModel.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Check permission
    if (req.user!.role === 'sales' && customer.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed for this customer' });
    }

    // Get company settings for tax rate
    const settings = await CompanySettings.findOne();
    const taxRate = settings?.taxRate ?? 0.16;

    // Process items with tax calculation
    let subtotal = 0;
    let totalItemTax = 0;
    const processedItems = [];

    for (const it of items) {
      const product = await ProductModel.findById(it.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${it.productId}` });
      }
      
      const price = typeof it.customPrice === 'number' ? it.customPrice : (it.price ?? product.price);
      const qty = Number(it.qty);
      const itemTotal = price * qty;
      subtotal += itemTotal;
      
      // Calculate item tax if taxPerItem is enabled and item is taxable
      let itemTax = 0;
      const isTaxable = it.taxable !== false;
      if (taxPerItem && isTaxable) {
        itemTax = itemTotal * taxRate;
        totalItemTax += itemTax;
      }
      
      processedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        qty,
        price,
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

    // Calculate discount
    const discountAmount = discountType === 'percentage' 
      ? subtotal * (discount / 100)
      : (discount || 0);
    
    // Calculate tax based on taxPerItem setting
    let tax = 0;
    if (taxPerItem) {
      tax = totalItemTax;
    } else {
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      tax = taxableAmount * taxRate;
    }
    
    // Transport info
    const transportCost = transport?.cost || 0;
    const transportDescription = transport?.description || '';
    const transportInfo = (transportCost > 0 || transportDescription) ? {
      cost: transportCost,
      description: transportDescription
    } : undefined;
    
    // Calculate total
    const total = subtotal - discountAmount + tax + transportCost;

    // Generate quote number
    const quoteNumber = await generateQuoteNumber();

    // Set valid until date (default 30 days)
    const validUntilDate = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create quotation
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
      taxRate,
      tax,
      taxPerItem: taxPerItem || false,
      discount: discountAmount,
      discountType: discountType || 'fixed',
      discountReason: '',
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

    console.log('✅ Quotation created with taxPerItem:', taxPerItem, 'transport:', transport);

    // Create audit log
    await createAuditLog(req as any, {
      action: 'create',
      resource: 'quotation',
      resourceId: quote._id.toString(),
      details: `Quotation created: ${quote.quoteNumber} for ${quote.customerName}`,
      skipIfNoUser: false
    });

    // Return the populated quotation
    const populatedQuote = await QuotationModel.findById(quote._id).lean();
    
    res.status(201).json({ success: true, quotation: populatedQuote });
  } catch (error: any) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create quotation' });
  }
});

// GET /api/sales/quotations - List quotations with filters
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
        { invoiceNumber: { $regex: search, $options: 'i' } },
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

    // For converted quotations, fetch payment status from the linked order
    const quotationsWithPaymentStatus = await Promise.all(
      quotations.map(async (quote) => {
        if (quote.status === 'converted' && quote.convertedOrderId) {
          const order = await OrderModel.findById(quote.convertedOrderId).select('paymentStatus amountPaid balanceDue');
          if (order) {
            return {
              ...quote,
              paymentStatus: order.paymentStatus,
              amountPaid: order.amountPaid,
              balanceDue: order.balanceDue
            };
          }
        }
        return quote;
      })
    );

    res.json({
      success: true,
      quotations: quotationsWithPaymentStatus,
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

    // For converted quotations, fetch payment status from the linked order
    if (quotation.status === 'converted' && quotation.convertedOrderId) {
      const order = await OrderModel.findById(quotation.convertedOrderId).select('paymentStatus amountPaid balanceDue total');
      if (order) {
        return res.json({
          success: true,
          quotation: {
            ...quotation,
            paymentStatus: order.paymentStatus,
            amountPaid: order.amountPaid,
            balanceDue: order.balanceDue,
            total: quotation.total
          }
        });
      }
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

    if (quotation.status === 'converted') {
      return res.status(409).json({ error: 'Cannot edit converted quotation' });
    }

    const { 
      status, notes, terms, items, discount, discountType, validUntil, 
      taxPerItem, transport, estimatedDelivery 
    } = req.body;

    // Update basic fields
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
    
    // Update transport info
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

    // Update items if provided
    if (items && Array.isArray(items)) {
      const settings = await CompanySettings.findOne();
      const taxRate = settings?.taxRate ?? 0.16;
      const updatedItems = [];
      let subtotal = 0;
      let totalItemTax = 0;
      
      for (const it of items) {
        const product = await ProductModel.findById(it.productId);
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${it.productId}` });
        }
        const price = it.customPrice || it.price || product.price;
        const qty = Number(it.qty);
        const itemTotal = price * qty;
        subtotal += itemTotal;
        
        let itemTax = 0;
        const isTaxable = it.taxable !== false;
        if (quotation.taxPerItem && isTaxable) {
          itemTax = itemTotal * taxRate;
          totalItemTax += itemTax;
        }
        
        updatedItems.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          qty,
          price,
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
      
      // Recalculate tax
      const discountAmount = quotation.discountType === 'percentage' 
        ? subtotal * (quotation.discount / 100)
        : quotation.discount;
      
      if (quotation.taxPerItem) {
        quotation.tax = totalItemTax;
      } else {
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        quotation.tax = taxableAmount * taxRate;
      }
      
      // Recalculate total
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
      items: quotation.items.map(item => ({
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

// POST /api/sales/quotations/:id/accept
router.post(
  '/quotations/:id/accept',
  authMiddleware,
  requireSalesRole,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentMethod = 'cod' } = req.body;

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

      const customerPhone = String(quotation.customerPhone || '').trim();
      if (!customerPhone) {
        return res.status(400).json({ error: 'Customer phone number is required' });
      }

      // Validate stock
      for (const item of quotation.items) {
        const product = await ProductModel.findById(item.productId).lean();
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.name}` });
        }
        if (product.stock < item.qty) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}` });
        }
      }

      // Deduct stock
      for (const item of quotation.items) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty }
        });
      }

      // Generate invoice number if not exists
      let invoiceNumber = quotation.invoiceNumber;
      if (!invoiceNumber) {
        invoiceNumber = await generateInvoiceNumber();
        quotation.invoiceNumber = invoiceNumber;
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const shippingAddress = {
        fullName: quotation.customerName,
        address1: 'To be provided',
        address2: '',
        city: 'Nairobi',
        state: 'KE',
        zip: '00000',
        country: 'KE',
        phone: customerPhone,
        email: quotation.customerEmail || ''
      };

      const orderItems = quotation.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image || '',
        price: Number(item.price),
        qty: Number(item.qty),
        description: item.description || ''
      }));

      const transportCost = quotation.transportCost || quotation.transportInfo?.cost || 0;

      // Determine payment status based on payment method
      let paymentStatus = 'unpaid';
      let amountPaid = 0;
      let balanceDue = quotation.total;

      // If payment method is COD or other non-prepaid methods, order is unpaid
      if (paymentMethod === 'cod') {
        paymentStatus = 'unpaid';
        amountPaid = 0;
        balanceDue = quotation.total;
      }
      // Add other payment methods as needed (mpesa, card might be paid immediately)

      const orderData = {
        quotationId: quotation._id,
        quotationNumber: quotation.quoteNumber,
        orderNumber,
        invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Net 30',
        userId: quotation.customerId,
        salesCustomerId: quotation.customerId,
        items: orderItems,
        subtotal: quotation.subtotal,
        shippingCost: transportCost,
        tax: quotation.tax,
        discount: quotation.discount,
        total: quotation.total,
        paymentMethod,
        paymentStatus,
        amountPaid,
        balanceDue,
        payments: [],
        status: paymentMethod === 'cod' ? 'pending' : 'processing',
        selectedShippingArea: null,
        shippingAddress,
        notes: `Auto-generated from quotation ${quotation.quoteNumber}\n\n${quotation.notes || ''}`,
        createdBy: req.user!.userId,
        guestInfo: null
      };

      const order = new OrderModel(orderData);
      const validationError = order.validateSync();

      if (validationError) {
        console.error('Order validation error:', validationError.errors);
        return res.status(400).json({
          error: 'Order validation failed',
          details: Object.keys(validationError.errors).map(key => ({
            field: key,
            message: validationError.errors[key].message
          }))
        });
      }

      await order.save();
     
      // Cast payment status to the correct type
      const orderPaymentStatus = order.paymentStatus as 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';

      // Update quotation
      quotation.status = 'converted';
      quotation.acceptedAt = new Date();
      quotation.convertedAt = new Date();
      quotation.convertedOrderId = order._id;
      quotation.invoiceNumber = invoiceNumber;

      // Sync payment status from order to quotation with type casting
      quotation.paymentStatus = orderPaymentStatus;
      quotation.amountPaid = order.amountPaid || 0;
      quotation.balanceDue = order.balanceDue || order.total;

      await quotation.save();

      await createAuditLog(req as any, {
        action: 'convert',
        resource: 'quotation',
        resourceId: quotation._id.toString(),
        details: `Quotation ${quotation.quoteNumber} converted to invoice ${invoiceNumber} and order ${order.orderNumber}`,
        skipIfNoUser: false
      });

      res.json({
        success: true,
        message: 'Quotation converted to invoice successfully',
        invoice: {
          invoiceNumber: order.invoiceNumber,
          quotationNumber: order.quotationNumber,
          total: order.total,
          balanceDue: order.balanceDue,
          paymentStatus: order.paymentStatus,
          dueDate: order.dueDate,
          invoiceDate: order.invoiceDate
        },
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          amountPaid: order.amountPaid,
          balanceDue: order.balanceDue
        }
      });
    } catch (error: any) {
      console.error('Accept quotation error:', error);
      res.status(500).json({
        error: error.message || 'Failed to accept quotation',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

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

    if (quotation.status === 'converted') {
      return res.status(409).json({ error: 'Cannot delete a converted quotation' });
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

// =====================
// Categories API
// =====================

// GET /api/sales/categories - Get distinct product categories
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
// Products API with Category Filter
// =====================

// GET /api/sales/products - Get products with search and category filter
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
        .select('_id name slug price stock images category description sku')
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

// =====================
// Manual Transactions (sales/admin)
// =====================

import TransactionModel from '../models/Transaction';

const requireSalesOrAdmin = (req: Request & { user?: any }, res: Response, next: any) => {
  return requireSalesRole(req, res, next);
};

const getSalesQuotationCreator = async (quotationId: mongoose.Types.ObjectId) => {
  const q = await QuotationModel.findById(quotationId).select('createdBy');
  return q?.createdBy?.toString();
};

const authorizeOrderByQuotationCreator = async (req: Request & { user?: any }, order: any) => {
  if (!order?.quotationId) return false;
  if (req.user!.role === 'admin') return true;

  const createdBy = await getSalesQuotationCreator(order.quotationId);
  if (!createdBy) return false;
  return createdBy === req.user!.userId;
};

// POST /api/sales/orders/:orderId/transactions
router.post('/orders/:orderId/transactions', authMiddleware, requireSalesOrAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, amount, status, transactionId, mpesaReceipt, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }
    
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const allowed = await authorizeOrderByQuotationCreator(req as any, order);
    if (!allowed) return res.status(403).json({ error: 'Not allowed' });
    
    if (status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be recorded via this endpoint' });
    }
    
    const finalAmount = typeof amount === 'number' ? amount : Number(amount);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Use PaymentService instead of direct Transaction creation
    const transaction = await PaymentService.recordPayment({
      orderId,
      amount: finalAmount,
      paymentMethod,
      reference: transactionId,
      notes,
      source: 'quotation',
      recordedBy: req.user!.userId,
      recordedByName: req.user!.name,
      transactionId: transactionId,
      mpesaReceipt
    });
    
    await createAuditLog(req as any, {
      action: 'create',
      resource: 'transaction',
      resourceId: transaction._id.toString(),
      details: `Payment recorded for order ${order.orderNumber} (${finalAmount}/${paymentMethod})`,
      skipIfNoUser: false,
    });
    
    return res.status(201).json({ success: true, transaction, order });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to record transaction' });
  }
});

// PATCH /api/sales/transactions/:transactionId
router.patch('/transactions/:transactionId', authMiddleware, requireSalesOrAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { transactionId } = req.params;

    const tx = await TransactionModel.findOne({ transactionId });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const order = await OrderModel.findById(tx.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allowed = await authorizeOrderByQuotationCreator(req as any, order);
    if (!allowed) return res.status(403).json({ error: 'Not allowed' });

    const { status, mpesaReceipt, cardLast4, cardBrand, notes } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'refunded') {
      const hasCompleted = await TransactionModel.findOne({ orderId: order._id, status: 'completed' });
      if (!hasCompleted) return res.status(400).json({ error: 'Cannot refund before a completed transaction exists' });
    }

    const oldStatus = tx.status;
    if (status !== undefined) tx.status = status;
    if (mpesaReceipt !== undefined) tx.mpesaReceipt = mpesaReceipt;
    if (cardLast4 !== undefined) tx.cardLast4 = cardLast4;
    if (cardBrand !== undefined) tx.cardBrand = cardBrand;
    if (notes !== undefined) tx.notes = notes;

    await tx.save();

    // FIXED: Map transaction status to order payment status correctly
    if (tx.status === 'completed') {
      // Calculate actual paid amount from all completed transactions
      const allCompletedTransactions = await TransactionModel.find({ 
        orderId: order._id, 
        status: 'completed' 
      });
      
      const totalPaid = allCompletedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Determine payment status based on total paid vs order total
      if (totalPaid === 0) {
        order.paymentStatus = 'unpaid';
      } else if (totalPaid < order.total) {
        order.paymentStatus = 'partially_paid';
      } else if (totalPaid === order.total) {
        order.paymentStatus = 'paid';
      } else {
        order.paymentStatus = 'overpaid';
      }
      
      order.status = 'processing';
      order.amountPaid = totalPaid;
      order.balanceDue = Math.max(0, order.total - totalPaid);
      
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: tx.transactionId,
        mpesaReceipt: tx.mpesaReceipt,
        cardLast4: tx.cardLast4,
        cardBrand: tx.cardBrand,
        paidAt: order.paymentDetails?.paidAt || new Date(),
      } as any;
      
    } else if (tx.status === 'failed') {
      // Failed transaction doesn't change payment status
      // Only update if there are no completed transactions
      const hasCompleted = await TransactionModel.findOne({ 
        orderId: order._id, 
        status: 'completed' 
      });
      
      if (!hasCompleted) {
        order.paymentStatus = 'unpaid';
      }
      // Don't change order status on failed payment
      
    } else if (tx.status === 'refunded') {
      // Recalculate total paid (excluding refunded amounts)
      const allCompletedTransactions = await TransactionModel.find({ 
        orderId: order._id, 
        status: 'completed' 
      });
      
      const totalPaid = allCompletedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (totalPaid === 0) {
        order.paymentStatus = 'refunded';
      } else if (totalPaid < order.total) {
        order.paymentStatus = 'partially_paid';
      } else if (totalPaid === order.total) {
        order.paymentStatus = 'paid';
      } else {
        order.paymentStatus = 'overpaid';
      }
      
      order.amountPaid = totalPaid;
      order.balanceDue = Math.max(0, order.total - totalPaid);
      
    } else if (tx.status === 'pending') {
      // Pending transaction doesn't change payment status
      // Keep existing status
    }

    await order.save();

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'transaction',
      resourceId: tx._id.toString(),
      details: `Transaction updated from ${oldStatus} to ${tx.status} for order ${order.orderNumber}`,
      skipIfNoUser: false,
    });

    res.json({ success: true, transaction: tx, order });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// GET /api/sales/orders/:orderId/transactions
router.get('/orders/:orderId/transactions', authMiddleware, requireSalesOrAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ error: 'Invalid orderId' });

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allowed = await authorizeOrderByQuotationCreator(req as any, order);
    if (!allowed) return res.status(403).json({ error: 'Not allowed' });

    const transactions = await TransactionModel.find({ orderId: order._id }).sort({ createdAt: -1 }).lean();
    res.json({ orderNumber: order.orderNumber, transactions });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;