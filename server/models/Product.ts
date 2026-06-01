import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Image {
  type: 'url' | 'gridfs';
  url?: string;
  fileId?: mongoose.Types.ObjectId;
  filename?: string;
  mimeType?: string;
}

export interface IBuyingPriceHistory {
  price: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  changedBy: mongoose.Types.ObjectId;
  reason?: string;
}

export interface IProduct extends Document {
  name: string;
  slug?: string;
  sku: string;
  category?: string;
  brand?: string;
  type?: string;
  price: number;
  buyingPrice: number;
  compareAtPrice?: number;
  description?: string;
  specs: any;
  stock: number;
  images: Image[];
  featured: boolean;
  rating: number;
  tags: string[];
  supplier?: mongoose.Types.ObjectId;
  supplierName?: string;
  buyingPriceHistory: IBuyingPriceHistory[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  profitMargin: number;
  profitAmount: number;
  marginPercentage: number;
  imageUrls: string[];
  discountPercent: number;
  
  // Methods
  updateBuyingPrice(newPrice: number, userId: mongoose.Types.ObjectId, reason?: string): Promise<boolean>;
}

export interface IProductModel extends Model<IProduct> {
  generateSKU(category: string, existingSkus?: string[]): string;
}

export function generateSKU(category: string, existingSkus: string[] = []): string {
  let prefix = (category || 'GEN').substring(0, 3).toUpperCase();
  
  if (prefix.length < 3) {
    prefix = prefix.padEnd(3, 'X');
  }
  
  const existingNumbers = existingSkus
    .filter(sku => sku.startsWith(`${prefix}-`))
    .map(sku => parseInt(sku.split('-')[1] || '0'))
    .filter(num => !isNaN(num));
  
  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    nextNumber = Math.max(...existingNumbers) + 1;
  }
  
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
}

const BuyingPriceHistorySchema = new Schema({
  price: { type: Number, required: true },
  effectiveFrom: { type: Date, default: Date.now },
  effectiveTo: { type: Date },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String }
});

const ImageSchema = new Schema({
  type: { 
    type: String, 
    enum: ['url', 'gridfs'],
    default: 'url',
    required: true
  },
  url: { type: String },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
  filename: String,
  mimeType: String
});

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: false, unique: true, sparse: true }, // unique creates index automatically
  sku: { type: String, required: true, unique: true }, // unique creates index automatically
  category: { type: String, required: false },
  brand: { type: String, required: false },
  type: { type: String, required: false },
  price: { type: Number, required: true },
  buyingPrice: { type: Number, required: true, default: 0 },
  compareAtPrice: { type: Number, default: null },
  description: { type: String },
  specs: { type: Schema.Types.Mixed, default: {} },
  stock: { type: Number, default: 0 },
  images: [ImageSchema],
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  tags: { type: [String], default: [] },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: { type: String },
  buyingPriceHistory: [BuyingPriceHistorySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Only define NON-unique indexes here
// DO NOT redefine indexes for fields that already have 'unique: true'
productSchema.index({ category: 1 });

// Virtuals
productSchema.virtual('profitMargin').get(function(this: IProduct) {
  if (this.buyingPrice && this.price) {
    return ((this.price - this.buyingPrice) / this.price) * 100;
  }
  return 0;
});

productSchema.virtual('profitAmount').get(function(this: IProduct) {
  return (this.price || 0) - (this.buyingPrice || 0);
});

productSchema.virtual('marginPercentage').get(function(this: IProduct) {
  if (this.buyingPrice && this.price) {
    return ((this.price - this.buyingPrice) / this.buyingPrice) * 100;
  }
  return 0;
});

productSchema.virtual('imageUrls').get(function(this: IProduct) {
  return this.images.map(img => {
    if (img.type === 'url') return img.url;
    if (img.type === 'gridfs' && img.fileId) {
      return `/api/products/image/${img.fileId}`;
    }
    return '';
  }).filter(Boolean);
});

productSchema.virtual('discountPercent').get(function(this: IProduct) {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Method
productSchema.methods.updateBuyingPrice = async function(
  this: IProduct,
  newPrice: number, 
  userId: mongoose.Types.ObjectId, 
  reason?: string
): Promise<boolean> {
  if (this.buyingPrice === newPrice) {
    return false;
  }
  
  const currentHistory = this.buyingPriceHistory.find(h => !h.effectiveTo);
  if (currentHistory) {
    currentHistory.effectiveTo = new Date();
  }
  
  this.buyingPriceHistory.push({
    price: newPrice,
    effectiveFrom: new Date(),
    changedBy: userId,
    reason: reason || 'Price update'
  });
  
  this.buyingPrice = newPrice;
  await this.save();
  return true;
};

// Pre-save hook
productSchema.pre('save', async function(this: IProduct, next) {
  if (!this.sku) {
    const ProductModel = mongoose.model<IProduct>('Product');
    const existingProducts = await ProductModel.find({ 
      category: this.category,
      sku: { $regex: `^${(this.category || 'GEN').substring(0, 3).toUpperCase()}-` }
    }).select('sku');
    
    const existingSkus = existingProducts.map(p => p.sku);
    this.sku = generateSKU(this.category || 'GEN', existingSkus);
  }
  next();
});

const ProductModel = mongoose.model<IProduct, IProductModel>('Product', productSchema);
export default ProductModel;