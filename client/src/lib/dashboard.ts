// lib/dashboard.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  getAdminOrders, 
  getProducts, 
  getOrderStats,
  getTransactionStats,
  getPaymentStats,
  getProfitSummary,
  getInventorySummary,
  getAdminAnalyticsOverview,
  getSalesAnalyticsOverview
} from './api'
import { useMemo } from 'react'
import { useAuth } from './auth'
import type { TopProduct } from './sales'

interface OrderItem {
  qty?: number
  price?: number
  name?: string
  productId?: string | { _id?: string }
}

interface Order {
  _id?: string
  total?: number | string
  status?: string
  paymentStatus?: string
  createdAt?: string
  items?: OrderItem[]
  userId?: string
  guestInfo?: { name?: string; email?: string; phone?: string }
  shippingAddress?: { fullName?: string }
}

interface Product {
  _id?: string
  name?: string
  price?: number
  stock?: number
}

export interface DashboardSummary {
  totalRevenue: number
  totalOrders: number
  totalItemsSold: number
  pendingOrders: number
  cancelledOrders: number
  totalProfit: number
  totalProducts: number
  totalTransactions: number
  lowStockProducts: number
  averageOrderValue: number
  activeCustomers: number
  revenueGrowth?: string
  orderGrowth?: string
  profitGrowth?: string
  conversionRate?: number
  totalStockValue?: number
  totalInventoryValue?: number
  paidOrders: number
}

export interface DashboardTopProduct {
  id: string
  name: string
  sales: number
  revenue: number
  growth: string
  stock?: number
  rank?: number
  margin?: number
  profit?: number
}

