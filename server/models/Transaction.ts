// src/models/Transaction.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
  orderId?: mongoose.Types.ObjectId;
  orderNumber?: string; // Store order number for quick access
  invoiceId?: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  quotationNumber?: string;
  
  userId?: mongoose.Types.ObjectId;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod' | 'cash' | 'bank_transfer' | 'cheque';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  
  // Payment details
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  reference?: string;
  phoneNumber?: string; // For M-Pesa transactions
  
  // Metadata
  notes?: string;
  recordedBy?: mongoose.Types.ObjectId;
  recordedByName?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual' | 'invoice' | 'order' | 'pos';
  isPartialPayment: boolean;
  paidAt?: Date;
  
  // For tracking refunds
  refundedAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  parentTransactionId?: string; // For refund transactions
  
  createdAt: Date;
  updatedAt: Date;
}

// ✅ FIX: Add the static methods to the interface
interface TransactionModel extends Model<ITransaction> {
  generateTransactionId(prefix?: string, source?: string): string;
}

const transactionSchema = new Schema<ITransaction, TransactionModel>({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: false, 
    index: true 
  },
  orderNumber: { 
    type: String, 
    index: true,
    trim: true 
  },
  invoiceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Invoice', 
    required: false, 
    index: true 
  },
  invoiceNumber: { 
    type: String, 
    index: true,
    trim: true 
  },
  quotationNumber: { 
    type: String, 
    index: true,
    trim: true 
  },
  
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  guestEmail: { 
    type: String, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  guestPhone: { 
    type: String, 
    trim: true,
    index: true 
  },
  customerName: { 
    type: String, 
    required: true,
    trim: true,
    index: true 
  },
  
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'KES' 
  },
  
  paymentMethod: { 
    type: String, 
    enum: ['mpesa', 'card', 'cod', 'cash', 'bank_transfer', 'cheque'],
    required: true,
    index: true
  },
  
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  transactionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  mpesaReceipt: { 
    type: String,
    index: true 
  },
  cardLast4: String,
  cardBrand: String,
  reference: {
    type: String,
    index: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  
  notes: {
    type: String,
    trim: true
  },
  recordedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  recordedByName: {
    type: String,
    trim: true
  },
  
  source: { 
    type: String, 
    enum: ['checkout', 'quotation', 'admin', 'manual', 'invoice', 'order', 'pos'],
    required: true,
    default: 'manual',
    index: true
  },
  
  isPartialPayment: { 
    type: Boolean, 
    default: false 
  },
  paidAt: { 
    type: Date,
    index: true 
  },
  
  // Refund tracking fields
  refundedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundedAt: Date,
  refundReason: {
    type: String,
    trim: true
  },
  parentTransactionId: {
    type: String,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
transactionSchema.index({ orderId: 1, status: 1 });
transactionSchema.index({ orderNumber: 1, status: 1 });
transactionSchema.index({ invoiceNumber: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ paymentMethod: 1, status: 1 });
transactionSchema.index({ source: 1, status: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function(this: ITransaction) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: this.currency || 'KES'
  }).format(this.amount);
});

// Virtual for isRefund
transactionSchema.virtual('isRefund').get(function(this: ITransaction) {
  return this.status === 'refunded' || this.amount < 0;
});

// Pre-save middleware to ensure orderNumber is populated
transactionSchema.pre('save', async function(this: ITransaction, next) {
  // If orderId is present but orderNumber is missing, fetch it
  if (this.orderId && !this.orderNumber) {
    try {
      const OrderModel = mongoose.model('Order');
      const order = await OrderModel.findById(this.orderId).select('orderNumber');
      if (order && order.orderNumber) {
        this.orderNumber = order.orderNumber;
      }
    } catch (error) {
      console.error('Failed to populate orderNumber:', error);
    }
  }
  
  // Set paidAt if status is completed and not already set
  if (this.status === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  next();
});

// ✅ Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function(
  prefix: string = 'TXN',
  source: string = 'manual'
): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sourcePrefix = source.substring(0, 3).toUpperCase();
  return `${prefix}-${sourcePrefix}-${timestamp}-${random}`;
};

const TransactionModel = mongoose.model<ITransaction, TransactionModel>('Transaction', transactionSchema);

export default TransactionModel;