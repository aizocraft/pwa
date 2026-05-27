// models/Invoice.ts - Updated with profit tracking
import mongoose, { Document, Schema } from 'mongoose';
import QuoteNumberCounterModel from './QuoteNumberCounter';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';

export interface IInvoiceItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  qty: number;
  price: number; // Selling price
  buyingPrice: number; // Cost price for profit tracking
  profitPerItem: number; // Profit per unit
  totalProfit: number; // Total profit for this line item
  total: number;
  tax?: number;
  taxable?: boolean;
  description?: string;
}

export interface ITransportInfo {
  cost: number;
  description: string;
}

export interface IInvoice extends Document {
  quotationId: mongoose.Types.ObjectId;
  quotationNumber: string;
  
  orderId?: mongoose.Types.ObjectId;
  orderCreatedAt?: Date;
  
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;

  createdBy: mongoose.Types.ObjectId;
  createdByName?: string;

  items: IInvoiceItem[];

  subtotal: number;
  totalCost: number; // Total cost of goods
  totalProfit: number; // Total profit for invoice
  taxRate: number;
  tax: number;
  taxPerItem?: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  transportInfo?: ITransportInfo;
  transportCost?: number;
  transportDescription?: string;
  total: number;

  invoiceNumber: string;
  
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number;
  
  issueDate: Date;
  dueDate: Date;
  
  notes?: string;
  terms?: string;
  
  payments: Array<{
    amount: number;
    method: string;
    reference?: string;
    date: Date;
    recordedBy: mongoose.Types.ObjectId;
    transactionId?: string;
  }>;
  
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    buyingPrice: { type: Number, default: 0, min: 0 },
    profitPerItem: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0 },
    taxable: { type: Boolean, default: true },
    description: { type: String }
  },
  { _id: false }
);

const transportInfoSchema = new Schema<ITransportInfo>(
  {
    cost: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, trim: true }
  },
  { _id: false }
);

const paymentSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, required: true },
  reference: { type: String },
  date: { type: Date, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String }
});

const invoiceSchema = new Schema<IInvoice>(
  {
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true, index: true },
    quotationNumber: { type: String, required: true },
    
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    orderCreatedAt: { type: Date },
    
    customerId: { type: Schema.Types.ObjectId, ref: 'SalesCustomer', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    customerPhone: { type: String, trim: true },
    customerLocation: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String },

    items: { type: [invoiceItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    totalProfit: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, required: true, min: 0, max: 1 },
    tax: { type: Number, required: true, min: 0 },
    taxPerItem: { type: Boolean, default: false },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    transportInfo: { type: transportInfoSchema },
    transportCost: { type: Number, default: 0 },
    transportDescription: { type: String },
    total: { type: Number, required: true, min: 0 },

    invoiceNumber: { type: String, required: true, unique: true, index: true },
    
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true
    },
    
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overpaid'],
      default: 'unpaid'
    },
    
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    
    notes: { type: String, trim: true },
    terms: { type: String, trim: true },
    
    payments: [paymentSchema],
    
    sentAt: { type: Date }
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totals including profit
invoiceSchema.pre('save', function(next) {
  // Calculate profit metrics for items
  if (this.isModified('items')) {
    this.subtotal = 0;
    this.totalCost = 0;
    this.totalProfit = 0;
    
    for (const item of this.items) {
      const itemTotal = item.price * item.qty;
      const itemCost = (item.buyingPrice || 0) * item.qty;
      const itemProfit = itemTotal - itemCost;
      
      item.total = itemTotal;
      item.totalProfit = itemProfit;
      item.profitPerItem = item.price - (item.buyingPrice || 0);
      
      this.subtotal += itemTotal;
      this.totalCost += itemCost;
      this.totalProfit += itemProfit;
    }
  }
  
  // Calculate balance due
  if (this.isModified('amountPaid') || this.isModified('total')) {
    this.balanceDue = Math.max(0, this.total - this.amountPaid);
    
    if (this.amountPaid === 0) {
      this.paymentStatus = 'unpaid';
    } else if (this.amountPaid < this.total) {
      this.paymentStatus = 'partially_paid';
    } else if (this.amountPaid === this.total) {
      this.paymentStatus = 'paid';
      if (this.status === 'draft' || this.status === 'sent') {
        this.status = 'paid';
      }
    } else {
      this.paymentStatus = 'overpaid';
    }
  }
  next();
});

// Generate invoice number
export async function generateInvoiceNumber(date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1;
  const month = String(monthNumber).padStart(2, '0');

  const counter = await QuoteNumberCounterModel.findOneAndUpdate(
    { year, month: monthNumber, type: 'invoice' },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = String(counter!.sequence).padStart(4, '0');
  return `${sequence}-${month}-PSMA/I`;
}

const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export default InvoiceModel;