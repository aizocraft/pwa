import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalesCustomer extends Document {
  user?: mongoose.Types.ObjectId; // link to User if the customer is a registered account
  name: string;
  email?: string;
  phone?: string;
  location?: string;

  notes?: string;

  // sales analytics fields (denormalized)
  totalSpent: number;
  lastOrder?: mongoose.Types.ObjectId;

  status: 'active' | 'inactive';

  createdBy: mongoose.Types.ObjectId;
}

interface SalesCustomerModel extends Model<ISalesCustomer> {}

const salesCustomerSchema = new Schema<ISalesCustomer, SalesCustomerModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },

    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },

    notes: { type: String },

    totalSpent: { type: Number, default: 0 },
    lastOrder: { type: Schema.Types.ObjectId, ref: 'Order', required: false },

    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

salesCustomerSchema.index({ email: 1 });
salesCustomerSchema.index({ phone: 1 });
salesCustomerSchema.index({ createdBy: 1, status: 1 });

// helper unique constraint is not enforced here; we handle in code.

const SalesCustomerModel: Model<ISalesCustomer> = mongoose.model<ISalesCustomer, SalesCustomerModel>(
  'SalesCustomer',
  salesCustomerSchema
);

export default SalesCustomerModel;

