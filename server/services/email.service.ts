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
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
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
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              ${data.phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${data.phone}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
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
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; background: #f9fafb; }
            .message-box { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You, ${data.name}!</h2>
            </div>
            <div class="content">
              <p>We have received your message and will get back to you within 24 hours.</p>
              <p><strong>Your message:</strong></p>
              <div class="message-box">
                ${data.message.replace(/\n/g, '<br>')}
              </div>
              <p>Best regards,<br><strong>The Support Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
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
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px; color: #475569; border-bottom: 2px solid #e2e8f0; }
          td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
          .order-summary { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0,0, 0.1); }
          .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
          .summary-row:last-child { border-bottom: none; }
          .discount .summary-row { color: #ef4444; }
          .summary-total { margin-top: 15px; padding-top: 15px; border-top: 2px solid #3b82f6; font-size: 22px; font-weight: 700; color: #1e293b; }
          @media (max-width: 600px) {
            .container { padding: 10px !important; }
            table { font-size: 14px; }
            th, td { padding: 10px 8px; }
            .summary-row { font-size: 14px; flex-direction: column; align-items: flex-start; gap: 4px; }
            .summary-total { font-size: 20px; }
          }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🎉</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
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
                  <span>Discount (${data.promoCode})</span>
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
            <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
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
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
  
  return await sendEmail({
    to: adminEmail,
    subject: `🔔 NEW ORDER #${data.orderId} - Action Required`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .alert-badge { background: #ef4444; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; display: inline-block; }
          .order-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; margin-bottom: 10px; flex-wrap: wrap; }
          .info-label { font-weight: bold; width: 150px; color: #374151; }
          .info-value { color: #6b7280; flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
          .action-buttons { margin-top: 30px; text-align: center; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 0 10px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="alert-badge">🔔 NEW ORDER ALERT</span>
            <h1 style="margin: 10px 0 0 0;">Order #${data.orderId}</h1>
          </div>
          <div class="content">
            <p>A new order has been placed and requires your attention.</p>
            
            <div class="order-info">
              <h3>📋 Order Information</h3>
              <div class="info-row">
                <div class="info-label">Order ID:</div>
                <div class="info-value">${data.orderId}</div>
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
              <h3>👤 Customer Information</h3>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${data.customerName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></div>
              </div>
              <div class="info-row">
                <div class="info-label">Shipping Address:</div>
                <div class="info-value">${data.shippingAddress}</div>
              </div>
            </div>

            <div class="order-info">
              <h3>🛍️ Order Items</h3>
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
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
                  <span>Discount (${data.promoCode})</span>
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
                  <span>Grand Total</span>
                  <span>KES ${data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/orders" class="button" style="background: #3b82f6;">📦 View All Orders</a>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/orders/${data.orderId}" class="button" style="background: #10b981;">👁️ View This Order</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please process this order as soon as possible.</p>
            <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
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
    subject: 'Welcome to Our Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome ${name}! 🎉</h1>
          </div>
          <div class="content">
            <p>We're excited to have you on board!</p>
            <p>Get started by exploring our platform and discovering all the amazing products we offer.</p>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br><strong>The Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .warning { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>Best regards,<br><strong>The Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Payment confirmation email
export const sendPaymentConfirmation = async (data: {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  transactionId?: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) => {
  // Implement your email sending logic
  console.log(`Payment confirmation sent to ${data.email} for order ${data.orderNumber}`);
};

// Payment failed notification
export const sendPaymentFailedNotification = async (data: {
  email: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  reason?: string;
}) => {
  // Implement your email sending logic
  console.log(`Payment failure notification sent to ${data.email} for order ${data.orderNumber}`);
};


/**
 * Send quotation email to customer
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded string
    contentType?: string;
  }>;
}

export interface QuotationEmailData {
  to: string;
  customerName: string;
  quoteNumber: string;
  quoteTotal: number;
  validUntil: Date;
  pdfBuffer: Buffer;
  pdfFilename: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

/**
 * Send email with PDF attachment using Resend
 */
export const sendEmailWithAttachment = async (options: EmailOptions) => {
  try {
    console.log(`📧 Sending email with attachment to: ${options.to}`);
    console.log(`📧 Subject: ${options.subject}`);
    console.log(`📎 Attachment: ${options.attachments?.length} file(s)`);
    
    // Convert Buffer to base64 string for Resend
    const attachments = options.attachments?.map(att => ({
      filename: att.filename,
      content: att.content, // Already base64 string
      contentType: att.contentType || 'application/pdf',
    }));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: attachments,
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
 * Send quotation email with PDF attachment
 */
export const sendQuotationWithPDF = async (data: QuotationEmailData) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a2540 0%, #1a4a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9fafb; }
        .quotation-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: #0a2540; color: white; text-decoration: none; border-radius: 8px; margin: 20px 10px 0 0; }
        .button-wa { background: #25D366; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px; }
        .attachment-note { background: #e0f2fe; padding: 10px; border-radius: 8px; margin: 15px 0; text-align: center; font-size: 12px; color: #0369a1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Quotation #${data.quoteNumber}</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${data.customerName}</strong>,</p>
          <p>Thank you for your interest in our products.</p>
          
          <div class="attachment-note">
            📎 <strong>PDF Attachment:</strong> Your quotation has been attached to this email as a PDF file.
          </div>
          
          <div class="quotation-details">
            <h3 style="margin-top: 0;">Quotation Summary</h3>
            <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
            <p><strong>Total Amount:</strong> <span style="font-size: 24px; color: #0a2540; font-weight: bold;">KES ${data.quoteTotal.toLocaleString()}</span></p>
            <p><strong>Valid Until:</strong> <span class="badge">${new Date(data.validUntil).toLocaleDateString()}</span></p>
            
            <h3>Items Summary</h3>
            <table>
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total: KES ${data.quoteTotal.toLocaleString()}</strong>
            </div>
          </div>
          
          <p>Please find the detailed quotation attached to this email.</p>
          <p>To accept this quotation, please reply to this email or contact our sales team.</p>
          <p>Best regards,<br><strong>Sales Team</strong></p>
        </div>
        <div class="footer">
          <p>This quotation is valid until ${new Date(data.validUntil).toLocaleDateString()}</p>
          <p>© ${new Date().getFullYear()} Plasma Water Africa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Convert PDF buffer to base64 string
  const pdfBase64 = data.pdfBuffer.toString('base64');

  return await sendEmailWithAttachment({
    to: data.to,
    subject: `Quotation #${data.quoteNumber} from Plasma Water Africa`,
    html: emailHtml,
    attachments: [{
      filename: data.pdfFilename,
      content: pdfBase64,
      contentType: 'application/pdf',
    }],
  });
};