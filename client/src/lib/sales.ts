// lib/sales.ts

import api from './api';
import type { ApiResponse } from '@/types/api';
import type { Order } from '@/types/order';


// ==================== TYPES ====================
export interface SalesCustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  status: 'active' | 'inactive';
  totalSpent: number;
  quotationsCount?: number;
  lastQuotationDate?: string;
  createdAt: string;
  updatedAt: string;
}
// lib/sales.ts - Add these types after the existing interfaces

// ==================== SUPPLIER TYPES ====================

export interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
  status: 'active' | 'inactive' | 'suspended';
  productsSupplied?: string[];
  totalPurchases: number;
  lastPurchaseDate?: string;
  purchaseHistory?: Array<{
    date: string;
    amount: number;
    orderNumber: string;
    items?: any[];
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierStats {
  summary: {
    totalSuppliers: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    suspendedSuppliers: number;
    totalPurchaseVolume: number;
  };
  supplierProducts: Array<{
    supplierId: string;
    supplierName: string;
    productCount: number;
    totalStockValue: number;
    totalInventoryValue: number;
    avgBuyingPrice: number;
    avgSellingPrice: number;
    profitMargin: number;
  }>;
  recentSuppliers: number;
  generatedAt: string;
}

export interface SupplierProduct {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  buyingPrice: number;
  stock: number;
  status: string;
}

// ==================== SUPPLIER API FUNCTIONS ====================

export async function getSuppliers(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  suppliers: Supplier[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const res = await api.get('/suppliers', { params });
  return res.data;
}

export async function getSupplier(id: string): Promise<{
  supplier: Supplier;
  products: any[];
  productCount: number;
}> {
  const res = await api.get(`/suppliers/${id}`);
  return res.data;
}

export async function createSupplier(data: Partial<Supplier>): Promise<{ success: boolean; supplier: Supplier }> {
  const res = await api.post('/suppliers', data);
  return res.data;
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<{ success: boolean; supplier: Supplier }> {
  const res = await api.put(`/suppliers/${id}`, data);
  return res.data;
}

export async function deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/suppliers/${id}`);
  return res.data;
}

export async function getSupplierStats(): Promise<SupplierStats> {
  const res = await api.get('/suppliers/stats/summary');
  return res.data;
}

export async function getActiveSuppliers(params?: { 
  search?: string; 
  limit?: number 
}): Promise<{ suppliers: Supplier[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.limit) query.append('limit', String(params.limit));
  const res = await api.get(`/suppliers/active?${query.toString()}`);
  return res.data;
}

export async function getTopSuppliers(params?: { 
  limit?: number 
}): Promise<{ suppliers: Supplier[]; totalPurchaseVolume: number; count: number }> {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', String(params.limit));
  const res = await api.get(`/suppliers/top?${query.toString()}`);
  return res.data;
}

export async function getSupplierPurchaseHistory(supplierId: string): Promise<{
  supplier: { _id: string; name: string; totalPurchases: number; lastPurchaseDate?: string };
  history: any[];
  totalRecords: number;
}> {
  const res = await api.get(`/suppliers/${supplierId}/purchase-history`);
  return res.data;
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
  const res = await api.get(`/suppliers/${supplierId}/analytics`);
  return res.data;
}

export async function getSupplierProducts(supplierId: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<{
  supplier: { _id: string; name: string };
  products: any[];
  pagination: { page: number; limit: number; total: number; pages: number };
  totalValue: number;
}> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.sort) query.append('sort', params.sort);
  const res = await api.get(`/suppliers/${supplierId}/products?${query.toString()}`);
  return res.data;
}

export async function recordSupplierPurchase(supplierId: string, data: {
  amount: number;
  orderNumber?: string;
  items?: any[];
}): Promise<{
  success: boolean;
  supplier: { _id: string; name: string; totalPurchases: number; lastPurchaseDate?: string };
}> {
  const res = await api.post(`/suppliers/${supplierId}/record-purchase`, data);
  return res.data;
}

export async function bulkCreateSuppliers(suppliers: Partial<Supplier>[]): Promise<{
  success: boolean;
  created: number;
  errors: number;
  suppliers: Supplier[];
  errorDetails: any[];
}> {
  const res = await api.post('/suppliers/bulk', { suppliers });
  return res.data;
}

export async function bulkUpdateSupplierStatus(supplierIds: string[], status: string): Promise<{
  success: boolean;
  message: string;
  modifiedCount: number;
}> {
  const res = await api.patch('/suppliers/bulk/status', { supplierIds, status });
  return res.data;
}

export async function toggleSupplierStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<{
  success: boolean;
  supplier: Supplier;
}> {
  const res = await api.patch(`/suppliers/${id}/status`, { status });
  return res.data;
}

// UPDATED: QuotationItem with profit tracking
export interface QuotationItem {
  productId: string;
  name: string;
  slug?: string;
  qty: number;
  price: number; // Selling price
  buyingPrice: number; // Cost price for profit calculation
  profitPerItem: number; // Profit per unit
  totalProfit: number; // Total profit for this line item
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

// UPDATED: Quotation with profit tracking
export interface Quotation {
  _id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;
  createdBy: string;
  createdByName?: string;
  items: QuotationItem[];
  subtotal: number;
  totalCost: number; // Total cost of goods
  totalProfit: number; // Total profit for quotation
  taxRate: number;
  tax: number;
  taxPerItem?: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountReason?: string;
  transportInfo?: TransportInfo;
  transportCost?: number;
  transportDescription?: string;
  estimatedDelivery?: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  terms?: string;
  acceptedAt?: string;
  sentAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// UPDATED: InvoiceItem with profit tracking
export interface InvoiceItem {
  productId: string;
  name: string;
  slug?: string;
  qty: number;
  price: number; // Selling price
  buyingPrice: number; // Cost price for profit calculation
  profitPerItem: number; // Profit per unit
  totalProfit: number; // Total profit for this line item
  total: number;
  tax?: number;
  taxable?: boolean;
  description?: string;
}

export interface InvoicePayment {
  amount: number;
  method: string;
  reference?: string;
  date: string;
  recordedBy: string;
  transactionId?: string;
}

// UPDATED: Invoice with profit tracking
export interface Invoice {
  _id: string;
  quotationId: string;
  quotationNumber: string;
  orderId?: string;
  orderCreatedAt?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;
  createdBy: string;
  createdByName?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalCost: number; // Total cost of goods
  totalProfit: number; // Total profit for invoice
  taxRate: number;
  tax: number;
  taxPerItem?: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  transportInfo?: TransportInfo;
  transportCost?: number;
  transportDescription?: string;
  total: number;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  amountPaid: number;
  balanceDue: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  payments: InvoicePayment[];
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  _id: string;
  transactionId: string;
  orderId?: string;
  orderNumber?: string; 
  invoiceId?: string;
  invoiceNumber?: string;
  quotationNumber?: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod' | 'cash' | 'bank_transfer' | 'cheque';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  reference?: string;
  phoneNumber?: string; 
  notes?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual' | 'invoice' | 'order' | 'pos'; 
  isPartialPayment: boolean;
  recordedBy?: string;
  recordedByName?: string;
  paidAt?: string;
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;
  parentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// UPDATED: OrderWithQuotation with profit tracking
export interface OrderWithQuotation extends Order {
  invoiceNumber?: string;
  quotationId?: string;
  quotationNumber?: string;
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;
}

// ==================== PROFIT METRICS TYPES ====================

export interface QuotationProfitMetrics {
  totalQuotations: number;
  totalQuotationValue: number;
  totalQuotationCost: number;
  totalQuotationProfit: number;
  averageQuotationMargin: number;
  convertedQuotationsProfit: number;
  pendingQuotationsValue: number;
}

export interface InvoiceProfitMetrics {
  totalInvoices: number;
  totalInvoiceValue: number;
  totalInvoiceCost: number;
  totalInvoiceProfit: number;
  averageInvoiceMargin: number;
  paidInvoicesProfit: number;
  unpaidInvoicesValue: number;
}

// ==================== ANALYTICS TYPES ====================

export interface PeriodInfo {
  from: Date | string;
  to: Date | string;
  label: string;
}

// UPDATED: OverviewMetrics with profit
export interface OverviewMetrics {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number | string;
  totalCustomers?: number;
  activeCustomers?: number;
  totalQuotations?: number;
  successRate?: number;
  revenueGrowth?: string;
  orderGrowth?: string;
  profitGrowth?: string;
  customerConversionRate?: string;
}

// UPDATED: QuotationMetrics with profit
export interface QuotationMetrics {
  totalQuotations: number;
  totalQuotationValue: number;
  totalQuotationProfit: number;
  averageQuotationMargin: number;
  convertedCount: number;
  acceptedCount: number;
  draftCount: number;
  sentCount: number;
  rejectedCount: number;
  expiredCount?: number;
  conversionRate: number | string;
  acceptanceRate?: number;
}

// UPDATED: OrderMetrics with profit
export interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  averageProfitPerOrder: number;
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
  totalInventoryProfit: number;
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
  profit: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  revenue: number;
  profit: number;
  margin: number;
  quantity: number;
  orders: number;
  stock?: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalSpent: number;
  totalProfit: number;
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

// UPDATED: ChartsData with profit
export interface ChartsData {
  dailySales?: DailySalesData[];
  dailyPerformance?: Array<{ date: string; revenue: number; profit: number; orders: number }>;
  ordersByDay?: Array<{ date: string; total: number; paid: number; pending: number; profit: number }>;
  quotationTrends?: Array<{ date: string; [key: string]: any }>;
  paymentMethods?: {
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
  };
  hourlyDistribution?: Array<{ hour: number; orders: number; revenue: number }>;
  categorySales?: Array<{ category: string; revenue: number; profit: number; quantity: number }>;
  profitTrends?: Array<{ date: string; profit: number; margin: number }>;
}

export interface RecentActivities {
  quotations: any[];
  orders: any[];
}

export interface SalesRepInfo {
  name: string;
  email: string;
}

// UPDATED: BaseAnalytics with profit
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

// Admin analytics interface
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
      totalValue: number;
      totalProfit: number;
      converted: number;
      accepted: number;
      conversionRate: number;
      acceptanceRate: number;
    };
    orders: {
      total: number;
      revenue: number;
      profit: number;
      margin: number;
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
  totalProfit: number;
  totalOrders: number;
  totalQuotes: number;
  totalCustomers: number;
  avgConversionRate: number;
  avgProfitMargin: number;
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
    customPrice?: number;
    taxable?: boolean;
  }>;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  notes?: string;
  terms?: string;
  validUntil?: string | Date;
  taxPerItem?: boolean;
  transport?: {
    cost: number;
    description: string;
  };
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
  startDate?: string;
  endDate?: string;
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
      customPrice?: number;
      taxable?: boolean;
    }>;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    validUntil?: string | Date;
    taxPerItem?: boolean;
    transport?: {
      cost: number;
      description: string;
    };
    estimatedDelivery?: string;
  }
): Promise<Quotation> {
  const res = await api.patch(`/sales/quotations/${quotationId}`, payload);
  return res.data.quotation;
}

export async function deleteSalesQuotation(quotationId: string): Promise<{ success: boolean }> {
  const res = await api.delete(`/sales/quotations/${quotationId}`);
  return res.data;
}

export async function sendQuotationEmail(quotationId: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/sales/quotations/${quotationId}/send`);
  return res.data;
}

// Accept quotation - creates invoice
export async function acceptQuotation(
  quotationId: string
): Promise<{
  success: boolean;
  message: string;
  quotation: {
    _id: string;
    quoteNumber: string;
    status: string;
    acceptedAt: string;
  };
  invoice: {
    _id: string;
    invoiceNumber: string;
    total: number;
    totalProfit: number;
    balanceDue: number;
    dueDate: string;
  };
}> {
  const res = await api.post(`/sales/quotations/${quotationId}/accept`);
  return res.data;
}

// ==================== INVOICES API ====================

export async function listInvoices(params?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ invoices: Invoice[]; pagination: any }> {
  const res = await api.get('/sales/invoices', { params });
  return res.data;
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const res = await api.get(`/sales/invoices/${invoiceId}`);
  return res.data.invoice;
}

export async function sendInvoiceEmail(invoiceId: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/sales/invoices/${invoiceId}/send`);
  return res.data;
}

export async function recordInvoicePayment(
  invoiceId: string,
  payload: {
    amount: number;
    method: 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
    reference?: string;
    notes?: string;
  }
): Promise<{
  success: boolean;
  invoice: {
    _id: string;
    invoiceNumber: string;
    paymentStatus: string;
    amountPaid: number;
    balanceDue: number;
  };
  transaction: {
    _id: string;
    transactionId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paidAt: string;
  };
}> {
  const res = await api.post(`/sales/invoices/${invoiceId}/payments`, payload);
  return res.data;
}
// ==================== INVOICES FROM EDITED QUOTATIONS API ====================

/**
 * Create a new invoice from an accepted quotation (for edited quotations)
 * This allows creating multiple invoices from the same accepted quotation after editing
 */
export async function createInvoiceFromQuotation(
  quotationId: string
): Promise<{
  success: boolean;
  message: string;
  invoice: {
    _id: string;
    invoiceNumber: string;
    total: number;
    totalProfit: number;
    balanceDue: number;
    dueDate: string;
  };
  quotation: {
    _id: string;
    quoteNumber: string;
    invoiceId: string;
    invoiceNumber: string;
  };
}> {
  const res = await api.post(`/sales/quotations/${quotationId}/create-invoice`);
  return res.data;
}

export async function createOrderFromInvoice(
  invoiceId: string,
  payload?: {
    paymentMethod?: 'cod' | 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
  }
): Promise<{
  success: boolean;
  message: string;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    totalProfit: number;
    paymentStatus: string;
    amountPaid: number;
    balanceDue: number;
    status: string;
     paymentMethod: string;
  };
  invoice: {
    _id: string;
    invoiceNumber: string;
    orderCreated: boolean;
  };
}> {
  const res = await api.post(`/sales/invoices/${invoiceId}/create-order`, payload || {});
  return res.data;
}

export async function getInvoicePaymentSummary(invoiceId: string): Promise<{
  success: boolean;
  invoice: {
    _id: string;
    invoiceNumber: string;
    total: number;
    totalProfit: number;
    amountPaid: number;
    balanceDue: number;
    paymentStatus: string;
    dueDate: string;
    issueDate: string;
  };
  payments: InvoicePayment[];
  transactions: Transaction[];
  summary: {
    totalPaid: number;
    paymentCount: number;
    lastPayment: Transaction | null;
    hasOrder: boolean;
    orderId?: string;
  };
}> {
  const res = await api.get(`/sales/invoices/${invoiceId}/payments-summary`);
  return res.data;
}

// ==================== PROFIT ANALYTICS API ====================

export async function getQuotationProfitMetrics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<QuotationProfitMetrics> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  const res = await api.get(`/analytics/sales/quotation-profit?${query.toString()}`);
  return res.data;
}

export async function getInvoiceProfitMetrics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<InvoiceProfitMetrics> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  const res = await api.get(`/analytics/sales/invoice-profit?${query.toString()}`);
  return res.data;
}

// ==================== PRODUCTS & CATEGORIES HELPERS ====================
export async function listProducts(params?: { 
  search?: string; 
  page?: number; 
  limit?: number; 
  category?: string;
  includeProfit?: boolean;
}): Promise<any> {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function listCategories(params?: { limit?: number }): Promise<{ categories: any[] }> {
  const res = await api.get('/categories', { params });
  return res.data;
}

// ==================== SHIPPING HELPERS ====================
export async function listShippingAreas(): Promise<any[]> {
  const res = await api.get('/shipping');
  return res.data;
}

export async function listPublicShippingAreas(): Promise<any[]> {
  const res = await api.get('/shipping/public');
  return res.data;
}

// ==================== HELPER FUNCTIONS ====================

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

export function getDisplayNumber(quotation: Quotation): string {
  return quotation.quoteNumber;
}

export function getDocumentType(quotation: Quotation): 'Quotation' {
  return 'Quotation';
}

export function parseInvoiceNumber(invoiceNumber: string): {
  sequence: number;
  month: number;
  year?: number;
  company: string;
  type: 'I';
} | null {
  const match = invoiceNumber.match(/^(\d{4})-(\d{2})-([A-Z]+)\/(I)$/);
  if (!match) return null;
  
  return {
    sequence: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    company: match[3],
    type: 'I',
  };
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

// ==================== PROFIT CALCULATION HELPERS ====================

/**
 * Calculate profit for a quotation
 */
export function calculateQuotationProfit(quotation: Quotation): {
  totalProfit: number;
  profitMargin: number;
  itemBreakdown: Array<{
    productName: string;
    profit: number;
    margin: number;
  }>;
} {
  const itemBreakdown = quotation.items.map(item => ({
    productName: item.name,
    profit: item.totalProfit,
    margin: item.price > 0 ? ((item.price - item.buyingPrice) / item.price) * 100 : 0
  }));
  
  return {
    totalProfit: quotation.totalProfit,
    profitMargin: quotation.total > 0 ? (quotation.totalProfit / quotation.total) * 100 : 0,
    itemBreakdown
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format profit with sign and color indication
 */
export function formatProfit(amount: number): { formatted: string; isPositive: boolean; className: string } {
  const isPositive = amount >= 0;
  return {
    formatted: formatCurrency(Math.abs(amount)),
    isPositive,
    className: isPositive ? 'text-green-600' : 'text-red-600'
  };
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}