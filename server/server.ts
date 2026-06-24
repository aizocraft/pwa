import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/db';
import { initGridFS } from './config/gridfs'; 
import { auditContextMiddleware, autoAuditMiddleware, createAuditLog } from './middleware/auditMiddleware';
import { configurePassport } from './config/passport';

import ProductModel from './models/Product';
import ReviewModel from './models/Review';
import productRoutes from './routes/product.routes';
import reviewRoutes from './routes/review.routes';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/categoryRoutes';
import companyRoutes from './routes/companyRoutes';
import feedbackRoutes from './routes/feedback.routes';
import contactRoutes from './routes/contact.routes';
import emailRoutes from './routes/email.routes';
import auditRoutes from './routes/audit.routes';
import healthzRoutes from './routes/healthz.routes';
import shippingRoutes from './routes/shipping.routes';
import promoRoutes from './routes/promo.routes';
import orderCalcRoutes from './routes/orderCalc.routes';
import transactionRoutes from './routes/transaction.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import salesRoutes from './routes/sales.routes';
import paymentRoutes from './routes/payment.routes';
import inventoryRoutes from './routes/inventory.routes';
import supplierRoutes from './routes/supplier.routes';
import profitRoutes from './routes/profit.routes';
import mpesaRoutes from './routes/mpesa.routes';


dotenv.config();

// Connect to DB and initialize GridFS
connectDB().then(() => {
  initGridFS(); 
  console.log('✅ GridFS initialized');
}).catch((error) => {
  console.error('Failed to initialize GridFS:', error);
});

const app = express();

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key_change_this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply audit middleware (retained)
app.use(auditContextMiddleware); 
app.use(autoAuditMiddleware({ 
  excludePaths: [
    '/health', 
    '/healthz', 
    '/metrics', 
    '/api/company/logo/', 
    '/api/company/favicon/',
    '/api/auth/google',
    '/api/auth/google/callback'
  ],
  includeBody: false // Don't log sensitive data
}));

// Routes
app.use('/api/categories', categoryRoutes());
app.use('/api/products', productRoutes(ProductModel));
app.use('/api/reviews', reviewRoutes(ReviewModel, ProductModel));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/order/calculate', orderCalcRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/profits', profitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/', healthzRoutes);


// Health check (excluded from audit)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    googleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💓 Healthz endpoint: http://localhost:${PORT}/healthz`);
  console.log(`🔐 Google Auth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
});