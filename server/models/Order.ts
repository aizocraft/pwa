import mongoose, { Document, Model, Schema, SchemaTypes } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  qty: number;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  guestInfo?: {
    email: string;
    phone: string;
    name?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'cod' | 'mpesa' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: {
    transactionId?: string;
    mpesaReceipt?: string;
    cardLast4?: string;
    cardBrand?: string;
  };
  stripeId?: string;
  selectedShippingArea?: mongoose.Types.ObjectId;
  appliedPromoCode?: mongoose.Types.ObjectId;
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

interface IOrderModel extends Model<IOrder> {
}

const orderItemSchema = new Schema({
  productId: { type: SchemaTypes.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const orderSchema = new Schema<IOrder, IOrderModel>({
  userId: { type: SchemaTypes.ObjectId, ref: 'User', required: false, index: true },
  guestInfo: {
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'mpesa', 'card'], 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    mpesaReceipt: String,
    cardLast4: String,
    cardBrand: String
  },
  stripeId: String,
  selectedShippingArea: { type: SchemaTypes.ObjectId, ref: 'ShippingArea' },
  appliedPromoCode: { type: SchemaTypes.ObjectId, ref: 'PromoCode' },
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

// Indexes for better query performance
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'guestInfo.email': 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ selectedShippingArea: 1 });
orderSchema.index({ appliedPromoCode: 1 });

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// ✅ Method to check if order can be cancelled
orderSchema.methods.canCancel = function(): boolean {
  return ['pending', 'processing'].includes(this.status);
};

// ✅ Method to check if order can be refunded
orderSchema.methods.canRefund = function(): boolean {
  return this.paymentStatus === 'completed' && 
         ['paid', 'shipped', 'delivered'].includes(this.status);
};

const OrderModel = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);

export default OrderModel;