export function useDashboardData() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isSales = user?.role === 'sales'

  // Fetch analytics data from backend
  const adminAnalyticsQuery = useQuery({
    queryKey: ['adminAnalytics', 'dashboard'],
    queryFn: () => getAdminAnalyticsOverview('month'),
    staleTime: 2 * 60 * 1000,
    enabled: !!user && isAdmin,
  })

  const salesAnalyticsQuery = useQuery({
    queryKey: ['salesAnalytics', 'dashboard'],
    queryFn: () => getSalesAnalyticsOverview('month'),
    staleTime: 2 * 60 * 1000,
    enabled: !!user && isSales,
  })

  // Fallback order data if analytics not available
  const ordersQuery = useQuery({
    queryKey: ['adminOrders', 'dashboard'],
    queryFn: () => getAdminOrders({ limit: 20 }),
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => getProducts({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  })

  // Additional stats queries for admin
  const orderStatsQuery = useQuery({
    queryKey: ['orderStats', 'dashboard'],
    queryFn: () => getOrderStats(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user && isAdmin,
  })

  const profitSummaryQuery = useQuery({
    queryKey: ['profitSummary', 'dashboard'],
    queryFn: () => getProfitSummary(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user && isAdmin,
  })

  const transactionStatsQuery = useQuery({
    queryKey: ['transactionStats', 'dashboard'],
    queryFn: () => getTransactionStats(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user && isAdmin,
  })

  const inventorySummaryQuery = useQuery({
    queryKey: ['inventorySummary', 'dashboard'],
    queryFn: () => getInventorySummary(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user && isAdmin,
  })

  // Memoized summary data from analytics
  const summary = useMemo((): DashboardSummary | null => {
    // Use admin analytics if available
    if (adminAnalyticsQuery.data?.data) {
      const data = adminAnalyticsQuery.data.data
      const overview = data.overview || {}
      const orders = data.orders || {}
      const transactions = data.transactions || {}
      const products = data.products || {}
      const customers = data.customers || {}

      return {
        totalRevenue: overview.totalRevenue || 0,
        totalOrders: overview.totalOrders || 0,
        totalItemsSold: 0,
        pendingOrders: orders.pendingOrders || 0,
        cancelledOrders: 0,
        totalProfit: 0,
        totalProducts: products.totalProducts || 0,
        totalTransactions: transactions.totalTransactions || 0,
        lowStockProducts: products.lowStockProducts || 0,
        averageOrderValue: overview.averageOrderValue || 0,
        activeCustomers: customers.activeCustomers || 0,
        paidOrders: orders.paidOrders || 0,
        revenueGrowth: overview.revenueGrowth || '0',
        orderGrowth: overview.orderGrowth || '0',
        conversionRate: overview.conversionRate || 0,
        totalStockValue: products.totalStockValue || 0,
      }
    }

    // Use sales analytics if available
    if (salesAnalyticsQuery.data?.data) {
      const data = salesAnalyticsQuery.data.data
      const overview = data.overview || {}
      const orders = data.orders || {}
      const transactions = data.transactions || {}
      const customers = data.customers || {}

      return {
        totalRevenue: overview.totalRevenue || 0,
        totalOrders: overview.totalOrders || 0,
        totalItemsSold: 0,
        pendingOrders: orders.pendingOrders || 0,
        cancelledOrders: 0,
        totalProfit: 0,
        totalProducts: 0,
        totalTransactions: transactions.totalTransactions || 0,
        lowStockProducts: 0,
        averageOrderValue: overview.averageOrderValue || 0,
        activeCustomers: customers.activeCustomers || 0,
        paidOrders: orders.paidOrders || 0,
        revenueGrowth: overview.revenueGrowth || '0',
        orderGrowth: overview.orderGrowth || '0',
        conversionRate: overview.conversionRate || 0,
      }
    }

    // Fallback: calculate from orders data
    if (!ordersQuery.data) return null

    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    const paidOrders = allOrders.filter((order: Order) => 
      order.paymentStatus === 'completed' || 
      order.paymentStatus === 'paid' ||
      order.status === 'paid' || 
      order.status === 'delivered'
    )

    const pendingOrders = allOrders.filter((o: Order) => 
      o.paymentStatus !== 'completed' && 
      o.paymentStatus !== 'paid' &&
      !['paid', 'delivered', 'cancelled'].includes(o.status || '')
    )

    const cancelledOrders = allOrders.filter((o: Order) => o.status === 'cancelled')

    const totalRevenue = paidOrders.reduce((sum, o) => {
      const total = typeof o.total === 'number' ? o.total : parseFloat(o.total || '0')
      return sum + total
    }, 0)

    const totalItemsSold = paidOrders.reduce((sum, o) => {
      const items = o.items || []
      return sum + items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0)
    }, 0)

    // Get product count from products query
    const productsArray = Array.isArray(productsQuery.data) 
      ? productsQuery.data 
      : (productsQuery.data as any)?.products || []
    const totalProducts = productsArray.length
    const lowStockProducts = productsArray.filter((p: any) => p.stock !== undefined && p.stock < 10).length

    // Get transactions count from transaction stats
    const txStats = transactionStatsQuery.data
    const totalTransactions = txStats?.summary?.totalTransactions || 0

    // Get profit from profit summary
    const profitData = profitSummaryQuery.data
    const totalProfit = profitData?.summary?.totalProfit || 0

    // Get inventory value
    const inventoryData = inventorySummaryQuery.data
    const totalStockValue = inventoryData?.summary?.totalStockValue || 0

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      totalItemsSold,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalProfit,
      totalProducts,
      totalTransactions,
      lowStockProducts,
      averageOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      activeCustomers: 0,
      paidOrders: paidOrders.length,
      revenueGrowth: '0',
      orderGrowth: '0',
      conversionRate: 0,
      totalStockValue,
    }
  }, [
    adminAnalyticsQuery.data,
    salesAnalyticsQuery.data,
    ordersQuery.data,
    productsQuery.data,
    transactionStatsQuery.data,
    profitSummaryQuery.data,
    inventorySummaryQuery.data,
  ])

  const recentOrders = useMemo(() => {
    // Use analytics data if available
    if (adminAnalyticsQuery.data?.data?.recentActivities?.orders) {
      return adminAnalyticsQuery.data.data.recentActivities.orders.slice(0, 5)
    }
    if (salesAnalyticsQuery.data?.data?.recentActivities?.orders) {
      return salesAnalyticsQuery.data.data.recentActivities.orders.slice(0, 5)
    }

    // Fallback to orders query
    if (!ordersQuery.data) return []
    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    return [...allOrders]
      .sort((a: Order, b: Order) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [adminAnalyticsQuery.data, salesAnalyticsQuery.data, ordersQuery.data])

  const topProducts = useMemo((): DashboardTopProduct[] => {
    // Use analytics data for top products if available
    const analyticsData = adminAnalyticsQuery.data?.data || salesAnalyticsQuery.data?.data
    if (analyticsData?.topProducts && analyticsData.topProducts.length > 0) {
      return analyticsData.topProducts.slice(0, 5).map((p: any, index: number) => ({
        id: p.id || p.productId || String(index),
        name: p.name || 'Unknown Product',
        sales: p.quantity || p.sales || 0,
        revenue: p.revenue || p.totalRevenue || 0,
        growth: '+0%',
        stock: p.stock,
        rank: index + 1,
        margin: p.margin || p.profitMargin || 0,
        profit: p.profit || 0,
      }))
    }

    // Fallback: calculate from orders
    if (!ordersQuery.data || !productsQuery.data) return []

    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    const paidOrders = allOrders.filter((o: Order) => 
      o.paymentStatus === 'completed' || 
      o.paymentStatus === 'paid' ||
      ['paid', 'delivered'].includes(o.status || '')
    )

    const productSalesMap = new Map()

    paidOrders.forEach((order: Order) => {
      order.items?.forEach((item: OrderItem) => {
        let productId: string | undefined
        if (item.productId) {
          if (typeof item.productId === 'object' && '_id' in item.productId) {
            productId = item.productId._id
          } else if (typeof item.productId === 'string') {
            productId = item.productId
          }
        }
        
        const key = String(productId || item.name || 'unknown')
        if (key) {
          const existing = productSalesMap.get(key) || { 
            sales: 0, 
            revenue: 0, 
            name: item.name, 
            price: item.price,
            stock: 0
          }
          existing.sales += item.qty || 0
          existing.revenue += (item.price || 0) * (item.qty || 0)
          productSalesMap.set(key, existing)
        }
      })
    })

    const productsArray = Array.isArray(productsQuery.data) 
      ? productsQuery.data 
      : (productsQuery.data as any)?.products || []
      
    productsArray.forEach((p: Product) => {
      const key = String(p._id || p.name || 'unknown')
      if (!productSalesMap.has(key)) {
        productSalesMap.set(key, { 
          sales: 0, 
          revenue: 0, 
          name: p.name, 
          price: p.price,
          stock: p.stock || 0
        })
      }
    })

    return Array.from(productSalesMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name || 'Unknown Product',
        sales: data.sales,
        revenue: data.revenue,
        growth: data.sales > 0 ? '+12%' : '0%',
        stock: data.stock,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }, [ordersQuery.data, productsQuery.data, adminAnalyticsQuery.data, salesAnalyticsQuery.data])

  // Determine which queries are loading
  const isLoading = 
    ordersQuery.isLoading || 
    productsQuery.isLoading ||
    (isAdmin && adminAnalyticsQuery.isLoading) ||
    (isSales && salesAnalyticsQuery.isLoading)

  const error = 
    ordersQuery.error || 
    productsQuery.error ||
    (isAdmin && adminAnalyticsQuery.error) ||
    (isSales && salesAnalyticsQuery.error)

  return {
    summary,
    recentOrders,
    topProducts,
    dashboardStats: [],
    isLoading,
    error,
    refetch: () => {
      ordersQuery.refetch()
      productsQuery.refetch()
      if (isAdmin) {
        adminAnalyticsQuery.refetch()
        orderStatsQuery.refetch()
        profitSummaryQuery.refetch()
        transactionStatsQuery.refetch()
        inventorySummaryQuery.refetch()
      }
      if (isSales) {
        salesAnalyticsQuery.refetch()
      }
    },

    

  }

  
}

