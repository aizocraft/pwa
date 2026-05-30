// src/types/order.ts
import { Product } from './product';
import { User } from './user';

export interface ShippingArea {
  _id: string;
  name: string;
  regions: string[];
  baseCost: number;
  freeThreshold: number;
  isActive: boolean;
}

export interface PromoCode {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  usedCount: number;
  maxUses: number;
  minSubtotal: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface OrderItem {
  _id?: string;
  productId: string;
  product?: Pick<Product, 'name' | 'slug' | 'images' | 'rating'>;
  name: string;
  slug: string;
  image: string;
  sellingPrice: number;
  qty: number;
  description?: string;
}

export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email?: string;
}

export interface GuestInfo {
  email: string;
  phone: string;
  name?: string;
}

export interface PaymentDetails {
  transactionId?: string;
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  userId?: string;
  guestInfo?: GuestInfo;
  user?: Pick<User, 'name' | 'email' | 'role'>;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: PaymentDetails;
  stripeId?: string;
  shippingAddress: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
}

export interface CreateShippingAreaRequest {
  name: string;
  regions: string[];
  baseCost: number;
  freeThreshold?: number;
  description?: string;
}

export interface UpdateShippingAreaRequest {
  name?: string;
  regions?: string[];
  baseCost?: number;
  freeThreshold?: number;
  isActive?: boolean;
  description?: string;
}

export interface CreateOrderRequest {
  items: Array<{ productId: string; qty: number; price: number }>;
  shippingAreaId?: string;
  promoCode?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  guestInfo?: GuestInfo;
  notes?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Admin order filters
export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Payment related types
export interface InitiateMpesaPaymentRequest {
  orderId: string;
  phoneNumber: string;
}

export interface InitiateCardPaymentRequest {
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentIntent?: {
    clientSecret?: string;
    checkoutRequestId?: string;
    redirectUrl?: string;
  };
}

// Order statistics
export interface Transaction {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    total: number;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  guestEmail?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  customerEmail?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface TransactionStats {
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
}

export interface OrderStats {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    codOrders: number;
    mpesaOrders: number;
    cardOrders: number;
  };
  statusBreakdown: Array<{
    _id: OrderStatus;
    count: number;
    revenue: number;
  }>;
}
