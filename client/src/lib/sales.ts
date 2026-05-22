// lib/sales.ts
import api from './api';
import type { ApiResponse } from '@/types/api';
import type { Order } from '@/types/order';

// ==================== TYPES ====================
export interface SalesCustomer {
  _id: string;
  user?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  totalSpent: number;
  lastOrder?: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  productId: string;
  name: string;
  slug?: string;
  qty: number;
  price: number;
  total: number;
  customPrice?: boolean;
  image?: string;
  description?: string;
}

export interface Quotation {
  _id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  createdBy: string;
  createdByName?: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountReason?: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  validUntil: string;
  notes?: string;
  terms?: string;
  convertedAt?: string;
  convertedOrderId?: string;
  shippingInfo?: {
    areaId: string;
    areaName: string;
    baseCost: number;
    freeThreshold: number;
    estimatedDelivery?: string;
    cost: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  orderId: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesAnalyticsOverview {
  quotations: {
    totalQuotations: number;
    convertedCount: number;
    acceptedCount: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    cancelledOrders: number;
  };
  transactions: {
    totalTransactions: number;
    totalVolume: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    successRate: number;
  };
}

// ==================== SALES CUSTOMERS API ====================
export async function createSalesCustomer(payload: {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}): Promise<SalesCustomer> {
  const res = await api.post('/sales/customers', payload);
  return res.data.customer;
}

export async function listSalesCustomers(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ customers: SalesCustomer[]; pagination: any }> {
  const res = await api.get('/sales/customers', { params });
  return res.data;
}

export async function updateSalesCustomer(
  customerId: string,
  payload: Partial<{
    name: string;
    email: string;
    phone: string;
    location: string;
    notes: string;
    status: 'active' | 'inactive';
  }>
): Promise<SalesCustomer> {
  const res = await api.patch(`/sales/customers/${customerId}`, payload);
  return res.data.customer;
}

// ==================== QUOTATIONS API ====================
// lib/sales.ts - Update the createSalesQuotation function

export async function createSalesQuotation(payload: {
  customerId: string;
  items: Array<{
    productId: string;
    qty: number;
    price?: number;
    customPrice?: number;
  }>;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  notes?: string;
  terms?: string;
  validUntil?: string | Date;
  shippingAreaId?: string;  
  estimatedDelivery?: string;
}): Promise<Quotation> {
  const res = await api.post('/sales/quotations', payload);
  return res.data.quotation;
}

export async function listSalesQuotations(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ quotations: Quotation[]; pagination: any }> {
  const res = await api.get('/sales/quotations', { params });
  return res.data;
}

export async function getSalesQuotation(quotationId: string): Promise<Quotation> {
  const res = await api.get(`/sales/quotations/${quotationId}`);
  return res.data.quotation;
}

export async function updateSalesQuotation(
  quotationId: string,
  payload: {
    status?: Quotation['status'];
    notes?: string;
    terms?: string;
    items?: Array<{
      productId: string;
      qty: number;
      price?: number;
      customPrice?: number;
    }>;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    taxRate?: number;
    validUntil?: string | Date;
    shippingAreaId?: string;  
    estimatedDelivery?: string;
  }
): Promise<Quotation> {
  const res = await api.patch(`/sales/quotations/${quotationId}`, payload);
  return res.data.quotation;
}

export async function convertQuotationToOrder(
  quotationId: string,
  payload: {
    shippingAreaId: string;
    paymentMethod: 'cod' | 'mpesa' | 'card';
    shippingAddress?: any;
    promoCode?: string;
  }
): Promise<Order> {
  const res = await api.post(`/sales/quotations/${quotationId}/convert`, payload);
  return res.data.order;
}

export async function deleteSalesQuotation(quotationId: string): Promise<{ success: boolean }> {
  const res = await api.delete(`/sales/quotations/${quotationId}`);
  return res.data;
}

// ==================== MANUAL TRANSACTIONS API ====================
export async function createManualTransaction(payload: {
  orderId: string;
  paymentMethod: 'mpesa' | 'card' | 'cod';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  notes?: string;
}): Promise<{ transaction: Transaction; order: Order }> {
  const { orderId, ...rest } = payload;
  const res = await api.post(`/sales/orders/${orderId}/transactions`, rest);
  return res.data;
}

export async function updateManualTransaction(
  transactionId: string,
  payload: {
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
    mpesaReceipt?: string;
    cardLast4?: string;
    cardBrand?: string;
    notes?: string;
  }
): Promise<{ success: boolean; transaction: Transaction; order: Order }> {
  const res = await api.patch(`/sales/transactions/${transactionId}`, payload);
  return res.data;
}

export async function listOrderTransactions(orderId: string): Promise<{ orderNumber: string; transactions: Transaction[] }> {
  const res = await api.get(`/sales/orders/${orderId}/transactions`);
  return res.data;
}

// ==================== ANALYTICS API ====================
export async function getSalesAnalyticsOverview(): Promise<SalesAnalyticsOverview> {
  const res = await api.get('/analytics/sales/overview');
  // Handle the new response structure { success: true, data: {...} }
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}

// Add admin analytics function
export async function getAdminAnalyticsOverview(period?: string): Promise<any> {
  const res = await api.get('/analytics/admin/overview', { params: { period } });
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}

// Add performance metrics function
export async function getPerformanceMetrics(): Promise<any> {
  const res = await api.get('/analytics/performance');
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}


// ==================== SHIPPING & PRODUCTS HELPERS ====================
export async function listShippingAreas(): Promise<any[]> {
  const res = await api.get('/shipping');
  return res.data;
}

export async function listPublicShippingAreas(): Promise<any[]> {
  const res = await api.get('/shipping/public');
  return res.data;
}

export async function listProducts(params?: { search?: string; page?: number; limit?: number }): Promise<any> {
  const res = await api.get('/products', { params });
  return res.data;
}

// Function to send quotation email
export async function sendQuotationEmail(quotationId: string): Promise<{ success: boolean }> {
  const res = await api.post(`/sales/quotations/${quotationId}/send`);
  return res.data;
}

// Function to accept quotation
export async function acceptQuotation(
  quotationId: string,
  payload?: {
    shippingAddress?: {
      fullName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      phone?: string;
      email?: string;
    };
    paymentMethod?: 'cod' | 'mpesa' | 'card';
    promoCode?: string;
  }
): Promise<{ success: boolean; order: Order }> {
  const res = await api.post(`/sales/quotations/${quotationId}/accept`, payload || {});
  return res.data;
}