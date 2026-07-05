import axios from 'axios';
import { Product, ProductListResponse } from '@/types/product';
import { User, UserListResponse, UserResponse, BulkStatusResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { Order, OrderListResponse, CreateOrderRequest } from '@/types/order';
import toast from 'react-hot-toast';
import { authSuccessToast } from './authToast';
import { getToken } from './auth';
import type { ContactStatus, CreateContactRequest, ContactSubmissionResponse, ContactListResponse, ContactMessage } from '@/types/contact';
import type {
  FeedbackCategory,
  CreateFeedbackRequest,
  FeedbackSubmissionResponse,
  PublicFeedbackResponse,
  FeedbackStatsResponse
} from '@/types/feedback';

import { 
  Review, 
  CreateReviewRequest, 
  UpdateReviewRequest, 
  ReviewListResponse,
  ReviewStats,
  HasReviewedResponse,
  AdminReviewListResponse,
  AdminReviewStats,
  normalizeReview 
} from '@/types/review';

import type { SendOrderEmailRequest, SendContactEmailRequest, SendStatusUpdateRequest, EmailResponse, SendOrderEmailsResponse
} from '@/types/email';
import type { ShippingArea, CreateShippingAreaRequest, UpdateShippingAreaRequest } from '@/types/order';
import type { PromoCode } from '@/types/order';
import type { PeriodInfo, SalesCustomer, Supplier } from './sales';

const RESERVED_PLACEHOLDERS = [
  'placeholder-product.png',
  'placeholder-product.jpg',
  'placeholder-product.jpeg',
  'placeholder-product.svg',
  'placeholder-solar.png',
  'placeholder-solar.jpg',
  'placeholder-solar.jpeg',
  'placeholder-solar.svg',
  'grid.svg',
  'favicon.ico',
  'placeholder.png',
  'placeholder.jpg',
  'no-image.png',
  'default.png',
  'thumbnail.png',
  'avatar.png',
];

// Check if a string is a valid product identifier (not a placeholder)
const isValidProductIdentifier = (idOrSlug: string): boolean => {
  if (!idOrSlug || typeof idOrSlug !== 'string') return false;
  const trimmed = idOrSlug.trim().toLowerCase();
  if (trimmed === '') return false;
  
  // Check against reserved placeholders
  if (RESERVED_PLACEHOLDERS.includes(trimmed)) {
    return false;
  }
  
  // Check if it looks like an image file
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico|avif|bmp|tiff|jfif)$/i.test(trimmed)) {
    return false;
  }
  
  // Check if it contains placeholder keywords
  if (/placeholder|no-image|default|thumbnail|avatar|grid|favicon/i.test(trimmed)) {
    return false;
  }
  
  return true;
};

const isServer = typeof window === 'undefined';

const API_URL = isServer 
  ? process.env.API_BASE_URL || 'http://localhost:4000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken();
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const buildQueryString = (params?: Record<string, any>) => {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// ========== AUTH API ==========
export async function loginUser(credentials: { email: string; password: string }) {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  } catch (error: any) {
    // UI layer should handle toasts to avoid duplicates
    throw error;
  }
}


export async function registerUser(userData: { 
  name: string; 
  email: string; 
  password: string;
  role?: 'user' | 'sales';
}) {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    authSuccessToast('Registration successful');
    return { token, user };
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Registration failed');
    throw error;
  }
}

export async function getProfile() {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await api.get('/auth/profile');
    const { user } = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.error || 'Failed to fetch profile');
    }
    throw error;
  }
}

export async function updateProfile(data: { 
  name: string; 
  email: string; 
  phone?: string; 
  avatar?: string;
}) {
  try {
    const response = await api.put('/auth/profile', data);
    const { user } = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    // UI layer should handle toasts to avoid duplicates
    throw error;
  }
}


export async function forgotPassword(email: string) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send reset email');
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    toast.success('Password reset successful');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to reset password');
    throw error;
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authSuccessToast('Logged out successfully');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}

// ========== GOOGLE AUTH API ==========
export const initiateGoogleLogin = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  window.location.href = `${API_URL}/auth/google`;
};

