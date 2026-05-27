// src/models/ProfitAnalysis.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProfitAnalysis extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  category?: string;
  brand?: string;
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  
  // Sales metrics
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageSellingPrice: number;
  averageBuyingPrice: number;
  
  // Margin metrics
  averageProfitMargin: number; // Percentage
  averageMarkup: number; // Percentage based on cost
  
  // Period breakdowns
  daily: IPeriodProfit[];
  weekly: IPeriodProfit[];
  monthly: IPeriodProfit[];
  quarterly: IPeriodProfit[];
  
  // Last updated
  lastCalculated: Date;
}

export interface IPeriodProfit {
  period: string; // YYYY-MM-DD or YYYY-WW or YYYY-MM
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

const PeriodProfitSchema = new Schema({
  period: { type: String, required: true },
  unitsSold: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  margin: { type: Number, default: 0 }
});

const ProfitAnalysisSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  productName: { type: String, required: true },
  productSku: { type: String, required: true },
  category: { type: String, index: true },
  brand: { type: String },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: { type: String },
  
  totalUnitsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  averageSellingPrice: { type: Number, default: 0 },
  averageBuyingPrice: { type: Number, default: 0 },
  averageProfitMargin: { type: Number, default: 0 },
  averageMarkup: { type: Number, default: 0 },
  
  daily: [PeriodProfitSchema],
  weekly: [PeriodProfitSchema],
  monthly: [PeriodProfitSchema],
  quarterly: [PeriodProfitSchema],
  
  lastCalculated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient filtering
ProfitAnalysisSchema.index({ category: 1 });
ProfitAnalysisSchema.index({ supplierId: 1 });
ProfitAnalysisSchema.index({ brand: 1 });
ProfitAnalysisSchema.index({ totalProfit: -1 });
ProfitAnalysisSchema.index({ averageProfitMargin: -1 });

const ProfitAnalysisModel = mongoose.model<IProfitAnalysis>('ProfitAnalysis', ProfitAnalysisSchema);
export default ProfitAnalysisModel;