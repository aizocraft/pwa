import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';

const router = Router();

// Helper function to calculate payment summary (FIXED - with absolute safety)
async function getOrderPaymentSummary(orderId: string) {
  // Get all completed transactions
  const transactions = await TransactionModel.find({
    orderId: new mongoose.Types.ObjectId(orderId),
    status: 'completed'
  }).sort({ createdAt: -1 }).lean();
  
  // Calculate total paid from transactions
  const totalPaid = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  // Get order with explicit total field
  const order = await OrderModel.findById(orderId).select('total amountPaid balanceDue');
  
  // Ensure order total is a valid positive number
  let orderTotal = 0;
  if (order && typeof order.total === 'number' && !isNaN(order.total)) {
    orderTotal = order.total;
  }
  
  // Calculate balance due - ensure it's never negative
  const calculatedBalance = Math.max(0, orderTotal - totalPaid);
  
  console.log(`Payment summary for ${orderId}: Total=${orderTotal}, Paid=${totalPaid}, Balance=${calculatedBalance}`);
  
  return {
    transactions,
    totalPaid,
    balanceDue: calculatedBalance,
    orderTotal,
    paymentCount: transactions.length,
    lastPayment: transactions[0] || null
  };
}

// Helper to calculate payment status
function calculatePaymentStatus(totalPaid: number, orderTotal: number) {
  if (totalPaid <= 0) return 'unpaid';
  if (totalPaid < orderTotal) return 'partially_paid';
  if (totalPaid === orderTotal) return 'paid';
  return 'overpaid';
}

// Helper to update order payment summary (FIXED)
async function updateOrderPaymentSummary(orderId: string) {
  const summary = await getOrderPaymentSummary(orderId);
  const order = await OrderModel.findById(orderId);
  if (!order) return null;
  
  // Ensure order.total is set correctly
  if (!order.total || order.total <= 0) {
    console.error(`Order ${orderId} has invalid total: ${order.total}`);
    return null;
  }
  
  // Use the calculated values from summary
  order.amountPaid = summary.totalPaid;
  order.balanceDue = Math.max(0, summary.balanceDue);
  order.paymentStatus = calculatePaymentStatus(summary.totalPaid, order.total);
  
  console.log(`Updated order ${orderId}: AmountPaid=${order.amountPaid}, BalanceDue=${order.balanceDue}, Status=${order.paymentStatus}`);
  
  // Update paymentDetails with latest transaction
  if (summary.transactions.length > 0) {
    const latest = summary.transactions[0];
    order.paymentDetails = {
      transactionId: latest.transactionId,
      mpesaReceipt: latest.mpesaReceipt,
      cardLast4: latest.cardLast4,
      cardBrand: latest.cardBrand,
      paidAt: latest.paidAt,
      phoneNumber: undefined
    };
  }
  
  await order.save();
  return order;
}

// GET /api/payments/orders/:orderId - Get payment summary for an order
router.get('/orders/:orderId', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isSales = req.user?.role === 'sales';
    const isOwner = order.userId?.toString() === req.user?.userId;
    
    if (!isAdmin && !isSales && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const summary = await getOrderPaymentSummary(orderId);
    
    // Ensure order total is valid
    const validTotal = order.total && !isNaN(order.total) ? order.total : 0;
    const validAmountPaid = summary.totalPaid || 0;
    const validBalanceDue = Math.max(0, validTotal - validAmountPaid);
    
    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber || 'N/A',
      invoiceNumber: order.invoiceNumber,
      total: validTotal,
      paymentStatus: order.paymentStatus || 'unpaid',
      amountPaid: validAmountPaid,
      balanceDue: validBalanceDue,
      paymentCount: summary.paymentCount,
      lastPayment: summary.lastPayment,
      transactions: summary.transactions
    });
  } catch (error: any) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments/record - Record a manual payment (FIXED)
router.post('/record', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId, amount, paymentMethod, reference, notes } = req.body;
    
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'orderId, amount, and paymentMethod are required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isSales = req.user?.role === 'sales';
    
    if (!isAdmin && !isSales) {
      return res.status(403).json({ error: 'Only admin or sales can record manual payments' });
    }
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    // Get current summary with fresh calculation
    const currentSummary = await getOrderPaymentSummary(orderId);
    
    // Ensure order total is valid
    const orderTotal = order.total && !isNaN(order.total) ? order.total : 0;
    const safeBalanceDue = Math.max(0, orderTotal - currentSummary.totalPaid);
    
    console.log(`Recording payment: OrderTotal=${orderTotal}, TotalPaid=${currentSummary.totalPaid}, BalanceDue=${safeBalanceDue}, AttemptAmount=${numAmount}`);
    
    // Validate amount doesn't exceed balance due
    if (numAmount > safeBalanceDue && safeBalanceDue > 0) {
      return res.status(400).json({ error: `Amount cannot exceed balance due of KES ${safeBalanceDue.toLocaleString()}` });
    }
    
    // If balanceDue is 0, prevent overpayment
    if (safeBalanceDue === 0) {
      return res.status(400).json({ error: 'Order is already fully paid. Cannot record additional payment.' });
    }
    
    // Create transaction
    const transaction = await TransactionModel.create({
      orderId: order._id,
      invoiceNumber: order.invoiceNumber,
      quotationNumber: order.quotationNumber,
      amount: numAmount,
      paymentMethod,
      status: 'completed',
      transactionId: `MAN-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      reference: reference || null,
      notes: notes || null,
      recordedBy: req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined,
      recordedByName: req.user?.name || req.user?.email,
      source: 'manual',
      isPartialPayment: numAmount < safeBalanceDue,
      paidAt: new Date(),
      customerName: order.shippingAddress?.fullName || order.guestInfo?.name || 'Customer',
      guestEmail: order.guestInfo?.email,
      guestPhone: order.guestInfo?.phone,
      userId: order.userId
    });
    
    // Update order payment summary
    const updatedOrder = await updateOrderPaymentSummary(orderId);
    
    await createAuditLog(req as any, {
      action: 'record_payment',
      resource: 'order',
      resourceId: orderId,
      details: `Manual payment of ${numAmount} recorded for order ${order.orderNumber}`,
      skipIfNoUser: false
    });
    
    // Get final updated summary
    const finalSummary = await getOrderPaymentSummary(orderId);
    
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      transaction,
      order: {
        orderNumber: order.orderNumber,
        paymentStatus: updatedOrder?.paymentStatus || 'paid',
        amountPaid: finalSummary.totalPaid,
        balanceDue: finalSummary.balanceDue
      }
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/payments/transactions - List all transactions (admin only)
router.get('/transactions', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { page = '1', limit = '20', status, paymentMethod, source, search } = req.query;
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;
    
    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (source) query.source = source;
    
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      TransactionModel.countDocuments(query)
    ]);
    
    res.json({
      transactions,
      pagination: {
        current: p,
        limit: l,
        total,
        pages: Math.ceil(total / l)
      }
    });
  } catch (error: any) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/payments/stats - Payment statistics
router.get('/stats', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = await TransactionModel.aggregate([
      {
        $match: { status: 'completed', amount: { $gt: 0 } }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransaction: { $avg: '$amount' }
        }
      }
    ]);
    
    const sourceBreakdown = await TransactionModel.aggregate([
      {
        $match: { status: 'completed', amount: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      summary: stats[0] || { totalVolume: 0, totalTransactions: 0, avgTransaction: 0 },
      sourceBreakdown
    });
  } catch (error: any) {
    console.error('Payment stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;