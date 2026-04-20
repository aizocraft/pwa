// src/app/dashboard/transactions/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  CreditCard, Search, Filter, Download, RefreshCw,
  DollarSign, Calendar, Clock, User, Mail, Phone,
  CheckCircle, XCircle, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Eye, Smartphone,
  Truck, Building2, Receipt, FileText, Copy,
  ChevronDown, TrendingUp, TrendingDown, Wallet, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getTransactions, getTransactionStats } from '@/lib/api'

// Types
interface Transaction {
  _id: string
  orderId: string | { orderNumber: string }
  transactionId: string
  customerName: string
  guestEmail?: string
  guestPhone?: string
  amount: number
  currency: string
  paymentMethod: 'mpesa' | 'card' | 'cod'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  mpesaReceipt?: string
  cardLast4?: string
  cardBrand?: string
  createdAt: string
  updatedAt: string
  orderNumber?: string
  customerInfo?: {
    name: string
    email: string
    phone: string
  }
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [page, setPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Real API queries
  const transactionsQuery = useQuery({
    queryKey: ['transactions', { 
      page, 
      search, 
      status: statusFilter, 
      paymentMethod: methodFilter,
      startDate: dateRange.start,
      endDate: dateRange.end
    }],
    queryFn: () => getTransactions({
      page,
      limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
      paymentMethod: methodFilter || undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const statsQuery = useQuery({
    queryKey: ['transactionStats'],
    queryFn: getTransactionStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const transactions = transactionsQuery.data?.transactions || []
const stats = statsQuery.data?.summary || {
  totalVolume: 0,
  totalTransactions: 0,
  completed: 0,
  pending: 0,
  failed: 0,
  refunded: 0,
  mpesaCount: 0,
  cardCount: 0,
  codCount: 0,
  completedVolume: 0,
  successRate: 0  
}
  const pagination = transactionsQuery.data?.pagination || { 
    current: 1, 
    pages: 1, 
    total: 0, 
    limit: 20
  } as any
  
  const isLoading = transactionsQuery.isLoading || statsQuery.isLoading

  const handleRefresh = () => {
    transactionsQuery.refetch()
    statsQuery.refetch()
    toast.success('Transactions refreshed')
  }

  const handleExport = async () => {
    try {
      const { exportTransactionsToCSV } = await import('@/lib/api')
      const blob = await exportTransactionsToCSV({
        status: statusFilter || undefined,
        paymentMethod: methodFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Export completed')
    } catch (error) {
      toast.error('Failed to export transactions')
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Transaction ID copied')
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setMethodFilter('')
    setDateRange({ start: '', end: '' })
    setPage(1)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' },
      pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
      failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Failed' },
      refunded: { icon: RefreshCw, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Refunded' }
    }
    return configs[status] || configs.pending
  }

  const getMethodConfig = (method: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      mpesa: { icon: Smartphone, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'M-PESA' },
      card: { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Card' },
      cod: { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Cash on Delivery' }
    }
    return configs[method] || configs.cod
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

  const getTransactionDisplay = (tx: Transaction) => {
    return {
      id: tx._id,
      transactionId: tx.transactionId,
      orderNumber: tx.orderNumber || (typeof tx.orderId === 'object' ? tx.orderId?.orderNumber : 'N/A'),
customerName: tx.customerInfo?.name || tx.customerName,
      customerEmail: tx.customerInfo?.email || tx.guestEmail || 'N/A',
      customerPhone: tx.customerInfo?.phone || tx.guestPhone || 'N/A',
      amount: tx.amount,
      currency: tx.currency,
      paymentMethod: tx.paymentMethod,
      status: tx.status,
      mpesaReceipt: tx.mpesaReceipt,
      cardLast4: tx.cardLast4,
      cardBrand: tx.cardBrand,
      createdAt: tx.createdAt
    }
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
                <CreditCard className="w-8 h-8 text-blue-600" />
                Transactions
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Track all payment transactions and financial activity
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  KES {stats.totalVolume?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                 <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          KES {stats.completed?.toLocaleString() || 0}
        </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats.pending || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.failed || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
          {(stats as any).successRate || '0'}%
        </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5 text-purple-600" />
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
                placeholder="Search by order, customer, or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Methods</option>
              <option value="mpesa">M-PESA</option>
              <option value="card">Card</option>
              <option value="cod">Cash on Delivery</option>
            </select>

            <input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Transactions Table */}
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
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
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
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Transaction</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Method</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Date</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.map((tx: Transaction, index: number) => {
                      const display = getTransactionDisplay(tx)
                      const StatusIcon = getStatusConfig(display.status).icon
                      const statusConfig = getStatusConfig(display.status)
                      const MethodIcon = getMethodConfig(display.paymentMethod).icon
                      const methodConfig = getMethodConfig(display.paymentMethod)
                      
                      return (
                        <motion.tr
                          key={display.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                          className="transition-colors cursor-pointer"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-mono font-medium text-gray-900 dark:text-white">
                                {display.transactionId.slice(0, 12)}...
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Order: {display.orderNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{display.customerName}</div>
                              <div className="text-xs text-gray-500">{display.customerEmail}</div>
                              <div className="text-xs text-gray-500">{display.customerPhone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 dark:text-white">
                              KES {display.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{display.currency}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${methodConfig.bg}`}>
                              <MethodIcon className={`w-4 h-4 ${methodConfig.color}`} />
                              <span className={`text-sm font-medium ${methodConfig.color}`}>
                                {methodConfig.label}
                              </span>
                            </div>
                            {display.cardLast4 && (
                              <div className="text-xs text-gray-500 mt-1">
                                •••• {display.cardLast4}
                              </div>
                            )}
                            {display.mpesaReceipt && (
                              <div className="text-xs text-gray-500 mt-1">
                                Receipt: {display.mpesaReceipt}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {formatDate(display.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyId(display.transactionId)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.current <= 3) {
                          pageNum = i + 1
                        } else if (pagination.current >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.current - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              pagination.current === pageNum
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
                      disabled={!pagination.hasNext}
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Transaction ID</label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Order Number</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.orderNumber || (typeof selectedTransaction.orderId === 'object' ? selectedTransaction.orderId?.orderNumber : 'N/A')}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    KES {selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedTransaction.status).bg} ${getStatusConfig(selectedTransaction.status).color}`}>
                      {getStatusConfig(selectedTransaction.status).label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Payment Method</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getMethodConfig(selectedTransaction.paymentMethod).bg}`}>
                      {getMethodConfig(selectedTransaction.paymentMethod).label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Created At</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedTransaction.mpesaReceipt && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">M-PESA Receipt</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTransaction.mpesaReceipt}</p>
                  </div>
                )}
                {selectedTransaction.cardLast4 && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">Card Details</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedTransaction.cardBrand} •••• {selectedTransaction.cardLast4}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}