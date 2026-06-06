// src/routes/feedback.routes.ts
import { Router, Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import authMiddleware from '../middleware/auth';
import { createNotification } from '../services/notification.service';
import User from '../models/User';

const router = Router();

// Helper function to get client IP
const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
};

// ==================== PUBLIC ROUTES ====================

// Submit feedback (public) - WITH ADMIN NOTIFICATION
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, rating, category, feedback, isPublic } = req.body;

    // Validation - only rating and feedback are required
    if (!rating || !feedback) {
      return res.status(400).json({ 
        error: 'Missing required fields: rating and feedback are required' 
      });
    }

    // Create feedback (name and email are optional)
    const newFeedback = new Feedback({
      name: name || 'Anonymous',
      email: email || undefined,
      rating,
      category: category || 'product',
      feedback,
      isPublic: isPublic || false,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req)
    });

    await newFeedback.save();

    // ✅ NOTIFICATION: Send to all admins for low ratings (1-2 stars) or all feedback
    try {
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      
      if (adminUsers.length > 0) {
        const ratingIcon = rating <= 2 ? '⚠️' : rating === 3 ? '📝' : '⭐';
        const priority = rating <= 2 ? 'URGENT - ' : '';
        
        const notificationPromises = adminUsers.map(admin => 
          createNotification({
            userId: admin._id.toString(),
            type: 'system',
            title: `${ratingIcon} ${priority}New ${rating}-Star Feedback`,
            message: `${name || 'Anonymous'} rated ${rating}/5: "${feedback.substring(0, 80)}${feedback.length > 80 ? '...' : ''}"`,
            actionUrl: `/dashboard/feedback/${newFeedback._id}`,
            metadata: {
              feedbackId: newFeedback._id.toString(),
              name: name || 'Anonymous',
              email: email || null,
              rating,
              category,
              feedback: feedback.substring(0, 500),
              isPublic,
              submittedAt: new Date().toISOString(),
              ipAddress: getClientIp(req)
            }
          })
        );
        
        await Promise.all(notificationPromises);
        console.log(`✅ Feedback notification sent to ${adminUsers.length} admin(s)`);
      }
    } catch (notificationErr) {
      console.error('Failed to send feedback notification to admins:', notificationErr);
      // Don't block the response if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        id: newFeedback._id,
        rating: newFeedback.rating,
        category: newFeedback.category
      }
    });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to submit feedback' 
    });
  }
});

// Get public feedback (for testimonials)
router.get('/public', async (req: Request, res: Response) => {
  try {
    const { limit = 10, rating } = req.query;

    const query: any = { 
      isPublic: true, 
      status: { $in: ['reviewed', 'resolved'] } 
    };
    
    if (rating) {
      query.rating = parseInt(rating as string);
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .select('name rating feedback category createdAt');

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error: any) {
    console.error('Fetch public feedback error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch feedback' 
    });
  }
});

// Get average rating (public)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await Feedback.aggregate([
      { $match: { status: { $in: ['reviewed', 'resolved'] } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          ratingDistribution: 1
        }
      }
    ]);

    // Calculate rating counts
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratingDistribution) {
      stats[0].ratingDistribution.forEach((rating: number) => {
        distribution[rating as keyof typeof distribution]++;
      });
    }

    res.json({
      success: true,
      data: {
        averageRating: stats[0]?.averageRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
        distribution
      }
    });
  } catch (error: any) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch statistics' 
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all feedback (admin only)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 20, status, category, rating, search } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (rating) query.rating = parseInt(rating as string);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { feedback: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Feedback.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch feedback' 
    });
  }
});

// Get single feedback (admin only)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch feedback' 
    });
  }
});

// Update feedback status (admin only) - WITH NOTIFICATION
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // ✅ NOTIFICATION: When admin resolves feedback
    if (status === 'resolved') {
      try {
        const otherAdmins = await User.find({ 
          role: 'admin', 
          isActive: true,
          _id: { $ne: user.userId }
        });
        
        if (otherAdmins.length > 0) {
          const notificationPromises = otherAdmins.map(admin =>
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: '✅ Feedback Resolved',
              message: `${user.email || user.name} resolved feedback from ${feedback.name} (${feedback.rating}/5)`,
              actionUrl: `/dashboard/feedback/${feedback._id}`,
              metadata: {
                feedbackId: feedback._id.toString(),
                resolvedBy: user.email || user.name,
                resolvedAt: new Date().toISOString(),
                rating: feedback.rating
              }
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notificationErr) {
        console.error('Failed to send feedback resolution notification:', notificationErr);
      }
    }

    res.json({
      success: true,
      message: 'Feedback status updated',
      data: feedback
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update status' 
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete feedback' 
    });
  }
});

export default router;