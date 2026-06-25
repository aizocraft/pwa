import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
  orderId: mongoose.Types.ObjectId;
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
  
  // Metadata
  notes?: string;
  recordedBy?: mongoose.Types.ObjectId;
  recordedByName?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual' | 'invoice' | 'order';
  isPartialPayment: boolean;
  paidAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionModel extends Model<ITransaction> {}

const transactionSchema = new Schema<ITransaction, TransactionModel>({
  orderId: { 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'Order', 
    required: false, 
    index: true 
  },
  invoiceId: { 
  type: mongoose.SchemaTypes.ObjectId, 
  ref: 'Invoice', 
  required: false, 
  index: true 
},

  invoiceNumber: { type: String, index: true },
  quotationNumber: { type: String, index: true },
  
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  guestEmail: String,
  guestPhone: String,
  customerName: { type: String, required: true },
  
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'KES' },
  
  paymentMethod: { 
    type: String, 
    enum: ['mpesa', 'card', 'cod', 'cash', 'bank_transfer', 'cheque'],
    required: true
  },
  
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  transactionId: { type: String, required: true, unique: true },
  
  mpesaReceipt: String,
  cardLast4: String,
  cardBrand: String,
  reference: String,
  
  notes: String,
  recordedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  recordedByName: String,
  
  source: { 
    type: String, 
    enum: ['checkout', 'quotation', 'admin', 'manual', 'invoice'],
    required: true,
    default: 'manual'
  },

  
  isPartialPayment: { type: Boolean, default: false },
  paidAt: { type: Date }
}, { timestamps: true });

// Indexes
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ orderId: 1, status: 1 });
transactionSchema.index({ invoiceNumber: 1 });
transactionSchema.index({ invoiceId: 1 });
transactionSchema.index({ source: 1 });

const TransactionModel = mongoose.model<ITransaction, TransactionModel>('Transaction', transactionSchema);

export default TransactionModel;