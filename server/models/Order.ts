// src/models/Order.ts
import mongoose, { Document, Model, Schema, SchemaTypes } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  sellingPrice: number;
  buyingPrice: number;
  profit: number;
  qty: number;
  description?: string;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  guestInfo?: { email: string; phone: string; name?: string; };
  items: IOrderItem[];
  subtotal: number;
  totalCost: number; 
  totalProfit: number; 
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'cod' | 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
  
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' | 'refunded';
  amountPaid: number;
  balanceDue: number;
  
  paymentDetails?: {
    transactionId?: string;
    mpesaReceipt?: string;
    cardLast4?: string;
    cardBrand?: string;
    paidAt?: Date;
    phoneNumber?: string;
  };
  
  invoiceNumber?: string;
  quotationNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  invoiceSentAt?: Date;
  paymentTerms?: string;
  
  stripeId?: string;
  selectedShippingArea?: mongoose.Types.ObjectId;
  appliedPromoCode?: mongoose.Types.ObjectId;
  salesCustomerId?: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  
  shippingAddress: {
    fullName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email?: string;
  };
  
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
  
  canCancel(): boolean;
  canRefund(): boolean;
}

interface IOrderModel extends Model<IOrder> {}

const orderItemSchema = new Schema({
  productId: { type: SchemaTypes.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String},
  sellingPrice: { type: Number, required: true },
  buyingPrice: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  qty: { type: Number, required: true, min: 1 },
  description: { type: String }
}, { _id: false });

const orderSchema = new Schema<IOrder, IOrderModel>({
  userId: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  guestInfo: {
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, enum: ['cod', 'mpesa', 'card', 'cash', 'bank_transfer', 'cheque'], required: true },
  
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'overpaid', 'refunded'],
    default: 'unpaid'
  },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  
  paymentDetails: {
    transactionId: { type: String },
    mpesaReceipt: { type: String },
    cardLast4: { type: String },
    cardBrand: { type: String },
    paidAt: { type: Date },
    phoneNumber: { type: String }
  },
  
  invoiceNumber: { type: String, unique: true, sparse: true }, // REMOVED index:true
  quotationNumber: { type: String }, // REMOVED index:true from field
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  invoiceSentAt: Date,
  paymentTerms: { type: String, default: 'Due on receipt' },
  
  stripeId: String,
  selectedShippingArea: { type: SchemaTypes.ObjectId, ref: 'ShippingArea' },
  appliedPromoCode: { type: SchemaTypes.ObjectId, ref: 'PromoCode' },
  salesCustomerId: { type: SchemaTypes.ObjectId, ref: 'SalesCustomer' },
  quotationId: { type: SchemaTypes.ObjectId, ref: 'Quotation' },
  invoiceId: { type: SchemaTypes.ObjectId, ref: 'Invoice' },
  
  shippingAddress: {
    fullName: { type: String, required: true },
    address1: { type: String, required: true },
    address2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true, default: 'KE' },
    phone: { type: String, required: true },
    email: String
  },
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// All indexes defined here - NO duplicates
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'guestInfo.email': 1 });
orderSchema.index({ invoiceNumber: 1 }); // Now only defined once
orderSchema.index({ quotationNumber: 1 }); // Now only defined once

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for profit margin
orderSchema.virtual('profitMargin').get(function(this: IOrder) {
  if (this.total && this.totalCost) {
    return ((this.total - this.totalCost) / this.total) * 100;
  }
  return 0;
});

// Methods
orderSchema.methods.canCancel = function(): boolean {
  return ['pending', 'processing'].includes(this.status);
};

orderSchema.methods.canRefund = function(): boolean {
  return ['paid', 'partially_paid'].includes(this.paymentStatus) && 
         ['paid', 'shipped', 'delivered'].includes(this.status);
};

// Pre-save hook to calculate balance
orderSchema.pre('save', function(next) {
  this.balanceDue = Math.max(0, this.total - this.amountPaid);
  next();
});

const OrderModel = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);

export default OrderModel;