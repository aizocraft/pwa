// src/routes/profitRoutes.ts
import { Router, Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import ProfitAnalysisModel from '../models/ProfitAnalysis';
import SupplierModel from '../models/Supplier';
import authMiddleware from '../middleware/auth';

const router = Router();

// Helper: Check if user is admin
const isAdmin = (req: Request & { user?: any }): boolean => req.user?.role === 'admin';

// Type for sort stage
type SortStage = { $sort: Record<string, 1 | -1 | mongoose.Expression.Meta> };

// GET /api/profits/summary - Overall profit summary
router.get('/summary', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate, category, supplier, brand } = req.query;

    const matchStage: any = {};
    
    // Date filter
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    // Status filter - only completed/paid orders
    matchStage.status = { $in: ['paid', 'delivered', 'processing'] };

    // Aggregation pipeline for profit analysis
    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          effectiveProfit: {
            $cond: [
              { $gt: ['$items.profit', 0] },
              '$items.profit',
              { $subtract: ['$items.sellingPrice', '$items.buyingPrice'] }
            ]
          },
          effectiveBuyingPrice: {
            $cond: [
              { $gt: ['$items.buyingPrice', 0] },
              '$items.buyingPrice',
              '$productInfo.buyingPrice'
            ]
          },
          category: '$productInfo.category',
          brand: '$productInfo.brand',
          supplierId: '$productInfo.supplier',
          supplierName: '$productInfo.supplierName'
        }
      }
    ];

    // Apply filters
    if (category) {
      pipeline.push({ $match: { category: category as string } });
    }
    if (supplier) {
      pipeline.push({ $match: { supplierId: new mongoose.Types.ObjectId(supplier as string) } });
    }
    if (brand) {
      pipeline.push({ $match: { brand: brand as string } });
    }

    // Group for summary
    const summaryPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          totalCost: { $sum: { $multiply: ['$effectiveBuyingPrice', '$items.qty'] } },
          totalProfit: { $sum: { $multiply: ['$effectiveProfit', '$items.qty'] } },
          totalUnitsSold: { $sum: '$items.qty' }
        }
      }
    ];

    const summaryResult = await OrderModel.aggregate(summaryPipeline);
    const summary = summaryResult[0] || { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalUnitsSold: 0 };
    
    // Calculate overall margin
    const overallMargin = summary.totalRevenue > 0 
      ? (summary.totalProfit / summary.totalRevenue) * 100 
      : 0;

    res.json({
      success: true,
      summary: {
        totalRevenue: summary.totalRevenue,
        totalCost: summary.totalCost,
        totalProfit: summary.totalProfit,
        totalUnitsSold: summary.totalUnitsSold,
        overallMargin: overallMargin.toFixed(2)
      }
    });
  } catch (error: any) {
    console.error('Profit summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profits/by-product - Profit breakdown by product
router.get('/by-product', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate, category, supplier, brand, sortBy = 'profit', limit = '50' } = req.query;

    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }
    matchStage.status = { $in: ['paid', 'delivered', 'processing'] };

    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          productSku: { $first: '$productInfo.sku' },
          category: { $first: '$productInfo.category' },
          brand: { $first: '$productInfo.brand' },
          supplierId: { $first: '$productInfo.supplier' },
          supplierName: { $first: '$productInfo.supplierName' },
          totalUnitsSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          totalCost: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }, 
              '$items.qty'
            ]
          } },
          totalProfit: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.profit', { $subtract: ['$items.sellingPrice', { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }] }] },
              '$items.qty'
            ]
          } }
        }
      },
      {
        $addFields: {
          averageMargin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
              0
            ]
          },
          averageSellingPrice: {
            $cond: [
              { $gt: ['$totalUnitsSold', 0] },
              { $divide: ['$totalRevenue', '$totalUnitsSold'] },
              0
            ]
          },
          averageBuyingPrice: {
            $cond: [
              { $gt: ['$totalUnitsSold', 0] },
              { $divide: ['$totalCost', '$totalUnitsSold'] },
              0
            ]
          }
        }
      }
    ];

    // Apply filters
    if (category) {
      pipeline.push({ $match: { category: category as string } });
    }
    if (supplier) {
      pipeline.push({ $match: { supplierId: new mongoose.Types.ObjectId(supplier as string) } });
    }
    if (brand) {
      pipeline.push({ $match: { brand: brand as string } });
    }

    // Sorting
    const sortField = sortBy as string;
    let sortKey = 'totalProfit';
    if (sortField === 'profit') sortKey = 'totalProfit';
    else if (sortField === 'margin') sortKey = 'averageMargin';
    else if (sortField === 'unitsSold') sortKey = 'totalUnitsSold';
    else if (sortField === 'revenue') sortKey = 'totalRevenue';
    
    pipeline.push({ $sort: { [sortKey]: -1 } });

    // Limit
    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    pipeline.push({ $limit: limitNum });

    const results = await OrderModel.aggregate(pipeline);

    res.json({
      success: true,
      products: results,
      totalProducts: results.length
    });
  } catch (error: any) {
    console.error('Profit by product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profits/by-category - Profit breakdown by category
router.get('/by-category', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;

    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }
    matchStage.status = { $in: ['paid', 'delivered', 'processing'] };

    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$productInfo.category', 'Uncategorized'] },
          totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          totalCost: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }, 
              '$items.qty'
            ]
          } },
          totalUnitsSold: { $sum: '$items.qty' }
        }
      },
      {
        $addFields: {
          totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          margin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalProfit: -1 } }
    ];

    const results = await OrderModel.aggregate(pipeline);

    res.json({
      success: true,
      categories: results
    });
  } catch (error: any) {
    console.error('Profit by category error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profits/by-supplier - Profit breakdown by supplier
router.get('/by-supplier', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;

    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }
    matchStage.status = { $in: ['paid', 'delivered', 'processing'] };

    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$productInfo.supplierName', 'No Supplier'] },
          supplierId: { $first: '$productInfo.supplier' },
          totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          totalCost: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }, 
              '$items.qty'
            ]
          } },
          totalUnitsSold: { $sum: '$items.qty' }
        }
      },
      {
        $addFields: {
          totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          margin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalProfit: -1 } }
    ];

    const results = await OrderModel.aggregate(pipeline);

    // Get supplier details for those with supplierId
    const suppliers = await SupplierModel.find({ status: 'active' }).select('name email phone totalPurchases');
    
    res.json({
      success: true,
      suppliers: results,
      allSuppliers: suppliers
    });
  } catch (error: any) {
    console.error('Profit by supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profits/trends - Profit trends over time
router.get('/trends', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period = 'monthly', months = '12' } = req.query;
    
    const monthsBack = parseInt(months as string) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const matchStage: any = {
      createdAt: { $gte: startDate },
      status: { $in: ['paid', 'delivered', 'processing'] }
    };

    let groupFormat = '';
    if (period === 'daily') {
      groupFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupFormat = '%Y-%U';
    } else {
      groupFormat = '%Y-%m';
    }

    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' }
          },
          revenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          cost: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }, 
              '$items.qty'
            ]
          } },
          unitsSold: { $sum: '$items.qty' }
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$cost'] },
          margin: {
            $cond: [
              { $gt: ['$revenue', 0] },
              { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cost'] }, '$revenue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await OrderModel.aggregate(pipeline);

    res.json({
      success: true,
      period,
      trends: results
    });
  } catch (error: any) {
    console.error('Profit trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profits/top-products - Top performing products
router.get('/top-products', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { metric = 'profit', limit = '10' } = req.query;
    
    const pipeline: any[] = [
      {
        $match: {
          status: { $in: ['paid', 'delivered', 'processing'] }
        }
      },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sku: { $first: '$productInfo.sku' },
          category: { $first: '$productInfo.category' },
          totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
          totalProfit: { $sum: { 
            $multiply: [
              { $ifNull: ['$items.profit', { $subtract: ['$items.sellingPrice', { $ifNull: ['$items.buyingPrice', '$productInfo.buyingPrice'] }] }] },
              '$items.qty'
            ]
          } },
          totalUnitsSold: { $sum: '$items.qty' }
        }
      },
      {
        $addFields: {
          profitPerUnit: {
            $cond: [
              { $gt: ['$totalUnitsSold', 0] },
              { $divide: ['$totalProfit', '$totalUnitsSold'] },
              0
            ]
          },
          margin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
              0
            ]
          }
        }
      }
    ];

    // Sort by selected metric
    if (metric === 'profit') {
      pipeline.push({ $sort: { totalProfit: -1 } });
    } else if (metric === 'margin') {
      pipeline.push({ $sort: { margin: -1 } });
    } else if (metric === 'units') {
      pipeline.push({ $sort: { totalUnitsSold: -1 } });
    } else {
      pipeline.push({ $sort: { totalRevenue: -1 } });
    }

    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    pipeline.push({ $limit: limitNum });

    const results = await OrderModel.aggregate(pipeline);

    res.json({
      success: true,
      metric,
      products: results
    });
  } catch (error: any) {
    console.error('Top products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/profits/recalculate - Recalculate profit analysis (admin only)
router.post('/recalculate', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all products with their sales
    const products = await ProductModel.find().select('_id name sku category brand supplier supplierName buyingPrice');
    
    let recalculated = 0;
    
    for (const product of products) {
      // Aggregate sales for this product
      const salesData = await OrderModel.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'delivered', 'processing'] }
          }
        },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
        {
          $match: {
            'items.productId': product._id
          }
        },
        {
          $group: {
            _id: null,
            totalUnitsSold: { $sum: '$items.qty' },
            totalRevenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
            totalCost: { $sum: { $multiply: [{ $ifNull: ['$items.buyingPrice', product.buyingPrice] }, '$items.qty'] } },
            averageSellingPrice: { $avg: '$items.sellingPrice' }
          }
        }
      ]);
      
      if (salesData.length > 0) {
        const data = salesData[0];
        const totalProfit = data.totalRevenue - data.totalCost;
        const averageMargin = data.totalRevenue > 0 ? (totalProfit / data.totalRevenue) * 100 : 0;
        const averageMarkup = data.totalCost > 0 ? (totalProfit / data.totalCost) * 100 : 0;
        
        // Update or create profit analysis record
        await ProfitAnalysisModel.findOneAndUpdate(
          { productId: product._id },
          {
            productName: product.name,
            productSku: product.sku,
            category: product.category,
            brand: product.brand,
            supplierId: product.supplier,
            supplierName: product.supplierName,
            totalUnitsSold: data.totalUnitsSold,
            totalRevenue: data.totalRevenue,
            totalCost: data.totalCost,
            totalProfit: totalProfit,
            averageSellingPrice: data.averageSellingPrice,
            averageBuyingPrice: data.totalCost / data.totalUnitsSold,
            averageProfitMargin: averageMargin,
            averageMarkup: averageMarkup,
            lastCalculated: new Date()
          },
          { upsert: true }
        );
        
        recalculated++;
      }
    }
    
    res.json({
      success: true,
      message: `Profit analysis recalculated for ${recalculated} products`,
      totalProducts: products.length,
      recalculated
    });
  } catch (error: any) {
    console.error('Recalculate profit error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;