// lib/audit.ts
import api from './api'

// Types matching backend (updated to match your actual backend response)
export interface AuditLogEntry {
  _id: string
  action: string
  resource: string
  resourceId?: string
  userId: {
    _id: string
    name?: string
    email?: string
    role?: string
  } | string // Can be either object or string ID
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
  createdAt: string
  updatedAt?: string
}

export interface AuditStats {
  totalEvents: number
  uniqueUsers: number
  recentActions: Array<{
    _id: { action: string; resource: string }
    count: number
    status?: string
  }>
  period: string
}

export interface AuditQueryParams {
  page?: number
  limit?: number
  action?: string
  resource?: string
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}

// Get audit logs with pagination and filters
export async function getAuditLogs(params: AuditQueryParams = {}) {
  try {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const response = await api.get(`/audit/logs?${query.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Failed to fetch audit logs:', error)
    throw error
  }
}

// Get audit statistics
export async function getAuditStats(params: { period?: '24h' | '7d' | '30d' } = {}) {
  try {
    const query = new URLSearchParams()
    if (params.period) query.append('period', params.period)

    const response = await api.get(`/audit/stats?${query.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Failed to fetch audit stats:', error)
    throw error
  }
}