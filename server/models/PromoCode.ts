import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  type: 'percent' | 'fixed';
  value: number; // % for percent, amount for fixed
  maxUses: number;
  usedCount: number;
  minSubtotal: number;
  expiryDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  canUse(subtotal: number): boolean;
}

interface IPromoModel extends Model<IPromoCode> {}

const promoCodeSchema = new Schema<IPromoCode, IPromoModel>({
  code: { 
    type: String, 
    required: [true, 'Promo code is required'],
    trim: true,
    uppercase: true,
    unique: true,
    minlength: [3, 'Code must be at least 3 characters']
  },
  type: { 
    type: String, 
    enum: ['percent', 'fixed'],
    required: true 
  },
  value: { 
    type: Number, 
    required: [true, 'Discount value is required'],
    min: 0
  },
  maxUses: { 
    type: Number, 
    default: 0, // 0 = unlimited
    min: 0
  },
  usedCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  minSubtotal: { 
    type: Number, 
    default: 0,
    min: 0
  },
  expiryDate: Date,
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: String
}, {
  timestamps: true
});

// Method to check if promo can be used
promoCodeSchema.methods.canUse = function(subtotal: number): boolean {
  return this.isActive &&
         (!this.expiryDate || this.expiryDate > new Date()) &&
         this.usedCount < this.maxUses &&
         subtotal >= this.minSubtotal;
};


promoCodeSchema.index({ isActive: 1, expiryDate: 1 });

export default mongoose.model<IPromoCode, IPromoModel>('PromoCode', promoCodeSchema);
