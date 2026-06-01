// src/models/Supplier.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number; // Days
  notes?: string;
  status: 'active' | 'inactive';
  productsSupplied?: mongoose.Types.ObjectId[];
  totalPurchases: number;
  lastPurchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const SupplierSchema = new Schema({
  name: { type: String, required: true, unique: true }, // REMOVED index:true
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'KE' },
    zipCode: String
  },
  taxId: { type: String },
  paymentTerms: { type: String, default: 'Net 30' },
  leadTime: { type: Number, default: 7 },
  notes: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  productsSupplied: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Define indexes here (unique:true already creates index for 'name')
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ phone: 1 });
SupplierSchema.index({ status: 1 });

const SupplierModel = mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default SupplierModel;