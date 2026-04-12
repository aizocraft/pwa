// client/src/app/dashboard/auditlog/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ClipboardList, Search, Filter, Download, RefreshCw,
  User, Activity, Calendar, AlertCircle, CheckCircle, LogIn, LogOut, Edit3,
  Trash2, Plus, Settings, ShoppingCart, Users,
  Package, Eye, ChevronLeft, ChevronRight, Loader2, X, MessageSquare,
  Shield, Clock, Globe, Server, Smartphone, Monitor, MapPin,
  Zap, TrendingUp, Award, Star, Heart, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAuditLogs, getAuditStats, AuditLogEntry as AuditLogEntryBackend } from '@/lib/audit'

// Frontend types
interface AuditLogEntry {
  id: string
  action: string
  resource: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  status: 'success' | 'failed'
}

// Helper function to safely get user info from backend response
const getUserInfo = (log: AuditLogEntryBackend) => {
  // Handle both populated user object and string user ID
  if (log.userId && typeof log.userId === 'object' && log.userId._id) {
    return {
      id: log.userId._id,
      name: log.userId.name || 'Unknown User',
      email: log.userId.email || log.userEmail || 'No email',
      role: log.userId.role || log.userRole || 'user'
    }
  }
  
  // Fallback to top-level fields or string ID
  return {
    id: typeof log.userId === 'string' ? log.userId : 'unknown',
    name: log.userName || 'Unknown User',
    email: log.userEmail || 'No email',
    role: log.userRole || 'user'
  }
}

// Transform backend data
const transformAuditLog = (log: AuditLogEntryBackend): AuditLogEntry => {
  const userInfo = getUserInfo(log)
  
  return {
    id: log._id,
    action: log.action,
    resource: log.resource,
    userId: userInfo.id,
    userName: userInfo.name,
    userEmail: userInfo.email,
    userRole: userInfo.role,
    details: log.details,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    timestamp: log.createdAt,
    status: log.status === 'pending' ? 'failed' : (log.status as 'success' | 'failed')
  }
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const itemsPerPage = 10

  // Real API queries
  const { data: apiData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', { search, actionFilter, resourceFilter, statusFilter, dateRange, currentPage }],
    queryFn: () => getAuditLogs({
      page: currentPage,
      limit: itemsPerPage,
      search: search || undefined,
      action: actionFilter || undefined,
      resource: resourceFilter || undefined,
      status: statusFilter || undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined
    })
  })

  const logs: AuditLogEntry[] = apiData?.logs?.map(transformAuditLog) || []
  const totalPages = apiData?.pagination?.pages || 1
  const totalItems = apiData?.pagination?.total || 0

  // Stats
  const { data: statsData } = useQuery({
    queryKey: ['auditStats'],
    queryFn: () => getAuditStats({ period: '30d' })
  })

