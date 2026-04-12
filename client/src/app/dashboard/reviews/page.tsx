// src/app/dashboard/reviews/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Star, Search, Filter, Download, RefreshCw,
  User, Mail, Calendar, Loader2, ChevronLeft,
  ChevronRight, Eye, Trash2, CheckCircle, XCircle,
  MessageSquare, ThumbsUp, ThumbsDown, Flag,
  Award, TrendingUp, StarHalf, Heart, X, Package, Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getProductReviews, deleteReview, updateReview } from '@/lib/api'

// Types
interface Review {
  _id?: string
  id?: string
  productId: string | {
    _id: string
    name: string
    images?: string[]
  }
  userId: string | {
    _id: string
    name: string
    email?: string
  }
  rating: number
  review?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [allProducts, setAllProducts] = useState<Map<string, string>>(new Map())
  const [allUsers, setAllUsers] = useState<Map<string, { name: string; email: string }>>(new Map())
  const itemsPerPage = 10

  // Fetch all reviews (you'll need a getAdminReviews endpoint)
  // For now, we'll simulate by fetching from multiple products
  // You should add a GET /api/reviews/admin endpoint in your backend

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual admin reviews endpoint
      // const response = await getAdminReviews({ page, limit: itemsPerPage, status: statusFilter, rating: ratingFilter })
      // For now, show empty state
      setReviews([])
      setTotalPages(1)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page, ratingFilter, statusFilter])

  // Handle search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page !== 1) setPage(1)
      fetchReviews()
    }, 500)
    return () => clearTimeout(timeout)
  }, [search])

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
    const approved = reviews.filter(r => r.isApproved).length
    const pending = reviews.filter(r => !r.isApproved).length
    const fiveStar = reviews.filter(r => r.rating === 5).length
    const fourStar = reviews.filter(r => r.rating === 4).length
    const threeStar = reviews.filter(r => r.rating === 3).length
    const twoStar = reviews.filter(r => r.rating === 2).length
    const oneStar = reviews.filter(r => r.rating === 1).length
    
    return { total, averageRating: avgRating, approved, pending, fiveStar, fourStar, threeStar, twoStar, oneStar }
  }, [reviews])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleRefresh = async () => {
    await fetchReviews()
    toast.success('Reviews refreshed')
  }

  const handleExport = () => {
    const csvData = reviews.map((r: any) => ({
      'Product': typeof r.productId === 'object' ? r.productId?.name || 'N/A' : 'N/A',
      'Customer': typeof r.userId === 'object' ? r.userId?.name || 'N/A' : 'N/A',
      'Email': typeof r.userId === 'object' ? r.userId?.email || 'N/A' : 'N/A',
      'Rating': r.rating || 0,
      'Review': r.review || '',
      'Status': r.isApproved ? 'approved' : 'pending',
      'Date': new Date(r.createdAt || Date.now()).toLocaleDateString()
    }))

    const headers = Object.keys(csvData[0] || {})
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => JSON.stringify(row[h as keyof typeof row] || '')).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reviews_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export completed')
  }

  const handleApprove = async (id: string) => {
    try {
      await updateReview(id, { rating: 5 }) // You'll need to add status update to review
      toast.success('Review approved successfully')
      fetchReviews()
    } catch (error) {
      toast.error('Failed to approve review')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id)
        toast.success('Review deleted successfully')
        fetchReviews()
      } catch (error) {
        toast.error('Failed to delete review')
      }
    }
  }

  const clearFilters = () => {
    setSearch('')
    setRatingFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days < 1) return 'Today'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getProductName = (review: Review) => {
    if (typeof review.productId === 'object') {
      return review.productId?.name || 'Unknown Product'
    }
    return 'Product ID: ' + review.productId
  }

  const getCustomerName = (review: Review) => {
    if (typeof review.userId === 'object') {
      return review.userId?.name || 'Anonymous'
    }
    return 'Anonymous'
  }

  const getCustomerEmail = (review: Review) => {
    if (typeof review.userId === 'object') {
      return review.userId?.email || 'No email'
    }
    return 'No email'
  }

  const getProductImage = (review: Review) => {
    if (typeof review.productId === 'object') {
      return review.productId?.images?.[0]
    }
    return null
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
                <MessageSquare className="w-8 h-8 text-blue-600" />
                Product Reviews
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage customer feedback and product ratings
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.averageRating}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">5-Star Reviews</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.fiveStar}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats[`${rating}Star` as keyof typeof stats] as number
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{rating} ★</div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-500">{count}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product or customer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-700 text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review._id || review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Product Info */}
                    <div className="flex items-start gap-4 mb-4">
                     <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
  {(() => {
    const productImage = getProductImage(review)
    return productImage ? (
      <img src={productImage} alt={getProductName(review)} className="w-full h-full object-cover" />
    ) : (
      <Package className="w-8 h-8 text-gray-500" />
    )
  })()}
</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{getProductName(review)}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">({review.rating}/5)</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    {review.review && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{review.review}</p>
                    )}

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {getCustomerName(review)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {getCustomerEmail(review)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review._id || review.id || '')}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id || review.id || '')}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    review.isApproved
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {review.isApproved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {review.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
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
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReview(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Details</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Product</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getProductName(selectedReview)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rating</label>
                  <div className="mt-1">{renderStars(selectedReview.rating)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Customer</label>
                  <p className="text-sm text-gray-900 dark:text-white">{getCustomerName(selectedReview)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{getCustomerEmail(selectedReview)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Review</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReview.review || 'No review text'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedReview.isApproved
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {selectedReview.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Created</label>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedReview.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}