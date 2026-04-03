// server/models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'sales' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;  // Add this field
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['user', 'sales', 'admin'], 
    default: 'user' 
  },
  phone: { 
    type: String, 
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  avatar: { type: String },
  isActive: { 
    type: Boolean, 
    default: true  // Add default value
  },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// Hash password pre-save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;