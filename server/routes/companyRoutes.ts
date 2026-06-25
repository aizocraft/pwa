// src/routes/companySettings.routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CompanySettings, ICompanySettings } from '../models/CompanySettings';
import { getGridFSBucket } from '../config/gridfs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';
import dotenv from 'dotenv';

dotenv.config();
const DEFAULT_LOGO_URL = process.env.DEFAULT_LOGO_URL || 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775217946/logo_upxr11.png';
const router = Router();

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, SVG'));
    }
  }
});

// Helper functions
const isAdmin = (req: Request): boolean => (req as any).user?.role === 'admin';
const logAction = (action: string, details: any) => console.log(`[Company] ${action}:`, JSON.stringify(details, null, 2));

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
      console.log(`✅ Notification sent to ${adminUsers.length} admin(s): ${title}`);
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// GET /api/company
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        slogan: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        footerText: '',
        socialLinks: [],
        taxRate: 0.16,
        logo: {
          type: 'url',
          url: DEFAULT_LOGO_URL
        },
        favicon: null,
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    }
    res.json(settings);
  } catch (error: any) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/company - Optimized update with notification
router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updateData = req.body;
    logAction('UPDATE', updateData);

    // Validation
    if (updateData.socialLinks && !Array.isArray(updateData.socialLinks)) {
      return res.status(400).json({ error: 'socialLinks must be an array' });
    }

    // Validate & sanitize theme colors (prevents bad values breaking the UI)
    const isValidHex = (v: unknown) => {
      if (typeof v !== 'string') return false;
      const s = v.trim();
      return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
    };

    const DEFAULT_LIGHT = { primary: '#000063', primaryForeground: '#ffffff', primaryMid: '#0043b3', primaryLight: '#009dff' };
    const DEFAULT_DARK = { primary: '#000063', primaryForeground: '#ffffff', primaryMid: '#0043b3', primaryLight: '#009dff' };

    if (updateData.themeColors) {
      const incoming = updateData.themeColors;
      const light = incoming?.light ?? {};
      const dark = incoming?.dark ?? {};

      const sanitizeTheme = (t: any, defaults: any) => {
        const out: any = {};
        for (const k of ['primary', 'primaryForeground', 'primaryMid', 'primaryLight'] as const) {
          out[k] = isValidHex(t?.[k]) ? t[k].trim() : defaults[k];
        }
        return out;
      };

      updateData.themeColors = {
        light: sanitizeTheme(light, DEFAULT_LIGHT),
        dark: sanitizeTheme(dark, DEFAULT_DARK)
      };
    }


    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // Don't allow logo/favicon updates through this endpoint
    delete updateData.logo;
    delete updateData.favicon;

    // Get old settings for comparison
    const oldSettings = await CompanySettings.findOne();
    
    // Atomic update with validation
    const settings = await CompanySettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    ) as ICompanySettings;

    logAction('UPDATE_SUCCESS', { id: settings._id, fields: Object.keys(updateData) });
    
    // ✅ NOTIFICATION: Company settings updated
    const changedFields = Object.keys(updateData).filter(key => 
      oldSettings && JSON.stringify(oldSettings[key as keyof ICompanySettings]) !== JSON.stringify(updateData[key])
    );
    
    if (changedFields.length > 0) {
      await notifyAdmins(
        '🏢 Company Settings Updated',
        `${(req as any).user?.email || 'Admin'} updated company settings: ${changedFields.join(', ')}`,
        '/dashboard/settings/company',
        {
          updatedBy: (req as any).user?.email || (req as any).user?.name,
          changedFields,
          oldValues: changedFields.reduce((acc, field) => {
            acc[field] = oldSettings?.[field as keyof ICompanySettings];
            return acc;
          }, {} as Record<string, any>),
          newValues: changedFields.reduce((acc, field) => {
            acc[field] = settings[field as keyof ICompanySettings];
            return acc;
          }, {} as Record<string, any>)
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    console.error('PUT error:', error);
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// POST /api/company/upload-logo
router.post('/upload-logo', authMiddleware, upload.single('logo'), async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const bucket = getGridFSBucket();
    const filename = `logo-${Date.now()}-${req.file.originalname}`;
    
    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: { type: 'logo', originalName: req.file.originalname, uploadedAt: new Date(), fileSize: req.file.size }
    });
    
    uploadStream.write(req.file.buffer);
    uploadStream.end();
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    // Get current settings
    let settings = await CompanySettings.findOne();
    
    // Delete old logo from GridFS if exists
    let oldLogoInfo = null;
    if (settings && settings.logo && settings.logo.type === 'gridfs' && settings.logo.fileId) {
      oldLogoInfo = { fileId: settings.logo.fileId, filename: settings.logo.filename };
      try { 
        await bucket.delete(settings.logo.fileId); 
        console.log('Old logo deleted from GridFS');
      } catch (err) { 
        console.warn('Old logo delete failed:', err); 
      }
    }

    // Update or create settings with new logo
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        logo: { 
          type: 'gridfs', 
          fileId: uploadStream.id, 
          filename, 
          mimeType: req.file.mimetype 
        },
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    } else {
      settings.logo = { 
        type: 'gridfs', 
        fileId: uploadStream.id, 
        filename, 
        mimeType: req.file.mimetype 
      };
      await settings.save();
    }

    // ✅ NOTIFICATION: Logo uploaded
    await notifyAdmins(
      '🖼️ Company Logo Updated',
      `${(req as any).user?.email || 'Admin'} uploaded a new company logo`,
      '/dashboard/settings/company',
      {
        action: 'upload_logo',
        uploadedBy: (req as any).user?.email || (req as any).user?.name,
        filename: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        oldLogoDeleted: !!oldLogoInfo
      }
    );

    res.json({ success: true, message: 'Logo uploaded successfully', fileId: uploadStream.id, data: settings });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// POST /api/company/upload-favicon
router.post('/upload-favicon', authMiddleware, upload.single('favicon'), async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const bucket = getGridFSBucket();
    const filename = `favicon-${Date.now()}-${req.file.originalname}`;
    
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: { type: 'favicon', originalName: req.file.originalname, uploadedAt: new Date(), fileSize: req.file.size }
    });
    
    uploadStream.write(req.file.buffer);
    uploadStream.end();
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    // Get current settings
    let settings = await CompanySettings.findOne();
    
    // Delete old favicon from GridFS if exists
    let oldFaviconInfo = null;
    if (settings && settings.favicon && settings.favicon.type === 'gridfs' && settings.favicon.fileId) {
      oldFaviconInfo = { fileId: settings.favicon.fileId, filename: settings.favicon.filename };
      try { 
        await bucket.delete(settings.favicon.fileId); 
        console.log('Old favicon deleted from GridFS');
      } catch (err) { 
        console.warn('Old favicon delete failed:', err); 
      }
    }

    // Update or create settings with new favicon
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        favicon: { 
          type: 'gridfs', 
          fileId: uploadStream.id, 
          filename, 
          mimeType: req.file.mimetype
        },
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    } else {
      settings.favicon = { 
        type: 'gridfs', 
        fileId: uploadStream.id, 
        filename, 
        mimeType: req.file.mimetype 
      };
      await settings.save();
    }

    // ✅ NOTIFICATION: Favicon uploaded
    await notifyAdmins(
      '🔖 Company Favicon Updated',
      `${(req as any).user?.email || 'Admin'} uploaded a new company favicon`,
      '/dashboard/settings/company',
      {
        action: 'upload_favicon',
        uploadedBy: (req as any).user?.email || (req as any).user?.name,
        filename: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        oldFaviconDeleted: !!oldFaviconInfo
      }
    );

    res.json({ success: true, message: 'Favicon uploaded successfully', fileId: uploadStream.id, data: settings });
  } catch (error) {
    console.error('Upload favicon error:', error);
    res.status(500).json({ error: 'Failed to upload favicon' });
  }
});

