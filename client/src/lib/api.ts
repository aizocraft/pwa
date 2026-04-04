// src/lib/api.ts
import axios from 'axios';
import { Product, ProductListResponse } from '@/types/product';
import { User, UserListResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { Order, OrderListResponse, CreateOrderRequest } from '@/types/order';
import toast from 'react-hot-toast';
import { getToken } from './auth';
import type {
  ContactStatus, 
  CreateContactRequest, 
  ContactSubmissionResponse,
  ContactListResponse, 
  ContactMessage
} from '@/types/contact';
import type {
  FeedbackCategory,
  CreateFeedbackRequest,
  FeedbackSubmissionResponse,
  PublicFeedbackResponse,
  FeedbackStatsResponse
} from '@/types/feedback';


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

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
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
    toast.success('Logged in successfully');
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

// ========== USER MANAGEMENT API ==========
export async function getUsers(params?: {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<UserListResponse> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const response = await api.get(`/users?${query.toString()}`);
  return response.data;
}

export async function getUser(id: string): Promise<{ user: User }> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<{ user: User }> {
  const response = await api.post('/users', data);
  return response.data;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<{ user: User }> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function toggleUserStatus(id: string): Promise<{ isActive: boolean }> {
  const response = await api.post(`/users/${id}/toggle-status`);
  return response.data;
}

// ========== PRODUCT API ==========
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

export async function updateProduct(id: string, productData: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  try {
    const dataToSend = { ...productData };
    if (dataToSend.price !== undefined) {
      dataToSend.price = typeof dataToSend.price === 'string' 
        ? parseFloat(dataToSend.price) 
        : dataToSend.price;
    }
    
    const response = await api.put(`/products/${id}`, dataToSend);
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
    toast.success('Order status updated');
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
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const response = await api.get(`/feedback?${query.toString()}`);
  return response.data;
}

export async function updateFeedbackStatus(id: string, status: string): Promise<{ success: true; message: string; data: any }> {
  const response = await api.patch(`/feedback/${id}/status`, { status });
  toast.success('Feedback status updated');
  return response.data;
}

export async function deleteFeedback(id: string): Promise<{ success: true; message: string }> {
  const response = await api.delete(`/feedback/${id}`);
  toast.success('Feedback deleted');
  return response.data;
}

// Export the api instance for custom requests 
export default api;
