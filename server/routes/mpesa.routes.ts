import { Router, Request, Response } from 'express';
import axios from 'axios';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optionalAuth';
import { sendPaymentConfirmation, sendPaymentFailedNotification } from '../services/email.service';

const router = Router();

// Helper: Get M-PESA Access Token
async function getMpesaToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-PESA credentials not configured');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 10000
    }
  );

  return response.data.access_token;
}

// Helper: Generate M-PESA Password
function generateMpesaPassword(): { password: string; timestamp: string } {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const str = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  const password = Buffer.from(str).toString('base64');
  return { password, timestamp };
}

// Helper: Validate Kenyan phone number
function validateKenyanPhone(phone: string): string | null {
  let normalized = phone.replace(/^\+254/, '254').replace(/^0/, '254');
  if (/^2547\d{8}$/.test(normalized)) {
    return normalized;
  }
  return null;
}

// POST /api/mpesa/stk-push - Initiate M-PESA STK Push
router.post('/stk-push', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({ error: 'Order ID and phone number are required' });
    }

    // Validate phone
    const normalizedPhone = validateKenyanPhone(phoneNumber);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Invalid Kenyan phone number. Use format: 07XXXXXXXX or 2547XXXXXXXX' });
    }

    // Find order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be paid
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: `Order cannot be paid. Current status: ${order.paymentStatus}` });
    }

    // Check if there's already a pending transaction
    const existingTransaction = await TransactionModel.findOne({
      orderId: order._id,
      status: 'pending',
      paymentMethod: 'mpesa'
    });

    if (existingTransaction) {
      return res.status(400).json({
        error: 'Payment already in progress',
        checkoutRequestId: existingTransaction.transactionId
      });
    }

    // Get M-PESA token
    const token = await getMpesaToken();
    const { password, timestamp } = generateMpesaPassword();

    // Prepare STK Push request
    const stkPushRequest = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(order.total),
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${process.env.BASE_URL || 'http://localhost:4000'}/api/mpesa/callback`,
      AccountReference: order.orderNumber,
      TransactionDesc: `Payment for ${order.orderNumber}`
    };

    // Make STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const { CheckoutRequestID, ResponseCode, ResponseDescription } = response.data;

    if (ResponseCode !== '0') {
      throw new Error(`STK Push failed: ${ResponseDescription}`);
    }

    // Create transaction record
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
      notes: `STK Push initiated to ${normalizedPhone}`
    });

    await transaction.save();

    res.json({
      success: true,
      checkoutRequestId: CheckoutRequestID,
      message: 'STK Push initiated. Check your phone for M-PESA PIN prompt.',
      phoneNumber: normalizedPhone
    });

  } catch (error: any) {
    console.error('STK Push error:', error);
    
    // Handle specific errors
    if (error.response?.data) {
      return res.status(400).json({
        error: 'M-PESA service error',
        details: error.response.data.errorMessage || error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to initiate STK Push',
      message: error.message
    });
  }
});

// POST /api/mpesa/callback - M-PESA Callback (Webhook)
router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('M-PESA Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure');
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback data' });
    }

    const stkCallback = Body.stkCallback;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Find transaction
    const transaction = await TransactionModel.findOne({ transactionId: CheckoutRequestID });
    
    if (!transaction) {
      console.error(`Transaction not found: ${CheckoutRequestID}`);
      return res.status(404).json({ ResultCode: 1, ResultDesc: 'Transaction not found' });
    }

    // Find associated order
    const order = await OrderModel.findById(transaction.orderId);
    if (!order) {
      console.error(`Order not found for transaction: ${transaction.orderId}`);
      return res.status(404).json({ ResultCode: 1, ResultDesc: 'Order not found' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      
      const mpesaReceipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const phone = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value;

      // Update transaction
      transaction.status = 'completed';
      if (mpesaReceipt) {
        transaction.mpesaReceipt = mpesaReceipt;
        transaction.notes = `Payment completed. Receipt: ${mpesaReceipt}`;
      } else {
        transaction.notes = 'Payment completed (receipt unavailable)';
      }
      await transaction.save();

      // Update order
      order.paymentStatus = 'completed';
      order.status = 'processing'; // Order ready for fulfillment
      order.paymentDetails = {
        transactionId: CheckoutRequestID,
        mpesaReceipt: mpesaReceipt || '',
        paidAt: new Date(),
        phoneNumber: phone || ''
      };
      await order.save();

      // Send confirmation email (don't await)
    const customerEmail = transaction.guestEmail || order.shippingAddress.email;
    if (customerEmail) {
      sendPaymentConfirmation({
        email: customerEmail,
        customerName: transaction.customerName,
        orderNumber: order.orderNumber,
        amount: transaction.amount,
        transactionId: mpesaReceipt || CheckoutRequestID || 'N/A',
        paymentMethod: 'M-PESA',
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        }))
      }).catch(err => console.error('Failed to send payment confirmation:', err));
    }

      console.log(`Payment successful: ${mpesaReceipt || CheckoutRequestID} for order ${order.orderNumber}`); 

    } else {
      // Payment failed
      transaction.status = 'failed';
      transaction.notes = `Payment failed: ${ResultDesc}`;
      await transaction.save();

      order.paymentStatus = 'failed';
      await order.save();

      // Send failure notification
const customerEmail = transaction.guestEmail || order.shippingAddress.email;
if (customerEmail) {
  sendPaymentFailedNotification({
    email: customerEmail,
    customerName: transaction.customerName,
    orderNumber: order.orderNumber,
    amount: transaction.amount,
    reason: ResultDesc
  }).catch(err => console.error('Failed to send payment failure notification:', err));
}

      console.error(`Payment failed for order ${order.orderNumber}: ${ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error: any) {
    console.error('M-PESA callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Callback processing failed' });
  }
});

// POST /api/mpesa/query - Query STK Push status
router.post('/query', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'CheckoutRequestID is required' });
    }

    // Find transaction
    const transaction = await TransactionModel.findOne({ transactionId: checkoutRequestId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get M-PESA token
    const token = await getMpesaToken();
    const { password, timestamp } = generateMpesaPassword();

    // Query status
    const queryRequest = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      queryRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const { ResultCode, ResultDesc } = response.data;

    res.json({
      checkoutRequestId,
      status: transaction.status,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        mpesaReceipt: transaction.mpesaReceipt,
        createdAt: transaction.createdAt
      }
    });

  } catch (error: any) {
    console.error('STK Query error:', error);
    res.status(500).json({ error: 'Failed to query payment status' });
  }
});

export default router;