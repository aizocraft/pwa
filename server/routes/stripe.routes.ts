import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import TransactionModel from '../models/Transaction';
import OrderModel from '../models/Order';
import UserModel from '../models/User';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optionalAuth';
import { sendPaymentConfirmation, sendPaymentFailedNotification } from '../services/email.service';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
  typescript: true
});

// POST /api/stripe/create-payment-intent
router.post('/create-payment-intent', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { orderId, successUrl, cancelUrl } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Find order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    
    if (order.paymentStatus !== 'unpaid') {
      return res.status(400).json({ error: `Order cannot be paid. Current status: ${order.paymentStatus}` });
    }

    // Check for existing pending payment intent
    const existingTransaction = await TransactionModel.findOne({
      orderId: order._id,
      status: 'pending',
      paymentMethod: 'card'
    });

    if (existingTransaction) {
      // Retrieve existing payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(existingTransaction.transactionId);
      
      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        successUrl,
        cancelUrl
      });
    }

    // Create customer if user is authenticated
    let customerId: string | undefined;
    if (req.user?.userId) {
      const user = await UserModel.findById(req.user.userId);
      if (user?.stripeCustomerId) {
        customerId = user.stripeCustomerId;
      } else if (user?.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: req.user.userId }
        });
        customerId = customer.id;
        // Save customer ID to user
        await UserModel.findByIdAndUpdate(req.user.userId, { stripeCustomerId: customerId });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'kes',
      customer: customerId,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user?.userId || 'guest'
      },
      receipt_email: order.guestInfo?.email || order.shippingAddress.email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      ...(successUrl && cancelUrl ? {
        redirect: {
          return_url: successUrl
        }
      } : {})
    });

    // Create transaction record
    const transaction = new TransactionModel({
      orderId: order._id,
      userId: req.user?.userId,
      guestEmail: order.guestInfo?.email,
      guestPhone: order.guestInfo?.phone,
      customerName: order.shippingAddress.fullName,
      amount: order.total,
      currency: 'KES',
      paymentMethod: 'card',
      status: 'pending',
      transactionId: paymentIntent.id,
      notes: `Payment intent created for order ${order.orderNumber}`
    });

    await transaction.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      successUrl,
      cancelUrl
    });

  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

// POST /api/stripe/webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret missing' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper: Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.id;
  const orderId = paymentIntent.metadata.orderId;

  // Find transaction
  const transaction = await TransactionModel.findOne({ transactionId });
  
  if (!transaction) {
    console.error(`Transaction not found: ${transactionId}`);
    return;
  }

  // Prevent duplicate processing
  if (transaction.status === 'completed') {
    console.log(`Transaction ${transactionId} already completed`);
    return;
  }

  // Get card details
  let cardLast4: string | undefined;
  let cardBrand: string | undefined;

  if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
    const paymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod;
    if (paymentMethod.card) {
      cardLast4 = paymentMethod.card.last4;
      cardBrand = paymentMethod.card.brand;
    }
  }

  // Update transaction
  transaction.status = 'completed';
  transaction.cardLast4 = cardLast4;
  transaction.cardBrand = cardBrand;
  transaction.notes = `Payment completed via Stripe. Payment Intent: ${paymentIntent.id}`;
  await transaction.save();

  // Find and update order
  const order = await OrderModel.findById(orderId);
  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }

  order.paymentStatus = 'paid';
  order.status = 'processing';
  order.paymentDetails = {
    transactionId: paymentIntent.id,
    cardLast4,
    cardBrand,
    paidAt: new Date()
  };
  order.stripeId = paymentIntent.id;
  await order.save();

  // Send confirmation email
  const customerEmail = transaction.guestEmail || order.shippingAddress.email;
  if (customerEmail) {
    sendPaymentConfirmation({
      email: customerEmail,
      customerName: transaction.customerName,
      orderNumber: order.orderNumber,
      amount: transaction.amount,
      transactionId: paymentIntent.id,
      paymentMethod: `Card (${cardBrand || 'Card'} ending in ${cardLast4 || '****'})`,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.sellingPrice
      }))
    }).catch(err => console.error('Failed to send payment confirmation:', err));
  }

  console.log(`Payment succeeded: ${paymentIntent.id} for order ${order.orderNumber}`);
}

// Helper: Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.id;
  const orderId = paymentIntent.metadata.orderId;

  const transaction = await TransactionModel.findOne({ transactionId });
  
  if (transaction && transaction.status === 'pending') {
    transaction.status = 'failed';
    transaction.notes = `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`;
    await transaction.save();

    const order = await OrderModel.findById(orderId);
    if (order) {
      
      order.paymentStatus = 'unpaid';
      await order.save();

      // Send failure notification
      const customerEmail = transaction.guestEmail || order.shippingAddress.email;
      if (customerEmail) {
        sendPaymentFailedNotification({
          email: customerEmail,
          customerName: transaction.customerName,
          orderNumber: order.orderNumber,
          amount: transaction.amount,
          reason: paymentIntent.last_payment_error?.message || 'Payment failed'
        }).catch(err => console.error('Failed to send failure notification:', err));
      }
    }

    console.error(`Payment failed: ${transactionId}`);
  }
}

// Helper: Handle canceled payment
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.id;

  const transaction = await TransactionModel.findOne({ transactionId });
  
  if (transaction && transaction.status === 'pending') {
    transaction.status = 'failed';
    transaction.notes = 'Payment was canceled by customer';
    await transaction.save();

    const order = await OrderModel.findById(transaction.orderId);
    if (order && order.paymentStatus === 'unpaid') { // FIXED: Use 'unpaid' instead of 'pending'
      order.paymentStatus = 'unpaid';
      await order.save();
    }

    console.log(`Payment canceled: ${transactionId}`);
  }
}

// GET /api/stripe/payment-status/:paymentIntentId
router.get('/payment-status/:paymentIntentId', optionalAuthMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    const transaction = await TransactionModel.findOne({ transactionId: paymentIntentId })
      .populate('orderId', 'orderNumber total status');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      status: transaction.status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      cardLast4: transaction.cardLast4,
      cardBrand: transaction.cardBrand,
      createdAt: transaction.createdAt,
      order: transaction.orderId
    });

  } catch (error: any) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

export default router;