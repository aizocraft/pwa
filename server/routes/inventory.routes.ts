// src/routes/inventoryRoutes.ts
import { Router, Request, Response } from 'express';
import ProductModel from '../models/Product';
import SupplierModel from '../models/Supplier';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';

const router = Router();

const isAdmin = (req: Request & { user?: any }): boolean => req.user?.role === 'admin';

// GET /api/inventory/summary - Inventory value summary
router.get('/summary', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const inventoryStats = await ProductModel.aggregate([
      {
        $group: {
          _id: null,
          totalStockValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalPotentialProfit: { $sum: { $multiply: [{ $subtract: ['$price', '$buyingPrice'] }, '$stock'] } },
          totalUnits: { $sum: '$stock' },
          lowStockItems: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } },
          outOfStockItems: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
        }
      }
    ]);

    const categoryBreakdown = await ProductModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$category', 'Uncategorized'] },
          stockValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
          inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          units: { $sum: '$stock' }
        }
      },
      { $sort: { stockValue: -1 } }
    ]);

    res.json({
      summary: inventoryStats[0] || {
        totalStockValue: 0,
        totalInventoryValue: 0,
        totalPotentialProfit: 0,
        totalUnits: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      },
      categoryBreakdown
    });
  } catch (error: any) {
    console.error('Inventory summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/low-stock - Get low stock products
router.get('/low-stock', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { threshold = '10', category, supplier } = req.query;
    const stockThreshold = parseInt(threshold as string);

    const query: any = { stock: { $lte: stockThreshold } };
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;

    const products = await ProductModel.find(query)
      .select('name sku category brand price buyingPrice stock supplierName')
      .sort({ stock: 1 })
      .lean();

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

// POST /api/inventory/restock/:productId - Record restock
router.post('/restock/:productId', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { quantity, buyingPrice, reason } = req.body;
    const product = await ProductModel.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    // Update stock
    product.stock += newQuantity;

    // Update buying price if provided and different
    if (buyingPrice && buyingPrice !== product.buyingPrice) {
      await product.updateBuyingPrice(buyingPrice, req.user.userId, reason || 'Restock');
    }

    await product.save();

    await createAuditLog(req as any, {
      action: 'restock',
      resource: 'product',
      resourceId: product._id.toString(),
      details: `Restocked ${newQuantity} units of ${product.name}. New stock: ${product.stock}`,
      skipIfNoUser: false
    });

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

export default router;