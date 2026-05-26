// routes/transaction.routes.ts (was admin.routes.ts)
import { Router, Request, Response } from 'express';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';
import { PaymentService } from '../services/payment.service';

const router = Router();

const adminMiddleware = (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/transactions - List all transactions (paginated)
router.get('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
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

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .populate('orderId', 'orderNumber total status')
        .populate('recordedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TransactionModel.countDocuments(query)
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
router.get('/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await TransactionModel.aggregate([
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
router.get('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id)
      .populate('orderId', 'orderNumber total status')
      .populate('recordedBy', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error: any) {
    console.error('Fetch transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// PATCH /api/transactions/:id/status - Update transaction status
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
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
    if (status === 'completed' || status === 'refunded') {
      await PaymentService.updateOrderPaymentSummary(transaction.orderId.toString());
    }
    
    res.json({ success: true, message: `Status updated from ${oldStatus} to ${status}`, transaction });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/transactions/export/csv - Export transactions as CSV
router.get('/export/csv', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
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
    
    const csvRows = [
      ['Transaction ID', 'Order Number', 'Customer Name', 'Amount', 'Currency', 'Status', 'Payment Method', 'Source', 'Reference', 'Created At', 'Notes']
    ];
    
    for (const tx of transactions) {
      csvRows.push([
        tx.transactionId,
        (tx.orderId as any)?.orderNumber || 'N/A',
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

export default router;