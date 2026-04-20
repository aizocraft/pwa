// src/lib/api.ts
import axios from 'axios';
import { Product, ProductListResponse } from '@/types/product';
import { User, UserListResponse, UserResponse, BulkStatusResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { Order, OrderListResponse, CreateOrderRequest } from '@/types/order';
import toast from 'react-hot-toast';
import { getToken } from './auth';
import type {  ContactStatus, CreateContactRequest, ContactSubmissionResponse, ContactListResponse, ContactMessage } from '@/types/contact';
import type {
  FeedbackCategory,
  CreateFeedbackRequest,
  FeedbackSubmissionResponse,
  PublicFeedbackResponse,
  FeedbackStatsResponse
} from '@/types/feedback';

import type { 
  Review, 
  CreateReviewRequest, 
  UpdateReviewRequest, 
  ReviewListResponse,
  ReviewStats 
} from '@/types/review';

import type { SendOrderEmailRequest, SendContactEmailRequest, SendStatusUpdateRequest, EmailResponse, SendOrderEmailsResponse
} from '@/types/email';
import type { ShippingArea, CreateShippingAreaRequest, UpdateShippingAreaRequest } from '@/types/order';
import type { PromoCode } from '@/types/order';



const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

// Response interceptor for errors - FIXED: Only "session expired" for REAL token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken();
      if (token) {
        // REAL session expiry (had token, now invalid)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } 
      // else: Guest 401 - silent fail (handled by app logic)
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export async function loginUser(credentials: { email: string; password: string }) {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Login failed');
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
    toast.success('Registration successful');
    return { token, user };
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Registration failed');
    throw error;
  }
}

export async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    const { user } = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to fetch profile');
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
    toast.success('Profile updated successfully');
    return user;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update profile');
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
    toast.success('Logged out successfully');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}

// ========== GOOGLE AUTH API ==========

/**
 * Initialize Google Sign-In
 * This redirects to the backend Google auth endpoint
 */
export const initiateGoogleLogin = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  // Redirect to backend Google auth endpoint
  window.location.href = `${API_URL}/auth/google`;
};

/**
 * Handle Google auth callback
 * This should be called on your callback page
 */
export const handleGoogleCallback = async (token: string, userData: string) => {
  try {
    // Parse user data from URL parameter
    const user = JSON.parse(decodeURIComponent(userData));
    
    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
  
    
    return { token, user };
  } catch (error) {
    console.error('Error handling Google callback:', error);
    toast.error('Failed to complete Google sign in');
    throw error;
  }
};

/**
 * Check if Google auth is configured on the backend
 */
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

/**
 * Get current user with proper typing including provider
 */
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

export function getAvatarUrl(userId: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/${userId}/avatar`;
}
// ========== USER MANAGEMENT API ==========



/**
 * Get all users with pagination and filtering
 * Access: Admin or Sales
 */
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
  
  if (params?.role && params.role !== 'all') {
    query.append('role', params.role);
  }
  if (params?.search) {
    query.append('search', params.search);
  }
  if (params?.isActive !== undefined && params?.isActive !== null) {
    query.append('isActive', String(params.isActive));
  }
  if (params?.page) {
    query.append('page', String(params.page));
  }
  if (params?.limit) {
    query.append('limit', String(params.limit));
  }
  if (params?.sortBy) {
    query.append('sortBy', params.sortBy);
  }
  if (params?.sortOrder) {
    query.append('sortOrder', params.sortOrder);
  }

  const response = await api.get(`/users?${query.toString()}`);
  
  // Align with user.ts UserListResponse shape (users instead of data)
  return {
    ...response.data,
    users: response.data.users || response.data.data || [],
  };
}

/**
 * Get single user by ID
 * Access: Admin or Sales (Admin gets additional stats)
 */
export async function getUser(id: string): Promise<UserResponse> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

/**
 * Create new user
 * Access: Admin only
 */
export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await api.post('/users', data);
  return response.data;
}

/**
 * Update user information
 * Access: Admin (full) or Sales (limited)
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

/**
 * Delete user (or deactivate if has orders)
 * Access: Admin only
 */
export async function deleteUser(id: string): Promise<{ 
  success: boolean; 
  message: string; 
  data?: { action: string; userId: string } 
}> {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

/**
 * Reset user password
 * Access: Admin only
 */
export async function resetUserPassword(id: string, newPassword: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await api.post(`/users/${id}/reset-password`, { newPassword });
  return response.data;
}

/**
 * Toggle user active status
 * Access: Admin only
 */
export async function toggleUserStatus(id: string): Promise<{
  success: boolean;
  message: string;
  data: { isActive: boolean };
}> {
  const response = await api.post(`/users/${id}/toggle-status`);
  return response.data;
}

/**
 * Bulk update user status
 * Access: Admin only
 */
export async function bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<BulkStatusResponse> {
  const response = await api.post('/users/bulk/status', { userIds, isActive });
  return response.data;
}

/**
 * Export users to CSV
 * Access: Admin only
 */
export async function exportUsersToCSV(params?: {
  role?: string;
  isActive?: boolean;
}): Promise<Blob> {
  const query = new URLSearchParams();
  
  if (params?.role) {
    query.append('role', params.role);
  }
  if (params?.isActive !== undefined) {
    query.append('isActive', String(params.isActive));
  }
  
  const response = await api.get(`/users/export/csv?${query.toString()}`, {
    responseType: 'blob'
  });
  
  return response.data;
}

// Legacy function aliases for backward compatibility
export async function getUsersLegacy(params?: {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; pagination: any }> {
  const response = await getUsers(params);
  return {
    users: response.users,
    pagination: response.pagination
  };
}

export async function getUserLegacy(id: string): Promise<{ user: User }> {
  const response = await getUser(id);
  return { user: response.data };
}
// Image utility
export const getImageUrl = (image: import('@/types/product').ProductImage): string => {
  if ((image as any).type === 'url' && image.url) {
    return image.url;
  }
  if (image.type === 'gridfs' && image.fileId) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/image/${image.fileId}`;
  }
  return '/placeholder.svg';
};

