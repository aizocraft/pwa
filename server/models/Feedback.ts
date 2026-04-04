import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  name?: string;  // Made optional
  email?: string; // Made optional
  rating: number;
  category: string;
  feedback: string;
  status: 'pending' | 'reviewed' | 'resolved';
  isPublic: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
      // Removed required
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
      // Removed required
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['product', 'service', 'shipping', 'website', 'customer-support', 'other'],
      default: 'product'
    },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ rating: 1 });
FeedbackSchema.index({ category: 1 });

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);