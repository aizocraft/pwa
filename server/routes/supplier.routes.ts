// src/routes/supplierRoutes.ts
import { Router, Request, Response } from 'express';
import SupplierModel from '../models/Supplier';
import ProductModel from '../models/Product';
import authMiddleware from '../middleware/auth';
import { createAuditLog } from '../middleware/auditMiddleware';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';

const router = Router();

const isAdmin = (req: Request & { user?: any }): boolean => req.user?.role === 'admin';

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
      console.log(`✅ Supplier notification sent to ${adminUsers.length} admin(s): ${title}`);
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// GET /api/suppliers - List all suppliers
router.get('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin' && user?.role !== 'sales') {
      return res.status(403).json({ error: 'Admin or sales access required' });
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
    const user = (req as any).user;
    if (user?.role !== 'admin' && user?.role !== 'sales') {
      return res.status(403).json({ error: 'Admin or sales access required' });
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

// POST /api/suppliers - Create supplier with notification
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

    // ✅ NOTIFICATION: New supplier created
    await notifyAdmins(
      '🏭 New Supplier Added',
      `${req.user.email || req.user.name} added a new supplier: "${supplier.name}"`,
      `/dashboard/suppliers/${supplier._id}`,
      {
        action: 'create_supplier',
        createdBy: req.user.email || req.user.name,
        supplierId: supplier._id,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        supplierPhone: supplier.phone,
        status: supplier.status,
        paymentTerms: supplier.paymentTerms
      }
    );

    res.status(201).json({ success: true, supplier });
  } catch (error: any) {
    console.error('Create supplier error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Supplier name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/:id - Update supplier with notification
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get existing supplier for comparison
    const existingSupplier = await SupplierModel.findById(req.params.id);
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = await SupplierModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Track changes
    const changes: string[] = [];
    const updateData = req.body;
    
    if (updateData.name && updateData.name !== existingSupplier.name) {
      changes.push(`name: "${existingSupplier.name}" → "${updateData.name}"`);
    }
    if (updateData.email && updateData.email !== existingSupplier.email) {
      changes.push(`email: "${existingSupplier.email}" → "${updateData.email}"`);
    }
    if (updateData.phone && updateData.phone !== existingSupplier.phone) {
      changes.push(`phone: "${existingSupplier.phone}" → "${updateData.phone}"`);
    }
    if (updateData.status && updateData.status !== existingSupplier.status) {
      changes.push(`status: "${existingSupplier.status}" → "${updateData.status}"`);
    }
    if (updateData.paymentTerms && updateData.paymentTerms !== existingSupplier.paymentTerms) {
      changes.push(`paymentTerms updated`);
    }
    if (updateData.address && JSON.stringify(updateData.address) !== JSON.stringify(existingSupplier.address)) {
      changes.push(`address updated`);
    }

    await createAuditLog(req as any, {
      action: 'update',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier updated: ${supplier.name}. Changes: ${changes.join(', ')}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Supplier updated (only if significant changes)
    if (changes.length > 0) {
      await notifyAdmins(
        '✏️ Supplier Updated',
        `${req.user.email || req.user.name} updated supplier "${supplier.name}": ${changes.join(', ')}`,
        `/dashboard/suppliers/${supplier._id}`,
        {
          action: 'update_supplier',
          updatedBy: req.user.email || req.user.name,
          supplierId: supplier._id,
          supplierName: supplier.name,
          changes,
          oldValues: {
            name: existingSupplier.name,
            email: existingSupplier.email,
            phone: existingSupplier.phone,
            status: existingSupplier.status,
            paymentTerms: existingSupplier.paymentTerms
          },
          newValues: {
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            status: supplier.status,
            paymentTerms: supplier.paymentTerms
          }
        }
      );
    }

    res.json({ success: true, supplier });
  } catch (error: any) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/suppliers/:id - Delete supplier with notification
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplier = await SupplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if supplier has products
    const productCount = await ProductModel.countDocuments({ supplier: req.params.id });
    if (productCount > 0) {
      // Get product names for better notification
      const products = await ProductModel.find({ supplier: req.params.id }).select('name sku').limit(10);
      const productNames = products.map(p => p.name).join(', ');
      
      return res.status(400).json({ 
        error: `Cannot delete supplier with ${productCount} linked products. Remove or reassign products first.`,
        productCount,
        products: productNames.substring(0, 500)
      });
    }

    const supplierName = supplier.name;
    await SupplierModel.findByIdAndDelete(req.params.id);

    await createAuditLog(req as any, {
      action: 'delete',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier deleted: ${supplierName}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Supplier deleted (notify other admins)
    await notifyAdmins(
      '🗑️ Supplier Deleted',
      `${req.user.email || req.user.name} deleted supplier "${supplierName}"`,
      '/dashboard/suppliers',
      {
        action: 'delete_supplier',
        deletedBy: req.user.email || req.user.name,
        supplierId: req.params.id,
        supplierName,
        status: supplier.status,
        hadProducts: productCount > 0,
        deletedAt: new Date().toISOString()
      }
    );

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/suppliers/:id/status - Toggle supplier status with notification
router.patch('/:id/status', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active, inactive, or suspended' });
    }

    const supplier = await SupplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const oldStatus = supplier.status;
    supplier.status = status;
    await supplier.save();

    await createAuditLog(req as any, {
      action: 'update_status',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Supplier status changed from ${oldStatus} to ${status} for ${supplier.name}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Supplier status changed
    const statusIcon = status === 'active' ? '✅' : status === 'inactive' ? '⛔' : '⚠️';
    await notifyAdmins(
      `${statusIcon} Supplier Status Changed`,
      `${req.user.email || req.user.name} changed supplier "${supplier.name}" status from ${oldStatus} to ${status}`,
      `/dashboard/suppliers/${supplier._id}`,
      {
        action: 'change_supplier_status',
        changedBy: req.user.email || req.user.name,
        supplierId: supplier._id,
        supplierName: supplier.name,
        oldStatus,
        newStatus: status
      }
    );

    res.json({ success: true, supplier });
  } catch (error: any) {
    console.error('Update supplier status error:', error);
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
          inactiveSuppliers: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          suspendedSuppliers: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          totalPurchaseVolume: { $sum: '$totalPurchases' }
        }
      }
    ]);

    // Get product count per supplier with more details
    const supplierProducts = await ProductModel.aggregate([
      {
        $group: {
          _id: '$supplier',
          productCount: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          avgBuyingPrice: { $avg: '$buyingPrice' },
          avgSellingPrice: { $avg: '$price' }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      {
        $unwind: {
          path: '$supplierInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          supplierId: '$_id',
          supplierName: '$supplierInfo.name',
          productCount: 1,
          totalStockValue: 1,
          totalInventoryValue: 1,
          avgBuyingPrice: 1,
          avgSellingPrice: 1,
          profitMargin: {
            $cond: [
              { $eq: ['$avgBuyingPrice', 0] },
              0,
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$avgSellingPrice', '$avgBuyingPrice'] }, '$avgSellingPrice'] },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    // Get recent suppliers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSuppliers = await SupplierModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      summary: stats[0] || { 
        totalSuppliers: 0, 
        activeSuppliers: 0, 
        inactiveSuppliers: 0,
        suspendedSuppliers: 0,
        totalPurchaseVolume: 0 
      },
      supplierProducts,
      recentSuppliers,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Supplier stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id/products - Get all products from a supplier with pagination
router.get('/:id/products', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin' && user?.role !== 'sales') {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }
    const supplier = await SupplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const { page = '1', limit = '20', sort = '-createdAt' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      ProductModel.find({ supplier: supplier._id })
        .select('name sku price buyingPrice stock status images')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductModel.countDocuments({ supplier: supplier._id })
    ]);

    // Calculate total value of products from this supplier
    const totalValue = products.reduce((sum, p) => sum + ((p.buyingPrice || 0) * (p.stock || 0)), 0);

    res.json({
      supplier: {
        _id: supplier._id,
        name: supplier.name
      },
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      totalValue
    });
  } catch (error: any) {
    console.error('Fetch supplier products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers/:id/record-purchase - Record purchase from supplier
router.post('/:id/record-purchase', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { amount, orderNumber, items } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid purchase amount required' });
    }

    const supplier = await SupplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const oldPurchaseVolume = supplier.totalPurchases || 0;
    supplier.totalPurchases = (supplier.totalPurchases || 0) + amount;
    supplier.lastPurchaseDate = new Date();
    
    // Add to purchase history if tracking
    const purchaseHistory = (supplier.get('purchaseHistory') as any[]) || [];
    purchaseHistory.push({
      date: new Date(),
      amount,
      orderNumber: orderNumber || `PO-${Date.now()}`,
      items: items || []
    });
    supplier.set('purchaseHistory', purchaseHistory);
    
    await supplier.save();

    await createAuditLog(req as any, {
      action: 'record_purchase',
      resource: 'supplier',
      resourceId: supplier._id.toString(),
      details: `Recorded purchase of KES ${amount.toLocaleString()} from ${supplier.name}`,
      skipIfNoUser: false
    });

    // ✅ NOTIFICATION: Large purchase recorded (over 100,000 KES)
    if (amount >= 100000) {
      await notifyAdmins(
        '💰 Large Purchase Recorded',
        `${req.user.email || req.user.name} recorded a purchase of KES ${amount.toLocaleString()} from supplier "${supplier.name}"`,
        `/dashboard/suppliers/${supplier._id}`,
        {
          action: 'record_purchase',
          recordedBy: req.user.email || req.user.name,
          supplierId: supplier._id,
          supplierName: supplier.name,
          amount,
          orderNumber: orderNumber || `PO-${Date.now()}`,
          totalPurchaseVolume: supplier.totalPurchases,
          oldPurchaseVolume
        }
      );
    }

    res.json({ 
      success: true, 
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        totalPurchases: supplier.totalPurchases,
        lastPurchaseDate: supplier.lastPurchaseDate
      }
    });
  } catch (error: any) {
    console.error('Record purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== NEW SUPPLIER ENDPOINTS ====================

// GET /api/suppliers/active - Get all active suppliers
router.get('/active', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'admin' && user?.role !== 'sales') {
      return res.status(403).json({ error: 'Admin or sales access required' });
    }

    const { search, limit = '50' } = req.query;
    const query: any = { status: 'active' };
    
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await SupplierModel.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit as string))
      .select('name email phone address paymentTerms leadTime')
      .lean();

    res.json({ suppliers, count: suppliers.length });
  } catch (error: any) {
    console.error('Fetch active suppliers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/top - Get top suppliers by purchase volume
router.get('/top', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { limit = '10' } = req.query;

    const suppliers = await SupplierModel.find({ status: 'active' })
      .sort({ totalPurchases: -1 })
      .limit(parseInt(limit as string))
      .select('name totalPurchases lastPurchaseDate email phone')
      .lean();

    const totalPurchaseVolume = await SupplierModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPurchases' } } }
    ]);

    res.json({
      suppliers,
      totalPurchaseVolume: totalPurchaseVolume[0]?.total || 0,
      count: suppliers.length
    });
  } catch (error: any) {
    console.error('Fetch top suppliers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id/purchase-history - Get supplier purchase history
router.get('/:id/purchase-history', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplier = await SupplierModel.findById(req.params.id)
      .select('name purchaseHistory totalPurchases lastPurchaseDate')
      .lean();

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const history = (supplier as any).purchaseHistory || [];
    
    res.json({
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        totalPurchases: supplier.totalPurchases,
        lastPurchaseDate: supplier.lastPurchaseDate
      },
      history,
      totalRecords: history.length
    });
  } catch (error: any) {
    console.error('Fetch purchase history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id/analytics - Get supplier analytics
router.get('/:id/analytics', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const supplier = await SupplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get products from this supplier with profit metrics
    const products = await ProductModel.find({ supplier: supplier._id })
      .select('name sku price buyingPrice stock profitMargin')
      .lean();

    const productCount = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + ((p.buyingPrice || 0) * (p.stock || 0)), 0);
    const totalRetailValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const avgProfitMargin = productCount > 0 
      ? products.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / productCount 
      : 0;

    res.json({
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        totalPurchases: supplier.totalPurchases,
        lastPurchaseDate: supplier.lastPurchaseDate,
        status: supplier.status
      },
      analytics: {
        productCount,
        totalStockValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalStockValue,
        avgProfitMargin: avgProfitMargin.toFixed(2),
        products
      }
    });
  } catch (error: any) {
    console.error('Fetch supplier analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers/bulk - Bulk create suppliers
router.post('/bulk', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { suppliers } = req.body;
    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return res.status(400).json({ error: 'Suppliers array is required' });
    }

    const createdSuppliers = [];
    const errors = [];

    for (const supplierData of suppliers) {
      try {
        const supplier = new SupplierModel({
          ...supplierData,
          createdBy: req.user.userId
        });
        await supplier.save();
        createdSuppliers.push(supplier);
      } catch (err: any) {
        errors.push({ data: supplierData, error: err.message });
      }
    }

    // Notify admins about bulk creation
    if (createdSuppliers.length > 0) {
      await notifyAdmins(
        '📦 Bulk Suppliers Created',
        `${req.user.email || req.user.name} created ${createdSuppliers.length} suppliers via bulk import`,
        '/dashboard/suppliers',
        {
          action: 'bulk_create_suppliers',
          createdBy: req.user.email || req.user.name,
          count: createdSuppliers.length,
          supplierNames: createdSuppliers.map(s => s.name).join(', ')
        }
      );
    }

    res.json({
      success: true,
      created: createdSuppliers.length,
      errors: errors.length,
      suppliers: createdSuppliers,
      errorDetails: errors
    });
  } catch (error: any) {
    console.error('Bulk create suppliers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/suppliers/bulk/status - Bulk update supplier status
router.patch('/bulk/status', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { supplierIds, status } = req.body;
    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return res.status(400).json({ error: 'Supplier IDs array is required' });
    }
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await SupplierModel.updateMany(
      { _id: { $in: supplierIds } },
      { status }
    );

    await notifyAdmins(
      `🔄 Bulk Supplier Status Updated to ${status}`,
      `${req.user.email || req.user.name} updated ${result.modifiedCount} suppliers to ${status}`,
      '/dashboard/suppliers',
      {
        action: 'bulk_update_supplier_status',
        updatedBy: req.user.email || req.user.name,
        count: result.modifiedCount,
        status
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} suppliers updated to ${status}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Bulk update supplier status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;