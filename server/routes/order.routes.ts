// src/routes/orderRoutes.ts

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import UserModel from '../models/User';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optionalAuth';
import { sendOrderConfirmation, sendAdminOrderNotification } from '../services/email.service';
import ShippingAreaModel from '../models/ShippingArea';
import PromoCodeModel from '../models/PromoCode';
import { CompanySettings } from '../models/CompanySettings';

const router = Router();

// Helper function to validate email
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to validate phone (Kenyan format)
const isValidPhone = (phone: string) => {
  return /^(07|\+2547|2547)\d{8}$/.test(phone);
};

// POST /api/orders - Create order (supports both auth and guest)
router.post('/', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      guestInfo,
      notes,
      shippingAreaId,
      promoCode
    } = req.body;

    // Validation
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address1) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    if (!paymentMethod || !['cod', 'mpesa', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid payment method is required' });
    }

    if (!shippingAreaId) {
      return res.status(400).json({ error: 'Shipping area is required' });
    }

    // Handle user identification
    let userId: string | undefined;
    let guestInfoData: any = undefined;

    if (req.user && req.user.userId) {
      userId = req.user.userId;
      console.log('✅ Authenticated user creating order:', userId);
    } else {
      console.log('👤 Guest user creating order');
      
      if (!guestInfo || (!guestInfo.email && !guestInfo.phone)) {
        return res.status(400).json({ 
          error: 'Guest email or phone is required for unregistered users' 
        });
      }

      if (guestInfo.email && !isValidEmail(guestInfo.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (guestInfo.phone && !isValidPhone(guestInfo.phone)) {
        return res.status(400).json({ error: 'Invalid phone number format. Use 07XXXXXXXX or +2547XXXXXXXX' });
      }

      guestInfoData = {
        email: guestInfo.email,
        phone: guestInfo.phone,
        name: guestInfo.name || shippingAddress.fullName
      };
    }

    // Debug logging
    console.log('=== ORDER CREATION ===');
    console.log('ShippingAreaId:', shippingAreaId);
    console.log('PromoCode:', promoCode);
    console.log('User authenticated:', !!req.user);
    console.log('User ID:', req.user?.userId);
    console.log('Payment method:', paymentMethod);

    // Process items and verify stock
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }
      
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      const price = parseFloat(product.price.toString());
      calculatedSubtotal += price * item.qty;
      
      orderItems.push({
        productId: item.productId,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price: price,
        qty: item.qty
      });
      
      // Update stock
      product.stock -= item.qty;
      await product.save();
    }

    console.log('Subtotal:', calculatedSubtotal);

    // Use client-provided values or calculate fallbacks
    // Server-side calculation for shipping and promo
    const shippingArea = await ShippingAreaModel.findOne({ _id: shippingAreaId, isActive: true });
    if (!shippingArea) {
      return res.status(400).json({ error: 'Invalid shipping area' });
    }

    let discount = 0;
    let appliedPromo = null;
    let promoCodeStr = promoCode;
    if (promoCode) {
      const promo = await PromoCodeModel.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && promo.canUse(calculatedSubtotal)) {
        discount = promo.type === 'percent' 
          ? calculatedSubtotal * (promo.value / 100)
          : Math.min(promo.value, calculatedSubtotal);
        appliedPromo = promo._id;
        promoCodeStr = promo.code;
        // Increment used count
        promo.usedCount += 1;
        await promo.save();
      } else {
        console.log('Promo not valid');
        promoCodeStr = undefined;
      }
    }

    const shippingCost = (shippingArea.freeThreshold > 0 && calculatedSubtotal >= shippingArea.freeThreshold) ? 0 : shippingArea.baseCost;
    const settings = await CompanySettings.findOne();
    const taxRate = settings?.taxRate ?? 0.16;
    const tax = calculatedSubtotal * taxRate;
    const finalTotal = calculatedSubtotal + shippingCost - discount + tax;

    console.log('Server calc - Subtotal:', calculatedSubtotal, 'Shipping:', shippingCost, 'Discount:', discount, 'Tax:', tax, 'Total:', finalTotal);

    // Create order
    const orderData: any = {
      items: orderItems,
      subtotal: calculatedSubtotal,
      shippingCost,
      tax,
      discount,
      total: finalTotal,
      selectedShippingArea: shippingArea._id,
      appliedPromoCode: appliedPromo,
      shippingAddress: {
        ...shippingAddress,
        email: shippingAddress.email || guestInfoData?.email
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: paymentMethod === 'cod' ? 'pending' : 'processing',
      notes: notes || null
    };

    if (userId) {
      orderData.userId = userId;
    } else {
      orderData.guestInfo = guestInfoData;
    }

    const order = new OrderModel(orderData);
    await order.save();

    // Get customer information for emails
    let customerName = shippingAddress.fullName;
    let customerEmail = shippingAddress.email || '';
    let customerPhone = shippingAddress.phone;

    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        customerName = user.name || customerName;
        customerEmail = user.email || customerEmail;
      }
    } else if (guestInfoData) {
      customerName = guestInfoData.name || customerName;
      customerEmail = guestInfoData.email || customerEmail;
      customerPhone = guestInfoData.phone || customerPhone;
    }

    // Format shipping address for email
    const formattedAddress = `${shippingAddress.address1}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}, ${shippingAddress.country}`;

    // Prepare email items
    const emailItems = orderItems.map(item => ({
      name: item.name,
      quantity: item.qty,
      price: item.price
    }));

    // Send order confirmation to customer (don't await - let it run in background)
