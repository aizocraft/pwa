// src/routes/contact.routes.ts
import { Router, Request, Response } from 'express';
import { Contact } from '../models/Contact';
import authMiddleware from '../middleware/auth';
import { createNotification, NOTIFICATION_TEMPLATES } from '../services/notification.service';
import User from '../models/User';

const router = Router();

// Helper function to get client IP
const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
};

// ==================== PUBLIC ROUTES ====================

// Submit contact form (public) - WITH ADMIN NOTIFICATION
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, subject, message are required' 
      });
    }

    // Check if either email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'Either email or phone number is required' 
      });
    }

    // Basic spam detection
    const spamKeywords = ['viagra', 'casino', 'lottery', 'prize'];
    const isSpam = spamKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || 
      subject.toLowerCase().includes(keyword)
    );

    // Create contact message
    const contact = new Contact({
      name,
      email: email || undefined,
      phone: phone || undefined,
      subject,
      message,
      status: isSpam ? 'spam' : 'pending',
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req)
    });

    await contact.save();

    // ✅ NOTIFICATION: Send to all admins when new contact message received (not spam)
    if (!isSpam) {
      try {
        const adminUsers = await User.find({ role: 'admin', isActive: true });
        
        if (adminUsers.length > 0) {
          const notificationPromises = adminUsers.map(admin => 
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: '📬 New Contact Message',
              message: `${name} submitted a contact message: "${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}"`,
              actionUrl: `/dashboard/contact/${contact._id}`,
              metadata: {
                contactId: contact._id.toString(),
                name,
                email: email || null,
                phone: phone || null,
                subject,
                message: message.substring(0, 200),
                submittedAt: new Date().toISOString(),
                ipAddress: getClientIp(req)
              }
            })
          );
          
          await Promise.all(notificationPromises);
          console.log(`✅ Contact notification sent to ${adminUsers.length} admin(s)`);
        }
      } catch (notificationErr) {
        console.error('Failed to send contact notification to admins:', notificationErr);
        // Don't block the response if notification fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send message' 
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all contact messages (admin only)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [messages, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch messages' 
    });
  }
});

// Get single contact message (admin only) - with notification when marked as replied
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read if it was pending
    if (message.status === 'pending') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Fetch message error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch message' 
    });
  }
});

// Update message status (admin only) - with notification
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, notes } = req.body;
    if (!status || !['pending', 'read', 'replied', 'spam'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (status === 'replied') {
      updateData.repliedAt = new Date();
      updateData.repliedBy = user.email || user.name;
    }
    if (notes) updateData.notes = notes;

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // ✅ NOTIFICATION: When admin replies, notify other admins (optional)
    if (status === 'replied') {
      try {
        const otherAdmins = await User.find({ 
          role: 'admin', 
          isActive: true,
          _id: { $ne: user.userId } // Exclude the replying admin
        });
        
        if (otherAdmins.length > 0) {
          const notificationPromises = otherAdmins.map(admin =>
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: '✅ Contact Message Replied',
              message: `${user.email || user.name} replied to ${message.name}'s message: "${message.subject}"`,
              actionUrl: `/dashboard/contact/${message._id}`,
              metadata: {
                contactId: message._id.toString(),
                repliedBy: user.email || user.name,
                repliedAt: new Date().toISOString(),
                subject: message.subject
              }
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notificationErr) {
        console.error('Failed to send reply notification to admins:', notificationErr);
      }
    }

    res.json({
      success: true,
      message: 'Message status updated',
      data: message
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update status' 
    });
  }
});

// Delete message (admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete message' 
    });
  }
});

// Get stats (admin only)
router.get('/stats/overview', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [total, pending, read, replied, spam] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ status: 'read' }),
      Contact.countDocuments({ status: 'replied' }),
      Contact.countDocuments({ status: 'spam' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        read,
        replied,
        spam,
        responseRate: total > 0 ? ((replied / total) * 100).toFixed(1) : '0'
      }
    });
  } catch (error: any) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch statistics' 
    });
  }
});

export default router;