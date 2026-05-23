import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Image {
  type: 'url' | 'gridfs';
  url?: string;
  fileId?: mongoose.Types.ObjectId;
  filename?: string;
  mimeType?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  brand: string;
  type: string;
  price: number; 
  compareAtPrice?: number; 
  description?: string;
  specs: any;
  stock: number;
  images: Image[];
  featured: boolean;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema({
  type: { 
    type: String, 
    enum: ['url', 'gridfs'],
    default: 'url',
    required: true
  },
  url: { type: String },
  fileId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  filename: String,
  mimeType: String
});

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, default: null }, 
  description: { type: String },
  specs: { type: Schema.Types.Mixed, default: {} },
  stock: { type: Number, default: 0 },
  images: [ImageSchema],
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  tags: { type: [String], default: [] },
}, {
  timestamps: true
});

// Virtual getter for image URLs
productSchema.virtual('imageUrls').get(function() {
  return this.images.map(img => {
    if (img.type === 'url') return img.url;
    if (img.type === 'gridfs' && img.fileId) {
      return `/api/products/image/${img.fileId}`;
    }
    return '';
  }).filter(Boolean);
});
// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});
// Export both the model and the model type
const ProductModel = mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;
export type ProductModelType = typeof ProductModel;