sendOrderConfirmation({
  orderId: order._id.toString(),
  customerName: customerName,
  customerEmail: customerEmail,
  subtotal: calculatedSubtotal,
  shippingCost: shippingCost,
  discount: discount,
  tax: tax,
  total: finalTotal,
  promoCode: promoCodeStr,
  status: order.status,
  items: emailItems
}).catch(err => console.error('Failed to send customer confirmation:', err));

// Send admin notification (don't await - let it run in background)
if (process.env.ADMIN_EMAIL) {
  sendAdminOrderNotification({
    orderId: order._id.toString(),
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    shippingAddress: formattedAddress,
    subtotal: calculatedSubtotal,
    shippingCost: shippingCost,
    discount: discount,
    tax: tax,
    total: finalTotal,
    promoCode: promoCodeStr,
    paymentMethod: paymentMethod,
    status: order.status,
    items: emailItems,
    orderDate: order.createdAt || new Date()
  }).catch(err => console.error('Failed to send admin notification:', err));
}

    // Populate product details for response
    const populatedOrder = await OrderModel.findById(order._id)
      .populate('items.productId', 'name images slug')
      .populate('selectedShippingArea', 'name baseCost freeThreshold')
      .populate('appliedPromoCode', 'code type value');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      _id: order._id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item: any) => ({
        _id: item._id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        qty: item.qty
      })),
      shippingAddress: order.shippingAddress
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create order' 
    });
  }
});

// GET /api/orders/track/:orderNumber - Track order by order number (public)
router.get('/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const orderId = 'ORD-' + orderNumber;
    
    // Find by ID or order number pattern
    const order = await OrderModel.findOne({
      $or: [
        { _id: orderNumber },
        { _id: orderId }
      ]
    }).populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    //  sensitive info
    const safeOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        image: item.image
      }))
    };

    res.json(safeOrder);
  } catch (error: any) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// GET /api/orders/guest/:email/:phone - Get guest orders
