// src/services/email.service.ts

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// ==================== COMPANY CONFIGURATION ====================
const COMPANY = {
  name: 'Plasma Water Africa',
  shortName: 'Plasma Water Africa',
  email: 'info@plasmawater.com',
  phone: '0710743793',
  phoneFormatted: '+254 710 743 793',
  address: 'P.O BOX 4996-00200, Nairobi, Kenya',
  website: 'www.plasmawater.co.ke',
  websiteUrl: 'https://plasmawater.co.ke',
  social: {
    facebook: '@PlasmaWaterAfrica',
    instagram: '@PlasmaWaterAfrica',
    twitter: '@PlasmaWaterKE',
  },
  colors: {
    primary: '#0043b3',
    secondary: '#000063',
    accent: '#009dff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  bank: {
    name: 'KCB Bank Kenya',
    accountName: 'PLASMA WATER AFRICA',
    accountNumber: '1312281278',
    branch: 'Moi Avenue, Nairobi',
  },
  mpesa: {
    tillNumber: '9114123',
    accountName: 'PLASMA WATER AFRICA',
  },
};

// ==================== INITIALIZATION ====================
const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== TYPES ====================
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface OrderEmailData {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export interface AdminOrderNotificationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  paymentMethod: string;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  orderDate: Date;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
  template?: 'new-user' | 'sales-team' | 'vip' | 'partner';
}

export interface OrderStatusUpdateData {
  to: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface PaymentConfirmationData {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  transactionId?: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export interface PaymentFailedData {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  reason?: string;
}

export interface QuotationData {
  to: string;
  customerName: string;
  quoteNumber: string;
  quoteTotal: number;
  validUntil: Date;
  items: Array<{ name: string; quantity: number; price: number; tax?: number; description?: string }>;
  taxPerItem?: boolean;
  transportInfo?: { cost: number; description?: string };
  estimatedDelivery?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  subtotal?: number;
  notes?: string;
  terms?: string;
}

export interface InvoiceData {
  to: string;
  customerName: string;
  invoiceNumber: string;
  invoiceTotal: number;
  dueDate: Date;
  items: Array<{ name: string; quantity: number; price: number; tax?: number; description?: string }>;
  taxPerItem?: boolean;
  transportInfo?: { cost: number; description?: string };
  estimatedDelivery?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  subtotal?: number;
  notes?: string;
  terms?: string;
  amountPaid?: number;
  balanceDue?: number;
}

// ==================== HELPERS ====================
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#009dff',
    shipped: '#0043b3',
    delivered: '#10b981',
    cancelled: '#ef4444',
    paid: '#10b981',
    confirmed: '#10b981',
  };
  return colors[status] || '#6b7280';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    confirmed: 'Confirmed',
  };
  return labels[status] || status;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ==================== EMAIL LAYOUT (Responsive) ====================
