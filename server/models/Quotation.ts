import mongoose, { Document, Schema } from 'mongoose';
import QuoteNumberCounterModel from './QuoteNumberCounter';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type DiscountType = 'percentage' | 'fixed';

export interface IQuotationItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  qty: number;
  price: number;
  buyingPrice: number;
  profitPerItem: number;
  totalProfit: number;
  total: number;
  tax?: number;
  customPrice?: boolean;
  taxable?: boolean;
  image?: string;
  description?: string;
}

export interface ITransportInfo {
  cost: number;
  description: string;
}

export interface IQuotation extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName?: string;
  invoiceId?: mongoose.Types.ObjectId | string;
  invoiceNumber?: string;
  lastInvoiceCreatedAt?: Date;
  items: IQuotationItem[];
  subtotal: number;
  totalCost: number;
  totalProfit: number;
  taxRate: number;
  tax: number;
  taxPerItem?: boolean;
  discount: number;
  discountType: DiscountType;
  discountReason?: string;
  transportInfo?: ITransportInfo;
  transportCost?: number;
  transportDescription?: string;
  estimatedDelivery?: string;
  total: number;
  quoteNumber: string;
  status: QuotationStatus;
  validUntil: Date;
  notes?: string;
  terms?: string;
  acceptedAt?: Date;
  sentAt?: Date;
  rejectedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const quotationItemSchema = new Schema<IQuotationItem>(
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
    tax: { type: Number, default: 0, min: 0 },
    customPrice: { type: Boolean, default: false },
    taxable: { type: Boolean, default: true },
    image: { type: String },
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

const quotationSchema = new Schema<IQuotation>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'SalesCustomer', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    customerPhone: { type: String, trim: true },
    customerLocation: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: false },
    invoiceNumber: { type: String, required: false },
    lastInvoiceCreatedAt: { type: Date, required: false },
    items: { type: [quotationItemSchema], required: true, validate: {
      validator: function(items: any[]) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    } },
    subtotal: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    totalProfit: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, required: true, min: 0, max: 1 },
    tax: { type: Number, required: true, min: 0 },
    taxPerItem: { type: Boolean, default: false },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountReason: { type: String },
    transportInfo: { type: transportInfoSchema },
    transportCost: { type: Number, default: 0, min: 0 },
    transportDescription: { type: String, trim: true },
    estimatedDelivery: { type: String, trim: true },
    total: { type: Number, required: true, min: 0 },
    quoteNumber: { type: String, required: true, unique: true }, // unique creates index automatically
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft'
    },
    validUntil: { type: Date, required: true },
    notes: { type: String, trim: true },
    terms: { type: String, trim: true },
    acceptedAt: { type: Date },
    sentAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String }
  },
  { timestamps: true }
);

// Only define NON-unique indexes here
// DO NOT redefine quoteNumber since it already has 'unique: true'
quotationSchema.index({ customerId: 1 });
quotationSchema.index({ createdBy: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ createdAt: -1 });

// Pre-save middleware
quotationSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount') || this.isModified('discountType') || 
      this.isModified('transportInfo') || this.isModified('taxPerItem')) {
    
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
    
    let discountAmount = this.discount;
    if (this.discountType === 'percentage') {
      discountAmount = this.subtotal * (this.discount / 100);
    }
    
    let tax = 0;
    if (this.taxPerItem) {
      tax = this.items.reduce((sum, item) => sum + (item.tax || 0), 0);
    } else {
      const taxableAmount = Math.max(0, this.subtotal - discountAmount);
      tax = taxableAmount * this.taxRate;
    }
    this.tax = tax;
    
    const transportCost = this.transportInfo?.cost || this.transportCost || 0;
    this.total = this.subtotal - discountAmount + this.tax + transportCost;
  }
  next();
});

export async function generateQuoteNumber(date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1;
  const month = String(monthNumber).padStart(2, '0');

  const counter = await QuoteNumberCounterModel.findOneAndUpdate(
    { year, month: monthNumber, type: 'quotation' },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = String(counter!.sequence).padStart(4, '0');
  return `${sequence}-${month}-PSMA/Q`;
}

const QuotationModel = mongoose.model<IQuotation>('Quotation', quotationSchema);
export default QuotationModel;