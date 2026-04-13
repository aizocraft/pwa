'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useDashboardData } from '@/lib/dashboard'
import { 
  Package, ShoppingCart, Users, ArrowUp, ArrowDown, BarChart3, 
  DollarSign, ChevronRight, Clock, CheckCircle, XCircle
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
  const { summary, recentOrders, topProducts, dashboardStats, isLoading, error } = useDashboardData()

  const stats: StatCard[] = dashboardStats.length > 0 ? dashboardStats : (summary ? [
    { 
      name: 'Total Revenue', 
      value: `Ksh ${summary.totalRevenue!.toLocaleString()}`, 
      change: '+12.5%', 
      icon: DollarSign, 
      color: 'from-emerald-500 to-green-500',
      trend: 'up' as const
    },
    { 
      name: 'Completed Orders', 
      value: summary.totalOrders!.toString(), 
      change: '+8.2%', 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-cyan-500',
      trend: 'up' as const
    },
    { 
      name: 'Products Sold', 
      value: summary.totalItemsSold!.toLocaleString(), 
      change: '+23.1%', 
      icon: Package, 
      color: 'from-purple-500 to-pink-500',
      trend: 'up' as const
    },
    { 
      name: 'Active Products', 
      value: '42', 
      change: '+5.3%', 
      icon: Users, 
      color: 'from-orange-500 to-red-500',
      trend: 'up' as const
    },
  ] : [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        Failed to load dashboard. <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-8">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Skeleton Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Status utils - simplified, no redundant comments
  const getStatusColor = (status: string) => ({
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }[status] || 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400')

  const getPaymentStatusBadge = (order: any) => {
    const isPaid = order.paymentStatus === 'completed' || ['paid', 'delivered'].includes(order.status)
    if (isPaid) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Paid
      </span>
    }
    return <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status || 'pending')}`}>
      {order.status || 'pending'}
    </span>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown
            return (
              <div key={idx} className="group bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-3 h-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline">vs last month</span>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} p-2 sm:p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Summary Cards - use summary from hook */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400">Paid Orders</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{summary?.totalOrders || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400">Pending Orders</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{summary?.pendingOrders || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">Cancelled Orders</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{summary?.cancelledOrders || 0}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products - Based on PAID orders only */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Selling Products
            </h3>
            <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.id || idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {product.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {product.sales} unit{product.sales !== 1 ? 's' : ''} sold
                    </p>
                    {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ Low stock: {product.stock} left</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    Ksh {product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">{product.growth}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sales data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders - Show payment status */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Orders
              </h3>
              <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {recentOrders.length > 0 ? recentOrders.map((order, idx) => {
              const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest'
              const isPaid = order.paymentStatus === 'completed' || order.status === 'paid' || order.status === 'delivered'
              return (
                <Link 
                  key={order._id || idx} 
                  href={`/dashboard/orders/${order._id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                      {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
                    </span>
                    {getPaymentStatusBadge(order)}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>{customerName}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className={`text-sm font-semibold mt-2 ${isPaid ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
  Ksh {typeof order.total === 'number' 
    ? order.total.toLocaleString() 
    : parseFloat(order.total).toLocaleString()}
  {!isPaid && <span className="text-xs text-amber-600 ml-2">(Pending payment)</span>}
</p>
                </Link>
              )
            }) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}