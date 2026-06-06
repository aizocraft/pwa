// src/routes/mpesa.routes.ts - COMPLETE FIXED VERSION

import { Router, Request, Response } from 'express';
import axios from 'axios';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optionalAuth';
import { createNotification, NOTIFICATION_TEMPLATES } from '../services/notification.service';
import UserModel from '../models/User';
import { sendPaymentConfirmation, sendPaymentFailedNotification } from '../services/email.service';



const router = Router();

// ==================== CONFIGURATION ====================

// Get M-PESA API URLs based on environment
const getMpesaUrls = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSandbox = process.env.MPESA_ENVIRONMENT === 'sandbox' || !isProduction;
  
  if (isSandbox) {
    return {
      auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      query: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      register: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl'
    };
  } else {
    return {
      auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      query: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      register: 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl'
    };
  }
};

// Validate M-PESA configuration
function validateMpesaConfig(): boolean {
  const required = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing M-PESA environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
  console.log(`✅ M-PESA running in ${env.toUpperCase()} mode`);
  
  return true;
}

// Get M-PESA Access Token with retry logic
async function getMpesaToken(retryCount = 0): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-PESA credentials not configured');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const urls = getMpesaUrls();
  
  try {
    const response = await axios.get(urls.auth, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 10000
    });
    return response.data.access_token;
  } catch (error: any) {
    if (retryCount < 3 && error.response?.status === 429) {
      console.log(`Rate limited on token, retrying in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return getMpesaToken(retryCount + 1);
    }
    console.error('Failed to get M-PESA token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-PESA');
  }
}

// Generate M-PESA Password
function generateMpesaPassword(): { password: string; timestamp: string } {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  
  if (!shortcode || !passkey) {
    throw new Error('M-PESA shortcode or passkey not configured');
  }
  
  const str = `${shortcode}${passkey}${timestamp}`;
  const password = Buffer.from(str).toString('base64');
  return { password, timestamp };
}

// Validate Kenyan phone number
function validateKenyanPhone(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  if (/^254[17]\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

// Format amount
function formatAmount(amount: number): number {
  return Math.round(amount);
}

// Delay helper for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== ROUTES ====================

/**
 * POST /api/mpesa/stk-push
 * Initiate STK Push payment
 */
router.post('/stk-push', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!validateMpesaConfig()) {
      return res.status(500).json({ 
        error: 'Payment system not configured',
        code: 'CONFIG_ERROR'
      });
    }

    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Order ID and phone number required',
        code: 'MISSING_FIELDS'
      });
    }

    const normalizedPhone = validateKenyanPhone(phoneNumber);
    if (!normalizedPhone) {
      return res.status(400).json({ 
        error: 'Invalid Kenyan phone number. Use 07XXXXXXXX or 2547XXXXXXXX',
        code: 'INVALID_PHONE'
      });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid', code: 'ALREADY_PAID' });
    }

    const existingTransaction = await TransactionModel.findOne({
      orderId: order._id,
      status: 'pending',
      paymentMethod: 'mpesa'
    });

    if (existingTransaction) {
      return res.status(400).json({
        error: 'Payment already in progress',
        checkoutRequestId: existingTransaction.transactionId,
        code: 'PAYMENT_IN_PROGRESS'
      });
    }

    const token = await getMpesaToken();
    const { password, timestamp } = generateMpesaPassword();
    const urls = getMpesaUrls();
    
    const callbackUrl = process.env.MPESA_CALLBACK_URL || 
                       `${process.env.BASE_URL || 'http://localhost:4000'}/api/mpesa/callback`;

    const stkPushRequest = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: formatAmount(order.total),
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: order.orderNumber.slice(-12),
      TransactionDesc: `Payment for ${order.orderNumber.slice(-10)}`
    };

    console.log(`🔄 Initiating STK Push for order ${order.orderNumber} in ${process.env.MPESA_ENVIRONMENT || 'sandbox'} mode`);

    const response = await axios.post(urls.stkPush, stkPushRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const { CheckoutRequestID, ResponseCode, ResponseDescription, CustomerMessage } = response.data;

    if (ResponseCode !== '0') {
      throw new Error(`STK Push failed: ${ResponseDescription}`);
    }

    const transaction = new TransactionModel({
      orderId: order._id,
      userId: req.user?.userId,
      guestEmail: order.guestInfo?.email,
      guestPhone: order.guestInfo?.phone || normalizedPhone,
      customerName: order.shippingAddress.fullName,
      amount: order.total,
      currency: 'KES',
      paymentMethod: 'mpesa',
      status: 'pending',
      transactionId: CheckoutRequestID,
      notes: `STK Push initiated to ${normalizedPhone}`,
      source: 'checkout'
    });

    await transaction.save();

    res.json({
      success: true,
      checkoutRequestId: CheckoutRequestID,
      message: CustomerMessage || 'STK Push initiated. Check your phone for M-PESA PIN prompt.',
      phoneNumber: normalizedPhone
    });

  } catch (error: any) {
    console.error('STK Push error:', error);
    
    if (error.response?.data) {
      return res.status(400).json({
        error: 'M-PESA service error',
        details: error.response.data.errorMessage || error.response.data,
        code: 'MPESA_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to initiate STK Push',
      message: error.message,
      code: 'STK_PUSH_FAILED'
    });
  }
});

// ==================== CALLBACK & QUERY ENDPOINTS ====================
router.post('/callback', async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log('📞 Callback received:', JSON.stringify(req.body).substring(0, 200));
  
  try {
    const { Body } = req.body;
    if (!Body?.stkCallback) {
      console.error('❌ Invalid callback structure');
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid data' });
    }
    
    const { ResultCode, CheckoutRequestID, ResultDesc, CallbackMetadata } = Body.stkCallback;
    
    // Find transaction
    const transaction = await TransactionModel.findOne({ 
      transactionId: CheckoutRequestID 
    });
    
    if (!transaction) {
      console.error(`❌ Transaction not found: ${CheckoutRequestID}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Transaction not found but acknowledged' });
    }
    
    // ✅ Idempotency check
    if (transaction.status === 'completed') {
      console.log(`⚠️ Duplicate callback for ${CheckoutRequestID}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Already processed' });
    }
    
    // Process based on result code
    if (ResultCode === 0 && CallbackMetadata) {
      // Success
      transaction.status = 'completed';
      transaction.mpesaReceipt = CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      transaction.paidAt = new Date();
      await transaction.save();

      // Update order
      const order = await OrderModel.findById(transaction.orderId);
      if (order) {
        // ensure amountPaid doesn't double add on duplicate callbacks
        const previousOrderAmountPaid = order.amountPaid || 0;
        order.paymentStatus = 'paid';
        order.amountPaid = previousOrderAmountPaid + (transaction.amount || 0);
        await order.save();

        // ✅ Notifications: both customer + admins
        try {
          const { title: payTitle, message: payMessage, actionUrl } = NOTIFICATION_TEMPLATES.paymentReceived(
            order.orderNumber,
            transaction.amount || order.total || 0
          );

          // customer notification
          if (order.userId) {
            await createNotification({
              userId: order.userId.toString(),
              type: 'payment',
              title: payTitle,
              message: payMessage,
              actionUrl,
              metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                amount: transaction.amount,
                mpesaReceipt: transaction.mpesaReceipt,
                paidAt: transaction.paidAt?.toISOString()
              }
            });
          }

          // admin notifications (broadcast to all active admins)
          const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
          if (adminUsers?.length) {
            const notifications = adminUsers.map((admin: any) =>
              createNotification({
                userId: admin._id.toString(),
                type: 'payment',
                title: payTitle,
                message: payMessage,
                actionUrl: `/dashboard/orders/${order._id}`,
                metadata: {
                  orderId: order._id.toString(),
                  orderNumber: order.orderNumber,
                  amount: transaction.amount,
                  mpesaReceipt: transaction.mpesaReceipt,
                  paidAt: transaction.paidAt?.toISOString()
                }
              })
            );
            await Promise.all(notifications);
          }

        } catch (notificationErr) {
          console.error('Failed to create payment notifications (mpesa callback):', notificationErr);
        }
      }

      console.log(`✅ Payment completed: ${CheckoutRequestID}, Receipt: ${transaction.mpesaReceipt}`);

    } else if (ResultCode === 1037) {
      // Timeout - keep pending
      console.log(`⏳ Payment timeout: ${CheckoutRequestID} - ${ResultDesc}`);
      transaction.notes = `Timeout: ${ResultDesc}`;
      await transaction.save();
      
    } else if (ResultCode !== 0) {
      // Failed
      transaction.status = 'failed';
      transaction.notes = `Failed: ${ResultDesc}`;
      await transaction.save();

      // ✅ Notifications for failure: both customer + admins
      try {
        const order = await OrderModel.findById(transaction.orderId);
        if (order) {
          const { title: failTitle, message: failMessage, actionUrl } = NOTIFICATION_TEMPLATES.paymentFailed(
            order.orderNumber,
            ResultDesc || 'Payment failed'
          );

          if (order.userId) {
            await createNotification({
              userId: order.userId.toString(),
              type: 'payment',
              title: failTitle,
              message: failMessage,
              actionUrl,
              metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                amount: transaction.amount,
                failedAt: new Date().toISOString(),
                mpesaResultDesc: ResultDesc
              }
            });
          }

          const adminUsers = await (await import('../models/User')).default.find({ role: 'admin', isActive: true });
          if (adminUsers?.length) {
            const notifications = adminUsers.map((admin: any) =>
              createNotification({
                userId: admin._id.toString(),
                type: 'payment',
                title: failTitle,
                message: failMessage,
                actionUrl: `/dashboard/orders/${order._id}/payment`,
                metadata: {
                  orderId: order._id.toString(),
                  orderNumber: order.orderNumber,
                  amount: transaction.amount,
                  failedAt: new Date().toISOString(),
                  mpesaResultDesc: ResultDesc
                }
              })
            );
            await Promise.all(notifications);
          }
        }
      } catch (notificationErr) {
        console.error('Failed to create payment failure notifications (mpesa callback):', notificationErr);
      }

      console.log(`❌ Payment failed: ${CheckoutRequestID} - ${ResultDesc}`);
    }

    
    const duration = Date.now() - startTime;
    console.log(`✅ Callback processed in ${duration}ms`);
    
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    
  } catch (error) {
    console.error('❌ Callback error:', error);
    // Return 200 anyway to stop M-PESA retries
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Error but acknowledged' });
  }
});
/**
 * POST /api/mpesa/query
 * Query STK Push status - FIXED: Handle rate limiting and never mark as failed prematurely
 */
router.post('/query', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'CheckoutRequestID required', code: 'MISSING_ID' });
    }

    const transaction = await TransactionModel.findOne({ transactionId: checkoutRequestId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', code: 'NOT_FOUND' });
    }

    // If already completed or failed, return current status
    if (transaction.status !== 'pending') {
      return res.json({
        success: true,
        checkoutRequestId,
        status: transaction.status,
        resultCode: transaction.status === 'completed' ? '0' : '1',
        resultDesc: transaction.status === 'completed' ? 'Payment completed' : 'Payment failed',
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          mpesaReceipt: transaction.mpesaReceipt,
          createdAt: transaction.createdAt
        }
      });
    }

    // Only query M-PESA if still pending
    try {
      const token = await getMpesaToken();
      const { password, timestamp } = generateMpesaPassword();
      const urls = getMpesaUrls();

      const queryRequest = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(urls.query, queryRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const { ResultCode, ResultDesc } = response.data;
      
      console.log(`Query result for ${checkoutRequestId}: ResultCode=${ResultCode}, ResultDesc=${ResultDesc}`);

      // Handle different ResultCodes
      if (ResultCode === '0') {
        // Payment completed successfully
        transaction.status = 'completed';
        transaction.notes = `Payment completed via query. Result: ${ResultDesc}`;
        transaction.paidAt = new Date();
        await transaction.save();
        
        const order = await OrderModel.findById(transaction.orderId);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          order.paymentDetails = {
            transactionId: checkoutRequestId,
            paidAt: new Date(),
            phoneNumber: transaction.guestPhone || ''
          };
          await order.save();
        }
        
      } else if (ResultCode === '1037' || ResultCode === '4999' || ResultCode === '500') {
        // Still processing - DO NOTHING, keep as pending
        console.log(`⏳ Transaction ${checkoutRequestId} still pending (${ResultCode})`);
        // Don't change status!
        
      } else {
        // Only log other codes, don't mark as failed - let callback handle it
        console.log(`⚠️ Query returned code ${ResultCode}: ${ResultDesc} - keeping as pending`);
        // Still don't mark as failed - callback might still come
      }
      
    } catch (queryError: any) {
      console.error('M-PESA query error:', queryError.message);
      
      // Handle rate limiting specifically
      if (queryError.response?.status === 429) {
        console.log(`⏳ Rate limited by M-PESA, will retry later`);
        // Keep as pending, don't change status
      }
      // Don't change status on any error
    }

    // Return current status (still pending unless callback updated it)
    res.json({
      success: true,
      checkoutRequestId,
      status: transaction.status,
      resultCode: transaction.status === 'completed' ? '0' : 'pending',
      resultDesc: transaction.status === 'completed' ? 'Payment completed' : 'Processing payment',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        mpesaReceipt: transaction.mpesaReceipt,
        createdAt: transaction.createdAt
      }
    });

  } catch (error: any) {
    console.error('Query endpoint error:', error);
    // Don't throw error - return pending status
    res.status(200).json({ 
      success: false,
      status: 'pending',
      error: 'Failed to query payment status, will retry',
      checkoutRequestId: req.body.checkoutRequestId
    });
  }
});

/**
 * GET /api/mpesa/payment-status/:orderId
 * Get payment status for an order
 */
router.get('/payment-status/:orderId', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    let hasAccess = false;
    if (req.user?.userId) {
      hasAccess = order.userId?.toString() === req.user.userId || req.user.role === 'admin';
    } else {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    }

    const transaction = await TransactionModel.findOne({ orderId: order._id }).sort({ createdAt: -1 });

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      total: order.total,
      transaction: transaction ? {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        mpesaReceipt: transaction.mpesaReceipt,
        createdAt: transaction.createdAt
      } : null
    });

  } catch (error: any) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status', code: 'STATUS_FETCH_FAILED' });
  }
});

/**
 * POST /api/mpesa/simulate
 * Simulate payment (Sandbox only)
 */
router.post('/simulate', async (req: Request, res: Response) => {
  const isSandbox = process.env.MPESA_ENVIRONMENT === 'sandbox' || process.env.NODE_ENV !== 'production';
  
  if (!isSandbox) {
    return res.status(403).json({ error: 'Simulation only available in sandbox', code: 'NOT_IN_SANDBOX' });
  }

  try {
    const { checkoutRequestId, amount, mpesaReceipt } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'checkoutRequestId required' });
    }

    const transaction = await TransactionModel.findOne({ transactionId: checkoutRequestId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: `Transaction already ${transaction.status}` });
    }

    const order = await OrderModel.findById(transaction.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Simulate successful payment
    transaction.status = 'completed';
    transaction.mpesaReceipt = mpesaReceipt || `SIM${Date.now()}`;
    transaction.notes = 'Simulated payment';
    transaction.paidAt = new Date();
    await transaction.save();

    order.paymentStatus = 'paid';
    order.status = 'processing';
    order.paymentDetails = {
      transactionId: checkoutRequestId,
      mpesaReceipt: transaction.mpesaReceipt,
      paidAt: new Date(),
      phoneNumber: transaction.guestPhone || ''
    };
    await order.save();

    console.log(`✅ Simulated payment for order ${order.orderNumber}`);

    res.json({
      success: true,
      message: 'Payment simulated successfully',
      transaction: {
        id: transaction._id,
        status: transaction.status,
        mpesaReceipt: transaction.mpesaReceipt
      }
    });

  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate payment', code: 'SIMULATION_FAILED' });
  }
});

export default router;