// Get first image URL from product (safe fallback)
export const getProductImageUrl = (product: import('@/types/product').Product, index: number = 0): string => {
  if (!product?.images?.[index]) return '/placeholder-product.jpg';
  return getImageUrl(product.images[index]);
};

// ========== PRODUCT API ==========
export async function uploadProductImages(
  productId: string | null, 
  files: File[]
): Promise<any[]> {
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
  const response = await api.get('/products/brands')
  return response.data
}
export async function getProduct(id: string): Promise<Product> {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch product:', error);
    throw error;
  }
}

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const dataToSend = {
      ...productData,
      price: typeof productData.price === 'string' 
        ? parseFloat(productData.price) 
        : productData.price
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
      dataToSend.price = typeof dataToSend.price === 'string' 
        ? parseFloat(dataToSend.price) 
        : dataToSend.price;
    }
    
    const response = await api.put(`/products/slug/${slug}`, dataToSend);
    toast.success('Product updated successfully');
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
// Get user's own orders (authenticated users)
export async function getUserOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch user orders:', error);
    throw error;
  }
}

// Get single order by ID
export async function getOrder(id: string): Promise<Order> {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch order:', error);
    throw error;
  }
}

// Track order by order number (public)
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

// Get guest orders by email and phone
export async function getGuestOrders(email: string, phone: string): Promise<Order[]> {
  try {
    const response = await api.get(`/orders/guest/${encodeURIComponent(email)}/${encodeURIComponent(phone)}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch guest orders:', error);
    throw error;
  }
}

// Create new order (supports both auth and guest)
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  try {
    const response = await api.post('/orders', orderData);
    toast.success('Order placed successfully');
    
    // Handle different response formats
    // Backend might return { order: {...} } or just {...}
    if (response.data.order) {
      return response.data.order;
    }
    
    // If response has _id, it's the order object
    if (response.data._id) {
      return response.data;
    }
    
    // Fallback: return the whole response data
    return response.data;
  } catch (error: any) {
    console.error('Create order error:', error);
    const errorMessage = error.response?.data?.error || 'Failed to place order';
    toast.error(errorMessage);
    throw error;
  }
}
// Cancel order (user or guest)
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

// Retry failed payment
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

// Get admin orders (paginated)
export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
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

// Update order status (admin only)
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

// Get order statistics (admin only)
export async function getOrderStats(): Promise<{
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    codOrders: number;
    mpesaOrders: number;
    cardOrders: number;
  };
  statusBreakdown: Array<{ _id: string; count: number; revenue: number }>;
}> {
  try {
    const response = await api.get('/orders/admin/stats/summary');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch order stats:', error);
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

// Public endpoint for customers
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
    toast.success('Shipping area updated');
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
    const response = await api.get(`/promo/validate/${code}`, {
      params: { subtotal }
    });
    return response.data;
  } catch (error: any) {
    return { 
      valid: false, 
      discount: 0, 
      error: error.response?.data?.error || 'Invalid promo code' 
    };
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
    const response = await api.post('/order/calculate', { 
      items, 
      subtotal, 
      shippingAreaId, 
      promoCode 
    });
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

export async function getPublicFeedback(params?: {
  limit?: number;
  rating?: number;
}): Promise<PublicFeedbackResponse> {
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

/**
 * Send a test email
 */
export async function sendTestEmail(data: {
  to: string;
  subject: string;
  message: string;
}): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-test', data);
    toast.success('Test email sent successfully!');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send test email');
    throw error;
  }
}



/**
 * Send order confirmation email (admin only)
 */
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

/**
 * Send order status update email (admin only)
 */
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

/**
 * Send bulk order confirmation emails (admin only)
 */
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

/**
 * Send welcome email to new user (admin only)
 */
export async function sendWelcomeEmail(data: {
  email: string;
  name: string;
}): Promise<EmailResponse> {
  try {
    const response = await api.post('/email/send-welcome', data);
    toast.success('Welcome email sent');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to send welcome email');
    throw error;
  }
}

/**
 * Send password reset email
 */
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
// Add these functions after the PRODUCTS API section (around line 200)

export async function getProductReviews(
  productId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<{
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
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const url = `/reviews/${productId}${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch product reviews:', error);
    throw error;
  }
}

export async function createReview(data: { productId: string; rating: number; review?: string }): Promise<any> {
  try {
    const response = await api.post('/reviews', data);
    toast.success('Review submitted successfully!');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to submit review';
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateReview(id: string, data: { rating?: number; review?: string }): Promise<any> {
  try {
    const response = await api.put(`/reviews/${id}`, data);
    toast.success('Review updated successfully!');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to update review';
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted successfully!');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to delete review';
    toast.error(errorMessage);
    throw error;
  }
}

export async function getProductReviewStats(productId: string): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const response = await api.get(`/reviews/${productId}/stats`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch review stats:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

export async function hasUserReviewed(productId: string): Promise<{ hasReviewed: boolean; reviewId?: string }> {
  try {
    const response = await api.get(`/reviews/user/${productId}/has-reviewed`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to check user review status:', error);
    return { hasReviewed: false };
  }
}

// ========== ADMIN REVIEWS API ==========
export async function getAdminReviews(params?: {
  page?: number;
  limit?: number;
  status?: string;
  rating?: number;
  search?: string;
}): Promise<{
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  try {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const response = await api.get(`/reviews/admin${query.toString() ? `?${query.toString()}` : ''}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch admin reviews:', error);
    toast.error('Failed to load reviews');
    throw error;
  }
}

export async function getAdminReviewStats(): Promise<{
  total: number;
  averageRating: number;
}> {
  try {
    const response = await api.get('/reviews/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch review stats:', error);
    return { total: 0, averageRating: 0 };
  }
}

export async function updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<Review> {
  try {
    const response = await api.patch(`/reviews/admin/${reviewId}/status`, { status });
    toast.success('Review status updated successfully');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to update review status';
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  try {
    await api.delete(`/reviews/admin/${reviewId}`);
    toast.success('Review deleted successfully');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to delete review';
    toast.error(errorMessage);
    throw error;
  }
}
// ========== TRANSACTION API ==========
// Get admin transactions (paginated)
export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
}): Promise<{
  transactions: any[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  try {
    const response = await api.get(`/transactions/admin?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
}

// Get transaction statistics
export async function getTransactionStats(): Promise<{
  summary: {
    totalVolume: number;
    totalTransactions: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    mpesaCount: number;
    cardCount: number;
    codCount: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
    volume: number;
  }>;
}> {
  try {
    const response = await api.get('/transactions/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch transaction stats:', error);
    throw error;
  }
}

// Update transaction status
export async function updateTransactionStatus(id: string, status: string): Promise<any> {
  try {
    const response = await api.patch(`/transactions/${id}/status`, { status });
    toast.success('Transaction status updated');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update status');
    throw error;
  }
}

// In api.ts - Add this function to your transaction API section

// Export transactions to CSV
export async function exportTransactionsToCSV(params?: {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  try {
    const response = await api.get(`/admin/transactions/export/csv?${query.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to export transactions:', error);
    toast.error('Failed to export transactions');
    throw error;
  }
}
// Export the api instance for custom requests 
export default api;