export const handleGoogleCallback = async (token: string, userData: string) => {
  try {
    const user = JSON.parse(decodeURIComponent(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    console.error('Error handling Google callback:', error);
    toast.error('Failed to complete Google sign in');
    throw error;
  }
};

export const checkGoogleAuthStatus = async (): Promise<{
  configured: boolean;
  message: string;
}> => {
  try {
    const response = await api.get('/auth/google/status');
    return response.data;
  } catch (error) {
    console.error('Failed to check Google auth status:', error);
    return { configured: false, message: 'Unable to check Google auth status' };
  }
};

export const getCurrentUser = (): {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'sales' | 'admin';
  isActive: boolean;
  avatar?: string;
  provider: 'local' | 'google';
} | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Avatar API functions
export async function uploadAvatar(userId: string, file: File): Promise<{ success: true; data: { avatar: string } }> {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deleteAvatar(userId: string): Promise<{ success: true; message: string }> {
  const response = await api.delete(`/users/${userId}/avatar`);
  return response.data;
}

// ✅ FIX 3: Updated getAvatarUrl with server detection
export function getAvatarUrl(userId: string): string {
  const baseUrl = isServer 
    ? process.env.API_BASE_URL || 'http://localhost:4000/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  return `${baseUrl}/users/${userId}/avatar`;
}

// ========== USER MANAGEMENT API ==========
export async function getUsers(params?: {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params?.role && params.role !== 'all') query.append('role', params.role);
  if (params?.search) query.append('search', params.search);
  if (params?.isActive !== undefined && params?.isActive !== null) query.append('isActive', String(params.isActive));
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

  const response = await api.get(`/users?${query.toString()}`);
  return {
    ...response.data,
    users: response.data.users || response.data.data || [],
  };
}

export async function getUser(id: string): Promise<UserResponse> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await api.post('/users', data);
  return response.data;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string; data?: { action: string; userId: string } }> {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await api.post(`/users/${id}/reset-password`, { newPassword });
  return response.data;
}

export async function toggleUserStatus(id: string): Promise<{ success: boolean; message: string; data: { isActive: boolean } }> {
  const response = await api.post(`/users/${id}/toggle-status`);
  return response.data;
}

export async function bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<BulkStatusResponse> {
  const response = await api.post('/users/bulk/status', { userIds, isActive });
  return response.data;
}

export async function exportUsersToCSV(params?: { role?: string; isActive?: boolean }): Promise<Blob> {
  const query = new URLSearchParams();
  if (params?.role) query.append('role', params.role);
  if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
  const response = await api.get(`/users/export/csv?${query.toString()}`, { responseType: 'blob' });
  return response.data;
}

// ✅ FIX 4: Updated getImageUrl with server detection
export const getImageUrl = (image: import('@/types/product').ProductImage): string => {
  if (!image) return '/placeholder-product.png';
  
  // Handle URL type images
  if ((image as any).type === 'url' && image.url) {
    try {
      // Validate URL
      new URL(image.url);
      return image.url;
    } catch {
      return '/placeholder-product.png';
    }
  }
  
  // Handle GridFS images
  if (image.type === 'gridfs' && image.fileId) {
    const baseUrl = isServer 
      ? process.env.API_BASE_URL || 'http://localhost:4000/api'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/products/image/${image.fileId}`;
  }
  
  // Fallback to placeholder
  return '/placeholder-product.png';
};

export const getProductImageUrl = (product: import('@/types/product').Product, index: number = 0): string => {
  if (!product?.images?.[index]) return '/placeholder-product.png';
  return getImageUrl(product.images[index]);
};

// ========== PRODUCT API ==========
export async function uploadProductImages(productId: string | null, files: File[]): Promise<any[]> {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    if (productId) {
      const response = await api.post(`/products/${productId}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.newImages;
    } else {
      const response = await api.post('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.images;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to upload images');
    throw error;
  }
}

export async function deleteProductImage(productId: string, index: number): Promise<void> {
  try {
    await api.delete(`/products/${productId}/images/${index}`);
    toast.success('Image deleted');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete image');
    throw error;
  }
}

export async function getProducts(params?: {
  category?: string;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  minRating?: number;
  tags?: string;
  supplier?: string;
  lowStock?: boolean;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  try {
    const response = await api.get(`/products?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getBrands(): Promise<string[]> {
  const response = await api.get('/products/brands');
  return response.data;
}

export async function getProduct(idOrSlug: string): Promise<Product> {
  if (!idOrSlug || typeof idOrSlug !== 'string') {
    throw new Error('Product ID or slug is required');
  }

  const trimmed = idOrSlug.trim();
  
  // ✅ FIX: Skip if it's a placeholder/reserved name
  if (!isValidProductIdentifier(trimmed)) {
    console.warn(`Skipping product fetch for placeholder: "${trimmed}"`);
    throw new Error(`Invalid product identifier: "${trimmed}" appears to be an image placeholder`);
  }

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);
  
  try {
    // ✅ Server-side: use fetch directly
    if (typeof window === 'undefined') {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000/api';
      let url;
      
      if (isObjectId) {
        url = `${baseUrl}/products/${trimmed}`;
      } else {
        url = `${baseUrl}/products/slug/${trimmed}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } else {
      // Client-side: use axios (with auth interceptors)
      let response;
      if (isObjectId) {
        response = await api.get(`/products/${trimmed}`);
      } else {
        response = await api.get(`/products/slug/${trimmed}`);
      }
      return response.data;
    }
  } catch (error: any) {
    console.error(`Failed to fetch product by "${idOrSlug}":`, error);
    
    // Fallback logic for 404
    if (error.response?.status === 404 || error.message?.includes('404')) {
      try {
        if (typeof window === 'undefined') {
          const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000/api';
          let fallbackUrl;
          
          if (isObjectId) {
            fallbackUrl = `${baseUrl}/products/slug/${trimmed}`;
          } else if (trimmed.length === 24) {
            fallbackUrl = `${baseUrl}/products/${trimmed}`;
          } else {
            throw new Error(`Product not found: ${idOrSlug}`);
          }
          
          const response = await fetch(fallbackUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          });
          
          if (!response.ok) {
            throw new Error(`Product not found: ${idOrSlug}`);
          }
          
          return await response.json();
        } else {
          // Client-side fallback
          if (isObjectId) {
            const response = await api.get(`/products/slug/${trimmed}`);
            return response.data;
          } else if (trimmed.length === 24) {
            const response = await api.get(`/products/${trimmed}`);
            return response.data;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Product not found: ${idOrSlug}`);
      }
    }
    
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Product slug is required');
  }
  
  try {
    // ✅ Server-side: use fetch directly (no auth needed)
    if (typeof window === 'undefined') {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000/api';
      const url = `${baseUrl}/products/slug/${encodeURIComponent(slug)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } else {
      // Client-side: use axios (with auth interceptors)
      const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`);
      return response.data;
    }
  } catch (error: any) {
    console.error(`Failed to fetch product by slug "${slug}":`, error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product> {
  if (!id || typeof id !== 'string') {
    throw new Error('Product ID is required');
  }
  
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error('Invalid product ID format');
  }
  
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch product by ID "${id}":`, error);
    throw error;
  }
}

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const dataToSend = {
      ...productData,
      price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
      buyingPrice: typeof productData.buyingPrice === 'string' ? parseFloat(productData.buyingPrice) : productData.buyingPrice
    };
    const response = await api.post('/products', dataToSend);
    toast.success('Product created successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create product');
    throw error;
  }
}

export async function updateProduct(slug: string, productData: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  try {
    const dataToSend = { ...productData };
    if (dataToSend.price !== undefined) {
      dataToSend.price = typeof dataToSend.price === 'string' ? parseFloat(dataToSend.price) : dataToSend.price;
    }
    if (dataToSend.buyingPrice !== undefined) {
      dataToSend.buyingPrice = typeof dataToSend.buyingPrice === 'string' ? parseFloat(dataToSend.buyingPrice) : dataToSend.buyingPrice;
    }
    const response = await api.put(`/products/slug/${slug}`, dataToSend);
    
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update product');
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await api.delete(`/products/${id}`);
    toast.success('Product deleted successfully');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete product');
    throw error;
  }
}

// ========== ORDERS API ==========
export async function getUserOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch user orders:', error);
    throw error;
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch order:', error);
    throw error;
  }
}

export async function trackOrder(orderNumber: string): Promise<{
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  items: Array<{ name: string; qty: number; image: string }>;
}> {
  try {
    const response = await api.get(`/orders/track/${orderNumber}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to track order:', error);
    throw error;
  }
}

export async function getGuestOrders(email: string, phone: string): Promise<Order[]> {
  try {
    const response = await api.get(`/orders/guest/${encodeURIComponent(email)}/${encodeURIComponent(phone)}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch guest orders:', error);
    throw error;
  }
}

export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  try {
    const response = await api.post('/orders', orderData);
    toast.success('Order placed successfully');
    if (response.data.order) return response.data.order;
    if (response.data._id) return response.data;
    return response.data;
  } catch (error: any) {
    console.error('Create order error:', error);
    toast.error(error.response?.data?.error || 'Failed to place order');
    throw error;
  }
}

export async function cancelOrder(id: string, verification?: { email?: string; phone?: string }): Promise<Order> {
  try {
    const response = await api.put(`/orders/${id}/cancel`, verification || {});
    toast.success('Order cancelled successfully');
    return response.data.order;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to cancel order');
    throw error;
  }
}

// Check if payment can be retried for an order

export async function checkCanRetry(orderId: string): Promise<{
  canRetry: boolean;
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  lastTransactionStatus: string | null;
}> {
  try {
    const response = await api.get(`/orders/${orderId}/can-retry`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to check retry status:', error);
    return {
      canRetry: false,
      orderId,
      orderNumber: '',
      paymentStatus: '',
      lastTransactionStatus: null
    };
  }
}
export async function retryPayment(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post(`/orders/${orderId}/retry-payment`);
    toast.success('Payment retry initiated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to retry payment');
    throw error;
  }
}

export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}): Promise<OrderListResponse> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  try {
    const response = await api.get(`/orders/admin/orders?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch admin orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: Order['status'], data?: {
  trackingNumber?: string;
  estimatedDelivery?: string;
}): Promise<Order> {
  try {
    const response = await api.patch(`/orders/admin/orders/${id}/status`, { status, ...data });
    return response.data.order;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update status');
    throw error;
  }
}

export async function getOrderStats(): Promise<{
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    codOrders: number;
    mpesaOrders: number;
    cardOrders: number;
  };
  statusBreakdown: Array<{ _id: string; count: number; revenue: number; profit: number }>;
}> {
  try {
    const response = await api.get('/orders/admin/stats/summary');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch order stats:', error);
    throw error;
  }
}

// ========== ORDER PROFIT ANALYTICS ==========
export async function getOrderProfitAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  analytics: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalOrders: number;
    totalUnitsSold: number;
    averageOrderValue: number;
    profitMargin: number;
    averageProfitPerOrder: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  try {
    const response = await api.get(`/orders/profit/analytics?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch order profit analytics:', error);
    throw error;
  }
}

