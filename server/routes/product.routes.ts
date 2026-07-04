// src/server/routes/productRoutes.ts
/**
 * Product Routes
 * 
 * Handles all product-related CRUD operations with proper route ordering:
 * 1. Static routes (no parameters)
 * 2. Slug-based routes (specific pattern)
 * 3. ID-based routes (fallback for backward compatibility)
 * 
 * Route Order Matters:
 * - Express matches routes in the order they are defined
 * - Slug routes must come before ID routes to prevent slug values 
 *   being interpreted as MongoDB ObjectIds
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ProductModel, { IProduct, Image } from '../models/Product';
import SupplierModel from '../models/Supplier';
import { getGridFSBucket } from '../config/gridfs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';
import { createNotification, NOTIFICATION_TEMPLATES } from '../services/notification.service';
import UserModel from '../models/User';

function productRoutes(productModel: typeof ProductModel) {
  const router = Router();

  // ============================================================================
  // HELPERS & UTILITIES
  // ============================================================================

  /**
   * Check if the current user has admin privileges
   */
  const isAdmin = (req: Request): boolean => (req as any).user?.role === 'admin';

  /**
   * Generate a unique SKU for a product
   * Format: {CATEGORY_PREFIX}-{SEQUENTIAL_NUMBER}
   * Example: SOL-001, BATT-002, PUMP-003
   */
  const generateSKU = async (category: string): Promise<string> => {
    const prefix = (category || 'GEN').substring(0, 3).toUpperCase();
    const finalPrefix = prefix.length < 3 ? prefix.padEnd(3, 'X') : prefix;
    
    const existingProducts = await ProductModel.find({
      sku: { $regex: `^${finalPrefix}-`, $options: 'i' }
    }).select('sku');
    
    const existingNumbers = existingProducts
      .map(p => {
        const match = p.sku.match(/\d{3}$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(num => !isNaN(num) && num > 0);
    
    let nextNumber = 1;
    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1;
    }
    
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    return `${finalPrefix}-${paddedNumber}`;
  };

  /**
   * Multer configuration for product image uploads
   * - Max file size: 5MB
   * - Allowed formats: JPEG, PNG, WebP, GIF, SVG
   */
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG'));
      }
    }
  });

  // ============================================================================
  // SECTION 1: STATIC ROUTES (No path parameters)
  // These routes have fixed paths and must be defined first
  // ============================================================================

  /**
   * GET /api/products
   * Get all products with advanced filtering, search, pagination, and sorting
   * 
   * Query Parameters:
   * - category: Filter by category
   * - q: Search term (matches name, description, tags, SKU, supplier)
   * - sort: Sort field (default: createdAt)
   * - order: Sort order (asc/desc, default: desc)
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 12, max: 100)
   * - featured: Filter featured products (true/false)
   * - minPrice/maxPrice: Price range filter
   * - minRating: Minimum rating filter
   * - tags: Comma-separated tags
   * - supplier: Filter by supplier (ID or name)
   * - minProfitMargin: Minimum profit margin percentage
   * - lowStock: Filter products with stock <= 10
   */
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
        tags,
        supplier,
        minProfitMargin,
        lowStock
      } = req.query;

      // Build filter query
      const query: any = {};

      if (category) query.category = category;
      if (featured === 'true') query.featured = true;
      if (tags) query.tags = { $in: (tags as string).split(',') };
      
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }
      
      if (minRating) query.rating = { $gte: Number(minRating) };
      
      if (supplier) {
        if (mongoose.Types.ObjectId.isValid(supplier as string)) {
          query.supplier = supplier;
        } else {
          query.supplierName = { $regex: supplier, $options: 'i' };
        }
      }
      
      if (lowStock === 'true') {
        query.stock = { $lte: 10 };
      }

      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [(search as string).toLowerCase()] } },
          { sku: { $regex: search, $options: 'i' } },
          { supplierName: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sortObj: any = {};
      sortObj[sort as string] = order === 'desc' ? -1 : 1;

      // Execute query
      let products = await ProductModel.find(query)
        .sort(sortObj)
        .limit(limitNum)
        .skip(skip)
        .populate('supplier', 'name email phone');

      const total = await ProductModel.countDocuments(query);

      // Filter by profit margin (client-side filter)
      if (minProfitMargin) {
        const marginThreshold = parseFloat(minProfitMargin as string);
        products = products.filter(p => {
          const margin = p.profitMargin || 0;
          return margin >= marginThreshold;
        });
      }

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
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  });

  /**
   * GET /api/products/brands
   * Get all unique brands from products
   * Used for filtering and autocomplete
   */
  router.get('/brands', async (req: Request, res: Response) => {
    try {
      const brands = await ProductModel.distinct('brand');
      const validBrands = brands.filter(brand => brand && brand !== '');
      res.json(validBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ error: 'Error fetching brands' });
    }
  });

  /**
   * GET /api/products/suppliers/list
   * Get all unique supplier names (Admin only)
   * Used for filtering products by supplier
   */
  router.get('/suppliers/list', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const suppliers = await ProductModel.distinct('supplierName');
      const validSuppliers = suppliers.filter(s => s && s !== '');
      res.json(validSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ error: 'Error fetching suppliers' });
    }
  });

  /**
   * GET /api/products/image/:fileId
   * Serve product images from GridFS
   */
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

  /**
   * POST /api/products/upload-images
   * Upload product images without associating with a product yet
   * Used during product creation workflow
   */
  router.post('/upload-images', authMiddleware, upload.array('images', 6), async (req: Request, res: Response) => {
    try {
      const role = (req as any).user?.role;
      if (role !== 'admin' && role !== 'sales') {
        return res.status(403).json({ error: 'Admin or sales access required' });
      }
      
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

  /**
   * GET /api/products/stats/profit-summary
   * Get profit statistics for all products (Admin only)
   * Returns average profit margin, markup, inventory value, etc.
   */
  router.get('/stats/profit-summary', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const stats = await ProductModel.aggregate([
        {
          $group: {
            _id: null,
            averageProfitMargin: { $avg: '$profitMargin' },
            averageMarkup: { $avg: '$marginPercentage' },
            totalInventoryValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
            totalPotentialProfit: { $sum: { $multiply: [{ $subtract: ['$price', '$buyingPrice'] }, '$stock'] } },
            productsWithMargin: { 
              $sum: { $cond: [{ $gt: ['$profitMargin', 0] }, 1, 0] } 
            },
            negativeMarginProducts: {
              $sum: { $cond: [{ $lt: ['$profitMargin', 0] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            averageProfitMargin: { $round: ['$averageProfitMargin', 2] },
            averageMarkup: { $round: ['$averageMarkup', 2] },
            totalInventoryValue: 1,
            totalPotentialProfit: 1,
            productsWithMargin: 1,
            negativeMarginProducts: 1
          }
        }
      ]);
      
      res.json(stats[0] || {
        averageProfitMargin: 0,
        averageMarkup: 0,
        totalInventoryValue: 0,
        totalPotentialProfit: 0,
        productsWithMargin: 0,
        negativeMarginProducts: 0
      });
    } catch (error) {
      console.error('Profit stats error:', error);
      res.status(500).json({ error: 'Error fetching profit statistics' });
    }
  });

  // ============================================================================
  // SECTION 2: SLUG-BASED ROUTES (Specific pattern: /slug/:slug)
  // These must come before ID routes to prevent slug values being treated as IDs
  // ============================================================================

  /**
   * GET /api/products/slug/:slug
   * Get a single product by its slug
   * 
   * This is the PREFERRED method for retrieving products in the frontend
   * as slugs are SEO-friendly and human-readable
   */
  router.get('/slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const product = await ProductModel.findOne({ slug })
        .populate('supplier', 'name email phone address paymentTerms')
        .lean();
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const productWithMetrics = {
        ...product,
        profitMargin: product.profitMargin,
        profitAmount: product.profitAmount,
        marginPercentage: product.marginPercentage
      };
      
      res.json(productWithMetrics);
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      res.status(500).json({ error: 'Error fetching product' });
    }
  });

  /**
   * PUT /api/products/slug/:slug
   * Update a product by its slug (Admin/Sales only)
   */
  router.put('/slug/:slug', authMiddleware, async (req: Request, res: Response) => {
    try {
      const role = (req as any).user?.role;
      if (role !== 'admin' && role !== 'sales') {
        return res.status(403).json({ error: 'Admin or sales access required' });
      }
        
      const { slug } = req.params;
      const updateData = { ...req.body };
      
      // Prevent updating immutable fields
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // Ensure price is a number
      if (updateData.price !== undefined && updateData.price !== null) {
        updateData.price = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : Number(updateData.price);
      }
      
      // Ensure buyingPrice is a number
      if (updateData.buyingPrice !== undefined && updateData.buyingPrice !== null) {
        updateData.buyingPrice = typeof updateData.buyingPrice === 'string' 
          ? parseFloat(updateData.buyingPrice) 
          : Number(updateData.buyingPrice);
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
      console.error('Update product by slug error:', error);
      res.status(400).json({ error: error.message || 'Error updating product' });
    }
  });

  // ============================================================================
  // SECTION 3: PRODUCT CREATION (POST routes)
  // These don't conflict with parameterized routes
  // ============================================================================

  /**
   * POST /api/products
   * Create a new product (Admin/Sales only)
   * 
   * Automatically:
   * - Generates a SKU if not provided
   * - Creates a slug from the product name
   * - Links to supplier if supplierId is provided
   * - Initializes buying price history
   * - Sends notifications to admins
   */
  router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
      const role = (req as any).user?.role;
      if (role !== 'admin' && role !== 'sales') {
        return res.status(403).json({ error: 'Admin or sales access required' });
      }
      
      const productData = { ...req.body };
      
      // Ensure price is a number
      if (productData.price !== undefined && productData.price !== null && productData.price !== '') {
        productData.price = typeof productData.price === 'string' 
          ? parseFloat(productData.price) 
          : Number(productData.price);
      }

      // Ensure buyingPrice is a number
      if (productData.buyingPrice !== undefined && productData.buyingPrice !== null && productData.buyingPrice !== '') {
        productData.buyingPrice = typeof productData.buyingPrice === 'string' 
          ? parseFloat(productData.buyingPrice) 
          : Number(productData.buyingPrice);
      } else {
        productData.buyingPrice = 0;
      }

      // Generate SKU if not provided
      if (!productData.sku || productData.sku.trim() === '') {
        productData.sku = await generateSKU(productData.category);
      }

      // Handle supplier reference
      if (productData.supplierId && mongoose.Types.ObjectId.isValid(productData.supplierId)) {
        const supplier = await SupplierModel.findById(productData.supplierId);
        if (supplier) {
          productData.supplier = supplier._id;
          productData.supplierName = supplier.name;
        }
        delete productData.supplierId;
      }

      // Normalize compareAtPrice
      if (productData.compareAtPrice === '' || productData.compareAtPrice === undefined || productData.compareAtPrice === null) {
        productData.compareAtPrice = null;
      } else {
        productData.compareAtPrice = typeof productData.compareAtPrice === 'string'
          ? parseFloat(productData.compareAtPrice)
          : Number(productData.compareAtPrice);

        if (productData.compareAtPrice <= productData.price) {
          productData.compareAtPrice = null;
        }
      }

      // Initialize buying price history
      if (productData.buyingPrice > 0 && req.user) {
        productData.buyingPriceHistory = [{
          price: productData.buyingPrice,
          effectiveFrom: new Date(),
          changedBy: (req.user as any).userId,
          reason: 'Initial product creation'
        }];
      }

      const product = new ProductModel(productData);
      const savedProduct = await product.save();
      
      // Update supplier's products list
      if (savedProduct.supplier) {
        await SupplierModel.findByIdAndUpdate(savedProduct.supplier, {
          $addToSet: { productsSupplied: savedProduct._id }
        });
      }
      
      // Create notification for admins
      try {
        const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
        if (adminUsers.length > 0) {
          const notificationPromises = adminUsers.map(admin => 
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: `New Product Added: ${savedProduct.name}`,
              message: `A new product "${savedProduct.name}" has been added. SKU: ${savedProduct.sku}, Price: KES ${savedProduct.price}, Cost: KES ${savedProduct.buyingPrice}`,
              actionUrl: `/dashboard/products/${savedProduct._id}`,
              metadata: {
                productId: savedProduct._id.toString(),
                productName: savedProduct.name,
                productSlug: savedProduct.slug,
                sku: savedProduct.sku,
                price: savedProduct.price,
                buyingPrice: savedProduct.buyingPrice,
                category: savedProduct.category,
                createdBy: (req.user as any)?.email || (req.user as any)?.name || 'Admin'
              }
            })
          );
          
          await Promise.all(notificationPromises);
        }
      } catch (notificationErr) {
        console.error('Failed to create product notification:', notificationErr);
      }
      
      res.status(201).json(savedProduct);
    } catch (error: any) {
      console.error('Create product error:', error);
      res.status(400).json({ error: error.message || 'Error creating product' });
    }
  });

  // ============================================================================
  // SECTION 4: ID-BASED ROUTES (/:id)
  // These must come LAST as they catch any parameter
  // They serve as fallback for backward compatibility
  // ============================================================================

  /**
   * GET /api/products/:id
   * Get a single product by its MongoDB ObjectId
   * 
   * NOTE: This is a FALLBACK method. The preferred method is using slug.
   * This is kept for backward compatibility with existing systems.
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      
      const product = await ProductModel.findById(id)
        .populate('supplier', 'name email phone address paymentTerms')
        .lean();
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const productWithMetrics = {
        ...product,
        profitMargin: product.profitMargin,
        profitAmount: product.profitAmount,
        marginPercentage: product.marginPercentage
      };
      
      res.json(productWithMetrics);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ error: 'Error fetching product' });
    }
  });

  /**
   * POST /api/products/:id/upload-images
   * Add images to an existing product (Admin only)
   * Maximum 6 images per upload
   */
  router.post('/:id/upload-images', authMiddleware, upload.array('images', 6), async (req: Request, res: Response) => {
    try {
      const role = (req as any).user?.role;
      if (role !== 'admin' && role !== 'sales') {
        return res.status(403).json({ error: 'Admin or sales access required' });
      }
      
      if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

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

  /**
   * DELETE /api/products/:id/images/:index
   * Remove a specific image from a product (Admin only)
   * Also deletes the file from GridFS
   */
  router.delete('/:id/images/:index', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

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

      res.json({ 
        success: true, 
        message: 'Image deleted successfully', 
        remaining: product.images.length 
      });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });

  /**
   * PATCH /api/products/:id/buying-price
   * Update product buying price and track history (Admin only)
   * Maintains a price history log for auditing
   */
  router.patch('/:id/buying-price', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { id } = req.params;
      const { buyingPrice, reason } = req.body;
      
      if (!buyingPrice || isNaN(parseFloat(buyingPrice))) {
        return res.status(400).json({ error: 'Valid buying price is required' });
      }
      
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const newPrice = parseFloat(buyingPrice);
      
      // Use model method if available, otherwise manual update
      if (typeof product.updateBuyingPrice === 'function') {
        await product.updateBuyingPrice(newPrice, (req.user as any).userId, reason);
      } else {
        product.buyingPriceHistory.push({
          price: newPrice,
          effectiveFrom: new Date(),
          changedBy: (req.user as any).userId,
          reason: reason || 'Manual price update'
        });
        product.buyingPrice = newPrice;
        await product.save();
      }
      
      // Create notification
      await createNotification({
        userId: (req.user as any).userId,
        type: 'system',
        title: `Buying Price Updated: ${product.name}`,
        message: `Buying price changed from KES ${product.buyingPrice} to KES ${newPrice}`,
        actionUrl: `/dashboard/products/${product._id}`,
        metadata: {
          productId: product._id.toString(),
          oldPrice: product.buyingPrice,
          newPrice: newPrice,
          reason: reason
        }
      });
      
      res.json({
        success: true,
        message: 'Buying price updated successfully',
        product: {
          _id: product._id,
          name: product.name,
          buyingPrice: product.buyingPrice,
          buyingPriceHistory: product.buyingPriceHistory
        }
      });
    } catch (error: any) {
      console.error('Update buying price error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/products/:id
   * Update a product by its ID (Admin/Sales only)
   * 
   * NOTE: This is a FALLBACK method. The preferred method is using slug.
   * This is kept for backward compatibility with existing systems.
   */
  router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      const role = (req as any).user?.role;
      if (role !== 'admin' && role !== 'sales') {
        return res.status(403).json({ error: 'Admin or sales access required' });
      }
      
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Get original product for comparison
      const originalProduct = await ProductModel.findById(id);
      if (!originalProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Ensure price is a number
      if (updateData.price !== undefined) {
        updateData.price = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : Number(updateData.price);
      }
      
      // Handle buying price changes with history tracking
      let buyingPriceChanged = false;
      if (updateData.buyingPrice !== undefined && updateData.buyingPrice !== originalProduct.buyingPrice) {
        buyingPriceChanged = true;
        updateData.buyingPrice = typeof updateData.buyingPrice === 'string'
          ? parseFloat(updateData.buyingPrice)
          : Number(updateData.buyingPrice);
        
        if (typeof originalProduct.updateBuyingPrice === 'function') {
          await originalProduct.updateBuyingPrice(
            updateData.buyingPrice,
            (req.user as any).userId,
            updateData.priceChangeReason || 'Price update via product edit'
          );
          delete updateData.buyingPrice;
        }
      }
      
      // Handle supplier reference
      if (updateData.supplierId) {
        const supplier = await SupplierModel.findById(updateData.supplierId);
        if (supplier) {
          updateData.supplier = supplier._id;
          updateData.supplierName = supplier.name;
        }
        delete updateData.supplierId;
      }
      
      // Handle compare at price
      if (updateData.compareAtPrice !== undefined) {
        if (updateData.compareAtPrice === '' || updateData.compareAtPrice === null) {
          updateData.compareAtPrice = null;
        } else {
          updateData.compareAtPrice = typeof updateData.compareAtPrice === 'string'
            ? parseFloat(updateData.compareAtPrice)
            : Number(updateData.compareAtPrice);

          const currentPrice = updateData.price !== undefined ? updateData.price : originalProduct.price;
          if (updateData.compareAtPrice <= currentPrice) {
            updateData.compareAtPrice = null;
          }
        }
      }
      
      // Perform update
      let product;
      if (buyingPriceChanged && typeof originalProduct.updateBuyingPrice === 'function') {
        product = await ProductModel.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        );
      } else {
        product = await ProductModel.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        );
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Create notifications for significant changes
      try {
        const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
        const changes: string[] = [];
        
        if (originalProduct.stock !== product.stock) {
          changes.push(`stock changed from ${originalProduct.stock} to ${product.stock}`);
          
          // Low stock alert
          if (product.stock < 10 && product.stock > 0 && adminUsers.length > 0) {
            const lowStockTemplate = NOTIFICATION_TEMPLATES.lowStock(product.name, product.stock);
            const notificationPromises = adminUsers.map(admin => 
              createNotification({
                userId: admin._id.toString(),
                type: lowStockTemplate.type,
                title: lowStockTemplate.title,
                message: lowStockTemplate.message,
                actionUrl: `/dashboard/products/${product._id}`,
                metadata: {
                  productId: product._id.toString(),
                  productName: product.name,
                  currentStock: product.stock,
                  previousStock: originalProduct.stock
                }
              })
            );
            await Promise.all(notificationPromises);
          }
        }
        
        if (originalProduct.price !== product.price) {
          changes.push(`price changed from KES ${originalProduct.price} to KES ${product.price}`);
        }
        
        if (originalProduct.buyingPrice !== product.buyingPrice) {
          changes.push(`buying price changed from KES ${originalProduct.buyingPrice} to KES ${product.buyingPrice}`);
        }
        
        if (originalProduct.supplierName !== product.supplierName) {
          changes.push(`supplier changed from ${originalProduct.supplierName || 'None'} to ${product.supplierName || 'None'}`);
        }
        
        // Send notifications if there are changes
        if (changes.length > 0 && adminUsers.length > 0) {
          const notificationPromises = adminUsers.map(admin => 
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: `Product Updated: ${product.name}`,
              message: `Product "${product.name}" was updated: ${changes.join(', ')}`,
              actionUrl: `/dashboard/products/${product._id}`,
              metadata: {
                productId: product._id.toString(),
                productName: product.name,
                changes: changes,
                updatedBy: (req.user as any)?.email || (req.user as any)?.name || 'Admin'
              }
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notificationErr) {
        console.error('Failed to create product update notification:', notificationErr);
      }
      
      res.json(product);
    } catch (error: any) {
      console.error('Update product error:', error);
      res.status(400).json({ error: error.message || 'Error updating product' });
    }
  });

  /**
   * DELETE /api/products/:id
   * Delete a product by its ID (Admin only)
   * Also removes associated images from GridFS
   * 
   * NOTE: This is a FALLBACK method. The preferred method is using slug.
   * This is kept for backward compatibility with existing systems.
   */
  router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { id } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Delete associated GridFS images
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
      
      // Delete the product
      await product.deleteOne();
      
      // Create audit log
      await createAuditLog(req as any, {
        action: 'delete',
        resource: 'product',
        resourceId: product._id.toString(),
        details: `Product deleted: ${product.name}`,
        skipIfNoUser: false
      });
      
      // Create notification for admins
      try {
        const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
        if (adminUsers.length > 0) {
          const notificationPromises = adminUsers.map(admin => 
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: `Product Deleted: ${product.name}`,
              message: `Product "${product.name}" has been deleted from the store.`,
              actionUrl: `/dashboard/products`,
              metadata: {
                productId: product._id.toString(),
                productName: product.name,
                productSlug: product.slug,
                deletedBy: (req.user as any)?.email || (req.user as any)?.name || 'Admin',
                deletedAt: new Date().toISOString()
              }
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notificationErr) {
        console.error('Failed to create product deletion notification:', notificationErr);
      }
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Error deleting product' });
    }
  });

  return router;
}

export default productRoutes;