// server/models/AuditLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  action: string
  resource: string
  resourceId?: string
  userId: mongoose.Types.ObjectId
  userEmail?: string
  userName?: string
  userRole?: string
  userAgent: string
  ipAddress: string
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
  details: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  status: 'success' | 'failed' | 'pending'
  severity: 'info' | 'warning' | 'error' | 'critical'
  duration?: number
  sessionId?: string
  requestId?: string
  createdAt: Date
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import', 'approve', 'reject', 'assign', 'revoke']
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'product', 'order', 'review', 'category', 'settings', 'feedback', 'contact', 'email', 'company', 'payment', 'shipping', 'inventory', 'unknown']
  },
  resourceId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String },
  userName: { type: String },
  userRole: { type: String },
  userAgent: { type: String, required: true },
  ipAddress: { type: String, required: true },
  location: {
    country: { type: String },
    city: { type: String },
    timezone: { type: String }
  },
  details: { type: String, required: true },
  oldValues: { type: Schema.Types.Mixed },
  newValues: { type: Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'success' 
  },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'critical'], 
    default: 'info' 
  },
  duration: { type: Number },
  sessionId: { type: String },
  requestId: { type: String }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
})

// Indexes for faster queries
AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ userId: 1, createdAt: -1 })
AuditLogSchema.index({ action: 1, resource: 1, createdAt: -1 })
AuditLogSchema.index({ status: 1, severity: 1 })
AuditLogSchema.index({ sessionId: 1 })
AuditLogSchema.index({ requestId: 1 })

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

export default AuditLog