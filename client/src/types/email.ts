// src/types/email.ts

export interface SendOrderEmailRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface SendContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface SendStatusUpdateRequest {
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

export interface SendOrderEmailsResponse {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  errors?: Array<{ orderId: string; error: string }>;
}