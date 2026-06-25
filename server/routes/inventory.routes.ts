// src/routes/inventoryRoutes.ts
import { Router, Request, Response } from 'express';
import { Parser } from 'json2csv';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import ProductModel, { IProduct, Image } from '../models/Product';
import SupplierModel from '../models/Supplier';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';
import mongoose from 'mongoose';

const router = Router();

const isAdmin = (req: Request & { user?: any }): boolean => req.user?.role === 'admin';
const isSales = (req: Request & { user?: any }): boolean => req.user?.role === 'sales';
const isAdminOrSales = (req: Request & { user?: any }): boolean => isAdmin(req) || isSales(req);

// Configure multer for CSV file uploads only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload CSV file only'));
    }
  }
});

// Helper function to generate SKU
const generateSKU = async (category: string, existingSkus: string[] = []): Promise<string> => {
  const prefix = (category || 'GEN').substring(0, 3).toUpperCase();
  const finalPrefix = prefix.length < 3 ? prefix.padEnd(3, 'X') : prefix;
  
  const existingNumbers = existingSkus
    .filter(sku => sku.startsWith(`${finalPrefix}-`))
    .map(sku => {
      const match = sku.match(/\d{3}$/);
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

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to ensure unique slug
const generateUniqueSlug = async (name: string, existingSlugs: Set<string>): Promise<string> => {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Helper to validate and parse product data
const validateProductData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.name) errors.push('Product name is required');
  if (!data.price && data.price !== 0) errors.push('Price is required');
  if (data.price && isNaN(parseFloat(data.price))) errors.push('Price must be a number');
  if (data.buyingPrice && isNaN(parseFloat(data.buyingPrice))) errors.push('Buying price must be a number');
  if (data.stock && isNaN(parseInt(data.stock))) errors.push('Stock must be a number');
  
  return errors;
};

// Helper to parse CSV buffer
const parseCSVBuffer = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const readable = Readable.from(buffer.toString());
    
    readable
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper to check low stock and send notifications
const checkLowStockAndNotify = async (product: any, oldStock: number, newStock: number) => {
  const threshold = 10;
  
  // If stock crossed below threshold
  if (oldStock > threshold && newStock <= threshold && newStock > 0) {
    const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
    if (adminUsers.length > 0) {
      await Promise.all(adminUsers.map(admin =>
        createNotification({
          userId: admin._id.toString(),
          type: 'stock',
          title: `⚠️ Low Stock Alert: ${product.name}`,
          message: `${product.name} is running low. Only ${newStock} units left. Consider restocking soon.`,
          actionUrl: `/dashboard/inventory/products/${product._id}`,
          metadata: {
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            currentStock: newStock,
            threshold
          }
        })
      ));
    }
  }
  
  // If out of stock
  if (oldStock > 0 && newStock === 0) {
    const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
    if (adminUsers.length > 0) {
      await Promise.all(adminUsers.map(admin =>
        createNotification({
          userId: admin._id.toString(),
          type: 'stock',
          title: `❌ Out of Stock: ${product.name}`,
          message: `${product.name} is now out of stock. Immediate restock recommended.`,
          actionUrl: `/dashboard/inventory/products/${product._id}`,
          metadata: {
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            currentStock: 0
          }
        })
      ));
    }
  }
};

// ==================== INVENTORY ROUTES WITH NOTIFICATIONS ====================

// GET /api/inventory/summary - Inventory value summary
router.get('/summary', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const products = await ProductModel.find({}).lean();
    
    let totalStockValue = 0;
    let totalInventoryValue = 0;
    let totalPotentialProfit = 0;
    let totalUnits = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    
    const categoryMap = new Map();
    
    for (const product of products) {
      const stock = product.stock || 0;
      const price = product.price || 0;
      const buyingPrice = product.buyingPrice || 0;
      
      totalStockValue += buyingPrice * stock;
      totalInventoryValue += price * stock;
      totalPotentialProfit += (price - buyingPrice) * stock;
      totalUnits += stock;
      
      if (stock === 0) outOfStockItems++;
      if (stock > 0 && stock < 10) lowStockItems++;
      
      const category = product.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          _id: category,
          stockValue: 0,
          inventoryValue: 0,
          units: 0
        });
      }
      
      const cat = categoryMap.get(category);
      cat.stockValue += buyingPrice * stock;
      cat.inventoryValue += price * stock;
      cat.units += stock;
    }
    
    const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.stockValue - a.stockValue);

    res.json({
      summary: {
        totalStockValue,
        totalInventoryValue,
        totalPotentialProfit,
        totalUnits,
        lowStockItems,
        outOfStockItems
      },
      categoryBreakdown
    });
  } catch (error: any) {
    console.error('Inventory summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/low-stock - Get low stock products (with optional notification)
router.get('/low-stock', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const { threshold = '10', category, supplier, notify = 'false' } = req.query;
    const stockThreshold = parseInt(threshold as string);

    const query: any = { stock: { $lte: stockThreshold } };
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;

    const products = await ProductModel.find(query)
      .select('name sku category brand price buyingPrice stock supplierName')
      .sort({ stock: 1 })
      .lean();

    // Send notification if requested
    if (notify === 'true' && products.length > 0) {
      const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
      if (adminUsers.length > 0) {
        const lowStockNames = products.slice(0, 5).map(p => `${p.name} (${p.stock})`).join(', ');
        await Promise.all(adminUsers.map(admin =>
          createNotification({
            userId: admin._id.toString(),
            type: 'stock',
            title: `⚠️ Low Stock Report: ${products.length} Products`,
            message: `Products below threshold (${stockThreshold}): ${lowStockNames}${products.length > 5 ? ` and ${products.length - 5} more` : ''}`,
            actionUrl: '/dashboard/inventory/low-stock',
            metadata: {
              productCount: products.length,
              threshold: stockThreshold,
              products: products.map(p => ({ id: p._id, name: p.name, stock: p.stock }))
            }
          })
        ));
      }
    }

    res.json({
      products,
      count: products.length,
      threshold: stockThreshold
    });
  } catch (error: any) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/restock/:productId - Record restock with notification
router.post('/restock/:productId', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const { quantity, buyingPrice, reason } = req.body;
    const product = await ProductModel.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldStock = product.stock;
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    product.stock += newQuantity;

    let priceUpdated = false;
    if (buyingPrice && buyingPrice !== product.buyingPrice) {
      if (typeof product.updateBuyingPrice === 'function') {
        await product.updateBuyingPrice(buyingPrice, req.user.userId, reason || 'Restock');
        priceUpdated = true;
      } else {
        product.buyingPrice = buyingPrice;
        priceUpdated = true;
      }
    }

    await product.save();

    await createAuditLog(req as any, {
      action: 'restock',
      resource: 'product',
      resourceId: product._id.toString(),
      details: `Restocked ${newQuantity} units of ${product.name}. New stock: ${product.stock}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Notify all admins about restock
    try {
      const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
      if (adminUsers.length > 0) {
        await Promise.all(adminUsers.map(admin =>
          createNotification({
            userId: admin._id.toString(),
            type: 'stock',
            title: `📦 Product Restocked: ${product.name}`,
            message: `${product.name} restocked with +${newQuantity} units. New stock: ${product.stock}${priceUpdated ? '. Buying price updated.' : ''}`,
            actionUrl: `/dashboard/inventory/products/${product._id}`,
            metadata: {
              productId: product._id,
              productName: product.name,
              sku: product.sku,
              oldStock: oldStock,
              newStock: product.stock,
              quantityAdded: newQuantity,
              buyingPriceUpdated: priceUpdated,
              newBuyingPrice: buyingPrice || product.buyingPrice,
              restockedBy: req.user.email || req.user.name,
              reason: reason || 'Manual restock'
            }
          })
        ));
      }
    } catch (notificationErr) {
      console.error('Failed to send restock notification:', notificationErr);
    }

    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        buyingPrice: product.buyingPrice
      }
    });
  } catch (error: any) {
    console.error('Restock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== EXPORT PRODUCTS TO CSV/JSON ==========

router.get('/export', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const { format = 'csv', category, supplier, minPrice, maxPrice, search } = req.query;
    
    const query: any = {};
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await ProductModel.find(query)
      .populate('supplier', 'name email phone')
      .lean();

    const exportData = products.map(product => ({
      'Product Name': product.name,
      'SKU': product.sku,
      'Category': product.category || '',
      'Brand': product.brand || '',
      'Type': product.type || '',
      'Price (KES)': product.price,
      'Buying Price (KES)': product.buyingPrice,
      'Compare At Price (KES)': product.compareAtPrice || '',
      'Stock': product.stock,
      'Description': product.description || '',
      'Tags': Array.isArray(product.tags) ? product.tags.join(', ') : '',
      'Featured': product.featured ? 'Yes' : 'No',
      'Rating': product.rating || 0,
      'Supplier Name': product.supplierName || '',
      'Supplier Email': (product.supplier as any)?.email || '',
      'Supplier Phone': (product.supplier as any)?.phone || '',
      'Profit Margin (%)': product.price && product.buyingPrice ? (((product.price - product.buyingPrice) / product.price) * 100).toFixed(2) : 0,
      'Profit Amount (KES)': ((product.price || 0) - (product.buyingPrice || 0)).toFixed(2),
      'Created At': new Date(product.createdAt).toLocaleDateString(),
      'Last Updated': new Date(product.updatedAt).toLocaleDateString(),
      'Image URLs': product.images?.map((img: any) => img.url).filter(Boolean).join('; ') || ''
    }));

    if (exportData.length === 0) {
      return res.status(404).json({ error: 'No products found to export' });
    }

    // ✅ NOTIFICATION: Log export activity (optional - can be commented if too noisy)
    await createAuditLog(req as any, {
      action: 'export',
      resource: 'product',
      details: `Exported ${exportData.length} products to ${format}`,
      skipIfNoUser: false
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.json`);
      return res.json(exportData);
    }
    
    try {
      const json2csvParser = new Parser({ fields: Object.keys(exportData[0]) });
      const csv = json2csvParser.parse(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.csv`);
      return res.send(csv);
    } catch (csvError) {
      console.error('CSV generation error:', csvError);
      return res.status(500).json({ error: 'Failed to generate CSV file' });
    }
    
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== DOWNLOAD IMPORT TEMPLATE ==========

router.get('/export/template', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const template = [{
      'Product Name': 'Example Product',
      'SKU (Optional)': '',
      'Category': 'Electronics',
      'Brand': 'Example Brand',
      'Type': 'Premium',
      'Price (KES)': '1000',
      'Buying Price (KES)': '600',
      'Compare At Price (KES)': '1500',
      'Stock': '50',
      'Description': 'Product description here',
      'Tags': 'electronics, premium, new',
      'Featured': 'Yes',
      'Supplier Name': 'Supplier Name',
      'Image URLs': 'https://example.com/image1.jpg; https://example.com/image2.jpg'
    }];

    const json2csvParser = new Parser({ fields: Object.keys(template[0]) });
    const csv = json2csvParser.parse(template);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product_import_template.csv');
    res.send(csv);
    
  } catch (error: any) {
    console.error('Template download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BULK IMPORT PRODUCTS FROM CSV FILE ==========

router.post('/import', authMiddleware, upload.single('file'), async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a CSV file.' });
    }

    let productsData: any[] = [];
    try {
      productsData = await parseCSVBuffer(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({ error: 'Failed to parse CSV file. Please check the file format.' });
    }

    if (productsData.length === 0) {
      return res.status(400).json({ error: 'No valid data found in CSV file' });
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
      duplicates: [] as any[],
      totalProcessed: 0,
      totalImported: 0,
      totalErrors: 0,
      totalDuplicates: 0
    };

    const existingProducts = await ProductModel.find({}, 'sku name slug');
    const existingSkus = new Set(existingProducts.map(p => p.sku).filter((sku): sku is string => !!sku));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()).filter((name): name is string => !!name));
    const existingSlugs = new Set<string>(
      existingProducts.map(p => p.slug).filter((slug): slug is string => !!slug)
    );

    for (const row of productsData) {
      results.totalProcessed++;
      
      try {
        const productName = row['Product Name'];
        if (!productName) {
          results.errors.push({ row, error: 'Product name is required', productName: 'Unknown' });
          results.totalErrors++;
          continue;
        }
        
        const providedSku = row['SKU (Optional)'] || row['SKU'] || '';
        let sku = providedSku;
        
        if (sku && existingSkus.has(sku)) {
          results.duplicates.push({ row, reason: `SKU ${sku} already exists`, productName });
          results.totalDuplicates++;
          continue;
        }
        
        if (existingNames.has(productName.toLowerCase())) {
          results.duplicates.push({ row, reason: `Product name "${productName}" already exists`, productName });
          results.totalDuplicates++;
          continue;
        }
        
        if (!sku || sku.trim() === '') {
          const category = row['Category'] || 'GEN';
          const existingSkusForCategory = await ProductModel.find({
            category: category,
            sku: { $regex: `^${category.substring(0, 3).toUpperCase()}-` }
          }).select('sku');
          const skuList = existingSkusForCategory.map(p => p.sku).filter((s): s is string => !!s);
          sku = await generateSKU(category, skuList);
        }
        
        const slug = await generateUniqueSlug(productName, existingSlugs);
        existingSlugs.add(slug);
        
        const imageUrls: Image[] = [];
        if (row['Image URLs']) {
          const urls = row['Image URLs'].split(';').map((url: string) => url.trim());
          for (const url of urls) {
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
              imageUrls.push({ type: 'url', url: url });
            }
          }
        }
        
        const tags = row['Tags'] ? row['Tags'].split(',').map((tag: string) => tag.trim().toLowerCase()) : [];
        const featured = row['Featured']?.toLowerCase() === 'yes' || row['Featured']?.toLowerCase() === 'true';
        
        let supplierId = null;
        if (row['Supplier Name']) {
          let supplier = await SupplierModel.findOne({ 
            name: { $regex: new RegExp(`^${row['Supplier Name']}$`, 'i') } 
          });
          
          if (!supplier) {
            supplier = await SupplierModel.create({
              name: row['Supplier Name'],
              createdBy: req.user.userId,
              isActive: true
            });
          }
          supplierId = supplier._id;
        }
        
        const price = parseFloat(row['Price (KES)'] || 0);
        const buyingPrice = parseFloat(row['Buying Price (KES)'] || 0);
        const compareAtPrice = row['Compare At Price (KES)'] ? parseFloat(row['Compare At Price (KES)']) : null;
        const stock = parseInt(row['Stock'] || 0);
        
        const productData: any = {
          name: productName,
          slug: slug,
          sku: sku,
          category: row['Category'] || '',
          brand: row['Brand'] || '',
          type: row['Type'] || '',
          price: price,
          buyingPrice: buyingPrice,
          compareAtPrice: compareAtPrice,
          stock: stock,
          description: row['Description'] || '',
          tags: tags,
          featured: featured,
          supplierName: row['Supplier Name'] || '',
          images: imageUrls,
          buyingPriceHistory: [{
            price: buyingPrice,
            effectiveFrom: new Date(),
            changedBy: req.user.userId,
            reason: 'Initial import'
          }]
        };
        
        if (supplierId) {
          productData.supplier = supplierId;
        }
        
        const validationErrors = validateProductData(productData);
        if (validationErrors.length > 0) {
          results.errors.push({ row, errors: validationErrors, productName });
          results.totalErrors++;
          continue;
        }
        
        const product = new ProductModel(productData);
        await product.save();
        
        if (supplierId) {
          await SupplierModel.findByIdAndUpdate(supplierId, {
            $addToSet: { productsSupplied: product._id }
          });
        }
        
        results.success.push({ 
          product: product.name, 
          sku: product.sku, 
          slug: product.slug,
          _id: product._id 
        });
        results.totalImported++;
        existingSkus.add(sku);
        existingNames.add(product.name.toLowerCase());
        
      } catch (error: any) {
        console.error('Import row error:', error);
        results.errors.push({ 
          row: row, 
          error: error.message, 
          productName: row['Product Name'] || 'Unknown' 
        });
        results.totalErrors++;
      }
    }
    
    // ✅ NOTIFICATION: Bulk import completion
    try {
      const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
      if (adminUsers.length > 0) {
        await Promise.all(adminUsers.map(admin =>
          createNotification({
            userId: admin._id.toString(),
            type: 'system',
            title: `📦 Bulk Product Import Completed`,
            message: `Imported ${results.totalImported} products. ${results.totalErrors} errors, ${results.totalDuplicates} duplicates.`,
            actionUrl: '/dashboard/inventory',
            metadata: {
              totalProcessed: results.totalProcessed,
              imported: results.totalImported,
              errors: results.totalErrors,
              duplicates: results.totalDuplicates,
              importedBy: req.user.email || req.user.name,
              fileName: req.file?.originalname
            }
          })
        ));
      }
    } catch (notificationErr) {
      console.error('Failed to create import notification:', notificationErr);
    }
    
    await createAuditLog(req as any, {
      action: 'bulk_import',
      resource: 'product',
      details: `Imported ${results.totalImported} products. Processed ${results.totalProcessed} records.`,
      skipIfNoUser: false
    });
    
    res.json({
      success: true,
      message: `Import completed: ${results.totalImported} products imported, ${results.totalErrors} errors, ${results.totalDuplicates} duplicates`,
      results: {
        imported: results.totalImported,
        errors: results.totalErrors,
        duplicates: results.totalDuplicates,
        totalProcessed: results.totalProcessed,
        successList: results.success.slice(0, 10),
        errorList: results.errors.slice(0, 10),
        duplicateList: results.duplicates.slice(0, 10)
      }
    });
    
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BULK UPDATE PRODUCTS ==========

router.put('/bulk-update', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }
    
    const results = {
      success: [] as any[],
      errors: [] as any[],
      totalUpdated: 0,
      totalErrors: 0
    };
    
    const updatedProductsInfo: any[] = [];
    
    for (const update of updates) {
      try {
        const { productId, ...updateData } = update;
        
        if (!productId) {
          results.errors.push({ update, error: 'Product ID is required' });
          results.totalErrors++;
          continue;
        }
        
        const product = await ProductModel.findById(productId);
        if (!product) {
          results.errors.push({ update, error: 'Product not found' });
          results.totalErrors++;
          continue;
        }
        
        const oldStock = product.stock;
        
        if (updateData.price !== undefined) {
          updateData.price = parseFloat(updateData.price);
        }
        
        if (updateData.buyingPrice !== undefined && updateData.buyingPrice !== product.buyingPrice) {
          const newPrice = parseFloat(updateData.buyingPrice);
          if (typeof product.updateBuyingPrice === 'function') {
            await product.updateBuyingPrice(newPrice, req.user.userId, updateData.priceChangeReason || 'Bulk update');
          }
          delete updateData.buyingPrice;
        }
        
        if (updateData.stock !== undefined) {
          const newStock = parseInt(updateData.stock);
          product.stock = newStock;
          
          // Check for low stock
          await checkLowStockAndNotify(product, oldStock, newStock);
        }
        
        Object.assign(product, updateData);
        await product.save();
        
        updatedProductsInfo.push({
          id: product._id,
          name: product.name,
          sku: product.sku,
          oldStock,
          newStock: product.stock
        });
        
        results.success.push({ productId: product._id, name: product.name, sku: product.sku });
        results.totalUpdated++;
        
      } catch (error: any) {
        results.errors.push({ update, error: error.message });
        results.totalErrors++;
      }
    }
    
    // ✅ NOTIFICATION: Bulk update completion
    if (results.totalUpdated > 0) {
      try {
        const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
        if (adminUsers.length > 0) {
          await Promise.all(adminUsers.map(admin =>
            createNotification({
              userId: admin._id.toString(),
              type: 'system',
              title: `📝 Bulk Product Update Completed`,
              message: `Updated ${results.totalUpdated} products. ${results.totalErrors} errors.`,
              actionUrl: '/dashboard/inventory',
              metadata: {
                updatedCount: results.totalUpdated,
                errorCount: results.totalErrors,
                updatedBy: req.user.email || req.user.name,
                products: updatedProductsInfo.slice(0, 5)
              }
            })
          ));
        }
      } catch (notificationErr) {
        console.error('Failed to send bulk update notification:', notificationErr);
      }
    }
    
    await createAuditLog(req as any, {
      action: 'bulk_update',
      resource: 'product',
      details: `Bulk updated ${results.totalUpdated} products`,
      skipIfNoUser: false
    });
    
    res.json({
      success: true,
      message: `Updated ${results.totalUpdated} products, ${results.totalErrors} errors`,
      results
    });
    
  } catch (error: any) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BULK DELETE PRODUCTS ==========

router.delete('/bulk-delete', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }
    
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    const validIds = productIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== productIds.length) {
      return res.status(400).json({ error: 'Some product IDs are invalid' });
    }
    
    const productsToDelete = await ProductModel.find({ _id: { $in: validIds } });
    const deletedCount = productsToDelete.length;
    const deletedProductNames = productsToDelete.map(p => p.name);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'No products found to delete' });
    }
    
    await ProductModel.deleteMany({ _id: { $in: validIds } });
    
    // ✅ NOTIFICATION: Bulk delete - notify all admins except the one who deleted
    try {
      const adminUsers = await UserModel.find({ 
        role: 'admin', 
        isActive: true,
        _id: { $ne: req.user.userId }
      });
      if (adminUsers.length > 0) {
        await Promise.all(adminUsers.map(admin =>
          createNotification({
            userId: admin._id.toString(),
            type: 'system',
            title: `🗑️ Bulk Products Deleted`,
            message: `${deletedCount} products were deleted by ${req.user.email || req.user.name}: ${deletedProductNames.slice(0, 3).join(', ')}${deletedProductNames.length > 3 ? ` and ${deletedProductNames.length - 3} more` : ''}`,
            actionUrl: '/dashboard/inventory',
            metadata: {
              deletedCount,
              deletedBy: req.user.email || req.user.name,
              productIds: validIds,
              productNames: deletedProductNames
            }
          })
        ));
      }
    } catch (notificationErr) {
      console.error('Failed to send bulk delete notification:', notificationErr);
    }
    
    await createAuditLog(req as any, {
      action: 'bulk_delete',
      resource: 'product',
      details: `Bulk deleted ${deletedCount} products: ${deletedProductNames.join(', ')}`,
      skipIfNoUser: false
    });
    
    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} products`,
      deletedCount,
      deletedProducts: deletedProductNames
    });
    
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BULK ADJUST STOCK ==========

router.post('/bulk-adjust-stock', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }
    
    const { adjustments, reason } = req.body;
    
    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ error: 'Adjustments array is required' });
    }
    
    const results = {
      success: [] as any[],
      errors: [] as any[],
      totalAdjusted: 0,
      totalErrors: 0
    };
    
    const adjustedProducts: any[] = [];
    
    for (const adjustment of adjustments) {
      try {
        const { productId, quantity, operation = 'add' } = adjustment;
        
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
          results.errors.push({ adjustment, error: 'Valid product ID is required' });
          results.totalErrors++;
          continue;
        }
        
        const product = await ProductModel.findById(productId);
        if (!product) {
          results.errors.push({ adjustment, error: 'Product not found' });
          results.totalErrors++;
          continue;
        }
        
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
          results.errors.push({ adjustment, error: 'Valid quantity > 0 is required' });
          results.totalErrors++;
          continue;
        }
        
        const oldStock = product.stock;
        
        if (operation === 'add') {
          product.stock += qty;
        } else if (operation === 'set') {
          product.stock = qty;
        } else if (operation === 'subtract') {
          product.stock = Math.max(0, product.stock - qty);
        } else {
          results.errors.push({ adjustment, error: 'Operation must be "add", "subtract", or "set"' });
          results.totalErrors++;
          continue;
        }
        
        await product.save();
        
        // Check for low stock after adjustment
        await checkLowStockAndNotify(product, oldStock, product.stock);
        
        adjustedProducts.push({
          id: product._id,
          name: product.name,
          sku: product.sku,
          operation,
          oldStock,
          newStock: product.stock,
          change: product.stock - oldStock
        });
        
        await createAuditLog(req as any, {
          action: 'bulk_stock_adjustment',
          resource: 'product',
          resourceId: product._id.toString(),
          details: `Stock adjusted from ${oldStock} to ${product.stock}. Reason: ${reason || 'Bulk adjustment'}`,
          skipIfNoUser: false
        });
        
        results.success.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          oldStock,
          newStock: product.stock,
          change: product.stock - oldStock
        });
        results.totalAdjusted++;
        
      } catch (error: any) {
        results.errors.push({ adjustment, error: error.message });
        results.totalErrors++;
      }
    }
    
    // ✅ NOTIFICATION: Bulk stock adjustment completion
    if (results.totalAdjusted > 0) {
      try {
        const adminUsers = await UserModel.find({ role: 'admin', isActive: true });
        if (adminUsers.length > 0) {
          const summary = adjustedProducts.slice(0, 5).map(p => `${p.name}: ${p.oldStock} → ${p.newStock}`).join(', ');
          await Promise.all(adminUsers.map(admin =>
            createNotification({
              userId: admin._id.toString(),
              type: 'stock',
              title: `📊 Bulk Stock Adjustment Completed`,
              message: `Updated stock for ${results.totalAdjusted} products. ${results.totalErrors} errors. ${summary}${adjustedProducts.length > 5 ? ` and ${adjustedProducts.length - 5} more` : ''}`,
              actionUrl: '/dashboard/inventory',
              metadata: {
                adjustedCount: results.totalAdjusted,
                errorCount: results.totalErrors,
                adjustedBy: req.user.email || req.user.name,
                reason: reason || 'Bulk adjustment',
                products: adjustedProducts
              }
            })
          ));
        }
      } catch (notificationErr) {
        console.error('Failed to send bulk stock adjustment notification:', notificationErr);
      }
    }
    
    await createAuditLog(req as any, {
      action: 'bulk_stock_adjustment',
      resource: 'product',
      details: `Bulk stock adjustment: ${results.totalAdjusted} products updated`,
      skipIfNoUser: false
    });
    
    res.json({
      success: true,
      message: `Adjusted stock for ${results.totalAdjusted} products, ${results.totalErrors} errors`,
      results
    });
    
  } catch (error: any) {
    console.error('Bulk stock adjustment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== INVENTORY VALUATION REPORT ==========

router.get('/valuation', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }
    
    const products = await ProductModel.find({})
      .select('name sku category price buyingPrice stock')
      .lean();
    
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let totalPotentialProfit = 0;
    let totalStockUnits = 0;
    let marginSum = 0;
    let marginCount = 0;
    
    const topProducts: any[] = [];
    const categoryMap = new Map();
    
    for (const product of products) {
      const stock = product.stock || 0;
      const price = product.price || 0;
      const buyingPrice = product.buyingPrice || 0;
      
      const costValue = buyingPrice * stock;
      const retailValue = price * stock;
      const profit = retailValue - costValue;
      
      let margin = 0;
      if (price > 0) {
        margin = ((price - buyingPrice) / price) * 100;
        if (margin > 0) {
          marginSum += margin;
          marginCount++;
        }
      }
      
      totalCostValue += costValue;
      totalRetailValue += retailValue;
      totalPotentialProfit += profit;
      totalStockUnits += stock;
      
      if (stock > 0) {
        topProducts.push({
          name: product.name,
          sku: product.sku,
          category: product.category || 'Uncategorized',
          price: price,
          buyingPrice: buyingPrice,
          stock: stock,
          inventoryValue: retailValue,
          costValue: costValue,
          potentialProfit: profit
        });
      }
      
      const category = product.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          _id: category,
          totalValue: 0,
          totalCost: 0,
          totalProfit: 0,
          productCount: 0,
          stockUnits: 0
        });
      }
      
      const cat = categoryMap.get(category);
      cat.totalValue += retailValue;
      cat.totalCost += costValue;
      cat.totalProfit += profit;
      cat.productCount++;
      cat.stockUnits += stock;
    }
    
    topProducts.sort((a, b) => b.inventoryValue - a.inventoryValue);
    const top10Products = topProducts.slice(0, 10);
    const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.totalValue - a.totalValue);
    const averageMargin = marginCount > 0 ? marginSum / marginCount : 0;
    
    res.json({
      summary: {
        totalCostValue,
        totalRetailValue,
        totalPotentialProfit,
        averageMargin: parseFloat(averageMargin.toFixed(2)),
        productsWithData: products.length,
        totalStockUnits
      },
      topProductsByValue: top10Products,
      categoryBreakdown,
      generatedAt: new Date()
    });
    
  } catch (error: any) {
    console.error('Valuation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;