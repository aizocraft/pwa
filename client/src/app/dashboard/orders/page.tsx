'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminOrders, updateOrderStatus } from '@/lib/api'
import { Order } from '@/types/order'
import toast from 'react-hot-toast'
import { 
  Search, Download, ChevronLeft, ChevronRight, Eye, 
  Filter, RefreshCw, ShoppingCart, AlertCircle, Loader2, 
  Smartphone, CreditCard, Truck, Mail, Phone, X, Wallet, Building, FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

// Status update dropdown
const StatusUpdateDropdown = ({ 
  orderId, 
  currentStatus, 
  onStatusChange 
}: { 
  orderId: string
  currentStatus: Order['status']
  onStatusChange: (id: string, status: Order['status']) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusOptions: { value: Order['status']; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const handleSelect = async (status: Order['status']) => {
    if (status === currentStatus) {
      setIsOpen(false)
      return
    }
    setIsUpdating(true)
    try {
      await onStatusChange(orderId, status)
      toast.success(`Status updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
      >
        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentStatus === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Payment method badge - Add missing payment methods
const PaymentMethodBadge = ({ method }: { method: Order['paymentMethod'] }) => {
  const config = {
    cod: { icon: Truck, label: 'Cash on Delivery' },
    mpesa: { icon: Smartphone, label: 'M-PESA' },
    card: { icon: CreditCard, label: 'Card' },
    cash: { icon: Wallet, label: 'Cash' },
    bank_transfer: { icon: Building, label: 'Bank Transfer' },
    cheque: { icon: FileText, label: 'Cheque' },
  }
  const { icon: Icon, label } = config[method] || config.cod
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Helper function to get customer name
const getCustomerName = (order: Order): string => {
  if (order.userId && typeof order.userId === 'object' && 'name' in order.userId) {
    return (order.userId as any).name
  }
  if (order.guestInfo?.name) {
    return order.guestInfo.name
  }
  if (order.shippingAddress?.fullName) {
    return order.shippingAddress.fullName
  }
  return 'Guest'
}

// Helper function to get customer email
const getCustomerEmail = (order: Order): string | null => {
  if (order.userId && typeof order.userId === 'object' && 'email' in order.userId) {
    return (order.userId as any).email
  }
  if (order.guestInfo?.email) {
    return order.guestInfo.email
  }
  if (order.shippingAddress?.email) {
    return order.shippingAddress.email
  }
  return null
}

// Helper function to get customer phone
const getCustomerPhone = (order: Order): string | null => {
  if (order.guestInfo?.phone) {
    return order.guestInfo.phone
  }
  if (order.shippingAddress?.phone) {
    return order.shippingAddress.phone
  }
  return null
}

export default function DashboardOrdersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminOrders', { search, statusFilter, paymentMethodFilter, page, limit }],
    queryFn: () => getAdminOrders({ 
      page, 
      limit, 
      status: statusFilter || undefined,
      paymentMethod: paymentMethodFilter || undefined,
      search: search || undefined,
    }),
  })

  const orders = data?.orders || []
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
    },
  })

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await statusMutation.mutateAsync({ id: orderId, status: newStatus })
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Payment', 'Date']
    const csvData = orders.map(order => [
      order.orderNumber || `#${order._id.slice(-8)}`,
      getCustomerName(order),
      getCustomerEmail(order) || 'N/A',
      getCustomerPhone(order) || 'N/A',
      order.items.reduce((sum, item) => sum + item.qty, 0),
      order.total.toFixed(2),
      order.status,
      order.paymentMethod,
      formatDate(order.createdAt)
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Orders exported')
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPaymentMethodFilter('')
    setPage(1)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load orders</h3>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination.total.toLocaleString()} total orders
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={paymentMethodFilter}
          onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All payments</option>
          <option value="cod">Cash on Delivery</option>
          <option value="mpesa">M-PESA</option>
          <option value="card">Card</option>
        </select>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active filters */}
      {(search || statusFilter || paymentMethodFilter) && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Search: {search}
              <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {paymentMethodFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Payment: {paymentMethodFilter}
              <button onClick={() => setPaymentMethodFilter('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700">Clear all</button>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No orders found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search || statusFilter ? 'Try adjusting your filters' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Order</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Items</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Payment</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber?.slice(-8) || order._id.slice(-8)}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {getCustomerName(order)}
                          </div>
                          {getCustomerEmail(order) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {getCustomerEmail(order)}
                            </div>
                          )}
                          {getCustomerPhone(order) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {getCustomerPhone(order)}
                            </div>
                          )}
                        </div>
                       </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Ksh {order.total.toLocaleString()}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <PaymentMethodBadge method={order.paymentMethod} />
                       </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                       </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(order.createdAt)}
                       </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StatusUpdateDropdown 
                            orderId={order._id}
                            currentStatus={order.status}
                            onStatusChange={handleStatusChange}
                          />
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}