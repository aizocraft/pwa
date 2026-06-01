import mongoose, { Schema, Model } from 'mongoose';

export interface IQuoteNumberCounter extends mongoose.Document {
  year: number;
  month: number;
  sequence: number;
  type: 'quotation' | 'invoice';
  updatedAt: Date;
}

const quoteNumberCounterSchema = new Schema<IQuoteNumberCounter>(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    sequence: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, enum: ['quotation', 'invoice'], default: 'quotation' },
  },
  { timestamps: true }
);

// Single unique compound index - no duplicates
quoteNumberCounterSchema.index({ year: 1, month: 1, type: 1 }, { unique: true });

const QuoteNumberCounterModel: Model<IQuoteNumberCounter> = mongoose.model(
  'QuoteNumberCounter',
  quoteNumberCounterSchema
);

export default QuoteNumberCounterModel;