import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
import SalesCustomerModel from '../models/SalesCustomer';
import QuotationModel, { DiscountType, QuotationStatus, generateQuoteNumber } from '../models/Quotation';
import ProductModel from '../models/Product';
import OrderModel from '../models/Order';
import { createAuditLog } from '../middleware/auditMiddleware';
import ShippingAreaModel from '../models/ShippingArea';
import PromoCodeModel from '../models/PromoCode';
import { CompanySettings } from '../models/CompanySettings';
import { sendQuotation } from '../services/email.service';


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

    // Normalize
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : undefined;
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : undefined;

    // prevent duplicates per creator (or globally; here we do global best effort)
    const existing = await SalesCustomerModel.findOne({
      $or: [
        normalizedEmail ? { email: normalizedEmail } : { email: { $exists: false } },
        normalizedPhone ? { phone: normalizedPhone } : { phone: { $exists: false } },
      ],
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
      resource: 'order',
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

    // sales can edit own customers if you want ownership enforcement;
    // requirement says sales can manage customers they create, admin manages all.
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
// Quotations 
// =====================

// POST /api/sales/quotations - Create quotation with shipping and tax
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
      shippingAreaId,
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

    // Process items
    let subtotal = 0;
    const processedItems = [];

    for (const it of items) {
      const product = await ProductModel.findById(it.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${it.productId}` });
      }
      
      const price = typeof it.customPrice === 'number' ? it.customPrice : (it.price ?? product.price);
      const qty = Number(it.qty);
      const total = price * qty;
      subtotal += total;
      
      processedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        qty,
        price,
        total,
        customPrice: it.customPrice !== undefined,
        image: product.images && product.images.length > 0 
          ? (product.images[0].url || (product.images[0].fileId ? product.images[0].fileId.toString() : ''))
          : '',
        description: product.description || ''
      });
    }

    // Calculate shipping if area provided
    let shippingInfo = null;
    if (shippingAreaId) {
      console.log('🔍 Looking for shipping area with ID:', shippingAreaId);
      const shippingArea = await ShippingAreaModel.findOne({ _id: shippingAreaId, isActive: true });
      console.log('📦 Found shipping area:', shippingArea);
      
      if (shippingArea) {
        const freeThreshold = Number(shippingArea.freeThreshold || 0);
        const freeShippingEnabled = freeThreshold > 0;
        const shippingCost = freeShippingEnabled && subtotal >= freeThreshold ? 0 : shippingArea.baseCost;
        shippingInfo = {
          areaId: shippingArea._id,
          areaName: shippingArea.name,
          baseCost: shippingArea.baseCost,
          freeThreshold: shippingArea.freeThreshold,
          estimatedDelivery: estimatedDelivery || '3-5 business days',
          cost: shippingCost
        };
        console.log('✅ Created shippingInfo:', shippingInfo);
      } else {
        console.log('⚠️ Shipping area not found or inactive');
      }
    }

    // Calculate discount
    const discountAmount = discountType === 'percentage' 
      ? subtotal * (discount / 100)
      : (discount || 0);
    
    // Calculate tax (after discount)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * taxRate;
    
    // Calculate total with shipping
    const shippingCost = shippingInfo?.cost || 0;
    const total = subtotal - discountAmount + tax + shippingCost;

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
      discount: discountAmount,
      discountType: discountType || 'fixed',
      discountReason: '',
      shippingInfo: shippingInfo, // Make sure this is included
      total,
      quoteNumber,
      status: 'draft',
      validUntil: validUntilDate,
      notes,
      terms
    });

    console.log('✅ Quotation created with shippingInfo:', quote.shippingInfo);

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
    
    // Role-based filtering
    if (req.user!.role === 'sales') {
      query.createdBy = req.user!.userId;
    }

    // Search functionality
    if (search && typeof search === 'string') {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
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

    // Check permission
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

    // Check permission
    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Prevent editing converted quotations
    if (quotation.status === 'converted') {
      return res.status(409).json({ error: 'Cannot edit converted quotation' });
    }

    const { status, notes, terms, items, discount, discountType, validUntil, shippingAreaId, estimatedDelivery } = req.body;

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

    // Update items if provided
    if (items && Array.isArray(items)) {
      const updatedItems = [];
      let subtotal = 0;
      
      for (const it of items) {
        const product = await ProductModel.findById(it.productId);
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${it.productId}` });
        }
        const price = it.customPrice || it.price || product.price;
        const qty = Number(it.qty);
        const total = price * qty;
        subtotal += total;
        
        updatedItems.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          qty,
          price,
          total,
          customPrice: it.customPrice !== undefined,
          image: product.images && product.images.length > 0 
            ? (product.images[0].url || (product.images[0].fileId ? product.images[0].fileId.toString() : ''))
            : '',
          description: product.description || ''
        });
      }
      
      quotation.items = updatedItems;
      quotation.subtotal = subtotal;
      
      // Update shipping if area changed or items changed
      if (shippingAreaId) {
        const shippingArea = await ShippingAreaModel.findOne({ _id: shippingAreaId, isActive: true });
        if (shippingArea) {
          const baseCost = Number(shippingArea.baseCost || 0);
          const freeThreshold = Number(shippingArea.freeThreshold || 0);
          
          // Only apply free shipping if threshold is explicitly set and greater than 0
          const shippingCost = (freeThreshold > 0 && subtotal >= freeThreshold) ? 0 : baseCost;
          
          quotation.shippingInfo = {
            areaId: shippingArea._id,
            areaName: shippingArea.name,
            baseCost: baseCost,
            freeThreshold: freeThreshold,
            estimatedDelivery: estimatedDelivery || quotation.shippingInfo?.estimatedDelivery || '3-5 business days',
            cost: shippingCost
          };
        }
      } else if (estimatedDelivery && quotation.shippingInfo) {
        quotation.shippingInfo.estimatedDelivery = estimatedDelivery;
      }
    }

    // Save the quotation (pre-save middleware will recalculate totals)
    await quotation.save();

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation updated: ${quotation.quoteNumber}`,
      skipIfNoUser: false
    });

    // Return the updated quotation
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

    // Check permission
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
    description: item.description
  })),
  shippingInfo: quotation.shippingInfo ? {
    areaName: quotation.shippingInfo.areaName,
    cost: quotation.shippingInfo.cost,
    freeThreshold: quotation.shippingInfo.freeThreshold,
    estimatedDelivery: quotation.shippingInfo.estimatedDelivery
  } : undefined,
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

    // Update status to sent if it was draft
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

// POST /api/sales/quotations/:id/resend - Resend quotation email (without PDF)
router.post('/quotations/:id/resend', authMiddleware, requireSalesRole, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const quotation = await QuotationModel.findById(id).lean();
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Check permission
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
    description: item.description
  })),
  shippingInfo: quotation.shippingInfo ? {
    areaName: quotation.shippingInfo.areaName,
    cost: quotation.shippingInfo.cost,
    freeThreshold: quotation.shippingInfo.freeThreshold,
    estimatedDelivery: quotation.shippingInfo.estimatedDelivery
  } : undefined,
  discount: quotation.discount,
  discountType: quotation.discountType,
  tax: quotation.tax,
  subtotal: quotation.subtotal,
  notes: quotation.notes,
  terms: quotation.terms
});

    if (!emailResult.success) {
      return res.status(500).json({ error: emailResult.error || 'Failed to send email' });
    }

    await createAuditLog(req as any, {
      action: 'resend',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation resent to ${quotation.customerEmail}`,
      skipIfNoUser: false
    });

    res.json({ 
      success: true, 
      message: 'Quotation resent successfully via email',
      emailResult: { messageId: emailResult.messageId }
    });
  } catch (error: any) {
    console.error('Resend quotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to resend quotation' });
  }
});

