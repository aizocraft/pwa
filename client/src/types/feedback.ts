export type FeedbackCategory = 'product' | 'service' | 'shipping' | 'website' | 'customer-support' | 'other';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved';

export interface CreateFeedbackRequest {
  name?: string;
  email?: string;
  rating: number; // 1-5
  category: FeedbackCategory;
  feedback: string;
  isPublic?: boolean;
}

export interface FeedbackSummary {
  id: string;
  rating: number;
  category: FeedbackCategory;
}

export interface FeedbackSubmissionResponse {
  success: true;
  message: string;
  data: FeedbackSummary;
}

export interface PublicFeedback {
  _id: string;
  name: string;
  rating: number;
  feedback: string;
  category: FeedbackCategory;
  createdAt: string;
}

export interface PublicFeedbackResponse {
  success: true;
  count: number;
  data: PublicFeedback[];
}

export interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface FeedbackStatsResponse {
  success: true;
  data: FeedbackStats;
}
