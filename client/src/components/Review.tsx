// src/components/Review.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Star, StarHalf, ThumbsUp, Flag, User, Calendar, Trash2, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createReview, updateReview, deleteReview, getProductReviews, hasUserReviewed } from '@/lib/api'
import type { Review, ReviewStats } from '@/types/review'
import Image from 'next/image'

interface ReviewComponentProps {
  productId: string
  productName?: string
}

const StarRating = ({ rating, onRatingChange, size = 'md', readonly = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
          disabled={readonly}
        >
          <Star
            className={`${sizeClasses[size]} ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const ReviewForm = ({ 
  productId, 
  productName,
  existingReview,
  onSubmit, 
  onCancel 
}: { 
  productId: string;
  productName?: string;
  existingReview?: Review | null;
  onSubmit: (rating: number, review: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [reviewText, setReviewText] = useState(existingReview?.review || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await onSubmit(rating, reviewText)
    } catch (err) {
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {existingReview ? 'Edit Your Review' : `Write a Review for ${productName || 'this product'}`}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating *
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Share your experience with this product..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {reviewText.length}/1000 characters
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
          {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

const ReviewCard = ({ review, onEdit, onDelete, isCurrentUser }: { 
  review: Review; 
  onEdit: () => void;
  onDelete: () => void;
  isCurrentUser: boolean;
}) => {
  const [showActions, setShowActions] = useState(false)
  
  // Safely get user name
  const getUserName = () => {
    if (typeof review.userId === 'object' && review.userId !== null) {
      return review.userId.name || 'Anonymous'
    }
    if (review.user && typeof review.user === 'object') {
      return review.user.name || 'Anonymous'
    }
    return 'Anonymous'
  }
  
  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">            
            {getUserInitial()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {getUserName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" readonly />
          {isCurrentUser && showActions && (
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                title="Edit review"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {review.review && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          {review.review}
        </p>
      )}
      
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-3 h-3" />
          Helpful
        </button>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
          <Flag className="w-3 h-3" />
          Report
        </button>
      </div>
    </div>
  )
}

export default function ReviewComponent({ productId, productName }: ReviewComponentProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  const [userReviewId, setUserReviewId] = useState<string | null>(null)
  
  const { user, isLoggedIn } = useAuth()
  const itemsPerPage = 10
  
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await getProductReviews(productId, { page, limit: itemsPerPage })
      setReviews(response.reviews)
      setStats(response.stats)
      setTotalPages(response.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const checkUserReview = async () => {
    if (!isLoggedIn) return
    
    try {
      const result = await hasUserReviewed(productId)
      setUserHasReviewed(result.hasReviewed)
      setUserReviewId(result.reviewId || null)
      
      // If user has a review, find it in the current reviews list
      if (result.hasReviewed && result.reviewId) {
        const userReview = reviews.find(r => r._id === result.reviewId || r.id === result.reviewId)
        if (userReview) {
          setEditingReview(userReview)
        }
      }
    } catch (error) {
      console.error('Failed to check user review:', error)
    }
  }
  
  useEffect(() => {
    fetchReviews()
  }, [productId, page])
  
  useEffect(() => {
    checkUserReview()
  }, [productId, isLoggedIn, reviews])
  
  const handleCreateReview = async (rating: number, reviewText: string) => {
    await createReview({
      productId,
      rating,
      review: reviewText
    })
    setShowForm(false)
    await fetchReviews()
    await checkUserReview()
  }
  
  const handleUpdateReview = async (rating: number, reviewText: string) => {
    if (!editingReview?._id && !editingReview?.id) return
    
    const reviewId = editingReview._id || editingReview.id
    await updateReview(reviewId!, {
      rating,
      review: reviewText
    })
    setEditingReview(null)
    setShowForm(false)
    await fetchReviews()
    await checkUserReview()
  }
  
  const handleDeleteReview = async () => {
    if (!userReviewId) return
    
    if (confirm('Are you sure you want to delete your review?')) {
      await deleteReview(userReviewId)
      setUserHasReviewed(false)
      setUserReviewId(null)
      setEditingReview(null)
      await fetchReviews()
      await checkUserReview()
    }
  }
  
  const handleEditClick = (review: Review) => {
    setEditingReview(review)
    setShowForm(true)
  }
  
  const handleCancelForm = () => {
    setShowForm(false)
    setEditingReview(null)
  }
  
  // Check if current user owns this review
  const isUserReview = (review: Review): boolean => {
    if (!isLoggedIn || !user) return false
    
    const userId = review.userId
    if (typeof userId === 'object' && userId !== null) {
      return userId._id === user.id
    }
    return userId === user.id
  }
  
  const canWriteReview = isLoggedIn && !userHasReviewed && !showForm
  
  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <div>
                <StarRating rating={stats.averageRating} size="md" readonly />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {canWriteReview && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
>
            Write a Review
          </button>
        )}
      </div>
      
      {/* Review Form */}
      {(showForm || editingReview) && (
        <ReviewForm
          productId={productId}
          productName={productName}
          existingReview={editingReview}
          onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
          onCancel={handleCancelForm}
        />
      )}
      
      {/* Existing User Review Display */}
      {userHasReviewed && !showForm && !editingReview && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Your Review
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const userReview = reviews.find(r => {
                    const userId = r.userId
                    if (typeof userId === 'object' && userId !== null) {
                      return userId._id === user?.id
                    }
                    return userId === user?.id
                  })
                  if (userReview) handleEditClick(userReview)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleDeleteReview}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
          
          {/* Display user's review text */}
          {(() => {
            const userReview = reviews.find(r => {
              const userId = r.userId
              if (typeof userId === 'object' && userId !== null) {
                return userId._id === user?.id
              }
              return userId === user?.id
            })
            return userReview?.review && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {userReview.review}
              </p>
            )
          })()}
        </div>
      )}
      
      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id || review.id}
              review={review}
              onEdit={() => handleEditClick(review)}
              onDelete={handleDeleteReview}
              isCurrentUser={isUserReview(review)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to review this product
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}