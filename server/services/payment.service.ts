import mongoose from 'mongoose';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';

export class PaymentService {
  /**
   * Get payment summary for an order
   */
  static async getOrderPaymentSummary(orderId: string) {
    const transactions = await TransactionModel.find({
      orderId: new mongoose.Types.ObjectId(orderId),
      status: 'completed'
    }).sort({ createdAt: -1 }).lean();
    
    const totalPaid = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const order = await OrderModel.findById(orderId).select('total');
    
    return {
      transactions,
      totalPaid,
      balanceDue: (order?.total || 0) - totalPaid,
      paymentCount: transactions.length,
      lastPayment: transactions[0] || null,
      bySource: {
        checkout: transactions.filter(t => t.source === 'checkout').length,
        quotation: transactions.filter(t => t.source === 'quotation').length,
        admin: transactions.filter(t => t.source === 'admin').length,
        manual: transactions.filter(t => t.source === 'manual').length
      }
    };
  }
  
  /**
   * Calculate payment status based on total paid
   */
  static calculatePaymentStatus(totalPaid: number, orderTotal: number) {
    if (totalPaid === 0) return 'unpaid';
    if (totalPaid < orderTotal) return 'partially_paid';
    if (totalPaid === orderTotal) return 'paid';
    return 'overpaid';
  }
  
  /**
   * Update order payment summary from transactions
   */
  static async updateOrderPaymentSummary(orderId: string) {
    const summary = await this.getOrderPaymentSummary(orderId);
    const order = await OrderModel.findById(orderId);
    if (!order) return;
    
    order.amountPaid = summary.totalPaid;
    order.balanceDue = summary.balanceDue;
    order.paymentStatus = this.calculatePaymentStatus(summary.totalPaid, order.total);
    
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
  
  /**
   * Record a payment
   */
  static async recordPayment({
    orderId,
    amount,
    paymentMethod,
    reference,
    notes,
    source,
    recordedBy,
    recordedByName,
    transactionId: customTransactionId,
    mpesaReceipt,
    cardLast4,
    cardBrand
  }: {
    orderId: string;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
    source: 'checkout' | 'quotation' | 'admin' | 'manual';
    recordedBy?: string;
    recordedByName?: string;
    transactionId?: string;
    mpesaReceipt?: string;
    cardLast4?: string;
    cardBrand?: string;
  }) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Order not found');
    
    const currentSummary = await this.getOrderPaymentSummary(orderId);
    
    if (amount <= 0) throw new Error('Amount must be positive');
    if (amount > currentSummary.balanceDue && currentSummary.balanceDue > 0) {
      throw new Error(`Payment exceeds balance due of ${currentSummary.balanceDue}`);
    }
    
    const transaction = await TransactionModel.create({
      orderId: order._id,
      invoiceNumber: order.invoiceNumber,
      quotationNumber: order.quotationNumber,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId: customTransactionId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reference,
      notes,
      recordedBy: recordedBy ? new mongoose.Types.ObjectId(recordedBy) : undefined,
      recordedByName,
      source,
      isPartialPayment: amount < currentSummary.balanceDue,
      paidAt: new Date(),
      mpesaReceipt,
      cardLast4,
      cardBrand,
      customerName: order.shippingAddress?.fullName || order.guestInfo?.name || 'Customer',
      guestEmail: order.guestInfo?.email,
      guestPhone: order.guestInfo?.phone,
      userId: order.userId
    });
    
    await this.updateOrderPaymentSummary(orderId);
    
    return transaction;
  }
  
  /**
   * Initialize order payment (called after order creation)
   */
  static async initializeOrderPayment(orderId: string, paymentMethod: string) {
    if (paymentMethod === 'cod') {
      await OrderModel.findByIdAndUpdate(orderId, {
        paymentStatus: 'unpaid',
        amountPaid: 0,
        balanceDue: (await OrderModel.findById(orderId))?.total || 0
      });
      return { status: 'unpaid', message: 'COD order created' };
    }
    
    return { status: 'pending', message: 'Payment pending' };
  }
  
  /**
   * Update transaction status (for payment callbacks)
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: 'completed' | 'failed',
    metadata?: { mpesaReceipt?: string; reference?: string }
  ) {
    const transaction = await TransactionModel.findOne({ transactionId });
    if (!transaction) throw new Error('Transaction not found');
    
    transaction.status = status;
    if (metadata?.mpesaReceipt) transaction.mpesaReceipt = metadata.mpesaReceipt;
    if (metadata?.reference) transaction.reference = metadata.reference;
    if (status === 'completed') transaction.paidAt = new Date();
    
    await transaction.save();
    
    // ✅ FIX: Check if orderId exists before updating
    if (status === 'completed' && transaction.orderId) {
      await this.updateOrderPaymentSummary(transaction.orderId.toString());
    }
    
    return transaction;
  }
}