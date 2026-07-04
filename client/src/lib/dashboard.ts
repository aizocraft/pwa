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

interface ProfitSummary {
  totalProfit?: number
  totalUnitsSold?: number
}

interface InventorySummary {
  totalStockValue?: number
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

  // Memoized summary data from analytics and order/profit endpoints
  const summary = useMemo((): DashboardSummary | null => {
    const adminData = adminAnalyticsQuery.data?.data
    const salesData = salesAnalyticsQuery.data?.data
    const adminOverview = adminData?.overview || {}
    const salesOverview = salesData?.overview || {}
    const adminOrders = adminData?.orders || {}
    const salesOrders = salesData?.orders || {}
    const adminTransactions = adminData?.transactions || {}
    const salesTransactions = salesData?.transactions || {}
    const adminProducts: any = adminData?.products || {}
    const adminCustomers = adminData?.customers || {}
    const salesCustomers = salesData?.customers || {}
    const profitSummary: ProfitSummary = profitSummaryQuery.data?.summary || {}
    const orderStatsSummary = orderStatsQuery.data?.summary || {}
    const inventorySummary: InventorySummary = inventorySummaryQuery.data?.summary || {}

    const rawOrders = ordersQuery.data?.orders || ordersQuery.data || []
    const allOrders = Array.isArray(rawOrders) ? rawOrders : []
    const productsArray = Array.isArray(productsQuery.data)
      ? productsQuery.data
      : (productsQuery.data as any)?.products || []

    const isPaidOrder = (order: Order) => {
      return order.paymentStatus === 'completed' ||
        order.paymentStatus === 'paid' ||
        order.status === 'paid' ||
        order.status === 'delivered'
    }

    const paidOrders = allOrders.filter(isPaidOrder)
    const pendingOrders = allOrders.filter((o: Order) =>
      o.paymentStatus !== 'completed' &&
      o.paymentStatus !== 'paid' &&
      !['paid', 'delivered', 'cancelled'].includes(o.status || '')
    )
    const cancelledOrders = allOrders.filter((o: Order) => o.status === 'cancelled')

    const totalRevenue = Number(
      adminOverview.totalRevenue ??
      salesOverview.totalRevenue ??
      paidOrders.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : parseFloat(o.total || '0')), 0)
    ) || 0

    const totalOrders = Number(
      adminOverview.totalOrders ??
      salesOverview.totalOrders ??
      allOrders.length
    ) || 0

    const totalItemsSold = Number(
      (profitSummary as any).totalUnitsSold ??
      adminOverview.totalItemsSold ??
      salesOverview.totalItemsSold ??
      paidOrders.reduce((sum, o) => {
        const items = o.items || []
        return sum + items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0)
      }, 0)
    ) || 0

    const derivedProfit = paidOrders.reduce((sum, o) => sum + Number((o as any).totalProfit || 0), 0)
    const totalProfit = Number(
      (profitSummary as any).totalProfit ??
      (orderStatsSummary as any).totalProfit ??
      adminOverview.totalProfit ??
      salesOverview.totalProfit ??
      derivedProfit
    ) || 0

    const totalProducts = Number(adminProducts.totalProducts ?? productsArray.length) || 0
    const lowStockProducts = productsArray.filter((p: any) => p.stock !== undefined && p.stock < 10).length

    const totalTransactions = Number(
      transactionStatsQuery.data?.summary?.totalTransactions ??
      adminTransactions.totalTransactions ??
      salesTransactions.totalTransactions ??
      0
    ) || 0

    const totalStockValue = Number(inventorySummary.totalStockValue ?? adminProducts.totalStockValue ?? 0) || 0

    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      pendingOrders: Number(adminOrders.pendingOrders ?? salesOrders.pendingOrders ?? pendingOrders.length) || 0,
      cancelledOrders: Number(cancelledOrders.length) || 0,
      totalProfit,
      totalProducts,
      totalTransactions,
      lowStockProducts,
      averageOrderValue: Number(adminOverview.averageOrderValue ?? salesOverview.averageOrderValue ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0)) || 0,
      activeCustomers: Number(adminCustomers.activeCustomers ?? salesCustomers.activeCustomers ?? 0) || 0,
      paidOrders: Number(adminOrders.paidOrders ?? salesOrders.paidOrders ?? paidOrders.length) || 0,
      revenueGrowth: adminOverview.revenueGrowth || salesOverview.revenueGrowth || '0',
      orderGrowth: adminOverview.orderGrowth || salesOverview.orderGrowth || '0',
      profitGrowth: adminOverview.profitGrowth || salesOverview.profitGrowth || '0',
      conversionRate: Number(adminOverview.conversionRate ?? salesOverview.conversionRate ?? 0) || 0,
      totalStockValue,
    }
  }, [
    adminAnalyticsQuery.data,
    salesAnalyticsQuery.data,
    ordersQuery.data,
    productsQuery.data,
    transactionStatsQuery.data,
    profitSummaryQuery.data,
    orderStatsQuery.data,
    inventorySummaryQuery.data,
  ])

  const recentOrders = useMemo(() => {
    const fallbackOrders = ordersQuery.data?.orders || ordersQuery.data || []
    const analyticsOrders = adminAnalyticsQuery.data?.data?.recentActivities?.orders || salesAnalyticsQuery.data?.data?.recentActivities?.orders || []
    const sourceOrders = Array.isArray(fallbackOrders) && fallbackOrders.length > 0 ? fallbackOrders : analyticsOrders

    return [...sourceOrders]
      .sort((a: Order, b: Order) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [adminAnalyticsQuery.data, salesAnalyticsQuery.data, ordersQuery.data])

  const topProducts = useMemo((): DashboardTopProduct[] => {
    const analyticsData = adminAnalyticsQuery.data?.data || salesAnalyticsQuery.data?.data
    const analyticsProducts = Array.isArray(analyticsData?.topProducts) ? analyticsData.topProducts : []

    if (analyticsProducts.length > 0) {
      return analyticsProducts.slice(0, 5).map((p: any, index: number) => ({
        id: p.id || p.productId || String(index),
        name: p.name || 'Unknown Product',
        sales: Number(p.quantity ?? p.sales ?? 0) || 0,
        revenue: Number(p.revenue ?? p.totalRevenue ?? 0) || 0,
        growth: p.growth || '+0%',
        stock: p.stock,
        rank: index + 1,
        margin: Number(p.margin ?? p.profitMargin ?? 0) || 0,
        profit: Number(p.profit ?? p.totalProfit ?? 0) || 0,
      }))
    }

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