// POST /api/company/logo-url
router.post('/logo-url', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { url } = req.body;
    console.log('=== LOGO URL UPDATE ===');
    console.log('Received URL:', url);
    
    if (!url || !url.match(/^https?:\/\/.+/)) {
      return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required' });
    }

    // Get current settings
    let settings = await CompanySettings.findOne();
    let oldLogoType = null;
    
    // Delete old GridFS file if exists
    if (settings && settings.logo && settings.logo.type === 'gridfs' && settings.logo.fileId) {
      oldLogoType = 'gridfs';
      try {
        const bucket = getGridFSBucket();
        await bucket.delete(settings.logo.fileId);
        console.log('Old GridFS logo deleted');
      } catch (err) {
        console.warn('Old logo delete failed:', err);
      }
    } else if (settings?.logo?.type === 'url') {
      oldLogoType = 'url';
    }

    // Prepare the logo object
    const logoData = {
      type: 'url' as const,
      url: url
    };

    // Update or create settings
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        slogan: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        footerText: '',
        socialLinks: [],
        logo: logoData,
        favicon: null,
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    } else {
      settings.logo = logoData;
      await settings.save();
    }
    
    console.log('Logo URL updated successfully');
    
    // ✅ NOTIFICATION: Logo URL updated
    await notifyAdmins(
      '🖼️ Company Logo URL Updated',
      `${(req as any).user?.email || 'Admin'} changed the company logo URL`,
      '/dashboard/settings/company',
      {
        action: 'update_logo_url',
        updatedBy: (req as any).user?.email || (req as any).user?.name,
        newLogoUrl: url,
        oldLogoType: oldLogoType
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Logo URL updated successfully',
      data: settings 
    });
    
  } catch (error: any) {
    console.error('Logo URL update error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to set logo URL'
    });
  }
});

