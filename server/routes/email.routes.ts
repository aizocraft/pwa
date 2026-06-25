import { Router, Request, Response } from 'express';
import { 
  sendEmail, 
  sendContactEmail, 
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  EmailOptions,
  ContactEmailData,
  OrderEmailData
} from '../services/email.service';

const router = Router();

// Test route - Send simple email
router.post('/send-test', async (req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;
    
    console.log('📨 Send test email request:', { to, subject, message });
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: to, subject, message' 
      });
    }
    
    const result = await sendEmail({
      to,
      subject,
      html: `<h3>${subject}</h3><p>${message}</p>`,
      text: message
    });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error: any) {
    console.error('Test email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Contact form route (public)
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;
    
    console.log('📝 Contact form submission:', { name, email, phone, message });
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and message are required' 
      });
    }
    
    const result = await sendContactEmail({ name, email, phone, message });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Message sent successfully! We will get back to you soon.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send message' 
      });
    }
    
  } catch (error: any) {
    console.error('Contact route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send order confirmation (authenticated/admin only)
router.post('/send-order-confirmation', async (req: Request, res: Response) => {
  try {
    const { orderId, customerName, customerEmail, total, status, items } = req.body;
    
    if (!orderId || !customerName || !customerEmail || !total || !items) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required order information' 
      });
    }
    
   const result = await sendOrderConfirmation({
      orderId,
      customerName,
      customerEmail,
      subtotal: total,
      shippingCost: 0,
      discount: 0,
      tax: 0,
      total,
      status: status || 'confirmed',
      items
    });
    
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Order confirmation email sent!' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error: any) {
    console.error('Order confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send welcome email
router.post('/send-welcome', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and name are required' 
      });
    }
    
    const result = await sendWelcomeEmail(email, name);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Welcome email sent successfully!' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send welcome email' 
      });
    }
    
  } catch (error: any) {
    console.error('Welcome email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send password reset email
router.post('/send-password-reset', async (req: Request, res: Response) => {
  try {
    const { email, resetToken } = req.body;
    
    if (!email || !resetToken) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and reset token are required' 
      });
    }
    
    const result = await sendPasswordResetEmail(email, resetToken);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Password reset email sent!' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check for email service
router.get('/health', async (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    service: 'Resend',
    apiKeyConfigured: !!process.env.RESEND_API_KEY,
    fromEmailConfigured: !!process.env.RESEND_FROM_EMAIL
  });
});

export default router;