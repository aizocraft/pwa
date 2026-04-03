// src/app/dashboard/auditlog/page.tsx
'use client'

import { useState } from 'react'
import { 
  ClipboardList, Search, Filter, Download, RefreshCw,
  User, Mail, Activity, Calendar, Clock, Shield,
  AlertCircle, CheckCircle, LogIn, LogOut, Edit3,
  Trash2, Plus, Settings, ShoppingCart, Users,
  Package, DollarSign, Eye, EyeOff, ChevronLeft,
  ChevronRight, Loader2, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Types
interface AuditLogEntry {
  id: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export'
  resource: 'user' | 'product' | 'order' | 'settings' | 'category' | 'review'
  userId: string
  userName: string
  userEmail: string
  userRole: 'admin' | 'sales' | 'user'
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  status: 'success' | 'failed'
}

// Mock data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    action: 'create',
    resource: 'product',
    userId: '1',
    userName: 'John Admin',
    userEmail: 'admin@plasmawater.com',
    userRole: 'admin',
    details: 'Created new product "Solar Panel 500W"',
    ipAddress: '192.168.1.1',
    userAgent: 'Chrome/120.0.0.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'success'
  },
  {
    id: '2',
    action: 'update',
    resource: 'order',
    userId: '2',
    userName: 'Jane Sales',
    userEmail: 'jane@plasmawater.com',
    userRole: 'sales',
    details: 'Updated order #ORD-123 status from "pending" to "shipped"',
    ipAddress: '192.168.1.2',
    userAgent: 'Firefox/121.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'success'
  },
  {
    id: '3',
    action: 'delete',
    resource: 'user',
    userId: '1',
    userName: 'John Admin',
    userEmail: 'admin@plasmawater.com',
    userRole: 'admin',
    details: 'Deleted user account "spammer@example.com"',
    ipAddress: '192.168.1.1',
    userAgent: 'Chrome/120.0.0.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'success'
  },
  {
    id: '4',
    action: 'login',
    resource: 'user',
    userId: '3',
    userName: 'Guest User',
    userEmail: 'guest@example.com',
    userRole: 'user',
    details: 'Failed login attempt - invalid password',
    ipAddress: '203.0.113.1',
    userAgent: 'Safari/17.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: 'failed'
  },
  {
    id: '5',
    action: 'export',
    resource: 'order',
    userId: '2',
    userName: 'Jane Sales',
    userEmail: 'jane@plasmawater.com',
    userRole: 'sales',
    details: 'Exported orders report (CSV)',
    ipAddress: '192.168.1.2',
    userAgent: 'Firefox/121.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'success'
  },
  {
    id: '6',
    action: 'update',
    resource: 'settings',
    userId: '1',
    userName: 'John Admin',
    userEmail: 'admin@plasmawater.com',
    userRole: 'admin',
    details: 'Changed company name from "PlasmaWater" to "PlasmaWater Africa"',
    ipAddress: '192.168.1.1',
    userAgent: 'Chrome/120.0.0.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'success'
  },
  {
    id: '7',
    action: 'create',
    resource: 'order',
    userId: '4',
    userName: 'Michael Customer',
    userEmail: 'michael@example.com',
    userRole: 'user',
    details: 'Placed new order #ORD-456 for $299.99',
    ipAddress: '203.0.113.2',
    userAgent: 'Edge/120.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: 'success'
  },
  {
    id: '8',
    action: 'view',
    resource: 'product',
    userId: '2',
    userName: 'Jane Sales',
    userEmail: 'jane@plasmawater.com',
    userRole: 'sales',
    details: 'Viewed product details for "Water Pump 2000W"',
    ipAddress: '192.168.1.2',
    userAgent: 'Firefox/121.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    status: 'success'
  }
]

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const itemsPerPage = 10

  // Filter logs
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = search === '' || 
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    
    const matchesAction = actionFilter === '' || log.action === actionFilter
    const matchesResource = resourceFilter === '' || log.resource === resourceFilter
    const matchesStatus = statusFilter === '' || log.status === statusFilter
    
    const matchesDate = (!dateRange.start || new Date(log.timestamp) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(log.timestamp) <= new Date(dateRange.end))
    
    return matchesSearch && matchesAction && matchesResource && matchesStatus && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Get action icon and color
  const getActionConfig = (action: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string }> = {
      create: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      update: { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
      login: { icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
      logout: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
      view: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      export: { icon: Download, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' }
    }
    return configs[action] || { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  // Get resource icon
  const getResourceIcon = (resource: string) => {
    const icons: Record<string, any> = {
      user: Users,
      product: Package,
      order: ShoppingCart,
      settings: Settings,
      category: ClipboardList,
      review: MessageSquare
    }
    return icons[resource] || Activity
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Audit log refreshed')
  }

  const handleExport = () => {
    toast.success('Export started. You will be notified when ready.')
  }

  const clearFilters = () => {
    setSearch('')
    setActionFilter('')
    setResourceFilter('')
    setStatusFilter('')
    setDateRange({ start: '', end: '' })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                Audit Log
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Track all user activities and system events
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {mockAuditLogs.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {mockAuditLogs.filter(l => l.status === 'success').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {mockAuditLogs.filter(l => l.status === 'failed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {new Set(mockAuditLogs.map(l => l.userId)).size}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or action..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="view">View</option>
              <option value="export">Export</option>
            </select>

            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Resources</option>
              <option value="user">Users</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="settings">Settings</option>
              <option value="category">Categories</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Audit Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No audit logs found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-700 text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Action</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">User</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Details</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedLogs.map((log, index) => {
                      const ActionIcon = getActionConfig(log.action).icon
                      const ResourceIcon = getResourceIcon(log.resource)
                      const actionConfig = getActionConfig(log.action)
                      
                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                          className="transition-colors cursor-pointer"
                          onClick={() => setSelectedEntry(log)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-sm">{formatDate(log.timestamp)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${actionConfig.bg}`}>
                                <ActionIcon className={`w-3.5 h-3.5 ${actionConfig.color}`} />
                              </div>
                              <span className="font-medium capitalize text-gray-900 dark:text-white">
                                {log.action}
                              </span>
                              <div className="flex items-center gap-1 text-gray-400">
                                <ChevronRight className="w-3 h-3" />
                                <ResourceIcon className="w-3 h-3" />
                                <span className="text-xs capitalize">{log.resource}</span>
                              </div>
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{log.userName}</div>
                              <div className="text-xs text-gray-500">{log.userEmail}</div>
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                <Shield className="w-2.5 h-2.5" />
                                {log.userRole}
                              </div>
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 dark:text-gray-300 max-w-md truncate">
                              {log.details}
                            </p>
                           </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === 'success'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {log.status === 'success' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {log.status}
                            </span>
                           </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                           </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="text-sm text-gray-500">
                    Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              page === pageNum
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Details</h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Timestamp</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">IP Address</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedEntry.ipAddress}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">User Agent</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.userAgent}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Details</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.details}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Missing import
import { MessageSquare } from 'lucide-react'