// ========== SHIPPING AREAS API ==========
export async function getShippingAreas(params?: { page?: number; limit?: number; search?: string }): Promise<{ areas: ShippingArea[]; pagination: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    const response = await api.get(`/shipping?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    toast.error('Failed to fetch shipping areas');
    throw error;
  }
}

export async function getPublicShippingAreas(): Promise<ShippingArea[]> {
  try {
    const response = await api.get('/shipping/public');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch shipping areas:', error);
    throw error;
  }
}

export async function createShippingArea(data: CreateShippingAreaRequest): Promise<ShippingArea> {
  try {
    const response = await api.post('/shipping', data);
    toast.success('Shipping area created');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create shipping area');
    throw error;
  }
}

export async function updateShippingArea(id: string, data: UpdateShippingAreaRequest): Promise<ShippingArea> {
  try {
    const response = await api.put(`/shipping/${id}`, data);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update shipping area');
    throw error;
  }
}

export async function deleteShippingArea(id: string): Promise<void> {
  try {
    await api.delete(`/shipping/${id}`);
    toast.success('Shipping area deleted');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete shipping area');
    throw error;
  }
}

// ========== ENHANCED ANALYTICS API ==========

/**
 * Get comprehensive profit analytics
 */
export async function getProfitAnalytics(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data: {
    period: PeriodInfo;
    summary: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      profitMargin: number;
      avgOrderProfit: number;
      maxOrderProfit: number;
      minOrderProfit: number;
      totalOrders: number;
      totalItems: number;
      revenueGrowth: string;
      profitGrowth: string;
    };
    products: Array<{
      id: string;
      name: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
      units: number;
      orders: number;
    }>;
    categories: Array<{
      category: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
      units: number;
    }>;
    trends: Array<{
      date: string;
      revenue: number;
      cost: number;
      profit: number;
      orders: number;
      margin: number;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      sku: string;
      revenue: number;
      profit: number;
      margin: number;
      units: number;
      orders: number;
    }>;
  };
}> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/analytics/profit/overview${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit analytics:', error);
    throw error;
  }
}

/**
 * Get inventory valuation with profit potential
 */
export async function getInventoryValuationAnalytics(): Promise<{
  success: boolean;
  data: {
    summary: {
      totalCostValue: number;
      totalRetailValue: number;
      totalPotentialProfit: number;
      averageMargin: number;
      totalUnits: number;
      productsWithStock: number;
      totalProducts: number;
    };
    topItems: Array<{
      name: string;
      sku: string;
      category: string;
      stock: number;
      costValue: number;
      retailValue: number;
      potentialProfit: number;
      margin: number;
    }>;
    categoryBreakdown: Array<{
      _id: string;
      totalCost: number;
      totalRetail: number;
      totalProfit: number;
      margin: number;
      totalUnits: number;
      productCount: number;
    }>;
    generatedAt: string;
  };
}> {
  try {
    const response = await api.get('/analytics/inventory/valuation');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch inventory valuation:', error);
    throw error;
  }
}

/**
 * Get sales team performance metrics
 */
export async function getSalesTeamPerformance(params?: {
  period?: string;
}): Promise<{
  success: boolean;
  data: {
    period: string;
    salesRepPerformance: Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
      rank: number;
      metrics: {
        quotations: {
          total: number;
          converted: number;
          accepted: number;
          conversionRate: number;
          acceptanceRate: number;
          totalValue: number;
        };
        orders: {
          total: number;
          revenue: number;
          profit: number;
          margin: number;
          paid: number;
          averageValue: number;
        };
        customers: {
          total: number;
          active: number;
          totalValue: number;
          avgValue: number;
        };
      };
    }>;
    teamSummary: {
      totalRevenue: number;
      totalProfit: number;
      totalOrders: number;
      totalQuotes: number;
      totalCustomers: number;
      avgConversionRate: number;
      topPerformer: any | null;
    };
  };
}> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/analytics/sales/performance${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch sales team performance:', error);
    throw error;
  }
}
// ========== PROMO CODES API ==========
export async function getPromoCodes(params?: { page?: number; limit?: number; search?: string }): Promise<{ promos: PromoCode[]; pagination: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    const response = await api.get(`/promo?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    toast.error('Failed to fetch promo codes');
    throw error;
  }
}