function getEmailLayout(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${escapeHtml(title)}</title>
      <style>
        /* RESET STYLES */
        body, table, td, p, a, div, span {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a2e;
        }
        body {
          margin: 0;
          padding: 0;
          background: #f5f7fa;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
        a {
          color: #0043b3;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        
        /* CONTAINER */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        /* HEADER */
        .header {
          background: ${COMPANY.colors.primary};
          padding: 32px 40px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          margin: 6px 0 0;
        }
        
        /* CONTENT */
        .content {
          padding: 40px;
        }
        .content p {
          color: #374151;
          font-size: 15px;
          margin-bottom: 16px;
        }
        
        /* BUTTON */
        .btn {
          display: inline-block;
          padding: 12px 28px;
          background: ${COMPANY.colors.primary};
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          mso-padding-alt: 0;
        }
        .btn:hover {
          background: ${COMPANY.colors.secondary};
          text-decoration: none;
        }
        .btn-success {
          background: ${COMPANY.colors.success};
        }
        .btn-success:hover {
          background: #059669;
        }
        .btn-warning {
          background: ${COMPANY.colors.warning};
        }
        .btn-warning:hover {
          background: #d97706;
        }
        
        /* TABLE */
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        table.items {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        table.items th {
          background: #f1f5f9;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table.items td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        table.items tr:last-child td {
          border-bottom: none;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        /* SUMMARY BOX */
        .summary-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .summary-row:last-child {
          border-bottom: none;
        }
        .summary-total {
          font-size: 18px;
          font-weight: 700;
          color: ${COMPANY.colors.primary};
          padding-top: 12px;
          border-top: 2px solid ${COMPANY.colors.primary};
        }
        .summary-discount {
          color: ${COMPANY.colors.danger};
        }
        .summary-paid {
          color: ${COMPANY.colors.success};
        }
        .summary-balance {
          color: ${COMPANY.colors.danger};
          font-weight: 600;
        }
        
        /* STATUS BADGE */
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
        }
        
        /* INFO BLOCK */
        .info-block {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .info-row {
          display: flex;
          padding: 4px 0;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          width: 140px;
          color: #475569;
          flex-shrink: 0;
        }
        .info-value {
          color: #1a1a2e;
        }
        
        /* NOTES & TERMS */
        .notes-box {
          background: #fef8e7;
          padding: 16px;
          border-left: 4px solid ${COMPANY.colors.warning};
          border-radius: 4px;
          margin: 16px 0;
        }
        .terms-box {
          background: #f8fafc;
          padding: 16px;
          border-left: 4px solid #6b7280;
          border-radius: 4px;
          margin: 16px 0;
        }
        
        /* DIVIDER */
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 24px 0;
        }
        
        /* FOOTER */
        .footer {
          padding: 24px 40px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        .footer a {
          color: ${COMPANY.colors.primary};
        }
        .footer .social {
          margin: 8px 0;
        }
        .footer .social span {
          margin: 0 8px;
        }
        
        /* RESPONSIVE */
        @media only screen and (max-width: 600px) {
          .header { padding: 24px 20px; }
          .header h1 { font-size: 20px; }
          .content { padding: 24px 20px; }
          .footer { padding: 16px 20px; }
          .info-row { flex-direction: column; }
          .info-label { width: auto; }
          table.items th, table.items td { padding: 8px; font-size: 12px; }
          .btn { display: block; text-align: center; margin: 8px 0; }
          .summary-row { font-size: 13px; }
        }
        @media only screen and (max-width: 400px) {
          .header h1 { font-size: 18px; }
          .content { padding: 16px; }
          table.items th, table.items td { padding: 6px; font-size: 11px; }
        }
      </style>
    </head>
    <body>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="padding:20px 16px; background:#f5f7fa;">
        <tr>
          <td align="center">
            <div class="email-container">
              <div class="header">
                <h1>${escapeHtml(COMPANY.name)}</h1>
                <p>Quality Water Solutions for Africa</p>
              </div>
              <div class="content">
                ${content}
              </div>
              <div class="footer">
                <div class="social">
                  <span>🌐 ${COMPANY.website}</span>
                  <span>•</span>
                  <span>📞 ${COMPANY.phone}</span>
                </div>
                <div>
                  ${COMPANY.address}
                </div>
                <div style="margin-top:8px;">
                  © ${getCurrentYear()} ${COMPANY.name}. All rights reserved.
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ==================== CORE EMAIL FUNCTION ====================
export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log(`Sending email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully! Message ID:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SEND WITH ATTACHMENT ====================
export const sendEmailWithAttachment = async (
  options: EmailOptions & { attachments?: Array<{ filename: string; content: string; contentType?: string }> }
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== CONTACT EMAIL ====================
// src/services/email.service.ts - Update sendContactEmail

export const sendContactEmail = async (data: ContactEmailData) => {
  try {
    // Email to admin
    const adminResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
      subject: `New Contact Message from ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a2540; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; background: #f9fafb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { margin-top: 5px; color: #6b7280; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${escapeHtml(data.name)}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${escapeHtml(data.email)}</div>
              </div>
              ${data.phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${escapeHtml(data.phone)}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Auto-reply to user
    const userResult = await sendEmail({
      to: data.email,
      subject: 'Thank you for contacting us!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9fafb; }
            .message-box { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You, ${escapeHtml(data.name)}!</h2>
            </div>
            <div class="content">
              <p>We have received your message and will get back to you within 24 hours.</p>
              <p><strong>Your message:</strong></p>
              <div class="message-box">
                ${escapeHtml(data.message).replace(/\n/g, '<br>')}
              </div>
              <p>Best regards,<br><strong>The Support Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // ✅ Return consistent response with error property
    if (adminResult.success && userResult.success) {
      return { success: true };
    } else {
      const error = adminResult.error || userResult.error || 'Failed to send contact email';
      return { success: false, error };
    }
  } catch (error: any) {
    console.error('Contact email error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ORDER CONFIRMATION ====================
export const sendOrderConfirmation = async (data: OrderEmailData) => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
    <p>Thank you for your order. It has been confirmed and is being processed.</p>

    <div class="info-block">
      <div class="info-row"><span class="info-label">Order Number</span><span class="info-value">${data.orderNumber}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#10b981;">${data.status.toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
    </div>

    <div class="table-wrapper">
      <table class="items">
        <thead>
          <tr><th>Product</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(data.subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${formatCurrency(data.shippingCost)}</span></div>
      ${data.discount > 0 ? `<div class="summary-row summary-discount"><span>Discount</span><span>-${formatCurrency(data.discount)}</span></div>` : ''}
      <div class="summary-row"><span>Tax</span><span>${formatCurrency(data.tax)}</span></div>
      <div class="summary-row summary-total"><span>Total</span><span>${formatCurrency(data.total)}</span></div>
    </div>

    <p style="color:#6b7280; font-size:14px;">We'll notify you when your order ships.</p>
    <p style="color:#6b7280; font-size:14px;">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
  `;

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderNumber}`,
    html: getEmailLayout(content, `Order Confirmation #${data.orderNumber}`),
  });
};

// ==================== ADMIN ORDER NOTIFICATION ====================
export const sendAdminOrderNotification = async (data: AdminOrderNotificationData) => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <div style="background:#ef4444; color:#ffffff; display:inline-block; padding:4px 12px; border-radius:4px; font-size:12px; font-weight:600; margin-bottom:12px;">NEW ORDER ALERT</div>
    <p>A new order has been placed and requires your attention.</p>

    <div class="info-block">
      <h3 style="margin:0 0 12px; font-size:16px;">Order Information</h3>
      <div class="info-row"><span class="info-label">Order Number</span><span class="info-value">${data.orderNumber}</span></div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${data.orderDate.toLocaleString()}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#10b981;">${data.status.toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">${data.paymentMethod.toUpperCase()}</span></div>
    </div>

    <div class="info-block">
      <h3 style="margin:0 0 12px; font-size:16px;">Customer</h3>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${escapeHtml(data.customerName)}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:${escapeHtml(data.customerPhone)}">${escapeHtml(data.customerPhone)}</a></span></div>
      <div class="info-row"><span class="info-label">Address</span><span class="info-value">${escapeHtml(data.shippingAddress)}</span></div>
    </div>

    <div class="info-block">
      <h3 style="margin:0 0 12px; font-size:16px;">Order Items</h3>
      <div class="table-wrapper">
        <table class="items">
          <thead><tr><th>Product</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
      <div style="text-align:right; margin-top:12px; font-size:18px; font-weight:700; color:#0043b3;">Total: ${formatCurrency(data.total)}</div>
    </div>

    <div style="text-align:center; margin-top:16px;">
      <a href="${process.env.CLIENT_URL}/dashboard/orders/${data.orderId}" class="btn btn-success">View Order</a>
      <a href="${process.env.CLIENT_URL}/dashboard/orders" class="btn" style="margin-left:8px;">All Orders</a>
    </div>
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
    subject: `New Order #${data.orderNumber} - Action Required`,
    html: getEmailLayout(content, `New Order #${data.orderNumber}`),
  });
};

// ==================== WELCOME EMAIL ====================

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const result = await sendEmail({
      to: email,
      subject: 'Welcome to Plasma Water Africa!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a2540; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #0a2540; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${escapeHtml(name)}!</h1>
            </div>
            <div class="content">
              <p>We're excited to have you on board!</p>
              <p>Get started by exploring our platform and discovering all the amazing products we offer.</p>
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br><strong>The Plasma Water Africa Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    // ✅ Return consistent response with error property
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Failed to send welcome email' };
    }
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== PASSWORD RESET ====================
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const content = `
    <p>We received a request to reset your password for your ${COMPANY.name} account.</p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div style="background:#fef2f2; padding:16px; border-left:4px solid #ef4444; border-radius:4px; margin:16px 0;">
      <p style="margin:0; font-size:14px;">This link will expire in 1 hour.</p>
      <p style="margin:4px 0 0; font-size:14px;">If you didn't request this, please ignore this email.</p>
    </div>
    <p style="color:#6b7280; font-size:14px;">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: getEmailLayout(content, 'Password Reset Request'),
  });
};

// ==================== ORDER STATUS UPDATE ====================
export const sendOrderStatusUpdate = async (data: OrderStatusUpdateData) => {
  const color = getStatusColor(data.status);
  const label = getStatusLabel(data.status);

  const content = `
    <p>Your order <strong>#${data.orderNumber}</strong> has been updated.</p>
    <div style="text-align:center; margin:20px 0;">
      <span class="status-badge" style="background:${color};">${label}</span>
    </div>
    <div class="info-block">
      <div class="info-row"><span class="info-label">Order Number</span><span class="info-value">${data.orderNumber}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value">${label}</span></div>
      ${data.trackingNumber ? `<div class="info-row"><span class="info-label">Tracking Number</span><span class="info-value">${data.trackingNumber}</span></div>` : ''}
      ${data.estimatedDelivery ? `<div class="info-row"><span class="info-label">Estimated Delivery</span><span class="info-value">${new Date(data.estimatedDelivery).toLocaleDateString()}</span></div>` : ''}
    </div>
    ${data.notes ? `<div class="notes-box"><p style="margin:0;">${escapeHtml(data.notes)}</p></div>` : ''}
    <p style="color:#6b7280; font-size:14px;">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Order #${data.orderNumber} - ${label}`,
    html: getEmailLayout(content, `Order Status Update #${data.orderNumber}`),
  });
};

// ==================== PAYMENT CONFIRMATION ====================
export const sendPaymentConfirmation = async (data: PaymentConfirmationData) => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
    <p>Your payment of <strong>${formatCurrency(data.amount)}</strong> for order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
    <div class="info-block">
      <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">${data.paymentMethod.toUpperCase()}</span></div>
      ${data.transactionId ? `<div class="info-row"><span class="info-label">Transaction ID</span><span class="info-value">${data.transactionId}</span></div>` : ''}
      <div class="info-row"><span class="info-label">Amount</span><span class="info-value" style="color:#10b981; font-weight:600;">${formatCurrency(data.amount)}</span></div>
    </div>
    <p>Your order is now being processed for delivery.</p>
    <p style="color:#6b7280; font-size:14px;">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
  `;

  return await sendEmail({
    to: data.email,
    subject: `Payment Confirmed - Order #${data.orderNumber}`,
    html: getEmailLayout(content, `Payment Confirmed #${data.orderNumber}`),
  });
};

// ==================== PAYMENT FAILED ====================
export const sendPaymentFailedNotification = async (data: PaymentFailedData) => {
  const content = `
    <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
    <p>We were unable to process your payment of <strong>${formatCurrency(data.amount)}</strong> for order <strong>#${data.orderNumber}</strong>.</p>
    ${data.reason ? `<div class="notes-box"><p style="margin:0;"><strong>Reason:</strong> ${escapeHtml(data.reason)}</p></div>` : ''}
    <p>Please try again or contact your bank for assistance.</p>
    <div style="text-align:center; margin:16px 0;">
      <a href="${process.env.CLIENT_URL}/orders/${data.orderNumber}" class="btn btn-warning">Retry Payment</a>
    </div>
    <p style="color:#6b7280; font-size:14px;">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
  `;

  return await sendEmail({
    to: data.email,
    subject: `Payment Failed - Order #${data.orderNumber}`,
    html: getEmailLayout(content, `Payment Failed #${data.orderNumber}`),
  });
};

// ==================== QUOTATION ====================
export const sendQuotation = async (data: QuotationData) => {
  const subtotal = data.subtotal ?? data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = data.discount ? (data.discountType === 'percentage' ? (subtotal * data.discount / 100) : data.discount) : 0;
  const deliveryCost = data.transportInfo?.cost || 0;
  const taxAmount = data.tax ?? 0;
  const total = subtotal - discountAmount + deliveryCost + taxAmount;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>
        <div style="font-weight:600;">${escapeHtml(item.name)}</div>
        ${item.description ? `<div style="font-size:12px; color:#6b7280;">${escapeHtml(item.description)}</div>` : ''}
      </td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right" style="font-weight:600;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
    <p>Thank you for considering our products. Please find your quotation below.</p>

    <div style="display:flex; gap:16px; margin:16px 0; flex-wrap:wrap;">
      <div style="flex:1; min-width:200px; background:#f8fafc; padding:16px; border-radius:8px;">
        <div style="font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Total Amount</div>
        <div style="font-size:24px; font-weight:700; color:#0043b3; margin:4px 0;">${formatCurrency(total)}</div>
        <div style="font-size:13px; color:#374151;">Valid until ${formatDate(data.validUntil)}</div>
      </div>
      <div style="flex:1; min-width:200px; background:#f8fafc; padding:16px; border-radius:8px;">
        <div style="font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Bill To</div>
        <div style="font-size:16px; font-weight:600; margin:4px 0;">${escapeHtml(data.customerName)}</div>
        <div style="font-size:13px; color:#374151;">${data.quoteNumber}</div>
      </div>
    </div>

    ${data.transportInfo ? `
    <div style="background:#f8fafc; padding:12px 16px; border-radius:8px; margin:12px 0; display:flex; flex-wrap:wrap; gap:12px;">
      ${data.transportInfo.description ? `<span><strong>Delivery:</strong> ${escapeHtml(data.transportInfo.description)}</span>` : ''}
      ${data.transportInfo.cost > 0 ? `<span><strong>Cost:</strong> ${formatCurrency(data.transportInfo.cost)}</span>` : ''}
      ${data.estimatedDelivery ? `<span><strong>Est. Delivery:</strong> ${escapeHtml(data.estimatedDelivery)}</span>` : ''}
    </div>
    ` : ''}

    <div class="table-wrapper">
      <table class="items">
        <thead><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      ${discountAmount > 0 ? `<div class="summary-row summary-discount"><span>Discount</span><span>-${formatCurrency(discountAmount)}</span></div>` : ''}
      ${deliveryCost > 0 ? `<div class="summary-row"><span>Delivery</span><span>${formatCurrency(deliveryCost)}</span></div>` : ''}
      ${taxAmount > 0 ? `<div class="summary-row"><span>Tax</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
      <div class="summary-row summary-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    </div>

    ${data.notes ? `<div class="notes-box"><strong>Notes:</strong> ${escapeHtml(data.notes)}</div>` : ''}
    ${data.terms ? `<div class="terms-box"><strong>Terms:</strong> ${escapeHtml(data.terms)}</div>` : ''}

    <div style="text-align:center; margin-top:16px;">
      <a href="mailto:${COMPANY.email}?subject=Accept Quotation ${data.quoteNumber}" class="btn">Accept Quotation</a>
      <a href="https://wa.me/${COMPANY.phone}?text=I%20would%20like%20to%20accept%20quotation%20${data.quoteNumber}" class="btn btn-success" style="margin-left:8px;">Chat on WhatsApp</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Quotation #${data.quoteNumber} from ${COMPANY.name}`,
    html: getEmailLayout(content, `Quotation #${data.quoteNumber}`),
  });
};

