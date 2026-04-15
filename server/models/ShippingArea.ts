import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingArea extends Document {
  name: string;
  regions: string[]; // e.g. Kenyan counties covered
  baseCost: number;
  freeThreshold: number; // subtotal > this → free shipping
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IShippingAreaModel extends Model<IShippingArea> {}

const shippingAreaSchema = new Schema<IShippingArea, IShippingAreaModel>({
  name: { 
    type: String, 
    required: [true, 'Shipping area name is required'],
    trim: true,
    unique: true
  },
  regions: [{
    type: String,
    trim: true
  }],
  baseCost: { 
    type: Number, 
    required: [true, 'Base shipping cost is required'],
    min: 0
  },
  freeThreshold: { 
    type: Number, 
    default: 0, // 0 = no free shipping
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: String
}, {
  timestamps: true
});

shippingAreaSchema.index({ isActive: 1 });


export default mongoose.model<IShippingArea, IShippingAreaModel>('ShippingArea', shippingAreaSchema);
