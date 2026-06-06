import { Router, Response, Request } from 'express';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IReview } from '../models/Review';
import { IProduct } from '../models/Product';
import authMiddleware from '../middleware/auth';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';

// Helper to send notifications to all admins
const notifyAdmins = async (title: string, message: string, actionUrl: string, metadata: any = {}) => {
  try {
    const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
    if (adminUsers.length > 0) {
      await Promise.all(adminUsers.map(admin =>
        createNotification({
          userId: admin._id.toString(),
          type: 'system',
          title,
          message,
          actionUrl,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
          }
        })
      ));
      console.log(`✅ Review notification sent to ${adminUsers.length} admin(s): ${title}`);
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

async function updateProductRating(ReviewModel: Model<IReview>, ProductModel: Model<IProduct>, productId: string) {
  const result = await ReviewModel.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (result[0]) {
    await ProductModel.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating! * 10) / 10,
    });
  }
}

function reviewRoutes(ReviewModel: Model<IReview>, ProductModel: Model<IProduct>) {
  const router = Router();

  // Admin middleware (reuse authMiddleware, assumes admin check exists)
  const adminMiddleware = authMiddleware;

  // Test route
  router.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Reviews API is working!' });
  });

  // ========== ADMIN DASHBOARD ENDPOINTS ==========
  // GET /api/reviews/admin - List all reviews with filters/pagination/search
  router.get('/admin', adminMiddleware, async (req: any, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        rating,
        search
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const match: any = { isApproved: true };

      if (status) match.status = status;
      if (rating) match.rating = parseInt(rating as string);

      const pipeline: any[] = [
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{ $project: { name: 1, email: 1 } }]
          }
        },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'productId',
            pipeline: [{ $project: { name: 1, images: { $arrayElemAt: ['$images', 0] } } }]
          }
        },
        { $unwind: { path: '$productId', preserveNullAndEmptyArrays: true } }
      ];

      if (search) {
        pipeline.unshift({
          $match: {
            $text: { $search: search as string }
          }
        });
      }

      const [reviews, total] = await Promise.all([
        ReviewModel.aggregate(pipeline),
        ReviewModel.countDocuments(match)
      ]);

      res.json({
        data: reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get admin reviews error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // GET /api/reviews/admin/stats - Aggregate stats for dashboard
  router.get('/admin/stats', adminMiddleware, async (req: any, res: Response) => {
    try {
      const stats = await ReviewModel.aggregate([
        {
          $match: { isApproved: true }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            averageRating: { $round: ['$averageRating', 1] }
          }
        }
      ]);
      res.json(stats[0] || { total: 0, averageRating: 0 });
    } catch (error: any) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // PATCH /api/reviews/admin/:id/status - Update review status with notification
  router.patch('/admin/:id/status', adminMiddleware, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const oldReview = await ReviewModel.findById(id)
        .populate('userId', 'name email')
        .populate('productId', 'name');

      if (!oldReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const review = await ReviewModel.findByIdAndUpdate(
        id,
        { 
          status,
          isApproved: status === 'approved',
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('userId', 'name email').populate('productId', 'name images');

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (status === 'approved' || status === 'rejected') {
        await updateProductRating(ReviewModel, ProductModel, review.productId as any);
      }

      // ✅ NOTIFICATION: Review status changed
      const statusIcon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
      const productName = (review.productId as any)?.name || 'Unknown Product';
      const customerName = (review.userId as any)?.name || 'Anonymous Customer';
      const rating = review.rating;

      await notifyAdmins(
        `${statusIcon} Review ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
        `${req.user?.email || req.user?.name} ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} a ${rating}-star review for "${productName}" by ${customerName}`,
        `/dashboard/reviews/${review._id}`,
        {
          action: 'update_review_status',
          updatedBy: req.user?.email || req.user?.name,
          reviewId: review._id,
          productId: review.productId,
          productName,
          customerId: review.userId,
          customerName,
          rating,
          oldStatus: oldReview.status,
          newStatus: status,
          reviewText: review.review?.substring(0, 200)
        }
      );

      res.json(review);
    } catch (error: any) {
      console.error('Update review status error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // DELETE /api/reviews/admin/:id - Delete review (admin) with notification
  router.delete('/admin/:id', adminMiddleware, async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const review = await ReviewModel.findById(id)
        .populate('userId', 'name email')
        .populate('productId', 'name');

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const productId = review.productId.toString();
      const productName = (review.productId as any)?.name || 'Unknown Product';
      const customerName = (review.userId as any)?.name || 'Anonymous Customer';
      const rating = review.rating;

      await ReviewModel.findByIdAndDelete(id);
      await updateProductRating(ReviewModel, ProductModel, productId);

      // ✅ NOTIFICATION: Review deleted by admin
      await notifyAdmins(
        '🗑️ Review Deleted by Admin',
        `${req.user?.email || req.user?.name} deleted a ${rating}-star review for "${productName}" by ${customerName}`,
        `/dashboard/reviews`,
        {
          action: 'delete_review_admin',
          deletedBy: req.user?.email || req.user?.name,
          reviewId: id,
          productId,
          productName,
          customerId: review.userId,
          customerName,
          rating,
          reviewText: review.review?.substring(0, 200),
          deletedAt: new Date().toISOString()
        }
      );

      res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      console.error('Delete admin review error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /api/reviews/user/:productId/has-reviewed - Check if user has reviewed
  router.get('/user/:productId/has-reviewed', authMiddleware, async (req: any, res: Response) => {
    try {
      const { productId } = req.params;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const review = await ReviewModel.findOne({ 
        productId, 
        userId: req.user.userId 
      });
      
      res.json({ 
        hasReviewed: !!review,
        reviewId: review?._id 
      });
    } catch (error: any) {
      console.error('Check user review error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // GET /api/reviews/:productId/stats - Get review stats
  router.get('/:productId/stats', async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const stats = await ReviewModel.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
      
      res.json(stats[0] || { averageRating: 0, totalReviews: 0 });
    } catch (error: any) {
      console.error('Get review stats error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // GET /api/reviews/:productId - Get product reviews with pagination
  router.get('/:productId', async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const [reviews, total, avgStats] = await Promise.all([
        ReviewModel.find({ productId, isApproved: true })
          .populate('userId', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ReviewModel.countDocuments({ productId, isApproved: true }),
        ReviewModel.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ])
      ]);

      res.json({
        reviews: reviews.map((r: any) => ({
          ...r,
          id: r._id,
          user: r.userId
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: avgStats[0] || { averageRating: 0, totalReviews: 0 }
      });
    } catch (error: any) {
      console.error('Get reviews error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // POST /api/reviews - Create review with admin notification
  router.post('/', authMiddleware, async (req: any, res: Response) => {
    try {
      const { productId, rating, review } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const existing = await ReviewModel.findOne({ 
        productId, 
        userId: req.user.userId 
      });
      if (existing) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const reviewData = new ReviewModel({
        productId,
        userId: req.user.userId,
        rating,
        review: review || '',
        status: 'pending',
        isApproved: false
      });

      const savedReview = await reviewData.save();
      await savedReview.populate('userId', 'name avatar');

      // ✅ NOTIFICATION: New review created (needs admin approval)
      const ratingIcon = rating <= 2 ? '⚠️' : rating === 3 ? '📝' : '⭐';
      await notifyAdmins(
        `${ratingIcon} New Review Awaiting Approval`,
        `${req.user.name || req.user.email} left a ${rating}-star review for "${product.name}". Status: PENDING APPROVAL`,
        `/dashboard/reviews/${savedReview._id}`,
        {
          action: 'create_review',
          reviewId: savedReview._id,
          productId,
          productName: product.name,
          customerId: req.user.userId,
          customerName: req.user.name || req.user.email,
          rating,
          reviewText: (review || '').substring(0, 500),
          status: 'pending',
          requiresApproval: true
        }
      );

      res.status(201).json({
        id: savedReview._id,
        ...savedReview.toObject(),
        user: savedReview.userId
      });
    } catch (error: any) {
      console.error('Create review error:', error);
      res.status(400).json({ error: error.message || 'Invalid data' });
    }
  });

  // PUT /api/reviews/:id - Update review (user updates their own review)
  router.put('/:id', authMiddleware, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const reviewDoc = await ReviewModel.findOne({ _id: id, userId: req.user.userId })
        .populate('productId', 'name');

      if (!reviewDoc) {
        return res.status(404).json({ error: 'Review not found or not authorized' });
      }

      const oldRating = reviewDoc.rating;
      const oldReviewText = reviewDoc.review;
      const productName = (reviewDoc.productId as any)?.name || 'Unknown Product';

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        reviewDoc.rating = rating;
      }
      if (review !== undefined) reviewDoc.review = review;
      
      // Reset to pending approval when edited
      reviewDoc.status = 'pending';
      reviewDoc.isApproved = false;
      
      const updated = await reviewDoc.save();
      await updateProductRating(ReviewModel, ProductModel, reviewDoc.productId.toString());
      await updated.populate('userId', 'name avatar');

      // ✅ NOTIFICATION: Review updated (needs re-approval)
      await notifyAdmins(
        '✏️ Review Updated - Needs Re-approval',
        `${req.user.name || req.user.email} updated their ${oldRating}→${rating}-star review for "${productName}". Status: PENDING RE-APPROVAL`,
        `/dashboard/reviews/${updated._id}`,
        {
          action: 'update_review',
          reviewId: updated._id,
          productId: reviewDoc.productId,
          productName,
          customerId: req.user.userId,
          customerName: req.user.name || req.user.email,
          oldRating,
          newRating: rating,
          oldReviewText: oldReviewText?.substring(0, 200),
          newReviewText: (review || '').substring(0, 200),
          status: 'pending'
        }
      );

      res.json({
        id: updated._id,
        ...updated.toObject(),
        user: updated.userId
      });
    } catch (error: any) {
      console.error('Update review error:', error);
      res.status(400).json({ error: error.message || 'Update failed' });
    }
  });

  // DELETE /api/reviews/:id - Delete review (user deletes their own review)
  router.delete('/:id', authMiddleware, async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const review = await ReviewModel.findOneAndDelete({ 
        _id: id, 
        userId: req.user.userId 
      }).populate('productId', 'name');

      if (!review) {
        return res.status(404).json({ error: 'Review not found or not authorized' });
      }

      const productId = review.productId.toString();
      const productName = (review.productId as any)?.name || 'Unknown Product';
      const rating = review.rating;

      await updateProductRating(ReviewModel, ProductModel, productId);

      // ✅ NOTIFICATION: Review deleted by user (notify admins)
      await notifyAdmins(
        '🗑️ Review Deleted by Customer',
        `${req.user.name || req.user.email} deleted their ${rating}-star review for "${productName}"`,
        `/dashboard/reviews`,
        {
          action: 'delete_review_user',
          deletedBy: req.user.name || req.user.email,
          reviewId: id,
          productId,
          productName,
          customerId: req.user.userId,
          customerName: req.user.name || req.user.email,
          rating,
          reviewText: review.review?.substring(0, 200),
          deletedAt: new Date().toISOString()
        }
      );

      res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      console.error('Delete review error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
}

export default reviewRoutes;