router.get('/guest/:email/:phone', async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.params;
    
    const orders = await OrderModel.find({
      'guestInfo.email': email,
      'guestInfo.phone': phone
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      itemsCount: order.items.length
    }));

    res.json(formattedOrders);
  } catch (error: any) {
    console.error('Fetch guest orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders - Get user orders (authenticated users)
router.get('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const orders = await OrderModel.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images rating');
    
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      orderNumber: order.orderNumber,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      items: order.items.map((item: any) => ({
        ...item.toObject(),
        price: Number(item.price)
      }))
    }));
    
    res.json(formattedOrders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order (supports both auth and guest)
router.get('/:id', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const orderId = req.params.id;
    let order = null;

    // Try to find by ID
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await OrderModel.findById(orderId)
        .populate('items.productId', 'name images rating');
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    let hasAccess = false;
    
    if (req.user && req.user.userId) {
      // Authenticated user - check if order belongs to them or they're admin
      hasAccess = order.userId?.toString() === req.user.userId || req.user.role === 'admin';
    } else {
      // Guest - would need to verify via email/phone, but for single order view
      // we'll just allow if they have the ID (basic security)
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const formattedOrder = {
      ...order.toObject(),
      orderNumber: order.orderNumber,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      items: order.items.map((item: any) => ({
        ...item.toObject(),
        price: Number(item.price)
      }))
    };
    
    res.json(formattedOrder);
  } catch (error: any) {
    console.error('Fetch order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/admin/orders - Get all orders for admin (paginated)
router.get('/admin/orders', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const paymentMethod = req.query.paymentMethod as string;
    const search = req.query.search as string;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 1 : -1;

    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (search) {
      query.$or = [
        { 'guestInfo.email': { $regex: search, $options: 'i' } },
        { 'guestInfo.phone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'name slug images rating')
        .populate('selectedShippingArea', 'name')
        .populate('appliedPromoCode', 'code')
        .sort({ [sortField]: sortOrder })
        .limit(limit)
        .skip(skip),
      OrderModel.countDocuments(query)
    ]);

    const formattedOrders = orders.map((order: any) => ({
      ...order.toObject(),
      orderNumber: order.orderNumber,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      items: order.items.map((item: any) => ({
        ...item.toObject(),
        price: Number(item.price)
      }))
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// PUT /api/orders/:id/cancel - Cancel order (user or guest)
router.put('/:id/cancel', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const orderId = req.params.id;
    const { email, phone } = req.body; // For guest verification
    
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify permissions
    let hasPermission = false;
    
    if (req.user && req.user.userId) {
      hasPermission = order.userId?.toString() === req.user.userId;
    } else {
      // Guest verification
      hasPermission = order.guestInfo?.email === email || order.guestInfo?.phone === phone;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Check if order can be cancelled
    if (!order.canCancel || (typeof order.canCancel === 'function' && !order.canCancel())) {
      return res.status(400).json({ 
        error: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Restore stock for each item
    for (const item of order.items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty }
      });
    }

    order.status = 'cancelled';
    if (order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
    }
    await order.save();

    const formattedOrder = {
      ...order.toObject(),
      orderNumber: order.orderNumber,
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item.toObject(),
        price: Number(item.price)
      }))
    };

    res.json({ 
      success: true,
      message: 'Order cancelled successfully', 
      order: formattedOrder 
    });
  } catch (error: any) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// PATCH /api/admin/orders/:id/status - Admin status update
router.patch('/admin/orders/:id/status', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, trackingNumber, estimatedDelivery } = req.body;
    const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Handle stock restoration for cancellation
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty }
        });
      }
    }

    // Update order fields
    order.status = status as any;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    
    // Update payment status if needed
    if (status === 'paid' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'completed';
    }
    
    await order.save();

    const populated = await OrderModel.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name images');

    const formattedOrder = {
      ...populated!.toObject(),
      orderNumber: populated!.orderNumber,
      total: Number(populated!.total),
      items: populated!.items.map((item: any) => ({
        ...item.toObject(),
        price: Number(item.price)
      }))
    };

    res.json({ 
      success: true,
      message: `Status updated to ${status}`, 
      order: formattedOrder 
    });
  } catch (error: any) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/orders/:id/retry-payment - Retry failed payment
router.post('/:id/retry-payment', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'failed') {
      return res.status(400).json({ error: 'Only failed payments can be retried' });
    }

    // Reset payment status
    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      message: 'Payment retry initiated',
      orderId: order._id
    });
  } catch (error: any) {
    console.error('Payment retry error:', error);
    res.status(500).json({ error: 'Failed to retry payment' });
  }
});

// GET /api/orders/stats/summary - Get order statistics (admin)
router.get('/admin/stats/summary', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          codOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0] } },
          mpesaOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'mpesa'] }, 1, 0] } },
          cardOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] } }
        }
      }
    ]);

    const statusBreakdown = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        codOrders: 0,
        mpesaOrders: 0,
        cardOrders: 0
      },
      statusBreakdown
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;