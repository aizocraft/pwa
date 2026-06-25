import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId | mongoose.Types.ObjectId;
  userId: Types.ObjectId | mongoose.Types.ObjectId;
  rating: number;
  review?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound unique index: one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Indexes for dashboard queries
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ productId: 1, status: 1 }); // ✅ Added for better query performance
reviewSchema.index({ review: 'text' });

// Virtual property for isApproved (derived from status)
reviewSchema.virtual('isApproved').get(function(this: IReview) {
  return this.status === 'approved';
});

// Ensure virtuals are included in JSON output
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

reviewSchema.methods.toJSON = function() {
  const review = this.toObject();
  review.id = review._id;
  delete review._id;
  delete review.__v;
  return review;
};

const ReviewModel = mongoose.model<IReview>('Review', reviewSchema);
export default ReviewModel;