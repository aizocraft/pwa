import mongoose, { Schema, model, models } from 'mongoose';
import { INotification } from '../types/notification';

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'stock', 'user', 'system', 'shipping', 'review'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    trim: true,
    maxlength: 200
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Compound index for unread count queries
notificationSchema.index({ userId: 1, read: 1 });

// Text index for searching titles/messages
notificationSchema.index({ 
  title: 'text', 
  message: 'text' 
});

// Pre-save middleware: Ensure metadata is valid object
notificationSchema.pre('save', function(next) {
  if (this.metadata && typeof this.metadata === 'object') {
    this.metadata = this.metadata;
  }
  next();
});

const Notification = models.Notification || model<INotification>('Notification', notificationSchema);

export default Notification;

