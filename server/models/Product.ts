import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  brand: string;
  type: string;
  price: number; 
  description?: string;
  specs: any;
  stock: number;
  images: string[];
  featured: boolean;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true }, 
  description: { type: String },
  specs: { type: Schema.Types.Mixed, default: {} },
  stock: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  tags: { type: [String], default: [] },
}, {
  timestamps: true
});

// Export both the model and the model type
const ProductModel = mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;
export type ProductModelType = typeof ProductModel;