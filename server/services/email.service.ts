// src/services/email.service.ts

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();
// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

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

// Helper function to escape HTML special characters
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send general email
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log(`📧 Sending email to: ${options.to}`);
    console.log(`📧 Subject: ${options.subject}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '')
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully! Message ID:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email with attachment using Resend
 */
export const sendEmailWithAttachment = async (options: EmailOptions & { attachments?: Array<{ filename: string; content: string; contentType?: string }> }) => {
  try {
    console.log(`📧 Sending email with attachment to: ${options.to}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully! Message ID:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form email (to admin + auto-reply to user)
 */
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

    return {
      success: adminResult.success && userResult.success,
      adminResult,
      userResult
    };
  } catch (error: any) {
    console.error('Contact email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email to customer
 */
export const sendOrderConfirmation = async (data: OrderEmailData) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a2540; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px; color: #475569; border-bottom: 2px solid #e2e8f0; }
          td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
          .order-summary { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
          .summary-row:last-child { border-bottom: none; }
          .discount .summary-row { color: #ef4444; }
          .summary-total { margin-top: 15px; padding-top: 15px; border-top: 2px solid #0a2540; font-size: 22px; font-weight: 700; color: #1e293b; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Status:</strong> <span style="color: #10b981;">${data.status.toUpperCase()}</span></p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="order-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>KES ${data.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>KES ${data.shippingCost.toFixed(2)}</span>
                </div>
                ${data.promoCode ? `
                <div class="summary-row discount">
                  <span>Discount (${escapeHtml(data.promoCode)})</span>
                  <span>-KES ${data.discount.toFixed(2)}</span>
                </div>
                ` : `
                <div class="summary-row">
                  <span>Discount</span>
                  <span>-KES ${data.discount.toFixed(2)}</span>
                </div>
                `}
                <div class="summary-row">
                  <span>Tax</span>
                  <span>KES ${data.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                  <span>Total</span>
                  <span>KES ${data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p>We'll notify you when your order ships. You can track your order status in your account dashboard.</p>
            <p>Best regards,<br><strong>The Support Team</strong></p>
          </div>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

/**
 * Send admin notification for new order
 */
export const sendAdminOrderNotification = async (data: AdminOrderNotificationData) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
  
  return await sendEmail({
    to: adminEmail,
    subject: `NEW ORDER #${data.orderNumber} - Action Required`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #0a2540; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .alert-badge { background: #ef4444; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; display: inline-block; }
          .order-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; margin-bottom: 10px; flex-wrap: wrap; }
          .info-label { font-weight: bold; width: 150px; color: #374151; }
          .info-value { color: #6b7280; flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .action-buttons { margin-top: 30px; text-align: center; }
          .button { display: inline-block; padding: 12px 24px; background: #0a2540; color: white; text-decoration: none; border-radius: 5px; margin: 0 10px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="alert-badge">NEW ORDER ALERT</span>
            <h1 style="margin: 10px 0 0 0;">Order #${data.orderNumber}</h1>
          </div>
          <div class="content">
            <p>A new order has been placed and requires your attention.</p>
            
            <div class="order-info">
              <h3>Order Information</h3>
              <div class="info-row">
                <div class="info-label">Order Number:</div>
                <div class="info-value">${data.orderNumber}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Order Date:</div>
                <div class="info-value">${data.orderDate.toLocaleString()}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value"><strong style="color: #10b981;">${data.status.toUpperCase()}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Payment Method:</div>
                <div class="info-value">${data.paymentMethod.toUpperCase()}</div>
              </div>
            </div>

            <div class="order-info">
              <h3>Customer Information</h3>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${escapeHtml(data.customerName)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value"><a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value"><a href="tel:${escapeHtml(data.customerPhone)}">${escapeHtml(data.customerPhone)}</a></div>
              </div>
              <div class="info-row">
                <div class="info-label">Shipping Address:</div>
                <div class="info-value">${escapeHtml(data.shippingAddress)}</div>
              </div>
            </div>

            <div class="order-info">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 20px; text-align: right;">
                <strong>Grand Total: KES ${data.total.toFixed(2)}</strong>
              </div>
            </div>

            <div class="action-buttons">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/orders" class="button">View All Orders</a>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/orders/${data.orderId}" class="button" style="background: #10b981;">View This Order</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please process this order as soon as possible.</p>
            <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  return await sendEmail({
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
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a2540; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .warning { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #0a2540; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning">
              <p>⚠️ This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
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
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmation = async (data: {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  transactionId?: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) => {
  const itemsHtml = data.items.map(item => `
    <tr style="border-bottom: 1px solid #e9eef3;">
      <td style="padding: 12px 8px;">${escapeHtml(item.name)}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">KES ${item.price.toLocaleString()}</td>
      <td style="padding: 12px 8px; text-align: right;">KES ${(item.quantity * item.price).toLocaleString()}</td>
    </tr>
  `).join('');

  return await sendEmail({
    to: data.email,
    subject: `Payment Confirmed - Order #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
            <p>Your payment of <strong>KES ${data.amount.toLocaleString()}</strong> for order #${data.orderNumber} has been confirmed.</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</p>
            ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
            <p>Your order is now being processed for delivery.</p>
            <p>Best regards,<br><strong>Plasma Water Africa Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

/**
 * Send payment failed notification
 */
export const sendPaymentFailedNotification = async (data: {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  reason?: string;
}) => {
  return await sendEmail({
    to: data.email,
    subject: `Payment Failed - Order #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
            <p>We were unable to process your payment of <strong>KES ${data.amount.toLocaleString()}</strong> for order #${data.orderNumber}.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>` : ''}
            <p>Please try again or contact your bank for assistance.</p>
            <p>Best regards,<br><strong>Plasma Water Africa Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

/**
 * Send quotation email to customer - Premium Professional Design
 */
export const sendQuotation = async (data: {
  to: string;
  customerName: string;
  quoteNumber: string;
  quoteTotal: number;
  validUntil: Date;
  items: Array<{ 
    name: string; 
    quantity: number; 
    price: number; 
    tax?: number;
    description?: string 
  }>;
  taxPerItem?: boolean;
  transportInfo?: {
    cost: number;
    description?: string;
  };
  estimatedDelivery?: string;
  shippingInfo?: {
    areaName: string;
    cost: number;
    freeThreshold?: number;
    estimatedDelivery?: string;
  };
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  subtotal?: number;
  notes?: string;
  terms?: string;
}) => {
  const subtotal = data.subtotal ?? data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = data.discount
    ? (data.discountType === 'percentage' ? (subtotal * data.discount / 100) : data.discount)
    : 0;

  // Use transportInfo if available, otherwise use shippingInfo
  const hasTransport = data.transportInfo && data.transportInfo.cost > 0;
  const hasShipping = data.shippingInfo && data.shippingInfo.cost > 0;
  const deliveryCost = hasTransport ? data.transportInfo!.cost : (hasShipping ? data.shippingInfo!.cost : 0);
  const deliveryDescription = hasTransport ? data.transportInfo!.description : (hasShipping ? data.shippingInfo!.areaName : null);
  const deliveryEstimate = data.estimatedDelivery || data.shippingInfo?.estimatedDelivery;
  
  const taxAmount = data.tax ?? 0;
  const total = subtotal - discountAmount + deliveryCost + taxAmount;

  // Build tax note if taxPerItem is enabled
  const taxNote = data.taxPerItem ? 
    '<div class="tax-note" style="font-size: 11px; color: #6b7280; margin-top: 5px;">✓ Tax calculated per item</div>' : 
    '';

  const itemsHtml = data.items.map(item => `
    <tr style="border-bottom: 1px solid #e9eef3;">
      <td style="padding: 14px 8px; vertical-align: top;">
        <div style="font-weight: 600; color: #1a2a3a; font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.name)}</div>
        ${item.description ? `<div style="font-size: 11px; color: #7a8a9a; line-height: 1.4;">${escapeHtml(item.description)}</div>` : ''}
        ${data.taxPerItem && item.tax ? `<div style="font-size: 10px; color: #10b981; margin-top: 4px;">Tax: KES ${item.tax.toLocaleString()}</div>` : ''}
      </td>
      <td style="padding: 14px 8px; text-align: center; color: #2c3e4e; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 14px 8px; text-align: right; color: #2c3e4e; font-size: 13px;">KES ${item.price.toLocaleString()}</td>
      <td style="padding: 14px 8px; text-align: right; font-weight: 600; color: #1a2a3a; font-size: 14px;">KES ${(item.quantity * item.price).toLocaleString()}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation #${data.quoteNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          background: #f0f2f5;
          padding: 40px 0;
        }
        
        .email-container {
          max-width: 700px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        
        .email-header {
          background: linear-gradient(135deg, #0a2540 0%, #1a4a6e 100%);
          padding: 32px 40px;
          text-align: center;
          border-bottom: 4px solid #f59e0b;
        }
        
        .company-logo {
          max-width: 140px;
          height: auto;
          margin-bottom: 20px;
          filter: brightness(0) invert(1);
        }
        
        .quotation-badge {
          background: #f59e0b;
          color: white;
          display: inline-block;
          padding: 8px 24px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 16px 0 8px;
          text-transform: uppercase;
        }
        
        .quotation-number {
          color: rgba(255,255,255,0.9);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .email-content {
          padding: 40px;
        }
        
        .greeting {
          margin-bottom: 32px;
        }
        
        .greeting h2 {
          color: #0a2540;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .greeting p {
          color: #5a6e7c;
          font-size: 15px;
        }
        
        .info-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        
        .info-cell {
          flex: 1;
          min-width: 200px;
        }
        
        .info-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .info-card-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8a9aaa;
          margin-bottom: 12px;
        }
        
        .info-value-large {
          font-size: 28px;
          font-weight: 800;
          color: #0a2540;
          margin: 8px 0;
        }
        
        .info-label-sm {
          font-size: 11px;
          color: #8a9aaa;
          margin-bottom: 4px;
        }
        
        .info-value-sm {
          font-size: 14px;
          color: #2c3e4e;
          font-weight: 500;
        }
        
        .delivery-row {
          background: #f7f9fc;
          border-radius: 14px;
          padding: 16px 20px;
          margin: 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .delivery-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .delivery-label {
          font-size: 11px;
          font-weight: 600;
          color: #5a7a5a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .delivery-value {
          font-size: 13px;
          font-weight: 500;
          color: #2c5e3c;
        }
        
        .items-table-wrapper {
          margin: 32px 0;
          overflow-x: auto;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table thead {
          background: #f1f5f9;
        }
        
        .items-table th {
          padding: 14px 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
        }
        
        .items-table td {
          padding: 16px 12px;
          vertical-align: top;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals-panel {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
          color: #475569;
        }
        
        .total-line.discount {
          color: #ef4444;
        }
        
        .total-line.grand {
          margin-top: 12px;
          padding-top: 16px;
          border-top: 2px solid #cbd5e1;
          font-size: 20px;
          font-weight: 800;
          color: #0a2540;
        }
        
        .tax-note {
          font-size: 11px;
          color: #6b7280;
          margin-top: 5px;
          text-align: right;
        }
        
        .payment-section {
          margin: 32px 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .payment-header {
          background: #0a2540;
          padding: 16px 24px;
        }
        
        .payment-header h4 {
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }
        
        .payment-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        
        .payment-method {
          padding: 24px;
        }
        
        .payment-method:first-child {
          border-right: 1px solid #e2e8f0;
        }
        
        .payment-method-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .payment-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        
        .payment-method-title {
          font-size: 16px;
          font-weight: 700;
          color: #0a2540;
        }
        
        .payment-method-sub {
          font-size: 12px;
          color: #8a9aaa;
        }
        
        .payment-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .payment-detail-key {
          color: #8a9aaa;
        }
        
        .payment-detail-value {
          color: #2c3e4e;
          font-weight: 500;
        }
        
        .notes-box, .terms-box {
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        
        .notes-box {
          background: #fef8e7;
          border-left: 4px solid #f59e0b;
        }
        
        .terms-box {
          background: #f1f5f9;
          border-left: 4px solid #64748b;
        }
        
        .notes-title, .terms-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .notes-title {
          color: #b46f0b;
        }
        
        .terms-title {
          color: #475569;
        }
        
        .notes-text, .terms-text {
          font-size: 13px;
          color: #5a6e7c;
          line-height: 1.6;
        }
        
        .action-buttons {
          text-align: center;
          margin: 32px 0 24px;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 28px;
          background: #0a2540;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          margin: 0 8px;
          transition: all 0.2s;
        }
        
        .btn-wa {
          background: #25D366;
        }
        
        .btn-wa:hover {
          background: #128C7E;
        }
        
        .btn:hover {
          background: #1a4a6e;
          transform: translateY(-2px);
        }
        
        .email-footer {
          background: #f8fafc;
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-slogan {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #5a7a5a;
          margin-bottom: 12px;
        }
        
        .footer-address {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.6;
        }
        
        @media (max-width: 600px) {
          .email-content {
            padding: 24px;
          }
          .payment-body {
            grid-template-columns: 1fr;
          }
          .payment-method:first-child {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-grid {
            flex-direction: column;
          }
          .action-buttons .btn {
            display: block;
            margin: 10px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="/images/logo1.png" alt="Plasma Water Africa" class="company-logo" onerror="this.style.display='none'">
          <div class="quotation-badge">QUOTATION</div>
          <div class="quotation-number">#${data.quoteNumber}</div>
        </div>
        
        <div class="email-content">
          <div class="greeting">
            <h2>Dear ${escapeHtml(data.customerName)},</h2>
            <p>Thank you for considering our products. Please find your quotation details below.</p>
          </div>
          
          <div class="info-grid">
            <div class="info-cell">
              <div class="info-card">
                <div class="info-card-title">QUOTE DETAILS</div>
                <div class="info-value-large">KES ${total.toLocaleString()}</div>
                <div style="margin-top: 12px;">
                  <div class="info-label-sm">Valid Until</div>
                  <div class="info-value-sm">${new Date(data.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
            <div class="info-cell">
              <div class="info-card">
                <div class="info-card-title">BILL TO</div>
                <div class="info-value-sm" style="font-weight: 600; margin-bottom: 8px;">${escapeHtml(data.customerName)}</div>
                <div class="info-label-sm">Quotation Reference</div>
                <div class="info-value-sm">${data.quoteNumber}</div>
              </div>
            </div>
          </div>
          
          <!-- Delivery Information -->
          ${(deliveryCost > 0 || deliveryDescription || deliveryEstimate) ? `
          <div class="delivery-row">
            ${deliveryDescription ? `
            <div class="delivery-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2c6e3c" stroke-width="1.8">
                <path d="M1 3h15v13H1z"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <div>
                <div class="delivery-label">Delivery Method</div>
                <div class="delivery-value">${escapeHtml(deliveryDescription)}</div>
              </div>
            </div>
            ` : ''}
            ${deliveryCost > 0 ? `
            <div class="delivery-item">
              <div>
                <div class="delivery-label">Delivery Cost</div>
                <div class="delivery-value">KES ${deliveryCost.toLocaleString()}</div>
              </div>
            </div>
            ` : ''}
            ${deliveryEstimate ? `
            <div class="delivery-item">
              <div>
                <div class="delivery-label">Est. Delivery</div>
                <div class="delivery-value">${escapeHtml(deliveryEstimate)}</div>
              </div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="items-table-wrapper">
            <table class="items-table">
              <thead>
                <tr><th style="width: 45%">Item Description</th><th class="text-center" style="width: 12%">Qty</th><th class="text-right" style="width: 20%">Unit Price</th><th class="text-right" style="width: 23%">Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            ${taxNote}
          </div>
          
          <div class="totals-panel">
            <div class="total-line"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
            ${discountAmount > 0 ? `<div class="total-line discount"><span>Discount (${data.discountType === 'percentage' ? `${data.discount}%` : 'Fixed'})</span><span>-KES ${discountAmount.toLocaleString()}</span></div>` : ''}
            ${deliveryCost > 0 ? `<div class="total-line"><span>Delivery</span><span>KES ${deliveryCost.toLocaleString()}</span></div>` : ''}
            ${taxAmount > 0 ? `<div class="total-line"><span>Tax (16% VAT)</span><span>KES ${taxAmount.toLocaleString()}</span></div>` : ''}
            <div class="total-line grand"><span>Total Amount</span><span>KES ${total.toLocaleString()}</span></div>
          </div>
          
          <div class="payment-section">
            <div class="payment-header">
              <h4>Payment Methods</h4>
            </div>
            <div class="payment-body">
              <div class="payment-method">
                <div class="payment-method-header">
                  <img src="/images/kcb-logo.png" class="payment-logo" alt="KCB Bank" onerror="this.style.display='none'">
                  <div>
                    <div class="payment-method-title">KCB Bank Kenya</div>
                    <div class="payment-method-sub">Bank Transfer</div>
                  </div>
                </div>
                <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account Number</span><span class="payment-detail-value">1312281278</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Branch</span><span class="payment-detail-value">Moi Avenue, Nairobi</span></div>
              </div>
              <div class="payment-method">
                <div class="payment-method-header">
                  <img src="/images/mpesa-logo.png" class="payment-logo" alt="M-PESA" onerror="this.style.display='none'">
                  <div>
                    <div class="payment-method-title">LIPA NA M-PESA</div>
                    <div class="payment-method-sub">Till Number</div>
                  </div>
                </div>
                <div class="payment-detail"><span class="payment-detail-key">Till Number</span><span class="payment-detail-value">9114123</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Reference</span><span class="payment-detail-value">${data.quoteNumber}</span></div>
              </div>
            </div>
          </div>
          
          ${data.notes ? `
          <div class="notes-box">
            <div class="notes-title">Notes</div>
            <div class="notes-text">${escapeHtml(data.notes)}</div>
          </div>
          ` : ''}
          
          ${data.terms ? `
          <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-text">${escapeHtml(data.terms)}</div>
          </div>
          ` : ''}
          
          <div class="action-buttons">
            <a href="mailto:sales@plasmawater.com?subject=Accept Quotation ${data.quoteNumber}" class="btn">Accept Quotation</a>
            <a href="https://wa.me/254710743793?text=I%20would%20like%20to%20accept%20quotation%20${data.quoteNumber}" class="btn btn-wa">Chat on WhatsApp</a>
          </div>
        </div>
        
        <div class="email-footer">
          <div class="footer-slogan">Quality Water Solutions for Africa</div>
          <div class="footer-address">
            P.O BOX 4996-00200, Nairobi, Kenya | Tel: 0710743793 | Email: info@plasmawater.com<br>
            © ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Quotation #${data.quoteNumber} from Plasma Water Africa`,
    html: emailHtml,
  });
};


/**
 * Send invoice email to customer - Premium Professional Design
 */
export const sendInvoice = async (data: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  invoiceTotal: number;
  dueDate: Date;
  items: Array<{ 
    name: string; 
    quantity: number; 
    price: number; 
    tax?: number;
    description?: string 
  }>;
  taxPerItem?: boolean;
  transportInfo?: {
    cost: number;
    description?: string;
  };
  estimatedDelivery?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  subtotal?: number;
  notes?: string;
  terms?: string;
  amountPaid?: number;
  balanceDue?: number;
}) => {
  const subtotal = data.subtotal ?? data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = data.discount
    ? (data.discountType === 'percentage' ? (subtotal * data.discount / 100) : data.discount)
    : 0;

  const hasTransport = data.transportInfo && data.transportInfo.cost > 0;
  const deliveryCost = hasTransport ? data.transportInfo!.cost : 0;
  const deliveryDescription = hasTransport ? data.transportInfo!.description : null;
  
  const taxAmount = data.tax ?? 0;
  const total = subtotal - discountAmount + deliveryCost + taxAmount;
  const amountPaid = data.amountPaid ?? 0;
  const balanceDue = data.balanceDue ?? total;
  const isPaid = amountPaid >= total;
  const isPartiallyPaid = amountPaid > 0 && amountPaid < total;

  // Build tax note if taxPerItem is enabled
  const taxNote = data.taxPerItem ? 
    '<div class="tax-note" style="font-size: 11px; color: #6b7280; margin-top: 5px;">✓ Tax calculated per item</div>' : 
    '';

  const itemsHtml = data.items.map(item => `
    <tr style="border-bottom: 1px solid #e9eef3;">
      <td style="padding: 14px 8px; vertical-align: top;">
        <div style="font-weight: 600; color: #1a2a3a; font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.name)}</div>
        ${item.description ? `<div style="font-size: 11px; color: #7a8a9a; line-height: 1.4;">${escapeHtml(item.description)}</div>` : ''}
        ${data.taxPerItem && item.tax ? `<div style="font-size: 10px; color: #10b981; margin-top: 4px;">Tax: KES ${item.tax.toLocaleString()}</div>` : ''}
      </td>
      <td style="padding: 14px 8px; text-align: center; color: #2c3e4e; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 14px 8px; text-align: right; color: #2c3e4e; font-size: 13px;">KES ${item.price.toLocaleString()}</td>
      <td style="padding: 14px 8px; text-align: right; font-weight: 600; color: #1a2a3a; font-size: 14px;">KES ${(item.quantity * item.price).toLocaleString()}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${data.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          background: #f0f2f5;
          padding: 40px 0;
        }
        
        .email-container {
          max-width: 700px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        
        .email-header {
          background: linear-gradient(135deg, #0a2540 0%, #1a4a6e 100%);
          padding: 32px 40px;
          text-align: center;
          border-bottom: 4px solid #10b981;
        }
        
        .company-logo {
          max-width: 160px;
          height: auto;
          margin-bottom: 20px;
          filter: brightness(0) invert(1);
        }
        
        .invoice-badge {
          background: #10b981;
          color: white;
          display: inline-block;
          padding: 8px 24px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 16px 0 8px;
          text-transform: uppercase;
        }
        
        .invoice-number {
          color: rgba(255,255,255,0.9);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .payment-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .status-paid {
          background: #10b981;
          color: white;
        }
        
        .status-partial {
          background: #f59e0b;
          color: white;
        }
        
        .status-unpaid {
          background: #ef4444;
          color: white;
        }
        
        .email-content {
          padding: 40px;
        }
        
        .greeting {
          margin-bottom: 32px;
        }
        
        .greeting h2 {
          color: #0a2540;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .greeting p {
          color: #5a6e7c;
          font-size: 15px;
        }
        
        .info-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        
        .info-cell {
          flex: 1;
          min-width: 200px;
        }
        
        .info-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .info-card-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8a9aaa;
          margin-bottom: 12px;
        }
        
        .info-value-large {
          font-size: 28px;
          font-weight: 800;
          color: #0a2540;
          margin: 8px 0;
        }
        
        .info-label-sm {
          font-size: 11px;
          color: #8a9aaa;
          margin-bottom: 4px;
        }
        
        .info-value-sm {
          font-size: 14px;
          color: #2c3e4e;
          font-weight: 500;
        }
        
        .delivery-row {
          background: #f7f9fc;
          border-radius: 14px;
          padding: 16px 20px;
          margin: 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .delivery-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .delivery-label {
          font-size: 11px;
          font-weight: 600;
          color: #5a7a5a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .delivery-value {
          font-size: 13px;
          font-weight: 500;
          color: #2c5e3c;
        }
        
        .items-table-wrapper {
          margin: 32px 0;
          overflow-x: auto;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table thead {
          background: #f1f5f9;
        }
        
        .items-table th {
          padding: 14px 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
        }
        
        .items-table td {
          padding: 16px 12px;
          vertical-align: top;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals-panel {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
          color: #475569;
        }
        
        .total-line.discount {
          color: #ef4444;
        }
        
        .total-line.grand {
          margin-top: 12px;
          padding-top: 16px;
          border-top: 2px solid #cbd5e1;
          font-size: 20px;
          font-weight: 800;
          color: #0a2540;
        }
        
        .payment-section {
          margin: 32px 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .payment-header {
          background: #0a2540;
          padding: 16px 24px;
        }
        
        .payment-header h4 {
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }
        
        .payment-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        
        .payment-method {
          padding: 24px;
        }
        
        .payment-method:first-child {
          border-right: 1px solid #e2e8f0;
        }
        
        .payment-method-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .payment-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        
        .payment-method-title {
          font-size: 16px;
          font-weight: 700;
          color: #0a2540;
        }
        
        .payment-method-sub {
          font-size: 12px;
          color: #8a9aaa;
        }
        
        .payment-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .payment-detail-key {
          color: #8a9aaa;
        }
        
        .payment-detail-value {
          color: #2c3e4e;
          font-weight: 500;
        }
        
        .notes-box, .terms-box {
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        
        .notes-box {
          background: #fef8e7;
          border-left: 4px solid #f59e0b;
        }
        
        .terms-box {
          background: #f1f5f9;
          border-left: 4px solid #64748b;
        }
        
        .notes-title, .terms-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .notes-title {
          color: #b46f0b;
        }
        
        .terms-title {
          color: #475569;
        }
        
        .notes-text, .terms-text {
          font-size: 13px;
          color: #5a6e7c;
          line-height: 1.6;
        }
        
        .action-buttons {
          text-align: center;
          margin: 32px 0 24px;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 28px;
          background: #0a2540;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          margin: 0 8px;
          transition: all 0.2s;
        }
        
        .btn-pay {
          background: #10b981;
        }
        
        .btn-pay:hover {
          background: #059669;
          transform: translateY(-2px);
        }
        
        .btn:hover {
          background: #1a4a6e;
          transform: translateY(-2px);
        }
        
        .email-footer {
          background: #f8fafc;
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-slogan {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #5a7a5a;
          margin-bottom: 12px;
        }
        
        .footer-address {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.6;
        }
        
        @media (max-width: 600px) {
          .email-content {
            padding: 24px;
          }
          .payment-body {
            grid-template-columns: 1fr;
          }
          .payment-method:first-child {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-grid {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="/images/logo1.png" alt="Plasma Water Africa" class="company-logo" style="max-width: 140px; height: auto;">
          <div class="invoice-badge">TAX INVOICE</div>
          <div class="invoice-number">#${data.invoiceNumber}</div>
          ${isPaid ? '<div class="payment-status status-paid">✓ PAID</div>' : 
            isPartiallyPaid ? `<div class="payment-status status-partial">⚠ PARTIALLY PAID - Balance: KES ${balanceDue.toLocaleString()}</div>` :
            '<div class="payment-status status-unpaid">⚠ UNPAID</div>'}
        </div>
        
        <div class="email-content">
          <div class="greeting">
            <h2>Dear ${escapeHtml(data.customerName)},</h2>
            <p>Please find your invoice details below. ${!isPaid ? 'Payment is due by the specified date.' : 'Thank you for your payment.'}</p>
          </div>
          
          <div class="info-grid">
            <div class="info-cell">
              <div class="info-card">
                <div class="info-card-title">INVOICE DETAILS</div>
                <div class="info-value-large">KES ${total.toLocaleString()}</div>
                <div style="margin-top: 12px;">
                  <div class="info-label-sm">Due Date</div>
                  <div class="info-value-sm">${new Date(data.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                ${amountPaid > 0 ? `
                <div style="margin-top: 8px;">
                  <div class="info-label-sm">Amount Paid</div>
                  <div class="info-value-sm" style="color: #10b981;">KES ${amountPaid.toLocaleString()}</div>
                </div>
                <div style="margin-top: 4px;">
                  <div class="info-label-sm">Balance Due</div>
                  <div class="info-value-sm" style="color: ${balanceDue > 0 ? '#ef4444' : '#10b981'};">KES ${balanceDue.toLocaleString()}</div>
                </div>
                ` : ''}
              </div>
            </div>
            <div class="info-cell">
              <div class="info-card">
                <div class="info-card-title">BILL TO</div>
                <div class="info-value-sm" style="font-weight: 600; margin-bottom: 8px;">${escapeHtml(data.customerName)}</div>
                <div class="info-label-sm">Invoice Reference</div>
                <div class="info-value-sm">${data.invoiceNumber}</div>
              </div>
            </div>
          </div>
          
          <!-- Delivery Information -->
          ${(deliveryCost > 0 || deliveryDescription) ? `
          <div class="delivery-row">
            ${deliveryDescription ? `
            <div class="delivery-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2c6e3c" stroke-width="1.8">
                <path d="M1 3h15v13H1z"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <div>
                <div class="delivery-label">Delivery Method</div>
                <div class="delivery-value">${escapeHtml(deliveryDescription)}</div>
              </div>
            </div>
            ` : ''}
            ${deliveryCost > 0 ? `
            <div class="delivery-item">
              <div>
                <div class="delivery-label">Delivery Cost</div>
                <div class="delivery-value">KES ${deliveryCost.toLocaleString()}</div>
              </div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="items-table-wrapper">
            <table class="items-table">
              <thead>
                <tr><th style="width: 45%">Item Description</th><th class="text-center" style="width: 12%">Qty</th><th class="text-right" style="width: 20%">Unit Price</th><th class="text-right" style="width: 23%">Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            ${taxNote}
          </div>
          
          <div class="totals-panel">
            <div class="total-line"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
            ${discountAmount > 0 ? `<div class="total-line discount"><span>Discount (${data.discountType === 'percentage' ? `${data.discount}%` : 'Fixed'})</span><span>-KES ${discountAmount.toLocaleString()}</span></div>` : ''}
            ${deliveryCost > 0 ? `<div class="total-line"><span>Delivery</span><span>KES ${deliveryCost.toLocaleString()}</span></div>` : ''}
            ${taxAmount > 0 ? `<div class="total-line"><span>Tax (16% VAT)</span><span>KES ${taxAmount.toLocaleString()}</span></div>` : ''}
            <div class="total-line grand"><span>Total Amount</span><span>KES ${total.toLocaleString()}</span></div>
          </div>
          
          <div class="payment-section">
            <div class="payment-header">
              <h4>Payment Instructions</h4>
            </div>
            <div class="payment-body">
              <div class="payment-method">
                <div class="payment-method-header">
                  <img src="/images/kcb-logo.png" class="payment-logo" alt="KCB Bank">
                  <div>
                    <div class="payment-method-title">KCB Bank Kenya</div>
                    <div class="payment-method-sub">Bank Transfer</div>
                  </div>
                </div>
                <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account Number</span><span class="payment-detail-value">1312281278</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Branch</span><span class="payment-detail-value">Moi Avenue, Nairobi</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Reference</span><span class="payment-detail-value">${data.invoiceNumber}</span></div>
              </div>
              <div class="payment-method">
                <div class="payment-method-header">
                  <img src="/images/mpesa-logo.png" class="payment-logo" alt="M-PESA">
                  <div>
                    <div class="payment-method-title">LIPA NA M-PESA</div>
                    <div class="payment-method-sub">Till Number</div>
                  </div>
                </div>
                <div class="payment-detail"><span class="payment-detail-key">Till Number</span><span class="payment-detail-value">9114123</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Reference</span><span class="payment-detail-value">${data.invoiceNumber}</span></div>
              </div>
            </div>
          </div>
          
          ${data.notes ? `
          <div class="notes-box">
            <div class="notes-title">Notes</div>
            <div class="notes-text">${escapeHtml(data.notes)}</div>
          </div>
          ` : ''}
          
          ${data.terms ? `
          <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-text">${escapeHtml(data.terms)}</div>
          </div>
          ` : ''}
          
          ${!isPaid ? `
          <div class="action-buttons">
            <a href="mailto:accounts@plasmawater.com?subject=Payment for Invoice ${data.invoiceNumber}" class="btn btn-pay">Make Payment</a>
            <a href="https://wa.me/254700000000?text=I%20would%20like%20to%20make%20payment%20for%20invoice%20${data.invoiceNumber}" class="btn">Chat on WhatsApp</a>
          </div>
          ` : ''}
        </div>
        
        <div class="email-footer">
          <div class="footer-slogan">Quality Water Solutions for Africa</div>
          <div class="footer-address">
            P.O BOX 4996-00200, Nairobi, Kenya | Tel: 0710743793 | Email: info@plasmawater.com<br>
            © ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Invoice #${data.invoiceNumber} from Plasma Water Africa`,
    html: emailHtml,
  });
};

// Keep all other existing functions (sendQuotation, sendOrderConfirmation, etc.)