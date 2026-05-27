// src/routes/supplierRoutes.ts
import { Router, Request, Response } from 'express';
import SupplierModel from '../models/Supplier';
import ProductModel from '../models/Product';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';

const router = Router();

const isAdmin = (req: Request & { user?: any }): boolean => req.user?.role === 'admin';

// GET /api/suppliers - List all suppliers
router.get('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, search, page = '1', limit = '20' } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [suppliers, total] = await Promise.all([
      SupplierModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SupplierModel.countDocuments(query)
    ]);

    res.json({
      suppliers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Fetch suppliers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id - Get single supplier with products
router.get('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplier = await SupplierModel.findById(req.params.id).lean();
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get products from this supplier
    const products = await ProductModel.find({ supplier: supplier._id })
      .select('name sku price buyingPrice stock status')
      .lean();

    res.json({
      supplier,
      products,
      productCount: products.length
    });
  } catch (error: any) {
    console.error('Fetch supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers - Create supplier
router.post('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplierData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const supplier = new SupplierModel(supplierData);
    await supplier.save();

    await createAuditLog(req as any, {
      action: 'create',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier created: ${supplier.name}`,
      skipIfNoUser: false
    });

    res.status(201).json({ success: true, supplier });
  } catch (error: any) {
    console.error('Create supplier error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Supplier name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplier = await SupplierModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier updated: ${supplier.name}`,
      skipIfNoUser: false
    });

    res.json({ success: true, supplier });
  } catch (error: any) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/suppliers/:id - Delete supplier (only if no products linked)
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if supplier has products
    const productCount = await ProductModel.countDocuments({ supplier: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete supplier with ${productCount} linked products. Remove or reassign products first.` 
      });
    }

    const supplier = await SupplierModel.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await createAuditLog(req as any, {
      action: 'delete',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier deleted: ${supplier.name}`,
      skipIfNoUser: false
    });

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/stats/summary - Supplier statistics
router.get('/stats/summary', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await SupplierModel.aggregate([
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalPurchaseVolume: { $sum: '$totalPurchases' }
        }
      }
    ]);

    // Get product count per supplier
    const supplierProducts = await ProductModel.aggregate([
      {
        $group: {
          _id: '$supplier',
          productCount: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    res.json({
      summary: stats[0] || { totalSuppliers: 0, activeSuppliers: 0, totalPurchaseVolume: 0 },
      supplierProducts
    });
  } catch (error: any) {
    console.error('Supplier stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;