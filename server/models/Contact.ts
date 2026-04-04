import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email?: string;  // Made optional
  phone?: string;  // Added phone field
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'spam';
  userAgent?: string;
  ipAddress?: string;
  repliedAt?: Date;
  repliedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
      // Removed required - either email or phone can be provided
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
      // Added phone field
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'read', 'replied', 'spam'],
      default: 'pending'
    },
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    repliedAt: {
      type: Date
    },
    repliedBy: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Validate that either email or phone is provided
ContactSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required'));
  } else {
    next();
  }
});

// Indexes
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ phone: 1 });
ContactSchema.index({ createdAt: -1 });

export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);