export async function validatePromo(code: string, subtotal: number): Promise<{ 
  valid: boolean; 
  discount?: number;
  code?: string;
  type?: string;
  value?: number;
  maxDiscount?: number;
  error?: string;
}> {
  try {
    const response = await api.get(`/promo/validate/${code}`, { params: { subtotal } });
    return response.data;
  } catch (error: any) {
    return { valid: false, discount: 0, error: error.response?.data?.error || 'Invalid promo code' };
  }
}

export async function createPromoCode(data: {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses?: number;
  minSubtotal?: number;
  expiryDate?: string;
  description?: string;
}): Promise<PromoCode> {
  try {
    const response = await api.post('/promo', data);
    toast.success('Promo code created');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create promo code');
    throw error;
  }
}

export async function updatePromoCode(id: string, data: Partial<{
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses: number;
  minSubtotal: number;
  expiryDate: string;
  isActive: boolean;
  description: string;
}>): Promise<PromoCode> {
  try {
    const response = await api.put(`/promo/${id}`, data);
    toast.success('Promo code updated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update promo code');
    throw error;
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  try {
    await api.delete(`/promo/${id}`);
    toast.success('Promo code deleted');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete promo code');
    throw error;
  }
}

// ========== ORDER CALCULATION API ==========
export async function calculateOrderTotals(
  items: Array<{productId: string; qty: number}>,
  subtotal: number,
  shippingAreaId?: string, 
  promoCode?: string
): Promise<{
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  validPromo: boolean;
  validShippingArea: boolean;
  errors: string[];
}> {
  try {
    const response = await api.post('/order/calculate', { items, subtotal, shippingAreaId, promoCode });
    return response.data;
  } catch (error: any) {
    console.error('Calculation error:', error);
    toast.error('Failed to calculate totals');
    throw error;
  }
}

// ========== CATEGORIES API ==========
export async function getCategories() {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

export async function getCategory(slug: string) {
  try {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch category:', error);
    throw error;
  }
}

// ========== CONTACT API ==========
export async function submitContact(data: CreateContactRequest): Promise<ContactSubmissionResponse> {
  try {
    const response = await api.post('/contact', data);
    toast.success('Message sent successfully!');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send message');
    throw error;
  }
}

export async function getContactMessages(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<ContactListResponse> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const response = await api.get(`/contact?${query.toString()}`);
  return response.data;
}

export async function getContactMessage(id: string): Promise<{ success: true; data: ContactMessage }> {
  const response = await api.get(`/contact/${id}`);
  return response.data;
}

export async function updateContactStatus(id: string, status: string, notes?: string): Promise<{ success: true; message: string; data: ContactMessage }> {
  const data: any = { status };
  if (notes) data.notes = notes;
  const response = await api.patch(`/contact/${id}/status`, data);
  toast.success('Contact status updated');
  return response.data;
}

export async function deleteContact(id: string): Promise<{ success: true; message: string }> {
  const response = await api.delete(`/contact/${id}`);
  toast.success('Contact deleted');
  return response.data;
}

export async function getContactStats(): Promise<{ success: true; data: any }> {
  const response = await api.get('/contact/stats/overview');
  return response.data;
}

// ========== FEEDBACK API ==========
export async function submitFeedback(data: CreateFeedbackRequest): Promise<FeedbackSubmissionResponse> {
  try {
    const response = await api.post('/feedback', data);
    toast.success('Thank you for your feedback!');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to submit feedback');
    throw error;
  }
}

export async function getPublicFeedback(params?: { limit?: number; rating?: number }): Promise<PublicFeedbackResponse> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && typeof value === 'string' && value !== '') {
      query.append(key, String(value));
    }
  });
  const response = await api.get(`/feedback/public?${query.toString()}`);
  return response.data;
}

export async function getFeedbackStats(): Promise<FeedbackStatsResponse> {
  const response = await api.get('/feedback/stats');
  return response.data;
}

