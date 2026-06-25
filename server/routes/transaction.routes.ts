// routes/transaction.routes.ts
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';

const router = Router();

// Helper to check if user is admin or sales
const isAdminOrSales = (user: any) => {
  return user && (user.role === 'admin' || user.role === 'sales');
};

// Middleware for admin or sales
const requireAdminOrSales = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || !isAdminOrSales(req.user)) {
    return res.status(403).json({ error: 'Admin or Sales access required' });
  }
  next();
};

const getSalesTransactionMatch = (req: Request & { user?: any }) => {
  if (req.user?.role !== 'sales') {
    return null;
  }
  const userId = req.user.userId;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    // A sales user without a valid ID should not see any transactions.
    return { recordedBy: new mongoose.Types.ObjectId('000000000000000000000000') };
  }
  return { recordedBy: new mongoose.Types.ObjectId(userId) };
};

const isSalesTransactionOwner = (req: Request & { user?: any }, transaction: any) => {
  if (req.user?.role !== 'sales') {
    return true;
  }
  const userId = req.user.userId?.toString();
  return transaction.recordedBy?.toString() === userId;
};

// Helper function to calculate payment summary
async function getOrderPaymentSummary(orderId: string) {
  const transactions = await TransactionModel.find({
    orderId: new mongoose.Types.ObjectId(orderId),
    status: 'completed'
  }).sort({ createdAt: -1 }).lean();
  
  const totalPaid = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const order = await OrderModel.findById(orderId).select('total amountPaid balanceDue');
  
  let orderTotal = 0;
  if (order && typeof order.total === 'number' && !isNaN(order.total)) {
    orderTotal = order.total;
  }
  
  const calculatedBalance = Math.max(0, orderTotal - totalPaid);
  
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

// Helper to update order payment summary
async function updateOrderPaymentSummary(orderId: string) {
  const summary = await getOrderPaymentSummary(orderId);
  const order = await OrderModel.findById(orderId);
  if (!order) return null;
  
  if (!order.total || order.total <= 0) {
    console.error(`Order ${orderId} has invalid total: ${order.total}`);
    return null;
  }
  
  order.amountPaid = summary.totalPaid;
  order.balanceDue = Math.max(0, summary.balanceDue);
  order.paymentStatus = calculatePaymentStatus(summary.totalPaid, order.total);
  
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

// GET /api/transactions - List all transactions (UPDATED: allows admin and sales)
router.get('/', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, paymentMethod, source, search, startDate, endDate } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (source) query.source = source;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { mpesaReceipt: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const salesMatch = getSalesTransactionMatch(req);
    const finalQuery = salesMatch ? { $and: [query, salesMatch] } : query;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(finalQuery)
        .populate('orderId', 'orderNumber total status')
        .populate('recordedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TransactionModel.countDocuments(finalQuery)
    ]);

    res.json({
      transactions,
      pagination: { current: page, pages: Math.ceil(total / limit), total, limit }
    });
  } catch (error: any) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/stats - Transaction statistics
router.get('/stats', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const salesMatch = getSalesTransactionMatch(req);
    const matchStage = salesMatch ? { $match: salesMatch } : { $match: {} };
    const stats = await TransactionModel.aggregate([
      matchStage,
      {
        $facet: {
          summary: [{
            $group: {
              _id: null,
              totalVolume: { $sum: '$amount' },
              totalTransactions: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
              failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
              refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } }
            }
          }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 }, volume: { $sum: '$amount' } } }],
          bySource: [{ $group: { _id: '$source', count: { $sum: 1 }, volume: { $sum: '$amount' } } }],
          byMethod: [{ $group: { _id: '$paymentMethod', count: { $sum: 1 }, volume: { $sum: '$amount' } } }]
        }
      }
    ]);
    
    res.json(stats[0]);
  } catch (error: any) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/transactions/:id - Get single transaction
router.get('/:id', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id)
      .populate('orderId', 'orderNumber total status')
      .populate('recordedBy', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!isSalesTransactionOwner(req, transaction)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(transaction);
  } catch (error: any) {
    console.error('Fetch transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// PATCH /api/transactions/:id/status - Update transaction status
router.patch('/:id/status', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const transaction = await TransactionModel.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!isSalesTransactionOwner(req, transaction)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const oldStatus = transaction.status;
    transaction.status = status;
    
    if (reason) {
      transaction.notes = `${transaction.notes || ''}\nStatus changed from ${oldStatus} to ${status}: ${reason}`.trim();
    }
    
    if (status === 'completed' && !transaction.paidAt) {
      transaction.paidAt = new Date();
    }
    
    await transaction.save();
    
    // Update order payment summary if completed or refunded
    if (transaction.orderId && (status === 'completed' || status === 'refunded')) {
      await updateOrderPaymentSummary(transaction.orderId.toString());
    }
    
    res.json({ success: true, message: `Status updated from ${oldStatus} to ${status}`, transaction });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/transactions/export/csv - Export transactions as CSV
router.get('/export/csv', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    const salesMatch = getSalesTransactionMatch(req);
    const finalQuery = salesMatch ? { $and: [query, salesMatch] } : query;

    const transactions = await TransactionModel.find(finalQuery)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .lean();
    
    const csvRows = [
      ['Transaction ID', 'Order Number', 'Invoice Number', 'Customer Name', 'Amount', 'Currency', 'Status', 'Payment Method', 'Source', 'Reference', 'Created At', 'Notes']
    ];
    
    for (const tx of transactions) {
      csvRows.push([
        tx.transactionId,
        (tx.orderId as any)?.orderNumber || 'N/A',
        tx.invoiceNumber || 'N/A',
        tx.customerName,
        tx.amount.toString(),
        tx.currency,
        tx.status,
        tx.paymentMethod,
        tx.source,
        tx.reference || tx.mpesaReceipt || '',
        tx.createdAt.toISOString(),
        tx.notes || ''
      ]);
    }
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

// GET /api/transactions/debug/latest - Debug endpoint to check latest transactions
router.get('/debug/latest', authMiddleware, requireAdminOrSales, async (req: Request & { user?: any }, res: Response) => {
  try {
    const salesMatch = getSalesTransactionMatch(req);
    const query = salesMatch ? salesMatch : {};
    const transactions = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map(t => ({
        id: t._id,
        transactionId: t.transactionId,
        invoiceNumber: t.invoiceNumber,
        amount: t.amount,
        source: t.source,
        paymentMethod: t.paymentMethod,
        status: t.status,
        customerName: t.customerName,
        createdAt: t.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
    
    const isAdmin = req.user?.role === 'admin';
    const isSales = req.user?.role === 'sales';
    const isOwner = order.userId?.toString() === req.user?.userId;
    
    if (!isAdmin && !isSales && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const summary = await getOrderPaymentSummary(orderId);
    
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

export default router;