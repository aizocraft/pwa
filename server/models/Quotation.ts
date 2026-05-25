// models/Quotation.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import QuoteNumberCounterModel from './QuoteNumberCounter';

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted';

export type DiscountType = 'percentage' | 'fixed';

export interface IQuotationItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  qty: number;
  price: number;
  total: number;
  tax?: number;
  customPrice?: boolean;
  taxable?: boolean;
  image?: string;
  description?: string;
}

export interface IShippingInfo {
  areaId: mongoose.Types.ObjectId;
  areaName: string;
  baseCost: number;
  freeThreshold: number;
  estimatedDelivery?: string;
  cost: number;
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

  items: IQuotationItem[];

  subtotal: number;
  taxRate: number;
  tax: number;
  taxPerItem?: boolean;
  discount: number;
  discountType: DiscountType;
  discountReason?: string;
  shippingInfo?: IShippingInfo;
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

  convertedAt?: Date;
  convertedOrderId?: mongoose.Types.ObjectId;
  
  sentAt?: Date;
  acceptedAt?: Date;
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
    total: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    customPrice: { type: Boolean, default: false },
    taxable: { type: Boolean, default: true },
    image: { type: String },
    description: { type: String }
  },
  { _id: false }
);

const shippingInfoSchema = new Schema<IShippingInfo>(
  {
    areaId: { type: Schema.Types.ObjectId, ref: 'ShippingArea', required: true },
    areaName: { type: String, required: true },
    baseCost: { type: Number, required: true, min: 0 },
    freeThreshold: { type: Number, default: 0 },
    estimatedDelivery: { type: String },
    cost: { type: Number, required: true, min: 0 }
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
    customerId: { type: Schema.Types.ObjectId, ref: 'SalesCustomer', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    customerPhone: { type: String, trim: true },
    customerLocation: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdByName: { type: String },

    items: { type: [quotationItemSchema], required: true, validate: {
      validator: function(items: any[]) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    } },

    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0, max: 1 },
    tax: { type: Number, required: true, min: 0 },
    taxPerItem: { type: Boolean, default: false },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountReason: { type: String },
    shippingInfo: { type: shippingInfoSchema },
    transportInfo: { type: transportInfoSchema },
    transportCost: { type: Number, default: 0, min: 0 },
    transportDescription: { type: String, trim: true },
    estimatedDelivery: { type: String, trim: true },
    total: { type: Number, required: true, min: 0 },

    quoteNumber: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
      index: true
    },

    validUntil: { type: Date, required: true, index: true },

    notes: { type: String, trim: true },
    terms: { type: String, trim: true },

    convertedAt: { type: Date },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String }
  },
  { timestamps: true }
);

// Indexes for better query performance
quotationSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
quotationSchema.index({ quoteNumber: 1 });
quotationSchema.index({ customerId: 1, status: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
quotationSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount') || this.isModified('discountType') || 
      this.isModified('shippingInfo') || this.isModified('transportInfo') || this.isModified('taxPerItem')) {
    
    // Recalculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Calculate discount amount
    let discountAmount = this.discount;
    if (this.discountType === 'percentage') {
      discountAmount = this.subtotal * (this.discount / 100);
    }
    
    // Calculate tax based on taxPerItem setting
    let tax = 0;
    if (this.taxPerItem) {
      // Sum tax from individual items
      tax = this.items.reduce((sum, item) => sum + (item.tax || 0), 0);
    } else {
      // Calculate tax on whole amount after discount
      const taxableAmount = Math.max(0, this.subtotal - discountAmount);
      tax = taxableAmount * this.taxRate;
    }
    this.tax = tax;
    
    // Get shipping cost (legacy) or transport cost
    const shippingCost = this.shippingInfo?.cost || 0;
    const transportCost = this.transportInfo?.cost || this.transportCost || 0;
    const finalTransportCost = Math.max(shippingCost, transportCost);
    
    // Calculate total
    this.total = this.subtotal - discountAmount + this.tax + finalTransportCost;
  }
  next();
});

// Virtual for getting effective transport info
quotationSchema.virtual('effectiveTransportInfo').get(function() {
  if (this.transportInfo) {
    return this.transportInfo;
  }
  if (this.transportCost !== undefined || this.transportDescription) {
    return {
      cost: this.transportCost || 0,
      description: this.transportDescription || ''
    };
  }
  return null;
});

const QuotationModel = mongoose.model<IQuotation>('Quotation', quotationSchema);

// Standalone function to generate quote number
export async function generateQuoteNumber(date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1; // 1-12
  const month = String(monthNumber).padStart(2, '0');

  // Atomic increment per year/month to avoid duplicate quote numbers under concurrency.
  const counter = await QuoteNumberCounterModel.findOneAndUpdate(
    { year, month: monthNumber },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = String(counter!.sequence).padStart(5, '0');
  return `QT-${year}${month}-${sequence}`;
}

export default QuotationModel;