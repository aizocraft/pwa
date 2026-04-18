import { Router, Request, Response } from 'express';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';

const router = Router();

// Admin middleware
const adminMiddleware = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/admin/transactions - Get all transactions (paginated)
router.get('/admin/transactions', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const paymentMethod = req.query.paymentMethod as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { mpesaReceipt: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .populate('orderId', 'orderNumber total status shippingAddress')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      TransactionModel.countDocuments(query)
    ]);

    // Format transactions for response
const formattedTransactions = transactions.map(transaction => ({
  ...transaction,
  amount: Number(transaction.amount),
  orderNumber: (transaction.orderId as any)?.orderNumber,
  customerInfo: {
    name: transaction.customerName,
    email: transaction.guestEmail || (transaction.userId as any)?.email,
    phone: transaction.guestPhone
  }
}));

    res.json({
      transactions: formattedTransactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/admin/transactions/stats - Transaction statistics
router.get('/admin/transactions/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const [summary, statusBreakdown, methodBreakdown, dailyStats] = await Promise.all([
      // Overall summary
      TransactionModel.aggregate([
        {
          $group: {
            _id: null,
        totalVolume: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refunded: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        },
        mpesaCount: {
          $sum: { $cond: [{ $eq: ['$paymentMethod', 'mpesa'] }, 1, 0] }
        },
        cardCount: {
          $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] }
        },
        codCount: {
          $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0] }
        },
        completedVolume: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        }
          }
        }
      ]),
      
      // Status breakdown
      TransactionModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        }
      ]),
      
      // Payment method breakdown
      TransactionModel.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        }
      ]),
      
      // Daily stats for last 30 days
      TransactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            dailyVolume: { $sum: '$amount' },
            dailyCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Calculate success rate
    const totalCompleted = summary[0]?.completed || 0;
    const totalTransactions = summary[0]?.totalTransactions || 0;

    res.json({
      summary: {
        totalVolume: summary[0]?.totalVolume || 0,
        totalTransactions: summary[0]?.totalTransactions || 0,
        completed: summary[0]?.completed || 0,
        pending: summary[0]?.pending || 0,
        failed: summary[0]?.failed || 0,
        refunded: summary[0]?.refunded || 0,
        completedVolume: summary[0]?.completedVolume || 0,
        successRate: totalTransactions > 0 ? (totalCompleted / totalTransactions) * 100 : 0
      },
      statusBreakdown: statusBreakdown.map(item => ({
        status: item._id,
        count: item.count,
        volume: item.volume
      })),
      methodBreakdown: methodBreakdown.map(item => ({
        method: item._id,
        count: item.count,
        volume: item.volume
      })),
      dailyStats: dailyStats.map(item => ({
        date: item._id,
        volume: item.dailyVolume,
        count: item.dailyCount
      }))
    });
  } catch (error: any) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/transactions/:id - Get single transaction
router.get('/admin/transactions/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id)
      .populate('orderId', 'orderNumber total status shippingAddress items')
      .populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

// Format response
const formattedTransaction = {
  ...transaction.toObject(),
  amount: Number(transaction.amount),
  orderNumber: (transaction.orderId as any)?.orderNumber,
  customerInfo: {
    name: transaction.customerName,
    email: transaction.guestEmail || (transaction.userId as any)?.email,
    phone: transaction.guestPhone
  }
};

    res.json(formattedTransaction);
  } catch (error: any) {
    console.error('Fetch transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// PATCH /api/admin/transactions/:id/status - Update transaction status
router.patch('/admin/transactions/:id/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { reason } = req.body;
    
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, completed, failed, refunded' });
    }

    const transaction = await TransactionModel.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const oldStatus = transaction.status;
    transaction.status = status as any;
    
    if (reason) {
      transaction.notes = `${transaction.notes || ''}\nStatus changed from ${oldStatus} to ${status}: ${reason}`.trim();
    }
    
    await transaction.save();

    // Sync order payment status if transaction is completed or refunded
    if (status === 'completed' || status === 'refunded') {
      await OrderModel.findByIdAndUpdate(transaction.orderId, {
        paymentStatus: status === 'completed' ? 'completed' : 'refunded'
      });
    }

    const populated = await TransactionModel.findById(req.params.id)
      .populate('orderId', 'orderNumber');

    res.json({ 
      success: true,
      message: `Status updated from ${oldStatus} to ${status}`,
      transaction: populated
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/admin/transactions/export/csv - Export transactions as CSV
router.get('/admin/transactions/export/csv', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
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

    const transactions = await TransactionModel.find(query)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const csvRows = [
      ['Transaction ID', 'Order Number', 'Customer Name', 'Amount', 'Currency', 'Status', 'Payment Method', 'MPESA Receipt', 'Card Last4', 'Created At', 'Notes']
    ];

    for (const transaction of transactions) {
      csvRows.push([
        transaction.transactionId,
        (transaction.orderId as any)?.orderNumber || 'N/A',
        transaction.customerName,
        transaction.amount.toString(),
        transaction.currency,
        transaction.status,
        transaction.paymentMethod,
        transaction.mpesaReceipt || '',
        transaction.cardLast4 || '',
        transaction.createdAt.toISOString(),
        transaction.notes || ''
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

export default router ;