// ==================== INVOICE ====================
export const sendInvoice = async (data: InvoiceData) => {
  const subtotal = data.subtotal ?? data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = data.discount ? (data.discountType === 'percentage' ? (subtotal * data.discount / 100) : data.discount) : 0;
  const deliveryCost = data.transportInfo?.cost || 0;
  const taxAmount = data.tax ?? 0;
  const total = subtotal - discountAmount + deliveryCost + taxAmount;
  const amountPaid = data.amountPaid ?? 0;
  const balanceDue = data.balanceDue ?? total;
  const isPaid = amountPaid >= total;

  const statusText = isPaid ? 'PAID' : amountPaid > 0 ? 'PARTIALLY PAID' : 'UNPAID';
  const statusColor = isPaid ? '#10b981' : amountPaid > 0 ? '#f59e0b' : '#ef4444';

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>
        <div style="font-weight:600;">${escapeHtml(item.name)}</div>
        ${item.description ? `<div style="font-size:12px; color:#6b7280;">${escapeHtml(item.description)}</div>` : ''}
      </td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right" style="font-weight:600;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
    <p>Please find your invoice below. ${!isPaid ? 'Payment is due by the specified date.' : 'Thank you for your payment.'}</p>

    <div style="text-align:center; margin:8px 0;">
      <span class="status-badge" style="background:${statusColor};">${statusText}</span>
    </div>

    <div style="display:flex; gap:16px; margin:16px 0; flex-wrap:wrap;">
      <div style="flex:1; min-width:200px; background:#f8fafc; padding:16px; border-radius:8px;">
        <div style="font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Total Amount</div>
        <div style="font-size:24px; font-weight:700; color:#0043b3; margin:4px 0;">${formatCurrency(total)}</div>
        <div style="font-size:13px; color:#374151;">Due ${formatDate(data.dueDate)}</div>
        ${amountPaid > 0 ? `<div style="font-size:13px; color:#10b981;">Paid: ${formatCurrency(amountPaid)}</div>` : ''}
        ${balanceDue > 0 ? `<div style="font-size:13px; color:#ef4444;">Balance: ${formatCurrency(balanceDue)}</div>` : ''}
      </div>
      <div style="flex:1; min-width:200px; background:#f8fafc; padding:16px; border-radius:8px;">
        <div style="font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Bill To</div>
        <div style="font-size:16px; font-weight:600; margin:4px 0;">${escapeHtml(data.customerName)}</div>
        <div style="font-size:13px; color:#374151;">${data.invoiceNumber}</div>
      </div>
    </div>

    ${data.transportInfo ? `
    <div style="background:#f8fafc; padding:12px 16px; border-radius:8px; margin:12px 0; display:flex; flex-wrap:wrap; gap:12px;">
      ${data.transportInfo.description ? `<span><strong>Delivery:</strong> ${escapeHtml(data.transportInfo.description)}</span>` : ''}
      ${data.transportInfo.cost > 0 ? `<span><strong>Cost:</strong> ${formatCurrency(data.transportInfo.cost)}</span>` : ''}
    </div>
    ` : ''}

    <div class="table-wrapper">
      <table class="items">
        <thead><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      ${discountAmount > 0 ? `<div class="summary-row summary-discount"><span>Discount</span><span>-${formatCurrency(discountAmount)}</span></div>` : ''}
      ${deliveryCost > 0 ? `<div class="summary-row"><span>Delivery</span><span>${formatCurrency(deliveryCost)}</span></div>` : ''}
      ${taxAmount > 0 ? `<div class="summary-row"><span>Tax</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
      <div class="summary-row summary-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
      ${amountPaid > 0 ? `<div class="summary-row summary-paid"><span>Amount Paid</span><span>${formatCurrency(amountPaid)}</span></div>` : ''}
      ${balanceDue > 0 ? `<div class="summary-row summary-balance"><span>Balance Due</span><span>${formatCurrency(balanceDue)}</span></div>` : ''}
    </div>

    ${data.notes ? `<div class="notes-box"><strong>Notes:</strong> ${escapeHtml(data.notes)}</div>` : ''}
    ${data.terms ? `<div class="terms-box"><strong>Terms:</strong> ${escapeHtml(data.terms)}</div>` : ''}

    ${!isPaid ? `
    <div style="text-align:center; margin-top:16px;">
      <a href="mailto:${COMPANY.email}?subject=Payment for Invoice ${data.invoiceNumber}" class="btn btn-success">Make Payment</a>
      <a href="https://wa.me/${COMPANY.phone}?text=I%20would%20like%20to%20make%20payment%20for%20invoice%20${data.invoiceNumber}" class="btn" style="margin-left:8px;">Chat on WhatsApp</a>
    </div>
    ` : ''}
  `;

  return await sendEmail({
    to: data.to,
    subject: `Invoice #${data.invoiceNumber} from ${COMPANY.name}`,
    html: getEmailLayout(content, `Invoice #${data.invoiceNumber}`),
  });
};