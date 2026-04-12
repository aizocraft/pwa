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
  total: number;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export interface AdminOrderNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
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
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
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
                  <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                <p><strong>Total: KES ${data.total.toFixed(2)}</strong></p>
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
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
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
                  <tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                <p><strong>Grand Total: KES ${data.total.toFixed(2)}</strong></p>
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
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
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
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
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
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
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