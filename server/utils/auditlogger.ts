// server/utils/auditLogger.ts
import AuditLog from '../models/AuditLog'

interface AuditLogOptions {
  userId: string
  userEmail?: string
  userName?: string
  userRole?: string
  action: string
  resource: string
  resourceId?: string
  details: string
  oldValues?: any
  newValues?: any
  status?: 'success' | 'failed' | 'pending'
  severity?: 'info' | 'warning' | 'error' | 'critical'
  req?: any
}

export async function logAuditEvent(options: AuditLogOptions) {
  try {
    const auditLog = new AuditLog({
      ...options,
      userAgent: options.req?.get('User-Agent') || 'system',
      ipAddress: options.req?.ip || options.req?.socket?.remoteAddress || 'system',
      location: options.req?.location,
      sessionId: options.req?.sessionId,
      requestId: options.req?.requestId
    })
    
    await auditLog.save()
    return auditLog
  } catch (error) {
    console.error('Failed to log audit event:', error)
    return null
  }
}

// Usage example in routes:
// await logAuditEvent({
//   userId: req.user.userId,
//   userEmail: req.user.email,
//   userName: req.user.name,
//   action: 'approve',
//   resource: 'order',
//   resourceId: orderId,
//   details: `Approved order #${orderId}`,
//   severity: 'info',
//   req
// })