// POST /api/company/favicon-url
router.post('/favicon-url', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { url } = req.body;
    console.log('=== FAVICON URL UPDATE ===');
    console.log('Received URL:', url);
    
    if (!url || !url.match(/^https?:\/\/.+/)) {
      return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required' });
    }

    // Get current settings
    let settings = await CompanySettings.findOne();
    let oldFaviconType = null;
    
    // Delete old GridFS file if exists
    if (settings && settings.favicon && settings.favicon.type === 'gridfs' && settings.favicon.fileId) {
      oldFaviconType = 'gridfs';
      try {
        const bucket = getGridFSBucket();
        await bucket.delete(settings.favicon.fileId);
        console.log('Old GridFS favicon deleted');
      } catch (err) {
        console.warn('Old favicon delete failed:', err);
      }
    } else if (settings?.favicon?.type === 'url') {
      oldFaviconType = 'url';
    }

    // Prepare the favicon object
    const faviconData = {
      type: 'url' as const,
      url: url
    };

    // Update or create settings
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        slogan: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        footerText: '',
        socialLinks: [],
        logo: {
          type: 'url',
          url: DEFAULT_LOGO_URL
        },
        favicon: faviconData
      });
    } else {
      settings.favicon = faviconData;
      await settings.save();
    }
    
    console.log('Favicon URL updated successfully');
    
    // ✅ NOTIFICATION: Favicon URL updated
    await notifyAdmins(
      '🔖 Company Favicon URL Updated',
      `${(req as any).user?.email || 'Admin'} changed the company favicon URL`,
      '/dashboard/settings/company',
      {
        action: 'update_favicon_url',
        updatedBy: (req as any).user?.email || (req as any).user?.name,
        newFaviconUrl: url,
        oldFaviconType: oldFaviconType
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Favicon URL updated successfully',
      data: settings 
    });
    
  } catch (error: any) {
    console.error('Favicon URL update error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to set favicon URL'
    });
  }
});

