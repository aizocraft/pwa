// src/types/review.ts

export interface Review {
  _id?: string;
  id?: string;
  productId: string | {
    _id: string;
    name: string;
    images?: string[];
  };
  userId: string | {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  rating: number;
  review?: string;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  product?: {
    _id: string;
    name: string;
    images?: string[];
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  review?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  review?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface HasReviewedResponse {
  hasReviewed: boolean;
  reviewId?: string;
  status?: 'pending' | 'approved' | 'rejected' | null;
}

export interface AdminReviewListResponse {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminReviewStats {
  total: number;
  averageRating: number;
  pending: number;
  approved: number;
  rejected: number;
}

// Helper function to normalize review response
export function normalizeReview(review: any): Review {
  // Handle case where review is null or undefined
  if (!review) {
    return {
      _id: '',
      id: '',
      productId: '',
      userId: '',
      rating: 0,
      isApproved: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Extract user data from various possible structures
  let userData = review.user || review.userId;
  if (userData && typeof userData === 'object' && !userData._id && userData.id) {
    userData._id = userData.id;
  }
  
  // Extract product data from various possible structures
  let productData = review.product || review.productId;
  if (productData && typeof productData === 'object' && !productData._id && productData.id) {
    productData._id = productData.id;
  }

  return {
    _id: review._id || review.id,
    id: review._id || review.id,
    productId: typeof productData === 'object' ? productData?._id || productData?.id || review.productId : review.productId,
    userId: typeof userData === 'object' ? userData?._id || userData?.id || review.userId : review.userId,
    rating: review.rating || 0,
    review: review.review || '',
    isApproved: review.isApproved || review.status === 'approved',
    status: review.status || 'pending',
    createdAt: review.createdAt || new Date().toISOString(),
    updatedAt: review.updatedAt || new Date().toISOString(),
    user: userData && typeof userData === 'object' ? {
      _id: userData._id || userData.id || review.userId,
      name: userData.name || 'Anonymous',
      email: userData.email,
      avatar: userData.avatar
    } : undefined,
    product: productData && typeof productData === 'object' ? {
      _id: productData._id || productData.id || review.productId,
      name: productData.name || 'Unknown Product',
      images: productData.images
    } : undefined
  };
}