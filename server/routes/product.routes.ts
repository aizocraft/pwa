// src/server/routes/productRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ProductModel, { IProduct, Image } from '../models/Product';
import { getGridFSBucket } from '../config/gridfs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';

function productRoutes(productModel: typeof ProductModel) {
  const router = Router();

  // Helper: Check if user is admin
  const isAdmin = (req: Request): boolean => (req as any).user?.role === 'admin';

  // Multer config for product images
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG'));
      }
    }
  });

  // Get all products with filters, search, pagination, sorting
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        category,
        q: search,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '12',
        featured,
        minPrice,
        maxPrice,
        minRating,
        tags
      } = req.query;

      const query: any = {};

      // Category filter
      if (category) query.category = category;
      // Featured filter
      if (featured === 'true') query.featured = true;
      // Tags filter (any match)
      if (tags) query.tags = { $in: (tags as string).split(',') };
      // Price range - now works with numbers directly
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }
      // Rating filter
      if (minRating) query.rating = { $gte: Number(minRating) };

      // Search across name, description, tags
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [(search as string).toLowerCase()] } }
        ];
      }

const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sortObj: any = {};
      sortObj[sort as string] = order === 'desc' ? -1 : 1;

      const [products, total] = await Promise.all([
        ProductModel.find(query)
          .sort(sortObj)
          .limit(limitNum)
          .skip(skip),
        ProductModel.countDocuments(query)
      ]);

      const productsWithUrls = products.map(p => p.toObject());

      res.json({
        products: productsWithUrls,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  });


// Get all unique brands
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const brands = await ProductModel.distinct('brand');
    const validBrands = brands.filter(brand => brand && brand !== '');
    res.json(validBrands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching brands' });
  }
});
  // Get single product by slug
  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const product = await ProductModel.findOne({ slug }).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // Price is already a number
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product' });
    }
  });

  // Create product
  router.post('/', async (req: Request, res: Response) => {
    try {
      const productData = { ...req.body };
      
      // Ensure price is a number
      if (productData.price) {
        productData.price = typeof productData.price === 'string' 
          ? parseFloat(productData.price) 
          : Number(productData.price);
      }
      
      const product = new ProductModel(productData);
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error creating product' });
    }
  });

  // Update product
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Ensure price is a number if it exists in the update
      if (updateData.price !== undefined) {
        updateData.price = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : Number(updateData.price);
      }
      
      const product = await ProductModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error updating product' });
    }
  });

  // Update product by slug
  router.put('/slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const updateData = { ...req.body };
      
      // Ensure price is a number if it exists in the update
      if (updateData.price !== undefined) {
        updateData.price = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : Number(updateData.price);
      }
      
      const product = await ProductModel.findOneAndUpdate(
        { slug }, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error updating product' });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Get the product first (before deletion)
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // 2. Delete all GridFS images
      const bucket = getGridFSBucket();
      for (const image of product.images) {
        if (image.type === 'gridfs' && image.fileId) {
          try {
            await bucket.delete(image.fileId);
          } catch (err) {
            console.error(`Failed to delete GridFS file ${image.fileId}:`, err);
          }
        }
      }
      
      // 3. Delete the product
      await product.deleteOne();
      
      res.json({ message: 'Product and associated images deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting product' });
    }
  });

  // POST /api/products/upload-images - Upload images for new product
  router.post('/upload-images', authMiddleware, upload.array('images', 6), async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
      if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const bucket = getGridFSBucket();
      const uploadedImages: Image[] = [];

      for (const file of req.files as any[]) {
        const filename = `product-${req.body.productSlug || 'unknown'}-${Date.now()}-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: file.mimetype,
          metadata: { 
            type: 'product-image', 
            originalName: file.originalname, 
            uploadedAt: new Date(), 
            fileSize: file.size 
          }
        });

        uploadStream.write(file.buffer);
        uploadStream.end();

        await new Promise((resolve, reject) => {
          uploadStream.on('finish', () => resolve(uploadStream.id));
          uploadStream.on('error', reject);
        });

        uploadedImages.push({
          type: 'gridfs',
          fileId: uploadStream.id,
          filename,
          mimeType: file.mimetype
        });
      }

      res.json({ success: true, images: uploadedImages });
    } catch (error: any) {
      console.error('Upload images error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  });

  // POST /api/products/:id/upload-images - Add images to existing product
  router.post('/:id/upload-images', authMiddleware, upload.array('images', 6), async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
      if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const product = await ProductModel.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const bucket = getGridFSBucket();
      const newImages: Image[] = [];

      for (const file of req.files as any[]) {
        const filename = `product-${product.slug}-${Date.now()}-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: file.mimetype,
          metadata: { 
            type: 'product-image', 
            productId: product._id,
            originalName: file.originalname, 
            uploadedAt: new Date(), 
            fileSize: file.size 
          }
        });

        uploadStream.write(file.buffer);
        uploadStream.end();

        const fileId = await new Promise<mongoose.Types.ObjectId>((resolve, reject) => {
          uploadStream.on('finish', () => resolve(uploadStream.id));
          uploadStream.on('error', reject);
        });

        newImages.push({
          type: 'gridfs',
          fileId,
          filename,
          mimeType: file.mimetype
        });
      }

      product.images.push(...newImages);
      await product.save();

      res.json({ 
        success: true, 
        message: 'Images added successfully', 
        newImages,
        totalImages: product.images.length 
      });
    } catch (error: any) {
      console.error('Add images error:', error);
      res.status(500).json({ error: 'Failed to add images' });
    }
  });

  // DELETE /api/products/:id/images/:index - Delete specific image
  router.delete('/:id/images/:index', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

      const product = await ProductModel.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const index = parseInt(req.params.index);
      if (isNaN(index) || index < 0 || index >= product.images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
      }

      const image = product.images[index];
      if (image.type === 'gridfs' && image.fileId) {
        const bucket = getGridFSBucket();
        await bucket.delete(image.fileId);
      }

      product.images.splice(index, 1);
      await product.save();

      res.json({ success: true, message: 'Image deleted successfully', remaining: product.images.length });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });

  // GET /api/products/image/:fileId - Serve GridFS image
  router.get('/image/:fileId', async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ error: 'Invalid file ID' });
      }

      const bucket = getGridFSBucket();
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

      downloadStream.on('error', () => {
        res.status(404).json({ error: 'Image not found' });
      });

      downloadStream.pipe(res);
    } catch (error) {
      console.error('Serve image error:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  return router;
}

export default productRoutes;
