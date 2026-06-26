'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useDashboardData } from '@/lib/dashboard'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  DollarSign, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle,
  Eye,
  Star,
  Award,
  Zap,
  Flame,
  Wallet,
  Calendar,
  Activity,
  PieChart,
  LineChart,
  Box,
  Truck,
  Percent,
  Clipboard,
  Medal,
  Crown,
  Sparkles,
  Target,
  CreditCard,
  ShoppingBag,
  Receipt,
  Layers,
  Gem,
  Diamond,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { Order } from '@/types/order'
import { DashboardSummary, DashboardTopProduct } from '@/lib/dashboard'

// ==================== TYPES ====================
interface StatCardData {
  name: string
  value: string | number
  change?: string
  icon?: any
  color: string
  trend?: 'up' | 'down'
  subtitle?: string
  valueColor?: string
}

// ==================== STATUS HELPERS ====================
const getStatusColor = (status: string, paymentStatus: string) => {
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
      text: 'Pending',
      icon: Clock,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
    }
  }
  
  if (order.paymentStatus === 'failed') {
    return {
      text: 'Failed',
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

// ==================== PREMIUM STAT CARD (NO ICON) ====================
function PremiumStatCard({ stat }: { stat: StatCardData }) {
  const isPositive = stat.trend === 'up'
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : null
  
  return (
    <div className="relative bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1 overflow-hidden group min-h-[140px] flex flex-col justify-center">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Decorative Ring */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
          {stat.name}
        </p>
        <p className={`text-2xl sm:text-3xl font-bold ${stat.valueColor || 'text-gray-900 dark:text-white'} truncate`}>
          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
        </p>
        {stat.subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{stat.subtitle}</p>
        )}
        {stat.change && stat.trend && TrendIcon && (
          <div className="flex items-center gap-1.5 mt-2">
            <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`} />
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {stat.change}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">vs last month</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== ORDER STATUS CARD ====================
function OrderStatusCard({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  bgColor 
}: { 
  title: string
  count: number
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-5 border ${color} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${color}`}>{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
        </div>
        <Icon className={`w-12 h-12 ${color} opacity-50`} />
      </div>
    </div>
  )
}

// ==================== TOP PRODUCT ITEM ====================
function TopProductItem({ product, index }: { product: DashboardTopProduct; index: number }) {
  const isPositive = parseFloat(product.growth) >= 0
  const rankColors = [
    'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md',
    'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-md',
    'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md',
  ]
  
  const rankIcons = [
    <Trophy key="trophy" className="w-4 h-4" />,
    <Medal key="medal" className="w-4 h-4" />,
    <Award key="award" className="w-4 h-4" />,
  ]
  
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
          index < 3 ? rankColors[index] : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {index < 3 ? rankIcons[index] : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {product.sales} unit{product.sales !== 1 ? 's' : ''} sold
            </p>
            {product.margin !== undefined && product.margin > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                {product.margin.toFixed(1)}% margin
              </p>
            )}
            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                Low stock: {product.stock} left
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-bold text-[#0043b3] dark:text-[#009dff] text-sm sm:text-base">
          KSh {typeof product.revenue === 'number' ? product.revenue.toLocaleString() : 0}
        </p>
        <p className={`text-xs flex items-center gap-1 justify-end font-medium ${
          isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {product.growth}
        </p>
      </div>
    </div>
  )
}

// ==================== RECENT ORDER ITEM ====================
function RecentOrderItem({ order }: { order: Order }) {
  const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest'
  const paymentBadge = getPaymentStatusBadge(order)
  const PaymentIcon = paymentBadge.icon
  const isPaid = order.paymentStatus === 'completed' || 
               order.paymentStatus === ('paid' as any) || 
               order.status === 'paid' || 
               order.status === 'delivered'
  
  // ✅ Calculate total items (sum of quantities, not just line items)
  const totalItems = Array.isArray(order.items) 
    ? order.items.reduce((sum, item) => sum + (item.qty || 0), 0) 
    : 0
  
  const orderNumber = order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`
  const totalAmount = typeof order.total === 'number' ? order.total : parseFloat(order.total || '0')
  
  return (
    <Link 
      href={`/dashboard/orders/${order._id}`}
      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border-b border-gray-200 dark:border-gray-800 last:border-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#0043b3] dark:text-[#009dff] font-mono">
              {orderNumber}
            </span>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${paymentBadge.className}`}>
              <PaymentIcon className="w-3 h-3" />
              {paymentBadge.text}
            </div>
          </div>
          <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="truncate">{customerName}</span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <p className={`text-base font-bold ${
            isPaid ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'
          }`}>
            KSh {totalAmount.toLocaleString()}
          </p>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

// ==================== MAIN COMPONENT ====================
export default function DashboardOverviewPage() {
  const { user } = useAuth()
  const { summary, recentOrders, topProducts, dashboardStats, isLoading, error, refetch } = useDashboardData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (!isLoading) {
      interval = setInterval(() => {
        refetch()
      }, 30000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [refetch, isLoading])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }, [refetch])

  // ✅ Calculate accurate metrics from summary with proper fallbacks
  const totalRevenue = Number(summary?.totalRevenue) || 0
  const totalOrders = Number(summary?.totalOrders) || 0
  const totalItemsSold = Number(summary?.totalItemsSold) || 0
  const totalProfit = Number(summary?.totalProfit) || 0
  const totalProducts = Number(summary?.totalProducts) || 0
  const totalTransactions = Number(summary?.totalTransactions) || 0
  const pendingOrders = Number(summary?.pendingOrders) || 0
  const cancelledOrders = Number(summary?.cancelledOrders) || 0
  const paidOrders = Number(summary?.paidOrders) || Math.max(0, totalOrders - pendingOrders - cancelledOrders)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const lowStockProducts = Number(summary?.lowStockProducts) || 0
  const activeCustomers = Number(summary?.activeCustomers) || 0
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // ✅ Build stats array WITHOUT icons for top cards
const stats: StatCardData[] = dashboardStats && Array.isArray(dashboardStats) && dashboardStats.length > 0 
  ? dashboardStats.map((s: any) => ({ 
      ...(typeof s === 'object' && s !== null ? s : {}), 
      icon: undefined 
    }))
  : [
      { 
        name: 'Total Revenue', 
        value: `KSh ${totalRevenue.toLocaleString()}`, 
        change: summary?.revenueGrowth || '+0%', 
        color: 'from-emerald-500 to-green-600',
        trend: totalRevenue > 0 ? 'up' : 'down',
        subtitle: `${totalOrders} orders`,
        valueColor: 'text-emerald-600 dark:text-emerald-400'
      },
      { 
        name: 'Total Profit', 
        value: `KSh ${totalProfit.toLocaleString()}`, 
        change: summary?.profitGrowth || '+0%', 
        color: 'from-blue-500 to-cyan-600',
        trend: totalProfit > 0 ? 'up' : 'down',
        subtitle: `Margin: ${profitMargin.toFixed(1)}%`,
        valueColor: 'text-blue-600 dark:text-blue-400'
      },
      { 
        name: 'Total Products', 
        value: totalProducts, 
        change: '+5.3%', 
        color: 'from-purple-500 to-pink-600',
        trend: totalProducts > 0 ? 'up' : 'down',
        subtitle: `${lowStockProducts} low stock`,
        valueColor: 'text-purple-600 dark:text-purple-400'
      },
      { 
        name: 'Total Transactions', 
        value: totalTransactions, 
        change: '+15.7%', 
        color: 'from-orange-500 to-red-600',
        trend: totalTransactions > 0 ? 'up' : 'down',
        subtitle: `Avg: KSh ${totalTransactions > 0 ? (totalRevenue / totalTransactions).toLocaleString() : 0}`,
        valueColor: 'text-orange-600 dark:text-orange-400'
      },
    ]

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">{error instanceof Error ? error.message : String(error)}</p>
        <button 
          onClick={() => refetch()} 
          className="px-6 py-2.5 bg-[#0043b3] hover:bg-[#000063] text-white rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000063] dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name || user?.email || 'Admin'}!
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ==================== PREMIUM STATS CARDS (NO ICONS) ==================== */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => (
            <PremiumStatCard key={idx} stat={stat} />
          ))}
        </div>
      )}

      {/* ==================== ORDER STATUS CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OrderStatusCard
          title="Paid Orders"
          count={paidOrders}
          icon={CheckCircle}
          color="border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400"
          bgColor="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
        />
        <OrderStatusCard
          title="Pending Orders"
          count={pendingOrders}
          icon={Clock}
          color="border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
          bgColor="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
        />
        <OrderStatusCard
          title="Cancelled Orders"
          count={cancelledOrders}
          icon={XCircle}
          color="border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
          bgColor="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20"
        />
      </div>

      {/* ==================== MAIN CHARTS SECTION ==================== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#000063] dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0043b3] dark:text-[#009dff]" />
                Top Selling Products
              </h3>
              <Link 
                href="/dashboard/products" 
                className="text-sm text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] dark:hover:text-[#0043b3] flex items-center gap-1 transition-colors font-medium"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-4 space-y-1 max-h-[500px] overflow-y-auto">
            {topProducts && topProducts.length > 0 ? (
              topProducts.slice(0, 10).map((product: DashboardTopProduct, idx: number) => (
                <TopProductItem 
                  key={product.id || idx} 
                  product={{
                    ...product,
                    revenue: Number(product.revenue) || 0,
                    sales: Number(product.sales) || 0,
                    margin: Number(product.margin) || 0
                  }} 
                  index={idx} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No sales data available yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete orders to see top products</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#000063] dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0043b3] dark:text-[#009dff]" />
                Recent Orders
              </h3>
              <Link 
                href="/dashboard/orders" 
                className="text-sm text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] dark:hover:text-[#0043b3] flex items-center gap-1 transition-colors font-medium"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: Order) => (
                <RecentOrderItem key={order._id} order={order} />
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== QUICK STATS BANNER ==================== */}
      <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Sold</p>
            <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{totalItemsSold.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Order Value</p>
            <p className="text-2xl font-bold text-[#0043b3] dark:text-[#009dff] mt-1">
              KSh {averageOrderValue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Customers</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{activeCustomers.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}