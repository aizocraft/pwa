export interface IReviewResponse {
  id: string;
  productId: string;
  rating: number;
  review?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}
