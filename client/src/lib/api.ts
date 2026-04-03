// src/lib/api.ts
import axios from 'axios';
import { Product, ProductListResponse } from '@/types/product';
import { User, UserListResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { Order, OrderListResponse, CreateOrderRequest } from '@/types/order';
import toast from 'react-hot-toast';
import { getToken } from './auth';

// src/lib/api.ts - Add this section

import { CompanySettings, UpdateCompanyRequest, UploadLogoResponse } from '@/types/company';


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


// ========== REVIEWS API ==========
export async function getReviews(productId: string, params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  try {
    const response = await api.get(`/products/${productId}/reviews?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
}

export async function createReview(productId: string, reviewData: {
  rating: number;
  comment: string;
}) {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    toast.success('Review submitted successfully');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to submit review');
    throw error;
  }
}

// Export the api instance for custom requests if needed
export default api;