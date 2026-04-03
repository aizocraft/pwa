// src/lib/submissions.ts
import api from './api';
import { getToken } from './auth';
import toast from 'react-hot-toast';

// ========== TYPES ==========

export interface FeedbackSubmission {
  name: string;
  email: string;
  rating: number;
  category: 'product' | 'service' | 'shipping' | 'website' | 'customer-support' | 'other';
  feedback: string;
  isPublic?: boolean;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    rating?: number;
    category?: string;
  };
}

export interface PublicFeedback {
  _id: string;
  name: string;
  rating: number;
  feedback: string;
  category: string;
  createdAt: string;
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

export interface AdminSubmission {
  _id: string;
  type: 'feedback' | 'contact';
  name: string;
  email: string;
  rating?: number;
  category?: string;
  feedback?: string;
  isPublic?: boolean;
  subject?: string;
  message?: string;
  status: 'pending' | 'read' | 'reviewed' | 'resolved' | 'replied' | 'spam';
  userAgent?: string;
  ipAddress?: string;
  notes?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubmissionsResponse {
  success: boolean;
  data: AdminSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  };
}

// ========== PUBLIC FEEDBACK ENDPOINTS ==========

/**
 * Submit feedback (public)
 * @param data - Feedback submission data
 */
export async function submitFeedback(data: FeedbackSubmission): Promise<SubmissionResponse> {
  try {
    const response = await api.post('/submissions/feedback', data);
    toast.success(response.data.message || 'Thank you for your feedback!');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to submit feedback';
    toast.error(message);
    throw error;
  }
}

/**
 * Submit contact form (public)
 * @param data - Contact submission data
 */
export async function submitContact(data: ContactSubmission): Promise<SubmissionResponse> {
  try {
    const response = await api.post('/submissions/contact', data);
    toast.success(response.data.message || 'Message sent successfully!');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to send message';
    toast.error(message);
    throw error;
  }
}

/**
 * Get public feedback/testimonials
 * @param limit - Number of items to fetch (default: 10)
 * @param rating - Filter by rating (optional)
 */
export async function getPublicFeedback(limit?: number, rating?: number): Promise<PublicFeedback[]> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (rating) params.append('rating', rating.toString());
    
    const response = await api.get(`/submissions/public/feedback?${params.toString()}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch public feedback:', error);
    return [];
  }
}

/**
 * Get feedback statistics (average rating, distribution)
 */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  try {
    const response = await api.get('/submissions/stats/feedback');
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch feedback stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
}

// ========== ADMIN SUBMISSION ENDPOINTS ==========

/**
 * Get all submissions (admin only)
 * @param params - Query parameters for filtering and pagination
 */
export async function getSubmissions(params?: {
  page?: number;
  limit?: number;
  type?: 'feedback' | 'contact';
  status?: string;
  search?: string;
}): Promise<AdminSubmissionsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/submissions?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to fetch submissions';
    toast.error(message);
    throw error;
  }
}

/**
 * Get single submission by ID (admin only)
 * @param id - Submission ID
 */
export async function getSubmission(id: string): Promise<AdminSubmission> {
  try {
    const response = await api.get(`/submissions/${id}`);
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to fetch submission';
    toast.error(message);
    throw error;
  }
}

/**
 * Update submission status (admin only)
 * @param id - Submission ID
 * @param status - New status
 * @param notes - Optional notes
 */
export async function updateSubmissionStatus(
  id: string, 
  status: 'pending' | 'read' | 'reviewed' | 'resolved' | 'replied' | 'spam',
  notes?: string
): Promise<AdminSubmission> {
  try {
    const response = await api.patch(`/submissions/${id}/status`, { status, notes });
    toast.success(response.data.message || 'Status updated successfully');
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to update status';
    toast.error(message);
    throw error;
  }
}

/**
 * Delete submission (admin only)
 * @param id - Submission ID
 */
export async function deleteSubmission(id: string): Promise<void> {
  try {
    await api.delete(`/submissions/${id}`);
    toast.success('Submission deleted successfully');
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to delete submission';
    toast.error(message);
    throw error;
  }
}

/**
 * Get admin stats overview (admin only)
 */
export async function getAdminStats(): Promise<{
  total: number;
  pending: number;
  read: number;
  reviewed: number;
  resolved: number;
  replied: number;
  spam: number;
  feedbackCount: number;
  contactCount: number;
}> {
  try {
    const response = await api.get('/submissions/admin/stats');
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch admin stats:', error);
    throw error;
  }
}

/**
 * Bulk update submission status (admin only)
 * @param ids - Array of submission IDs
 * @param status - New status
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: 'pending' | 'read' | 'reviewed' | 'resolved' | 'replied' | 'spam'
): Promise<{ success: boolean; updatedCount: number }> {
  try {
    const response = await api.patch('/submissions/bulk/status', { ids, status });
    toast.success(`Updated ${response.data.updatedCount} submissions`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to update submissions';
    toast.error(message);
    throw error;
  }
}

/**
 * Export submissions as CSV (admin only)
 * @param params - Filter parameters
 */
export async function exportSubmissions(params?: {
  type?: 'feedback' | 'contact';
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await api.get(`/submissions/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `submissions-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Export started');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to export submissions';
    toast.error(message);
    throw error;
  }
}