import { Router, Request, Response } from 'express';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IReview } from '../models/Review';
import { IProduct } from '../models/Product';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optionalAuth';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

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
  router.get('/admin', adminMiddleware, async (req: AuthRequest, res: Response) => {
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

      const match: any = { isApproved: true }; // Only show approved for consistency, or remove

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
  router.get('/admin/stats', adminMiddleware, async (req: AuthRequest, res: Response) => {
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

  // PATCH /api/reviews/admin/:id/status - Update review status
  router.patch('/admin/:id/status', adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
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

      // Update product rating if approved/rejected changes
      if (status === 'approved' || status === 'rejected') {
        await updateProductRating(ReviewModel, ProductModel, review.productId as any);
      }

      res.json(review);
    } catch (error: any) {
      console.error('Update review status error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // DELETE /api/reviews/admin/:id - Delete review (admin)
  router.delete('/admin/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const review = await ReviewModel.findByIdAndDelete(id);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Update product rating after deletion
      await updateProductRating(ReviewModel, ProductModel, review.productId.toString());

      res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      console.error('Delete admin review error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /api/reviews/user/:productId/has-reviewed - Check if user has reviewed
  router.get('/user/:productId/has-reviewed', authMiddleware, async (req: AuthRequest, res: Response) => {
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
  router.get('/:productId', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
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

  // POST /api/reviews - Create review
  router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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
        review: review || ''
      });

      const savedReview = await reviewData.save();
      await savedReview.populate('userId', 'name avatar');

      await updateProductRating(ReviewModel, ProductModel, productId);

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

  // PUT /api/reviews/:id - Update review
  router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid review ID' });
      }

      const reviewDoc = await ReviewModel.findOne({ _id: id, userId: req.user.userId });
      if (!reviewDoc) {
        return res.status(404).json({ error: 'Review not found or not authorized' });
      }

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        reviewDoc.rating = rating;
      }
      if (review !== undefined) reviewDoc.review = review;
      
      const updated = await reviewDoc.save();
      await updateProductRating(ReviewModel, ProductModel, reviewDoc.productId.toString());
      await updated.populate('userId', 'name avatar');
      
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

  // DELETE /api/reviews/:id - Delete review
  router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
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
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found or not authorized' });
      }

      await updateProductRating(ReviewModel, ProductModel, review.productId.toString());

      res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      console.error('Delete review error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
}

export default reviewRoutes;