export async function getFeedbacks(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: FeedbackCategory;
  rating?: number;
  search?: string;
}): Promise<{ success: true; data: any[]; pagination: any }> {
  try {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const response = await api.get(`/feedback?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch feedbacks:', error);
    throw error;
  }
}

export async function updateFeedbackStatus(id: string, status: string): Promise<{ success: true; message: string; data: any }> {
  try {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    toast.success('Feedback status updated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update status');
    throw error;
  }
}

export async function deleteFeedback(id: string): Promise<{ success: true; message: string }> {
  try {
    const response = await api.delete(`/feedback/${id}`);
    toast.success('Feedback deleted');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete feedback');
    throw error;
  }
}

// ========== EMAIL API ==========
export async function sendTestEmail(data: { to: string; subject: string; message: string }): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-test', data);
    toast.success('Test email sent successfully!');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send test email');
    throw error;
  }
}

export async function sendOrderConfirmationEmail(data: SendOrderEmailRequest): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-order-confirmation', data);
    toast.success('Order confirmation email sent');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send order confirmation');
    throw error;
  }
}

export async function sendOrderStatusUpdateEmail(data: SendStatusUpdateRequest): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-status-update', data);
    toast.success('Status update email sent');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send status update');
    throw error;
  }
}

export async function sendBulkOrderEmails(orderIds: string[]): Promise<SendOrderEmailsResponse> {
  try {
    const response = await api.post('/email/bulk-order-emails', { orderIds });
    toast.success(`Sent ${response.data.sent} out of ${response.data.total} emails`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send bulk emails');
    throw error;
  }
}

export async function sendWelcomeEmail(data: { email: string; name: string }): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-welcome', data);
    toast.success('Welcome email sent');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send welcome email');
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-password-reset', { email });
    toast.success('Password reset email sent');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send reset email');
    throw error;
  }
}

// ========== REVIEWS API ==========


export async function getProductReviews(productId: string, params?: { page?: number; limit?: number }): Promise<ReviewListResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const url = `/reviews/${productId}${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await api.get(url);
    
    // Normalize the reviews
    const reviews = (response.data.reviews || []).map(normalizeReview);
    
    return {
      reviews,
      pagination: response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
      stats: response.data.stats || { averageRating: 0, totalReviews: 0 }
    };
  } catch (error: any) {
    console.error('Failed to fetch product reviews:', error);
    throw error;
  }
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  try {
    const response = await api.post('/reviews', data);
    toast.success('Review submitted successfully!');
    return normalizeReview(response.data);
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to submit review');
    throw error;
  }
}

export async function updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
  try {
    const response = await api.put(`/reviews/${id}`, data);
    toast.success('Review updated successfully!');
    return normalizeReview(response.data);
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update review');
    throw error;
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted successfully!');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete review');
    throw error;
  }
}

export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  try {
    const response = await api.get(`/reviews/${productId}/stats`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch review stats:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

export async function hasUserReviewed(productId: string): Promise<HasReviewedResponse> {
  try {
    const response = await api.get(`/reviews/user/${productId}/has-reviewed`);
    return {
      hasReviewed: response.data.hasReviewed || false,
      reviewId: response.data.reviewId,
      status: response.data.status || null
    };
  } catch (error: any) {
    console.error('Failed to check user review status:', error);
    return { hasReviewed: false };
  }
}

export async function getAdminReviews(params?: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  rating?: number; 
  search?: string 
}): Promise<AdminReviewListResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.rating) query.append('rating', params.rating.toString());
    if (params?.search) query.append('search', params.search);
    
    const response = await api.get(`/reviews/admin${query.toString() ? `?${query.toString()}` : ''}`);
    
    return {
      data: (response.data.data || []).map(normalizeReview),
      pagination: response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
    };
  } catch (error: any) {
    console.error('Failed to fetch admin reviews:', error);
    toast.error('Failed to load reviews');
    throw error;
  }
}

export async function getAdminReviewStats(): Promise<AdminReviewStats> {
  try {
    const response = await api.get('/reviews/admin/stats');
    return response.data || { total: 0, averageRating: 0, pending: 0, approved: 0, rejected: 0 };
  } catch (error: any) {
    console.error('Failed to fetch review stats:', error);
    return { total: 0, averageRating: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

export async function updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<Review> {
  try {
    const response = await api.patch(`/reviews/admin/${reviewId}/status`, { status });
    toast.success(`Review ${status} successfully`);
    return normalizeReview(response.data);
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update review status');
    throw error;
  }
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  try {
    await api.delete(`/reviews/admin/${reviewId}`);
    toast.success('Review deleted successfully');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete review');
    throw error;
  }
}

// ========== TRANSACTION API ==========
export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  source?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  transactions: any[];
  pagination: { current: number; pages: number; total: number; limit: number };
}> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/transactions${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
}

export async function getTransactionStats(): Promise<{
  summary: { totalVolume: number; totalTransactions: number; completed: number; pending: number; failed: number; refunded: number };
  byStatus: Array<{ _id: string; count: number; volume: number }>;
  bySource: Array<{ _id: string; count: number; volume: number }>;
  byMethod: Array<{ _id: string; count: number; volume: number }>;
}> {
  try {
    const response = await api.get('/transactions/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch transaction stats:', error);
    throw error;
  }
}

export async function getTransaction(id: string): Promise<any> {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch transaction:', error);
    throw error;
  }
}

export async function updateTransactionStatus(id: string, status: string, reason?: string): Promise<any> {
  try {
    const response = await api.patch(`/transactions/${id}/status`, { status, reason });
    toast.success('Transaction status updated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update status');
    throw error;
  }
}

export async function exportTransactionsToCSV(params?: {
  status?: string;
  paymentMethod?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/transactions/export/csv${query}`, { responseType: 'blob' });
    return response.data;
  } catch (error: any) {
    console.error('Failed to export transactions:', error);
    toast.error('Failed to export transactions');
    throw error;
  }
}
// ========== ANALYTICS API ==========
export async function getAdminAnalyticsOverview(period?: string): Promise<any> {
  try {
    const response = await api.get(`/analytics/admin/overview?period=${period || 'month'}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch admin analytics:', error);
    throw error;
  }
}

export async function getSalesAnalyticsOverview(period?: string): Promise<any> {
  try {
    const response = await api.get(`/analytics/sales/overview?period=${period || 'month'}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch sales analytics:', error);
    throw error;
  }
}

export async function getPerformanceMetrics(period?: string): Promise<any> {
  try {
    const response = await api.get(`/analytics/performance?period=${period || 'month'}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch performance metrics:', error);
    throw error;
  }
}

export async function exportAnalytics(period?: string, type?: string): Promise<any> {
  try {
    const response = await api.get(`/analytics/export?period=${period || 'month'}&type=${type || 'all'}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to export analytics:', error);
    throw error;
  }
}

export async function getQuotationProfitMetrics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/analytics/sales/quotation-profit${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch quotation profit metrics:', error);
    throw error;
  }
}

export async function getInvoiceProfitMetrics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/analytics/sales/invoice-profit${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch invoice profit metrics:', error);
    throw error;
  }
}
// ========== PAYMENT API ==========

export async function getOrderPaymentSummary(orderIdOrNumber: string): Promise<{
  success: boolean;
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  total: number;
  paymentStatus: string;
  amountPaid: number;
  balanceDue: number;
  paymentCount: number;
  lastPayment: any;
  transactions: any[];
}> {
  try {
    const response = await api.get(`/payments/orders/${encodeURIComponent(orderIdOrNumber)}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch payment summary:', error);
    throw error;
  }
}

export async function recordManualPayment(data: {
  orderId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
  reference?: string;
  notes?: string;
  phoneNumber?: string;
}): Promise<{
  success: boolean;
  message: string;
  transaction: any;
  order: { orderNumber: string; paymentStatus: string; amountPaid: number; balanceDue: number };
}> {
  try {
    const response = await api.post('/payments/record', data);
    toast.success('Payment recorded successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to record payment');
    throw error;
  }
}

export async function refundTransaction(data: {
  transactionId: string;
  reason?: string;
  amount?: number;
}): Promise<{
  success: boolean;
  message: string;
  refund: any;
  originalTransaction: any;
}> {
  try {
    const response = await api.post('/payments/refund', data);
    toast.success('Refund processed successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to process refund');
    throw error;
  }
}

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  source?: string;
  search?: string;
  orderNumber?: string;
}): Promise<{ transactions: any[]; pagination: any }> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/payments/transactions${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch payments:', error);
    throw error;
  }
}

