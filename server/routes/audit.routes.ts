import express from 'express'
import { Request, Response } from 'express'
import AuditLog, { IAuditLog } from '../models/AuditLog'
import authMiddleware from '../middleware/auth'

const router = express.Router()

// Get audit logs with filters and pagination
router.get('/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      resource,
      userId,
      status,
      search,
      startDate,
      endDate
    } = req.query

    const query: any = {}

    if (action) query.action = action
    if (resource) query.resource = resource
    if (userId) query.userId = userId
    if (status) query.status = status

    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ]
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }

    const skip = ((Number(page) - 1) * Number(limit))
    
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      AuditLog.countDocuments(query)
    ])

    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats: Object.fromEntries(stats.map((s: any) => [s._id, s.count]))
    })

  } catch (error: any) {
    console.error('Audit log fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// Get audit log stats
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const matchQuery: any = {}
    
    // Apply filters if provided
    const { period = '30d' } = req.query
    const now = new Date()
    
    let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (period === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (period === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    matchQuery.createdAt = { $gte: startDate }

    const [summary, recentActions] = await Promise.all([
      AuditLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]),
      
      AuditLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { action: '$action', resource: '$resource' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ])

    res.json({
      totalEvents: summary[0]?.total || 0,
      uniqueUsers: summary[0]?.uniqueUsers?.length || 0,
      recentActions,
      period: period as string
    })

  } catch (error: any) {
    console.error('Audit stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Create audit log (internal use)
router.post('/', async (req: Request, res: Response) => {
  try {
    const auditLog = new AuditLog({
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    })
    
    const saved = await auditLog.save()
    await saved.populate('userId', 'name email role')
    
    res.json(saved)
  } catch (error: any) {
    console.error('Create audit log error:', error)
    res.status(500).json({ error: 'Failed to create audit log' })
  }
})

// Get audit analytics
router.get('/analytics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query
    const now = new Date()
    let startDate = new Date(now.getTime() - (parseInt(period as string) * 24 * 60 * 60 * 1000))
    
    const [timeline, topUsers, topActions, statusBreakdown, resourceBreakdown] = await Promise.all([
      // Timeline data
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: groupBy === 'day' 
              ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
              : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Top active users
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$userId',
            userName: { $first: '$userName' },
            userEmail: { $first: '$userEmail' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Most common actions
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { action: '$action', resource: '$resource' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Status breakdown
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Resource breakdown
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$resource',
            count: { $sum: 1 }
          }
        }
      ])
    ])
    
    res.json({
      timeline,
      topUsers,
      topActions,
      statusBreakdown,
      resourceBreakdown,
      period,
      groupBy
    })
  } catch (error: any) {
    console.error('Audit analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Get user activity timeline
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { limit = 50 } = req.query
    
    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .lean()
    
    res.json({ logs, count: logs.length })
  } catch (error: any) {
    console.error('User activity error:', error)
    res.status(500).json({ error: 'Failed to fetch user activity' })
  }
})

// Get security alerts
router.get('/alerts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const alerts = await AuditLog.find({
      severity: { $in: ['error', 'critical'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name email')
      .lean()
    
    res.json({ alerts, count: alerts.length })
  } catch (error: any) {
    console.error('Security alerts error:', error)
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

// Export logs
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query
    
    const query: any = {}
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }
    
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .lean()
    
    if (format === 'csv') {
      const csv = convertToCSV(logs)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json(logs)
    }
  } catch (error: any) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Failed to export logs' })
  }
})

function convertToCSV(logs: any[]): string {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address', 'Status', 'Severity']
  const rows = logs.map(log => [
    new Date(log.createdAt).toISOString(),
    log.userName || log.userId,
    log.action,
    log.resource,
    log.details,
    log.ipAddress,
    log.status,
    log.severity
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

export default router