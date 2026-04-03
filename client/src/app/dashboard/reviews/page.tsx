// src/app/dashboard/reviews/page.tsx
'use client'

import { useState } from 'react'
import { 
  Star, Search, Filter, Download, RefreshCw,
  User, Mail, Calendar, Loader2, ChevronLeft,
  ChevronRight, Eye, Trash2, CheckCircle, XCircle,
  MessageSquare, ThumbsUp, ThumbsDown, Flag,
  Award, TrendingUp, StarHalf, Heart
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Types
interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  isApproved: boolean
  helpful: number
  notHelpful: number
  replies?: ReviewReply[]
  createdAt: string
  updatedAt: string
}

interface ReviewReply {
  id: string
  author: string
  comment: string
  createdAt: string
}

// Mock data
const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'prod_1',
    productName: 'Solar Panel 500W',
    productImage: '/placeholder.jpg',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    rating: 5,
    title: 'Excellent product!',
    comment: 'This solar panel exceeded my expectations. Installation was easy and performance is outstanding.',
    isVerified: true,
    isApproved: true,
    helpful: 12,
    notHelpful: 1,
    replies: [
      {
        id: 'reply_1',
        author: 'Support Team',
        comment: 'Thank you for your feedback! We appreciate your support.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: '2',
    productId: 'prod_2',
    productName: 'Water Pump 2000W',
    productImage: '/placeholder.jpg',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    rating: 4,
    title: 'Good quality pump',
    comment: 'Works well for our irrigation needs. A bit noisy but powerful.',
    isVerified: true,
    isApproved: true,
    helpful: 8,
    notHelpful: 2,
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: '3',
    productId: 'prod_3',
    productName: 'Inverter 3000W',
    productImage: '/placeholder.jpg',
    customerName: 'Michael Otieno',
    customerEmail: 'michael@example.com',
    rating: 3,
    title: 'Decent but has issues',
    comment: 'The inverter works but the fan is loud. Customer service was helpful though.',
    isVerified: true,
    isApproved: false,
    helpful: 5,
    notHelpful: 3,
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: '4',
    productId: 'prod_4',
    productName: 'Battery 12V 200Ah',
    productImage: '/placeholder.jpg',
    customerName: 'Sarah Wanjiku',
    customerEmail: 'sarah@example.com',
    rating: 5,
    title: 'Amazing battery life!',
    comment: 'Lasts longer than expected. Perfect for our solar system.',
    isVerified: true,
    isApproved: true,
    helpful: 15,
    notHelpful: 0,
    replies: [
      {
        id: 'reply_2',
        author: 'Tech Support',
        comment: 'Great to hear! Thank you for choosing our product.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: '5',
    productId: 'prod_5',
    productName: 'Charge Controller 60A',
    productImage: '/placeholder.jpg',
    customerName: 'David Kimani',
    customerEmail: 'david@example.com',
    rating: 2,
    title: 'Not as described',
    comment: 'The product specifications were misleading. Returns process was complicated.',
    isVerified: true,
    isApproved: false,
    helpful: 7,
    notHelpful: 4,
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
  }
]

export default function ReviewsPage() {
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const itemsPerPage = 10

  // Filter reviews
  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = search === '' || 
      review.productName.toLowerCase().includes(search.toLowerCase()) ||
      review.customerName.toLowerCase().includes(search.toLowerCase()) ||
      review.comment.toLowerCase().includes(search.toLowerCase())
    
    const matchesRating = ratingFilter === '' || review.rating === parseInt(ratingFilter)
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'approved' && review.isApproved) ||
      (statusFilter === 'pending' && !review.isApproved)
    
    return matchesSearch && matchesRating && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const paginatedReviews = filteredReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Statistics
  const stats = {
    total: mockReviews.length,
    averageRating: (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1),
    approved: mockReviews.filter(r => r.isApproved).length,
    pending: mockReviews.filter(r => !r.isApproved).length,
    fiveStar: mockReviews.filter(r => r.rating === 5).length,
    fourStar: mockReviews.filter(r => r.rating === 4).length,
    threeStar: mockReviews.filter(r => r.rating === 3).length,
    twoStar: mockReviews.filter(r => r.rating === 2).length,
    oneStar: mockReviews.filter(r => r.rating === 1).length
  }

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
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Reviews refreshed')
  }

  const handleExport = () => {
    toast.success('Export started. You will be notified when ready.')
  }

  const handleApprove = (reviewId: string) => {
    toast.success('Review approved successfully')
  }

  const handleDelete = (reviewId: string) => {
    toast.success('Review deleted successfully')
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : paginatedReviews.length === 0 ? (
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
            paginatedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Product Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{review.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">({review.rating}/5)</span>
                          {review.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{review.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{review.comment}</p>

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {review.customerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {review.customerEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>

                    {/* Helpful Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {review.helpful} helpful
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="w-3.5 h-3.5" />
                        {review.notHelpful} not helpful
                      </div>
                    </div>

                    {/* Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                        {review.replies.map(reply => (
                          <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-blue-600 dark:text-blue-400">{reply.author}</span>
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reply.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
                        onClick={() => handleApprove(review.id)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReview.productName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rating</label>
                  <div className="mt-1">{renderStars(selectedReview.rating)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Customer</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedReview.customerName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedReview.customerEmail}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Title</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReview.title}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Comment</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReview.comment}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Helpful Votes</label>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-green-600">👍 {selectedReview.helpful}</span>
                    <span className="text-sm text-red-600">👎 {selectedReview.notHelpful}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Missing imports
import { X, Package, Clock } from 'lucide-react'