import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { initGridFS } from './config/gridfs'; 
import { auditContextMiddleware, autoAuditMiddleware, createAuditLog } from './middleware/auditMiddleware';
import authMiddleware from './middleware/auth'; 

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

dotenv.config();

// Connect to DB and initialize GridFS
connectDB().then(() => {
  initGridFS(); 
  console.log('✅ GridFS initialized');
}).catch((error) => {
  console.error('Failed to initialize GridFS:', error);
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware); 
// Apply audit middleware (corrected)
app.use(auditContextMiddleware); // This adds requestId and startTime
app.use(autoAuditMiddleware({ 
  excludePaths: ['/health', '/metrics', '/api/company/logo/', '/api/company/favicon/'],
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

// Health check (excluded from audit)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});