// GET /api/company/logo/:fileId
router.get('/logo/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    
    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(404).json({ error: 'File not found' });
    });
    
    res.setHeader('Content-Type', 'image/*');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Fetch logo error:', error);
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

// GET /api/company/favicon/:fileId
router.get('/favicon/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    
    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(404).json({ error: 'File not found' });
    });
    
    res.setHeader('Content-Type', 'image/*');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Fetch favicon error:', error);
    res.status(500).json({ error: 'Failed to fetch favicon' });
  }
});

// DELETE /api/company/logo
router.delete('/logo', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    let settings = await CompanySettings.findOne();
    
    if (settings && settings.logo && settings.logo.type === 'gridfs' && settings.logo.fileId) {
      const bucket = getGridFSBucket();
      try {
        await bucket.delete(settings.logo.fileId);
        console.log('GridFS logo deleted');
      } catch (err) {
        console.warn('Failed to delete GridFS logo:', err);
      }
    }

    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        logo: {
          type: 'url',
          url: DEFAULT_LOGO_URL
        },
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    } else {
      settings.logo = {
        type: 'url',
        url: DEFAULT_LOGO_URL
      };
      await settings.save();
    }

    // ✅ NOTIFICATION: Logo reset to default
    await notifyAdmins(
      '🖼️ Company Logo Reset',
      `${(req as any).user?.email || 'Admin'} reset the company logo to default`,
      '/dashboard/settings/company',
      {
        action: 'reset_logo',
        resetBy: (req as any).user?.email || (req as any).user?.name
      }
    );

    res.json({ success: true, message: 'Logo reset to default', data: settings });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// DELETE /api/company/favicon
router.delete('/favicon', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    let settings = await CompanySettings.findOne();
    
    if (settings && settings.favicon && settings.favicon.type === 'gridfs' && settings.favicon.fileId) {
      const bucket = getGridFSBucket();
      try {
        await bucket.delete(settings.favicon.fileId);
        console.log('GridFS favicon deleted');
      } catch (err) {
        console.warn('Failed to delete GridFS favicon:', err);
      }
    }

    // Set favicon to null
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'My Company',
        favicon: null,
        themeColors: {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      });
    } else {
      settings.favicon = null;
      await settings.save();
    }

    // ✅ NOTIFICATION: Favicon deleted
    await notifyAdmins(
      '🔖 Company Favicon Deleted',
      `${(req as any).user?.email || 'Admin'} deleted the company favicon`,
      '/dashboard/settings/company',
      {
        action: 'delete_favicon',
        deletedBy: (req as any).user?.email || (req as any).user?.name
      }
    );

    res.json({ success: true, message: 'Favicon deleted', data: settings });
  } catch (error) {
    console.error('Delete favicon error:', error);
    res.status(500).json({ error: 'Failed to delete favicon' });
  }
});

