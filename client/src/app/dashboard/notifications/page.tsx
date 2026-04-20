// app/dashboard/notifications/page.tsx

"use client"

import { useState } from 'react'
import { 
  Bell, X, Check, AlertCircle, Package, Users, ShoppingBag, Truck, Clock, CreditCard, Star, Settings, RefreshCw 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  useNotifications, 
  useUnreadCount,
  useMarkAsRead, 
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllRead
} from '@/lib/notifications'
import { Notification } from '@/types/notification'

const NotificationsPage = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Real API data
  const notificationsQuery = useNotifications({ 
    limit: 50,
    page: 1 
  })
  const unreadCountQuery = useUnreadCount()
  
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  const deleteAllReadMutation = useDeleteAllRead()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        notificationsQuery.refetch(),
        unreadCountQuery.refetch()
      ])
      toast.success('Notifications refreshed!')
    } catch (error) {
      toast.error('Failed to refresh notifications')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter notifications by current tab
  const allNotifications = notificationsQuery.data?.data?.notifications ?? []
  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })
  
  const totalCount = notificationsQuery.data?.data?.pagination?.total ?? 0
  const unreadCount = unreadCountQuery.data?.data?.unreadCount ?? 0
  const readCount = totalCount - unreadCount
  
  const isLoading = notificationsQuery.isLoading || notificationsQuery.isFetching

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return { icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
      case 'stock':
        return { icon: Package, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' }
      case 'user':
        return { icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
      case 'payment':
        return { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' }
      case 'shipping':
        return { icon: Truck, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' }
      case 'review':
        return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }
      case 'system':
        return { icon: Settings, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' }
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
    }
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

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const handleDeleteAllRead = () => {
    deleteAllReadMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Stay updated with your latest activities
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || notificationsQuery.isFetching || unreadCountQuery.isFetching}
                className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending || isRefreshing}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
              {readCount > 0 && (
                <button
                  onClick={handleDeleteAllRead}
                  disabled={deleteAllReadMutation.isPending || isRefreshing}
                  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteAllReadMutation.isPending ? 'Clearing...' : 'Clear read'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unreadCount}</p>
              </div>
              <Bell className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Read</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{readCount}</p>
              </div>
              <Check className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800"
        >
          {[
            { id: 'all', label: 'All', count: totalCount },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'read', label: 'Read', count: readCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                filter === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You've read all your notifications! 🎉" 
                  : filter === 'read'
                  ? "No read notifications yet"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const { icon: Icon, color, bg } = getIcon(notification.type)
                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
                        : 'bg-white dark:bg-gray-900 border-l-4 border-l-blue-500 shadow-md'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-xl ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Details →
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={markAsReadMutation.isPending}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-200"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            disabled={deleteNotificationMutation.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gradient border effect for unread */}
                    {!notification.read && (
                      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-blue-500/20" />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Footer Info */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>Notifications are automatically cleaned up after 90 days</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage