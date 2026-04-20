// server/models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Made optional for Google auth
  role: 'user' | 'sales' | 'admin';
    stripeCustomerId?: string; 

  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Google Auth fields
  googleId?: string;
  provider: 'local' | 'google';
  
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
  password: { 
    type: String, 
    minlength: 6,
    required: function(this: any) {
      return this.provider === 'local';
    }
  },
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
avatar: { 
  type: String,
  match: [/^(https?:\/\/.*|[\w\.\-\s]+)$/i, 'Avatar must be valid URL or GridFS filename']
},
  isActive: { 
    type: Boolean, 
    default: true
  },
  lastLogin: { type: Date },
  
  // Google Auth fields
  googleId: { 
    type: String, 
    sparse: true, 
    unique: true 
  },
  provider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Hash password pre-save (only for local provider) - also clear reset fields on password change
userSchema.pre('save', async function(next) {
  // Clear reset fields when password is changed
  if (this.isModified('password')) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }
  
  // Only hash password if provider is local and password is modified
  if (this.provider === 'local' && this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Compare password method (only for local provider)
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (this.provider !== 'local' || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
