// lib/sales.ts - Updated with new fields for tax per item and transport
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
  tax?: number;
  customPrice?: boolean;
  taxable?: boolean;
  image?: string;
  description?: string;
}

export interface TransportInfo {
  cost: number;
  description: string;
}

export interface Quotation {
  _id: string;
  quoteNumber: string;        // Format: 0001-MM-PSMA/Q
  invoiceNumber?: string;      // Format: 0001-MM-PSMA/I (when converted)
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
  taxPerItem?: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountReason?: string;
  transportInfo?: TransportInfo;
  transportCost?: number;
  transportDescription?: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid';
  amountPaid: number;
  balanceDue: number;
  validUntil: string;
  notes?: string;
  terms?: string;
  convertedAt?: string;
  convertedOrderId?: string;
  estimatedDelivery?: string;
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

// Extended interface for order with quotation info
export interface OrderWithQuotation extends Order {
  invoiceNumber?: string;      // Invoice number from converted quotation
  quotationId?: string;         // Reference to original quotation
  quotationNumber?: string;     // Original quotation number (e.g., 0001-MM-PSMA/Q)
}


// Update Transaction interface
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
  paymentMethod: 'mpesa' | 'card' | 'cod' | 'cash' | 'bank_transfer' | 'cheque'; // UPDATED
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  reference?: string;  // NEW
  notes?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual';  // NEW
  isPartialPayment: boolean;  // NEW
  recordedBy?: string;  // NEW
  recordedByName?: string;  // NEW
  paidAt?: string;  // NEW
  invoiceNumber?: string;  // NEW
  quotationNumber?: string;  // NEW
  createdAt: string;
  updatedAt: string;
}

// NEW: Payment summary type
export interface PaymentSummary {
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  total: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' | 'refunded';
  amountPaid: number;
  balanceDue: number;
  paymentCount: number;
  lastPayment?: Transaction;
  transactions: Transaction[];
}

// NEW: Manual payment request type
export interface ManualPaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
  reference?: string;
  notes?: string;
}

// NEW: Refund request type
export interface RefundRequest {
  transactionId: string;
  reason?: string;
}

// ==================== ANALYTICS TYPES ====================

export interface PeriodInfo {
  from: Date | string;
  to: Date | string;
  label: string;
}

export interface OverviewMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number | string;
  totalCustomers?: number;
  activeCustomers?: number;
  totalQuotations?: number;
  successRate?: number;
  revenueGrowth?: string;
  orderGrowth?: string;
  customerConversionRate?: string;
}

export interface QuotationMetrics {
  totalQuotations: number;
  convertedCount: number;
  acceptedCount: number;
  draftCount: number;
  sentCount: number;
  rejectedCount: number;
  expiredCount?: number;
  conversionRate: number | string;
  acceptanceRate?: number;
  totalQuotationValue: number;
}

export interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  completionRate: number;
  failedPayments?: number;
  refundedOrders?: number;
}

export interface TransactionMetrics {
  totalTransactions: number;
  totalVolume: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  successRate: number;
  averageValue: number;
  methodBreakdown?: {
    mpesa: { count: number; volume: number };
    card: { count: number; volume: number };
    cod: { count: number; volume: number };
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers?: number;
  totalCustomerValue: number;
  avgCustomerValue?: number;
  totalCustomerSpent?: number;
  avgCustomerSpent?: number;
  conversionRate?: number;
  convertedCustomers?: number;
}

export interface ProductMetrics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
}

export interface UserMetrics {
  totalUsers: number;
  adminUsers: number;
  salesUsers: number;
  regularUsers: number;
  activeUsers: number;
}

export interface MonthlyTarget {
  target: number;
  current: number;
  remaining: number;
  progress: number;
}

export interface DailySalesData {
  _id: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  orders: number;
  stock?: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
}

export interface ConversionFunnel {
  quotations: number;
  accepted: number;
  converted: number;
  ordered: number;
  paid: number;
  rates: {
    quoteToAccepted: number;
    acceptedToConverted: number;
    convertedToOrder: number;
    orderToPayment: number;
    overall: number;
  };
}

export interface ChartsData {
  dailySales?: DailySalesData[];
  dailyPerformance?: Array<{ date: string; revenue: number; orders: number }>;
  ordersByDay?: Array<{ date: string; total: number; paid: number; pending: number }>;
  quotationTrends?: Array<{ date: string; [key: string]: any }>;
  paymentMethods?: {
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
  };
  hourlyDistribution?: Array<{ hour: number; orders: number; revenue: number }>;
  categorySales?: Array<{ category: string; revenue: number; quantity: number }>;
}

export interface RecentActivities {
  quotations: any[];
  orders: any[];
}

export interface SalesRepInfo {
  name: string;
  email: string;
}

// Base analytics interface with common fields
export interface BaseAnalytics {
  period: PeriodInfo;
  overview: OverviewMetrics;
  quotations: QuotationMetrics;
  orders: OrderMetrics;
  transactions: TransactionMetrics;
  customers?: CustomerMetrics;
  monthlyTarget?: MonthlyTarget;
  charts?: ChartsData;
  topProducts?: TopProduct[];
  recentActivities?: RecentActivities;
}

