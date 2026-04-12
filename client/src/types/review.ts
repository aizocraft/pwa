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