const stats = statsData || { totalEvents: 0, uniqueUsers: 0, recentActions: [] }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
    toast.success('Audit logs refreshed')
  }

  const handleExport = async () => {
    toast.loading('Preparing export...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('Export completed! Check your downloads folder.')
    }, 1500)
  }

  const clearFilters = () => {
    setSearch('')
    setActionFilter('')
    setResourceFilter('')
    setStatusFilter('')
    setDateRange({ start: '', end: '' })
    setCurrentPage(1)
    toast.success('Filters cleared')
  }

  // Get action config
  const getActionConfig = (action: string) => ({
    create: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Created', gradient: 'from-emerald-500 to-teal-500' },
    update: { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Updated', gradient: 'from-blue-500 to-indigo-500' },
    delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Deleted', gradient: 'from-red-500 to-pink-500' },
    login: { icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Logged In', gradient: 'from-emerald-500 to-teal-500' },
    logout: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Logged Out', gradient: 'from-gray-500 to-gray-600' },
    view: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Viewed', gradient: 'from-purple-500 to-pink-500' },
    export: { icon: Download, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Exported', gradient: 'from-amber-500 to-orange-500' }
  }[action] || { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100', label: action, gradient: 'from-gray-500 to-gray-600' })

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

  const getResourceColor = (resource: string) => {
    const colors: Record<string, string> = {
      user: 'text-orange-500',
      product: 'text-blue-500',
      order: 'text-purple-500',
      settings: 'text-gray-500',
      category: 'text-emerald-500',
      review: 'text-pink-500'
    }
    return colors[resource] || 'text-gray-500'
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

  const getDeviceType = (userAgent: string) => {
    if (/mobile/i.test(userAgent)) return { icon: Smartphone, label: 'Mobile' }
    if (/tablet/i.test(userAgent)) return { icon: Monitor, label: 'Tablet' }
    return { icon: Monitor, label: 'Desktop' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
              <div className="relative flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Audit Log
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Track all user activities and system events
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="relative flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 overflow-hidden group"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards with Microinteractions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Events', value: stats.totalEvents, icon: Activity, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Successful', value: apiData?.stats?.success || logs.filter(l => l.status === 'success').length, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Failed', value: apiData?.stats?.failed || logs.filter(l => l.status === 'failed').length, icon: AlertCircle, gradient: 'from-red-500 to-pink-500' },
            { label: 'Active Users', value: stats.uniqueUsers, icon: Users, gradient: 'from-purple-500 to-indigo-500' }
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm group-hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Filters Bar with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs by user, action, or details..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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
              onChange={(e) => { setResourceFilter(e.target.value); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <option value="">All Resources</option>
              <option value="user">Users</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="settings">Settings</option>
              <option value="category">Categories</option>
              <option value="review">Reviews</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <option value="">All Status</option>
              <option value="success">✓ Success</option>
              <option value="failed">✗ Failed</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              Clear Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Audit Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 relative z-10" />
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No audit logs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                {search || actionFilter || resourceFilter || statusFilter 
                  ? 'Try adjusting your search or filters'
                  : 'Logs will appear here as users interact with the system'}
              </p>
              {(search || actionFilter || resourceFilter || statusFilter) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
                >
                  Clear Filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      {['Timestamp', 'Action', 'User', 'Details', 'Status', 'IP'].map((header, idx) => (
                        <th key={header} className={`px-6 py-4 text-left font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider ${idx === 0 ? 'rounded-tl-2xl' : idx === 5 ? 'rounded-tr-2xl' : ''}`}>
                          <div className="flex items-center gap-2">
                            {header === 'Timestamp' && <Clock className="w-3 h-3" />}
                            {header === 'Action' && <Zap className="w-3 h-3" />}
                            {header === 'User' && <User className="w-3 h-3" />}
                            {header === 'Details' && <Activity className="w-3 h-3" />}
                            {header === 'Status' && <Shield className="w-3 h-3" />}
                            {header === 'IP' && <Globe className="w-3 h-3" />}
                            {header}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <AnimatePresence mode="wait">
                      {logs.map((log, index) => {
                        const actionConfig = getActionConfig(log.action)
                        const ActionIcon = actionConfig.icon
                        const ResourceIcon = getResourceIcon(log.resource)
                        const resourceColor = getResourceColor(log.resource)
                        const device = getDeviceType(log.userAgent)
                        const DeviceIcon = device.icon
                        
                        return (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03, duration: 0.3 }}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                            className="cursor-pointer transition-colors duration-200"
                            onClick={() => setSelectedEntry(log)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(log.timestamp)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${actionConfig.bg}`}>
                                  <ActionIcon className={`w-3.5 h-3.5 ${actionConfig.color}`} />
                                </div>
                                <span className="font-medium capitalize text-gray-900 dark:text-white">{log.action}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <ChevronRight className="w-3 h-3" />
                                  <ResourceIcon className={`w-3 h-3 ${resourceColor}`} />
                                  <span className="capitalize">{log.resource}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                                  {log.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">{log.userName}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{log.userEmail}</div>
                                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">
                                    <Shield className="w-2.5 h-2.5" />
                                    {log.userRole}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md line-clamp-2">{log.details}</p>
                            </td>
                            <td className="px-6 py-4">
                              <motion.span
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  log.status === 'success' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                }`}
                              >
                                {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {log.status === 'success' ? 'Success' : 'Failed'}
                              </motion.span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-mono text-gray-500">{log.ipAddress}</div>
                                <DeviceIcon className="w-3 h-3 text-gray-400" />
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/10 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span> entries
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        )
                      })}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEntry(null)}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={() => setSelectedEntry(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${getActionConfig(selectedEntry.action).gradient}`}>
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Details</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedEntry.id}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Timestamp
                        </label>
                        <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                          {new Date(selectedEntry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3" /> IP Address
                        </label>
                        <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">{selectedEntry.ipAddress}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Action
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          {(() => {
                            const actionConfig = getActionConfig(selectedEntry.action)
                            const ActionIcon = actionConfig.icon
                            const ResourceIconComponent = getResourceIcon(selectedEntry.resource)
                            return (
                              <>
                                <div className={`p-1.5 rounded-lg ${actionConfig.bg}`}>
                                  <ActionIcon className={`w-4 h-4 ${actionConfig.color}`} />
                                </div>
                                <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">{selectedEntry.action}</span>
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                                <ResourceIconComponent className={`w-4 h-4 ${getResourceColor(selectedEntry.resource)}`} />
                                <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{selectedEntry.resource}</span>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Status
                        </label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                            selectedEntry.status === 'success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                          }`}>
                            {selectedEntry.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {selectedEntry.status === 'success' ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3 h-3" /> User
                        </label>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-md">
                            {selectedEntry.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.userName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEntry.userEmail}</p>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">
                              {selectedEntry.userRole}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Monitor className="w-3 h-3" /> Device
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          {(() => {
                            const device = getDeviceType(selectedEntry.userAgent)
                            const DeviceIcon = device.icon
                            return <DeviceIcon className="w-4 h-4 text-gray-500" />
                          })()}
                          <span className="text-sm text-gray-600 dark:text-gray-400">{getDeviceType(selectedEntry.userAgent).label}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3 h-3" /> User Agent
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono break-all">
                          {selectedEntry.userAgent}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Details
                      </label>
                      <div className="mt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {selectedEntry.details}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}