// POST /api/company/reset
router.post('/reset', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    const settings = await CompanySettings.findOne();
    const bucket = getGridFSBucket();
    
    if (settings?.logo?.type === 'gridfs' && settings.logo.fileId) {
      try { await bucket.delete(settings.logo.fileId); } catch (err) {}
    }
    if (settings?.favicon?.type === 'gridfs' && settings.favicon.fileId) {
      try { await bucket.delete(settings.favicon.fileId); } catch (err) {}
    }

    const resetSettings = await CompanySettings.findOneAndUpdate(
      {}, 
      { 
        $set: {
          companyName: 'My Company',
          slogan: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          footerText: '',
          socialLinks: [],
          logo: {
            type: 'url',
            url: DEFAULT_LOGO_URL
          },
          favicon: null,
          themeColors: {
            light: {
              primary: '#000063',
              primaryForeground: '#ffffff',
              primaryMid: '#0043b3',
              primaryLight: '#009dff'
            },
            dark: {
              primary: '#000063',
              primaryForeground: '#ffffff',
              primaryMid: '#0043b3',
              primaryLight: '#009dff'
            }
          }
        }
      }, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ) as ICompanySettings;

    // ✅ NOTIFICATION: All settings reset
    await notifyAdmins(
      '🏢 Company Settings Reset',
      `${(req as any).user?.email || 'Admin'} reset all company settings to default`,
      '/dashboard/settings/company',
      {
        action: 'reset_all_settings',
        resetBy: (req as any).user?.email || (req as any).user?.name
      }
    );

    res.json({ success: true, message: 'Settings reset', data: resetSettings });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

// GET /api/company/tax-rate
router.get('/tax-rate', async (req: Request, res: Response) => {
  try {
    const settings = await CompanySettings.findOne();
    const taxRate = settings?.taxRate ?? 0.16; // Default to 16% if not set
    res.json({ taxRate });
  } catch (error: any) {
    console.error('GET tax rate error:', error);
    res.status(500).json({ error: 'Failed to fetch tax rate' });
  }
});

// PUT /api/admin/settings/tax-exempt-categories
router.put('/admin/settings/tax-exempt-categories', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { taxExemptCategories } = req.body;
    
    if (!Array.isArray(taxExemptCategories)) {
      return res.status(400).json({ error: 'taxExemptCategories must be an array' });
    }

    const oldSettings = await CompanySettings.findOne();
    const oldCategories = oldSettings?.taxExemptCategories || [];

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = new CompanySettings();
    }
    
    settings.taxExemptCategories = taxExemptCategories;
    await settings.save();
    
    // ✅ NOTIFICATION: Tax-exempt categories updated
    const added = taxExemptCategories.filter((c: string) => !oldCategories.includes(c));
    const removed = oldCategories.filter((c: string) => !taxExemptCategories.includes(c));
    
    if (added.length > 0 || removed.length > 0) {
      await notifyAdmins(
        '💰 Tax-Exempt Categories Updated',
        `${req.user.email || 'Admin'} updated tax-exempt categories. ${added.length > 0 ? `Added: ${added.join(', ')}` : ''} ${removed.length > 0 ? `Removed: ${removed.join(', ')}` : ''}`,
        '/dashboard/settings/tax',
        {
          action: 'update_tax_exempt_categories',
          updatedBy: req.user.email || req.user.name,
          addedCategories: added,
          removedCategories: removed,
          totalCategories: taxExemptCategories.length
        }
      );
    }
    
    res.json({
      success: true,
      taxExemptCategories: settings.taxExemptCategories
    });
  } catch (error: any) {
    console.error('Error updating tax-exempt categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/company/export
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    const settings = await CompanySettings.findOne().lean();
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    // ✅ NOTIFICATION: Settings exported (optional - can be commented if too noisy)
    await notifyAdmins(
      '📤 Company Settings Exported',
      `${(req as any).user?.email || 'Admin'} exported company settings`,
      '/dashboard/settings/company',
      {
        action: 'export_settings',
        exportedBy: (req as any).user?.email || (req as any).user?.name,
        exportTime: new Date().toISOString()
      }
    );

    // Destructure with proper type assertion
    const { _id, __v, createdAt, updatedAt, ...exportData } = settings as any;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=company-settings.json');
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// POST /api/company/import
router.post('/import', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    const importData = req.body;
    if (!importData.companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const { _id, __v, createdAt, updatedAt, ...cleanData } = importData;
    const settings = await CompanySettings.findOneAndUpdate(
      {}, 
      { $set: cleanData }, 
      { new: true, upsert: true }
    ) as ICompanySettings;

    // ✅ NOTIFICATION: Settings imported
    await notifyAdmins(
      '📥 Company Settings Imported',
      `${(req as any).user?.email || 'Admin'} imported company settings`,
      '/dashboard/settings/company',
      {
        action: 'import_settings',
        importedBy: (req as any).user?.email || (req as any).user?.name,
        importTime: new Date().toISOString(),
        companyName: importData.companyName
      }
    );

    res.json({ success: true, message: 'Settings imported', data: settings });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

export default router;