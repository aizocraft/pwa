import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
  orderId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  canRefund(): boolean;
}

interface TransactionModel extends Model<ITransaction> {}

const transactionSchema = new Schema<ITransaction, TransactionModel>({
  orderId: { 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'Order', 
    required: true, 
    index: true 
  },
  userId: { 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User' 
  },
  guestEmail: String,
  guestPhone: String,
  customerName: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'KES' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['mpesa', 'card', 'cod'],
    required: true
  },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: { 
    type: String, 
    required: true,
    unique: true
  },
  mpesaReceipt: String,
  cardLast4: String,
  cardBrand: String,
  notes: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'orderId': 1 });

// Can this transaction be refunded?
transactionSchema.methods.canRefund = function(): boolean {
  return this.status === 'completed';
};

const TransactionModel = mongoose.model<ITransaction, TransactionModel>('Transaction', transactionSchema);

export default TransactionModel;
