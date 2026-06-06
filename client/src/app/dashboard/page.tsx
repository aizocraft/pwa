'use client'

import { useMemo, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useDashboardData } from '@/lib/dashboard'
import { 
  Package, ShoppingCart, Users, ArrowUp, ArrowDown, BarChart3, 
  DollarSign, ChevronRight, Clock, CheckCircle, XCircle, 
  TrendingUp, TrendingDown, RefreshCw, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface StatCard {
  name: string
  value: string
  change: string
  icon: any
  color: string
  trend: 'up' | 'down'
}

export default function DashboardOverviewPage() {
  const { user } = useAuth()
  const { summary, recentOrders, topProducts, dashboardStats, isLoading, error, refetch } = useDashboardData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const paidOrders = summary ? Math.max(0, (summary.totalOrders || 0) - (summary.pendingOrders || 0) - (summary.cancelledOrders || 0)) : 0
  const activeCustomers = summary ? ((summary as any).activeCustomers || 0) : 0

  const stats: StatCard[] = dashboardStats.length > 0 ? dashboardStats : (summary ? [
    { 
      name: 'Total Revenue', 
      value: `Ksh ${(summary.totalRevenue || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: DollarSign, 
      color: 'from-emerald-500 to-green-500',
      trend: 'up' as const
    },
    { 
      name: 'Paid Orders', 
      value: paidOrders.toString(), 
      change: '+8.2%', 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-cyan-500',
      trend: 'up' as const
    },
    { 
      name: 'Products Sold', 
      value: (summary.totalItemsSold || 0).toLocaleString(), 
      change: '+23.1%', 
      icon: Package, 
      color: 'from-purple-500 to-pink-500',
      trend: 'up' as const
    },
    { 
      name: 'Active Customers', 
      value: activeCustomers.toString(), 
      change: '+5.3%', 
      icon: Users, 
      color: 'from-orange-500 to-red-500',
      trend: 'up' as const
    },
  ] : [])

  // Get dynamic status color based on actual order status
  const getStatusColor = (status: string, paymentStatus: string) => {
    // Priority: Check payment status first for completed payments
    if (paymentStatus === 'completed' || paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
    }
    
    const statusMap: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 text-gray-400',
    }
    return statusMap[status] || 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
  }

  // Get payment status badge (dynamic based on actual payment)
  const getPaymentStatusBadge = (order: any) => {
    const isPaid = order.paymentStatus === 'completed' || order.paymentStatus === 'paid' || 
                   order.status === 'paid' || order.status === 'delivered' ||
                   (order.amountPaid && order.amountPaid >= (order.total || 0))
    
    if (isPaid) {
      return {
        text: 'Paid',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
      }
    }
    
    if (order.paymentStatus === 'pending' || order.paymentStatus === 'awaiting') {
      return {
        text: 'Pending Payment',
        icon: Clock,
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
      }
    }
    
    if (order.paymentStatus === 'failed') {
      return {
        text: 'Payment Failed',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
      }
    }
    
    if (order.paymentStatus === 'refunded') {
      return {
        text: 'Refunded',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      }
    }
    
    return {
      text: order.status || 'Pending',
      icon: Clock,
      className: getStatusColor(order.status || 'pending', order.paymentStatus)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error instanceof Error ? error.message : String(error)}</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-8">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Skeleton Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name || user?.email || 'Admin'}!
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
            return (
              <div key={idx} className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 p-5 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-3.5 h-3.5 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`} />
                      <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">vs last month</span>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Summary Cards - Dynamic based on actual data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-5 border border-green-200 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400">Paid Orders</p>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300">{paidOrders}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600/50 dark:text-green-500/30" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400">Pending Orders</p>
              <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">{summary?.pendingOrders || 0}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-600/50 dark:text-amber-500/30" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-2xl p-5 border border-red-200 dark:border-red-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">Cancelled Orders</p>
              <p className="text-3xl font-bold text-red-800 dark:text-red-300">{summary?.cancelledOrders || 0}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600/50 dark:text-red-500/30" />
          </div>
        </div>
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products - Improved UI without gradient background */}
        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              Top Selling Products
            </h3>
            <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.id || idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  {/* Number without gradient - clean design */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    {product.rank || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sales} unit{product.sales !== 1 ? 's' : ''} sold
                      </p>
                      {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Low stock: {product.stock} left
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    Ksh {product.revenue.toLocaleString()}
                  </p>
                  <p className={`text-xs flex items-center gap-1 justify-end ${parseFloat(product.growth) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {parseFloat(product.growth) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {product.growth}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No sales data available yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete orders to see top products</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders - Dynamic payment status */}
        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                Recent Orders
              </h3>
              <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-800">
            {recentOrders.length > 0 ? recentOrders.map((order, idx) => {
              const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest'
              const paymentBadge = getPaymentStatusBadge(order)
              const PaymentIcon = paymentBadge.icon
              // Normalize checks to avoid strict type mismatches with TS unions
              const normalizedPaymentStatus = String(order.paymentStatus)
              const normalizedStatus = String(order.status)
              const isPaid = ['completed', 'paid'].includes(normalizedPaymentStatus) || ['paid', 'delivered'].includes(normalizedStatus)
              
              return (
                <Link 
                  key={order._id || idx} 
                  href={`/dashboard/orders/${order._id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-500 font-mono">
                      {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
                    </span>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${paymentBadge.className}`}>
                      <PaymentIcon className="w-3 h-3" />
                      {paymentBadge.text}
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="truncate">{customerName}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className={`text-base font-semibold ${isPaid ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'}`}>
                      Ksh {typeof order.total === 'number' 
                        ? order.total.toLocaleString() 
                        : parseFloat(order.total || 0).toLocaleString()}
                    </p>
                    {!isPaid && order.paymentStatus !== 'failed' && (
                      <span className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Awaiting payment
                      </span>
                    )}
                    {order.paymentStatus === 'failed' && (
                      <span className="text-xs text-red-600 dark:text-red-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Payment failed
                      </span>
                    )}
                  </div>
                </Link>
              )
            }) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}