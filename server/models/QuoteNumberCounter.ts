import mongoose, { Schema, Model } from 'mongoose';

export interface IQuoteNumberCounter extends mongoose.Document {
  year: number;
  month: number; // 1-12
  sequence: number;
  updatedAt: Date;
}

const quoteNumberCounterSchema = new Schema<IQuoteNumberCounter>(
  {
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    sequence: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Enforce single counter doc per year/month
quoteNumberCounterSchema.index({ year: 1, month: 1 }, { unique: true });

const QuoteNumberCounterModel: Model<IQuoteNumberCounter> = mongoose.model(
  'QuoteNumberCounter',
  quoteNumberCounterSchema
);

export default QuoteNumberCounterModel;

