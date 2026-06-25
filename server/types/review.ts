// server/types/review.ts

export interface IReviewResponse {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  review?: string;
  status: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  pending?: number;
  approved?: number;
  rejected?: number;
}

export interface ReviewListResponse {
  data: IReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: ReviewStats;
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

export interface UpdateReviewStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface HasReviewedResponse {
  hasReviewed: boolean;
  reviewId?: string;
  status?: 'pending' | 'approved' | 'rejected' | null;
}

export interface AdminReviewStats {
  total: number;
  averageRating: number;
  pending: number;
  approved: number;
  rejected: number;
}