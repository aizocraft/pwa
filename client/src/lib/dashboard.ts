'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminOrders, getProducts } from './api'
import { useMemo } from 'react'
import { useAuth } from './auth'

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
}

interface Product {
  _id?: string
  name?: string
  price?: number
}

export function useDashboardData() {
  const { user } = useAuth()

  const ordersQuery = useQuery({
    queryKey: ['adminOrders', 'dashboard'],
    queryFn: () => getAdminOrders({ limit: 20 }), // Changed from '20' to 20 (number)
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => getProducts({ limit: 50 }), // Changed from '50' to 50 (number)
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  })

  // Memoized derived data
  const summary = useMemo(() => {
    if (!ordersQuery.data) return null

    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    const paidOrders = allOrders.filter((order: Order) => 
      order.paymentStatus === 'completed' || 
      order.status === 'paid' || order.status === 'delivered'
    )

    return {
      totalRevenue: paidOrders.reduce((sum, o) => {
        const total = typeof o.total === 'number' ? o.total : parseFloat(o.total || '0')
        return sum + total
      }, 0),
      totalOrders: paidOrders.length,
      totalItemsSold: paidOrders.reduce((sum, o) => {
        const items = o.items || []
        return sum + items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0)
      }, 0),
      pendingOrders: allOrders.filter((o: Order) => 
        o.paymentStatus !== 'completed' && 
        !['paid', 'delivered', 'cancelled'].includes(o.status || '')
      ).length,
      cancelledOrders: allOrders.filter((o: Order) => o.status === 'cancelled').length,
    }
  }, [ordersQuery.data])

  const recentOrders = useMemo(() => {
    if (!ordersQuery.data) return []
    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    return [...allOrders]
      .sort((a: Order, b: Order) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [ordersQuery.data])

  const topProducts = useMemo(() => {
    if (!ordersQuery.data || !productsQuery.data) return []

    const allOrders = ordersQuery.data.orders || ordersQuery.data || []
    const paidOrders = allOrders.filter((o: Order) => 
      o.paymentStatus === 'completed' || ['paid', 'delivered'].includes(o.status || '')
    )

    const productSalesMap = new Map()

    paidOrders.forEach((order: Order) => {
      order.items?.forEach((item: OrderItem) => {
        // Safely get the product ID
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
            price: item.price 
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
          price: p.price 
        })
      }
    })

    return Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p, i) => ({ 
        ...p, 
        rank: i + 1, 
        growth: p.sales > 0 ? '+12%' : '0%' 
      }))
  }, [ordersQuery.data, productsQuery.data])

  const isLoading = ordersQuery.isLoading || productsQuery.isLoading
  const error = ordersQuery.error || productsQuery.error

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
    },
  }
}