export async function getPaymentStats(): Promise<{
  summary: { totalVolume: number; totalTransactions: number; avgTransaction: number; totalRefunds?: number };
  sourceBreakdown: Array<{ _id: string; count: number; volume: number }>;
  methodBreakdown?: Array<{ _id: string; count: number; volume: number }>;
}> {
  try {
    const response = await api.get('/payments/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch payment stats:', error);
    throw error;
  }
}

// ========== PROFIT TRACKING API ==========
export async function getProfitSummary(params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  supplier?: string;
  brand?: string;
}): Promise<{
  success: boolean;
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalUnitsSold: number;
    overallMargin: string;
  };
}> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  try {
    const response = await api.get(`/profits/summary?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit summary:', error);
    throw error;
  }
}

export async function getProfitByProduct(params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  supplier?: string;
  brand?: string;
  sortBy?: 'profit' | 'margin' | 'unitsSold' | 'revenue';
  limit?: number;
}): Promise<{
  success: boolean;
  products: Array<{
    _id: string;
    productName: string;
    productSku: string;
    category: string;
    brand: string;
    supplierId: string;
    supplierName: string;
    totalUnitsSold: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
    averageSellingPrice: number;
    averageBuyingPrice: number;
  }>;
  totalProducts: number;
}> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  try {
    const response = await api.get(`/profits/by-product?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit by product:', error);
    throw error;
  }
}

export async function getProfitByCategory(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  categories: Array<{
    _id: string;
    totalRevenue: number;
    totalCost: number;
    totalUnitsSold: number;
    totalProfit: number;
    margin: number;
  }>;
}> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  try {
    const response = await api.get(`/profits/by-category?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit by category:', error);
    throw error;
  }
}

export async function getProfitBySupplier(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  suppliers: Array<{
    _id: string;
    supplierId: string;
    totalRevenue: number;
    totalCost: number;
    totalUnitsSold: number;
    totalProfit: number;
    margin: number;
  }>;
  allSuppliers: Array<{ name: string; email: string; phone: string; totalPurchases: number }>;
}> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  try {
    const response = await api.get(`/profits/by-supplier?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit by supplier:', error);
    throw error;
  }
}

export async function getProfitTrends(params?: {
  period?: 'daily' | 'weekly' | 'monthly';
  months?: number;
}): Promise<{
  success: boolean;
  period: string;
  trends: Array<{
    _id: string;
    revenue: number;
    cost: number;
    unitsSold: number;
    profit: number;
    margin: number;
  }>;
}> {
  const query = new URLSearchParams();
  if (params?.period) query.append('period', params.period);
  if (params?.months) query.append('months', String(params.months));
  try {
    const response = await api.get(`/profits/trends?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profit trends:', error);
    throw error;
  }
}

export async function getTopProfitProducts(params?: {
  metric?: 'profit' | 'margin' | 'units' | 'revenue';
  limit?: number;
}): Promise<{
  success: boolean;
  metric: string;
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    category: string;
    totalRevenue: number;
    totalProfit: number;
    totalUnitsSold: number;
    profitPerUnit: number;
    margin: number;
  }>;
}> {
  const query = new URLSearchParams();
  if (params?.metric) query.append('metric', params.metric);
  if (params?.limit) query.append('limit', String(params.limit));
  try {
    const response = await api.get(`/profits/top-products?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch top profit products:', error);
    throw error;
  }
}

export async function recalculateProfitAnalysis(): Promise<{
  success: boolean;
  message: string;
  totalProducts: number;
  recalculated: number;
}> {
  try {
    const response = await api.post('/profits/recalculate');
    toast.success('Profit analysis recalculated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to recalculate profit analysis');
    throw error;
  }
}

// ========== SUPPLIER API ==========
export async function getSuppliers(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  suppliers: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    totalPurchases: number;
    createdAt: string;
  }>;
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  try {
    const response = await api.get(`/suppliers?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch suppliers:', error);
    throw error;
  }
}

export async function getSupplier(id: string): Promise<{
  supplier: any;
  products: any[];
  productCount: number;
}> {
  try {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch supplier:', error);
    throw error;
  }
}

export async function createSupplier(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: any;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
}): Promise<{ success: boolean; supplier: any }> {
  try {
    const response = await api.post('/suppliers', data);
    toast.success('Supplier created successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create supplier');
    throw error;
  }
}

export async function updateSupplier(id: string, data: any): Promise<{ success: boolean; supplier: any }> {
  try {
    const response = await api.put(`/suppliers/${id}`, data);
    toast.success('Supplier updated successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update supplier');
    throw error;
  }
}

export async function deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/suppliers/${id}`);
    toast.success('Supplier deleted successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete supplier');
    throw error;
  }
}

// ========== SUPPLIER STATS API ==========