// Sales analytics interface
export interface SalesAnalytics extends BaseAnalytics {
  salesRep?: SalesRepInfo;
  customers: CustomerMetrics;
  topProducts: TopProduct[];
  recentActivities: RecentActivities;
  charts: ChartsData;
}

// Admin analytics interface (extends sales with additional fields)
export interface AdminAnalytics extends BaseAnalytics {
  products: ProductMetrics;
  users: UserMetrics;
  topCustomers: TopCustomer[];
  conversionFunnel: ConversionFunnel;
  charts: Required<ChartsData>;
  company?: {
    taxRate: number;
  };
  customers: CustomerMetrics;
}

// Performance metrics types
export interface SalesRepMetrics {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  metrics: {
    quotes: {
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
      paid: number;
      pending: number;
      averageValue: number;
      completionRate: number;
    };
    customers: {
      total: number;
      active: number;
      totalValue: number;
      avgValue: number;
    };
  };
}

export interface TeamSummary {
  totalRevenue: number;
  totalOrders: number;
  totalQuotes: number;
  totalCustomers: number;
  avgConversionRate: number;
  topPerformer: SalesRepMetrics | null;
}

export interface PerformanceMetrics {
  salesRepPerformance: SalesRepMetrics[] | any[];
  teamSummary?: TeamSummary | null;
  period: string;
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
export async function createSalesQuotation(payload: {
  customerId: string;
  items: Array<{
    productId: string;
    qty: number;
    price?: number;
    customPrice?: number;
    taxable?: boolean;
  }>;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  taxPerItem?: boolean;
  notes?: string;
  terms?: string;
  validUntil?: string | Date;
  shippingAreaId?: string;
  estimatedDelivery?: string;
  transport?: {
    cost: number;
    description: string;
  };
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
      taxable?: boolean;
    }>;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    taxRate?: number;
    taxPerItem?: boolean;
    validUntil?: string | Date;
    shippingAreaId?: string;
    estimatedDelivery?: string;
    transport?: {
      cost: number;
      description: string;
    };
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


// ==================== ANALYTICS API ====================

export async function getSalesAnalyticsOverview(period?: string): Promise<SalesAnalytics> {
  const res = await api.get('/analytics/sales/overview', { params: { period } });
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}

export async function getAdminAnalyticsOverview(period?: string): Promise<AdminAnalytics> {
  const res = await api.get('/analytics/admin/overview', { params: { period } });
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}

export async function getPerformanceMetrics(period?: string): Promise<PerformanceMetrics> {
  const res = await api.get('/analytics/performance', { params: { period } });
  if (res.data.success) {
    return res.data.data;
  }
  return res.data;
}

export async function exportAnalytics(period?: string, type?: string): Promise<any> {
  const res = await api.get('/analytics/export', { params: { period, type } });
  if (res.data.success) {
    return res.data;
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

export async function listProducts(params?: { search?: string; page?: number; limit?: number; category?: string }): Promise<any> {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function sendQuotationEmail(quotationId: string): Promise<{ success: boolean }> {
  const res = await api.post(`/sales/quotations/${quotationId}/send`);
  return res.data;
}

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
): Promise<{ success: boolean; order: OrderWithQuotation; invoiceNumber?: string }> {
  const res = await api.post(`/sales/quotations/${quotationId}/accept`, payload || {});
  return res.data;
}

// ==================== CATEGORIES API ====================
export async function listCategories(params?: { limit?: number }): Promise<{ categories: any[] }> {
  const res = await api.get('/categories', { params });
  return res.data;
}

// ==================== HELPER FUNCTIONS FOR NUMBER FORMATTING ====================

/**
 * Parse a quotation number to extract components
 * Example: "0001-01-PSMA/Q" -> { sequence: 1, month: 1, year: current, company: "PSMA", type: "Q" }
 */
export function parseQuotationNumber(quoteNumber: string): {
  sequence: number;
  month: number;
  year?: number;
  company: string;
  type: 'Q' | 'I';
} | null {
  const match = quoteNumber.match(/^(\d{4})-(\d{2})-([A-Z]+)\/([QI])$/);
  if (!match) return null;
  
  return {
    sequence: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    company: match[3],
    type: match[4] as 'Q' | 'I',
  };
}

/**
 * Check if a quotation has been converted to an invoice
 */
export function isConvertedToInvoice(quotation: Quotation): boolean {
  return quotation.status === 'converted' && !!quotation.invoiceNumber;
}

/**
 * Get the appropriate display number based on document type
 */
export function getDisplayNumber(quotation: Quotation): string {
  if (quotation.status === 'converted' && quotation.invoiceNumber) {
    return quotation.invoiceNumber;
  }
  return quotation.quoteNumber;
}

/**
 * Get document type label
 */
export function getDocumentType(quotation: Quotation): 'Quotation' | 'Invoice' {
  if (quotation.status === 'converted' && quotation.invoiceNumber) {
    return 'Invoice';
  }
  return 'Quotation';
}