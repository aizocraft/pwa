import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CompanySettings, ICompanySettings } from '../models/CompanySettings';
import { getGridFSBucket } from '../config/gridfs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
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
        logo: {
          type: 'url',
          url: DEFAULT_LOGO_URL
        },
        favicon: null
      });
    }
    res.json(settings);
  } catch (error: any) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/company - Optimized update
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

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // Don't allow logo/favicon updates through this endpoint
    delete updateData.logo;
    delete updateData.favicon;

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
    if (settings && settings.logo && settings.logo.type === 'gridfs' && settings.logo.fileId) {
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
    if (settings && settings.favicon && settings.favicon.type === 'gridfs' && settings.favicon.fileId) {
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
    
    // Delete old GridFS file if exists
    if (settings && settings.logo && settings.logo.type === 'gridfs' && settings.logo.fileId) {
      try {
        const bucket = getGridFSBucket();
        await bucket.delete(settings.logo.fileId);
        console.log('Old GridFS logo deleted');
      } catch (err) {
        console.warn('Old logo delete failed:', err);
      }
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
        favicon: null
      });
    } else {
      settings.logo = logoData;
      await settings.save();
    }
    
    console.log('Logo URL updated successfully');
    console.log('New logo:', settings.logo);
    
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
    
    // Delete old GridFS file if exists
    if (settings && settings.favicon && settings.favicon.type === 'gridfs' && settings.favicon.fileId) {
      try {
        const bucket = getGridFSBucket();
        await bucket.delete(settings.favicon.fileId);
        console.log('Old GridFS favicon deleted');
      } catch (err) {
        console.warn('Old favicon delete failed:', err);
      }
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
    console.log('New favicon:', settings.favicon);
    
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
        }
      });
    } else {
      settings.logo = {
        type: 'url',
        url: DEFAULT_LOGO_URL
      };
      await settings.save();
    }

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
        favicon: null
      });
    } else {
      settings.favicon = null;
      await settings.save();
    }

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
          favicon: null
        }
      }, 
      { new: true, upsert: true }
    ) as ICompanySettings;

    res.json({ success: true, message: 'Settings reset', data: resetSettings });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

// GET /api/company/export
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

    const settings = await CompanySettings.findOne().lean();
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

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

    res.json({ success: true, message: 'Settings imported', data: settings });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

export default router;