export async function getSupplierStats(): Promise<{
  summary: { 
    totalSuppliers: number; 
    activeSuppliers: number; 
    inactiveSuppliers: number;
    suspendedSuppliers: number;
    totalPurchaseVolume: number;
  };
  supplierProducts: any[];
  recentSuppliers: number;
  generatedAt: string;
}> {
  try {
    const response = await api.get('/suppliers/stats/summary');
    
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch supplier stats:', error);
    throw error;
  }
}

// ========== INVENTORY API ==========

// Export products to CSV/JSON/Excel
export async function exportProducts(params?: {
  format?: 'csv' | 'json';
  category?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<Blob> {
  const query = new URLSearchParams();
  query.append('format', params?.format || 'csv');
  if (params?.category) query.append('category', params.category);
  if (params?.supplier) query.append('supplier', params.supplier);
  if (params?.minPrice) query.append('minPrice', String(params.minPrice));
  if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
  if (params?.search) query.append('search', params.search);
  
  try {
    const response = await api.get(`/inventory/export?${query.toString()}`, { 
      responseType: 'blob' 
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to export products');
    throw error;
  }
}

// Download import template CSV
export async function downloadImportTemplate(): Promise<Blob> {
  try {
    const response = await api.get('/inventory/export/template', { 
      responseType: 'blob' 
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to download template');
    throw error;
  }
}

// Bulk import products from CSV
export async function bulkImportProducts(file: File): Promise<{
  success: boolean;
  message: string;
  results: {
    imported: number;
    errors: number;
    duplicates: number;
    totalProcessed: number;
    successList: Array<{ product: string; sku: string; _id: string }>;
    errorList: Array<{ row: any; error: string; productName: string }>;
    duplicateList: Array<{ row: any; reason: string; productName: string }>;
  };
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const result = response.data;
    if (result.success) {
      if (result.results.imported > 0) {
        toast.success(`Successfully imported ${result.results.imported} products`);
      }
      if (result.results.errors > 0) {
        toast.error(`${result.results.errors} products failed to import`);
      }
    toast(`${result.results.duplicates} duplicate products skipped`, {
      icon: "⚠️",
    });
    }
    return result;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to import products');
    throw error;
  }
}

// Bulk update products
export async function bulkUpdateProducts(updates: Array<{
  productId: string;
  price?: number;
  buyingPrice?: number;
  stock?: number;
  category?: string;
  brand?: string;
  featured?: boolean;
  [key: string]: any;
}>): Promise<{
  success: boolean;
  message: string;
  results: {
    totalUpdated: number;
    totalErrors: number;
    success: Array<{ productId: string; name: string; sku: string }>;
    errors: Array<{ update: any; error: string }>;
  };
}> {
  try {
    const response = await api.put('/inventory/bulk-update', { updates });
    toast.success(response.data.message);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to bulk update products');
    throw error;
  }
}

// Bulk delete products
export async function bulkDeleteProducts(productIds: string[]): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
}> {
  try {
    const response = await api.delete('/inventory/bulk-delete', { 
      data: { productIds } 
    });
    toast.success(response.data.message);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete products');
    throw error;
  }
}

// Bulk stock adjustment
export async function bulkAdjustStock(
  adjustments: Array<{
    productId: string;
    quantity: number;
    operation: 'add' | 'subtract' | 'set';
  }>,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  results: {
    totalAdjusted: number;
    totalErrors: number;
    success: Array<{
      productId: string;
      name: string;
      sku: string;
      oldStock: number;
      newStock: number;
      change: number;
    }>;
    errors: Array<{ adjustment: any; error: string }>;
  };
}> {
  try {
    const response = await api.post('/inventory/bulk-adjust-stock', { adjustments, reason });
    toast.success(response.data.message);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to adjust stock');
    throw error;
  }
}

// Get inventory valuation report
export async function getInventoryValuation(): Promise<{
  summary: {
    totalCostValue: number;
    totalRetailValue: number;
    totalPotentialProfit: number;
    averageMargin: number;
    productsWithData: number;
    totalStockUnits: number;
  };
  topProductsByValue: Array<{
    name: string;
    sku: string;
    category: string;
    price: number;
    buyingPrice: number;
    stock: number;
    inventoryValue: number;
    costValue: number;
    potentialProfit: number;
  }>;
  categoryBreakdown: Array<{
    _id: string;
    totalValue: number;
    totalCost: number;
    totalProfit: number;
    productCount: number;
    stockUnits: number;
  }>;
  generatedAt: string;
}> {
  try {
    const response = await api.get('/inventory/valuation');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch inventory valuation:', error);
    toast.error('Failed to load inventory valuation');
    throw error;
  }
}

// ========== INVENTORY DASHBOARD STATS ==========

// Get inventory health metrics
export async function getInventoryHealth(): Promise<{
  healthScore: number;
  turnoverRate: number;
  daysOfStock: number;
  deadStock: number;
  slowMoving: number;
  fastMoving: number;
  recommendations: string[];
}> {
  try {
    const response = await api.get('/inventory/health');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch inventory health:', error);
    throw error;
  }
}

// Get stock movement history
export async function getStockMovements(params?: {
  productId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'restock' | 'sale' | 'adjustment' | 'return';
  page?: number;
  limit?: number;
}): Promise<{
  movements: Array<{
    _id: string;
    productId: string;
    productName: string;
    productSku: string;
    type: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    performedBy: { name: string; email: string };
    createdAt: string;
  }>;
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const query = new URLSearchParams();
  if (params?.productId) query.append('productId', params.productId);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.type) query.append('type', params.type);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  
  try {
    const response = await api.get(`/inventory/movements?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch stock movements:', error);
    throw error;
  }
}

export async function getInventorySummary(): Promise<{
  summary: {
    totalStockValue: number;
    totalInventoryValue: number;
    totalPotentialProfit: number;
    totalUnits: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  categoryBreakdown: Array<{
    _id: string;
    stockValue: number;
    inventoryValue: number;
    units: number;
  }>;
}> {
  try {
    const response = await api.get('/inventory/summary');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch inventory summary:', error);
    throw error;
  }
}

export async function getLowStockProducts(threshold?: number, category?: string, supplier?: string): Promise<{
  products: any[];
  count: number;
  threshold: number;
}> {
  const query = buildQueryString({ threshold, category, supplier });
  try {
    const response = await api.get(`/inventory/low-stock${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch low stock products:', error);
    throw error;
  }
}

export async function restockProduct(productId: string, data: { quantity: number; buyingPrice?: number; reason?: string }): Promise<{
  success: boolean;
  product: { _id: string; name: string; stock: number; buyingPrice: number };
}> {
  try {
    const response = await api.post(`/inventory/restock/${productId}`, data);
    toast.success('Stock updated successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update stock');
    throw error;
  }
}

// ========== PRODUCT STATS API ==========
export async function getProductProfitStats(): Promise<{
  averageProfitMargin: number;
  averageMarkup: number;
  totalInventoryValue: number;
  totalPotentialProfit: number;
  productsWithMargin: number;
  negativeMarginProducts: number;
}> {
  try {
    const response = await api.get('/products/stats/profit-summary');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch product profit stats:', error);
    throw error;
  }
}

// M-PESA API functions
export async function initiateMpesaPayment(orderId: string, phoneNumber: string): Promise<{
  success: boolean;
  checkoutRequestId: string;
  message: string;
}> {
  try {
    const response = await api.post('/mpesa/stk-push', { orderId, phoneNumber });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function checkPaymentStatus(checkoutRequestId: string): Promise<{
  checkoutRequestId: string;
  status: string;
  resultCode?: string;
  resultDesc?: string;
  transaction?: any;
}> {
  try {
    const response = await api.post('/mpesa/query', { checkoutRequestId });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getOrderPaymentStatus(orderId: string): Promise<{
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  total: number;
  transaction?: any;
}> {
  try {
    const response = await api.get(`/mpesa/payment-status/${orderId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

// ========== ENHANCED SUPPLIER API ==========

export async function getActiveSuppliers(params?: { 
  search?: string; 
  limit?: number 
}): Promise<{ suppliers: Supplier[]; count: number }> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/suppliers/active${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch active suppliers:', error);
    throw error;
  }
}

export async function getTopSuppliers(params?: { 
  limit?: number 
}): Promise<{ suppliers: Supplier[]; totalPurchaseVolume: number; count: number }> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/suppliers/top${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch top suppliers:', error);
    throw error;
  }
}

export async function getSupplierPurchaseHistory(supplierId: string): Promise<{
  supplier: { _id: string; name: string; totalPurchases: number; lastPurchaseDate?: string };
  history: any[];
  totalRecords: number;
}> {
  try {
    const response = await api.get(`/suppliers/${supplierId}/purchase-history`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch purchase history:', error);
    throw error;
  }
}

export async function getSupplierAnalytics(supplierId: string): Promise<{
  supplier: { _id: string; name: string; totalPurchases: number; lastPurchaseDate?: string; status: string };
  analytics: {
    productCount: number;
    totalStockValue: number;
    totalRetailValue: number;
    potentialProfit: number;
    avgProfitMargin: string;
    products: any[];
  };
}> {
  try {
    const response = await api.get(`/suppliers/${supplierId}/analytics`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch supplier analytics:', error);
    throw error;
  }
}

export async function bulkCreateSuppliers(suppliers: any[]): Promise<{
  success: boolean;
  created: number;
  errors: number;
  suppliers: any[];
  errorDetails: any[];
}> {
  try {
    const response = await api.post('/suppliers/bulk', { suppliers });
    toast.success(`${response.data.created} suppliers created successfully`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create suppliers');
    throw error;
  }
}

export async function bulkUpdateSupplierStatus(supplierIds: string[], status: string): Promise<{
  success: boolean;
  message: string;
  modifiedCount: number;
}> {
  try {
    const response = await api.patch('/suppliers/bulk/status', { supplierIds, status });
    toast.success(response.data.message);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update supplier status');
    throw error;
  }
}

// ========== ENHANCED SALES CUSTOMER API ==========

export async function getSalesCustomer(id: string): Promise<any> {
  try {
    const response = await api.get(`/sales/customers/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch sales customer:', error);
    throw error;
  }
}

export async function getSalesCustomerOrders(customerId: string, params?: { 
  page?: number; 
  limit?: number; 
  status?: string 
}): Promise<any> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/sales/customers/${customerId}/orders${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch customer orders:', error);
    throw error;
  }
}

export async function getSalesCustomerQuotations(customerId: string, params?: { 
  page?: number; 
  limit?: number; 
  status?: string 
}): Promise<any> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/sales/customers/${customerId}/quotations${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch customer quotations:', error);
    throw error;
  }
}

export async function getSalesCustomerInvoices(customerId: string, params?: { 
  page?: number; 
  limit?: number; 
  status?: string;
  paymentStatus?: string;
}): Promise<any> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/sales/customers/${customerId}/invoices${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch customer invoices:', error);
    throw error;
  }
}

export async function getActiveSalesCustomers(params?: { 
  limit?: number; 
  search?: string 
}): Promise<{ customers: SalesCustomer[]; count: number }> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/sales/customers/active${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch active customers:', error);
    throw error;
  }
}

export async function getTopSalesCustomers(params?: { 
  limit?: number 
}): Promise<{ customers: SalesCustomer[]; count: number }> {
  const query = buildQueryString(params);
  try {
    const response = await api.get(`/sales/customers/top${query}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch top customers:', error);
    throw error;
  }
}

export async function getSalesCustomerStats(): Promise<any> {
  try {
    const response = await api.get('/sales/customers/stats/overview');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch customer stats:', error);
    throw error;
  }
}

export async function toggleSalesCustomerStatus(customerId: string, status: 'active' | 'inactive'): Promise<any> {
  try {
    const response = await api.patch(`/sales/customers/${customerId}/status`, { status });
    toast.success(`Customer ${status === 'active' ? 'activated' : 'deactivated'}`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update customer status');
    throw error;
  }
}

export async function deleteSalesCustomer(id: string): Promise<any> {
  try {
    const response = await api.delete(`/sales/customers/${id}`);
    toast.success('Customer deleted successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to delete customer');
    throw error;
  }
}

// Export the api instance
export default api;