// POST /api/sales/quotations/:id/accept - Accept quotation and auto-convert to order
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

    // Check permission
    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Can only accept sent or draft quotations
    if (quotation.status !== 'sent' && quotation.status !== 'draft') {
      return res.status(400).json({ error: `Cannot accept quotation with status: ${quotation.status}` });
    }

    // Check if quotation is expired
    if (new Date() > new Date(quotation.validUntil)) {
      quotation.status = 'expired';
      await quotation.save();
      return res.status(400).json({ error: 'Quotation has expired' });
    }

    // Validate customer phone - MUST have phone number
    const customerPhone = (quotation.customerPhone || '').trim();
    if (!customerPhone) {
      console.error('Accept quotation customer phone missing', {
        quotationId: quotation._id.toString(),
        customerId: quotation.customerId.toString(),
        customerName: quotation.customerName,
      });
      return res.status(400).json({
        error: 'Customer phone number is required to create order. Please update the customer profile with a phone number.',
        customerId: quotation.customerId,
      });
    }

    // Validate shipping address from request body
    const shippingAddressFromRequest = req.body.shippingAddress || {};

    // Order schema requires shippingAddress.phone, so always derive it.
    const shippingPhone = String(shippingAddressFromRequest.phone || customerPhone || '').trim();
    if (!shippingPhone) {
      return res.status(400).json({
        error: 'Shipping phone number is required. Customer phone is also missing.'
      });
    }

    // Validate stock + critical product fields before creating order
    const productMap = new Map();
    
    for (const [idx, item] of quotation.items.entries()) {
      if (!item?.productId) {
        console.error('Accept quotation invalid item.productId', {
          quotationId: quotation._id.toString(),
          itemIndex: idx,
        });
        return res.status(400).json({ error: `Quotation item ${idx} is missing productId` });
      }

      const product = await ProductModel.findById(item.productId).lean();
      if (!product) {
        console.error('Accept quotation product not found', {
          quotationId: quotation._id.toString(),
          itemIndex: idx,
          productId: item.productId?.toString?.(),
          itemName: item.name,
        });
        return res.status(404).json({ error: `Product not found for item ${idx}`, productId: item.productId });
      }

      // Ensure slug exists to satisfy Order schema validation
      if (!product.slug || typeof product.slug !== 'string' || product.slug.trim() === '') {
        console.error('Accept quotation product.slug missing or invalid', {
          quotationId: quotation._id.toString(),
          itemIndex: idx,
          productId: product._id.toString(),
          productName: product.name,
          slug: product.slug,
        });
        return res.status(400).json({
          error: `Product slug missing for "${product.name}". Please update the product with a valid slug.`,
          productId: product._id,
          productName: product.name,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
        });
      }

      // Ensure item has name
      if (!item.name || item.name.trim() === '') {
        return res.status(400).json({ error: `Quotation item ${idx} is missing item name/description` });
      }

      // Cache product for later use
      productMap.set(item.productId.toString(), product);
    }

    // Deduct stock
    for (const item of quotation.items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Build shipping address with all required fields
    const shippingAddress = {
      fullName: shippingAddressFromRequest.fullName || quotation.customerName,
      address1: shippingAddressFromRequest.address1 || 'To be provided',
      address2: shippingAddressFromRequest.address2 || '',
      city: shippingAddressFromRequest.city || 'Nairobi',
      state: shippingAddressFromRequest.state || 'KE',
      zip: shippingAddressFromRequest.zip || '00000',
      country: shippingAddressFromRequest.country || 'KE',
      phone: shippingPhone,  // Use shipping phone or customer phone
      email: shippingAddressFromRequest.email || quotation.customerEmail || ''
    };

    // Create order from quotation using cached products
    const orderItems = quotation.items.map((item: any) => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        throw new Error(`Product not found in cache for productId=${item.productId}`);
      }

      // Ensure required Order item fields match Order schema
      const slug = String(item.slug || product.slug || '').trim();
      if (!slug) {
        throw new Error(`Product slug is missing or empty for productId=${item.productId}`);
      }

      const name = String(item.name || product.name || '').trim();
      if (!name) {
        throw new Error(`Quotation item name is missing for productId=${item.productId}`);
      }

      const image =
        item.image ||
        (product.images && product.images[0]
          ? product.images[0].url || product.images[0].fileId?.toString() || ''
          : '');

      return {
        productId: item.productId,
        name,
        slug,
        image,
        price: Number(item.price),
        qty: Number(item.qty),
        description: item.description || product.description || ''
      };
    });

    const orderData = {
      orderNumber,
      items: orderItems,
      subtotal: quotation.subtotal,
      shippingCost: quotation.shippingInfo?.cost || 0,
      tax: quotation.tax,
      discount: quotation.discount,
      total: quotation.total,
      selectedShippingArea: quotation.shippingInfo?.areaId || null,
      paymentMethod: req.body.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'processing',
      notes: `Auto-generated from quotation ${quotation.quoteNumber}\n\n${quotation.notes || ''}`,
      salesCustomerId: quotation.customerId,
      quotationId: quotation._id,
      shippingAddress: shippingAddress,
      createdBy: req.user!.userId,
      // Add any other required fields your Order schema expects
      guestInfo: null, // Since this is from a sales customer, not a guest
      promoCode: req.body.promoCode || null,
      promoDiscount: 0
    };

    // Validate order data before saving (optional but helpful for debugging)
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    const order = new OrderModel(orderData);
    
    // Validate the order before saving to get more specific errors
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

    // Update quotation
    quotation.status = 'accepted';
    quotation.acceptedAt = new Date();
    quotation.convertedAt = new Date();
    quotation.convertedOrderId = order._id;
    await quotation.save();

    await createAuditLog(req as any, {
      action: 'convert',
      resource: 'quotation',
      resourceId: quotation._id.toString(),
      details: `Quotation ${quotation.quoteNumber} accepted and converted to order ${order.orderNumber}`,
      skipIfNoUser: false
    });

    res.json({ 
      success: true, 
      message: 'Quotation accepted and order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total
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

    // Check permission
    if (req.user!.role === 'sales' && quotation.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Cannot delete converted quotations
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
// Manual Transactions (sales/admin)
// =====================
// Create / update / view TransactionModel records manually for orders created via quotations.

import TransactionModel from '../models/Transaction';

const isAdmin = (user: any) => user && user.role === 'admin';

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
// Body: { paymentMethod, amount, status, transactionId?, mpesaReceipt?, cardLast4?, cardBrand?, notes? }
router.post('/orders/:orderId/transactions', authMiddleware, requireSalesOrAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ error: 'Invalid orderId' });

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allowed = await authorizeOrderByQuotationCreator(req as any, order);
    if (!allowed) return res.status(403).json({ error: 'Not allowed' });

    const { paymentMethod, amount, status, transactionId, mpesaReceipt, cardLast4, cardBrand, notes } = req.body;

    const validPaymentMethods = ['mpesa', 'card', 'cod'];
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid paymentMethod' });
    }
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const finalAmount = typeof amount === 'number' ? amount : Number(amount);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (status !== 'pending' && status !== 'completed' && !transactionId) {
      // transactionId is required for identity; mpesa/stripe use it.
      return res.status(400).json({ error: 'transactionId is required for this status' });
    }

    // Duplicate prevention: for completed payments, don't allow another transaction with same paymentMethod.
    if (status === 'completed' || status === 'failed' || status === 'refunded') {
      const existingSameMethod = await TransactionModel.findOne({
        orderId: order._id,
        paymentMethod,
        status: { $in: ['completed', 'failed', 'refunded'] },
      });

      if (existingSameMethod) {
        return res.status(409).json({ error: 'Transaction already recorded for this order/payment method', transactionId: existingSameMethod.transactionId });
      }
    }

    // Enforce refunded can only be recorded if completed already exists
    if (status === 'refunded') {
      const hasCompleted = await TransactionModel.findOne({ orderId: order._id, status: 'completed' });
      if (!hasCompleted) {
        return res.status(400).json({ error: 'Cannot refund before a completed transaction exists' });
      }
    }

    const tx = await TransactionModel.create({
      orderId: order._id,
      userId: req.user!.userId,
      guestEmail: order.guestInfo?.email,
      guestPhone: order.guestInfo?.phone,
      customerName: order.shippingAddress?.fullName || order.guestInfo?.name || 'Customer',
      amount: finalAmount,
      currency: 'KES',
      paymentMethod,
      status,
      transactionId: transactionId || new mongoose.Types.ObjectId().toString(),
      mpesaReceipt: mpesaReceipt || undefined,
      cardLast4: cardLast4 || undefined,
      cardBrand: cardBrand || undefined,
      notes: notes || undefined,
    });

    // Sync order payment fields
    if (status === 'completed') {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: tx.transactionId,
        mpesaReceipt: tx.mpesaReceipt,
        cardLast4: tx.cardLast4,
        cardBrand: tx.cardBrand,
        paidAt: new Date(),
        phoneNumber: order.shippingAddress?.phone,
      } as any;
    } else if (status === 'failed') {
      order.paymentStatus = 'failed';
      // keep order.status unchanged (or pending/processing). We'll set to pending.
      if (order.status === 'processing') order.status = 'pending';
    } else if (status === 'refunded') {
      order.paymentStatus = 'refunded';
      order.status = 'refunded' as any;
    } else {
      order.paymentStatus = 'pending';
    }

    await order.save();

    await createAuditLog(req as any, {
      action: 'create',
      resource: 'transaction',
      resourceId: tx._id.toString(),
      details: `Manual transaction recorded for order ${order.orderNumber} (${status}/${paymentMethod})`,
      skipIfNoUser: false,
    });

    return res.status(201).json({ transaction: tx, order });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// PATCH /api/sales/transactions/:transactionId
// Body: { status, paymentMethod?, mpesaReceipt?, cardLast4?, cardBrand?, notes?, transactionId? }
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

    // Refund transition guard
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

    // Sync order
    if (tx.status === 'completed') {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: tx.transactionId,
        mpesaReceipt: tx.mpesaReceipt,
        cardLast4: tx.cardLast4,
        cardBrand: tx.cardBrand,
        paidAt: order.paymentDetails?.paidAt || new Date(),
      } as any;
    } else if (tx.status === 'failed') {
      order.paymentStatus = 'failed';
      if (order.status === 'processing') order.status = 'pending';
    } else if (tx.status === 'refunded') {
      order.paymentStatus = 'refunded';
      order.status = 'refunded' as any;
    } else {
      order.paymentStatus = 'pending';
    }

    await order.save();

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'transaction',
      resourceId: tx._id.toString(),
      details: `Manual transaction updated from ${oldStatus} to ${tx.status} for order ${order.orderNumber}`,
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