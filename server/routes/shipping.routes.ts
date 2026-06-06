// src/routes/shipping.routes.ts
import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import ShippingAreaModel from '../models/ShippingArea';
import { createNotification } from '../services/notification.service';
import UserModel from '../models/User';

const router = Router();

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
      console.log(`✅ Shipping notification sent to ${adminUsers.length} admin(s): ${title}`);
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// GET /api/shipping - Admin list (paginated)
router.get('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const query: any = { isActive: { $ne: false } };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [areas, total] = await Promise.all([
      ShippingAreaModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ShippingAreaModel.countDocuments(query)
    ]);

    res.json({
      areas,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    console.error('Shipping areas fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch shipping areas' });
  }
});

// GET /api/shipping/public - Public active areas for buyer
router.get('/public', async (req: Request, res: Response) => {
  try {
    const areas = await ShippingAreaModel.find({ isActive: true }).sort({ name: 1 });
    res.json(areas);
  } catch (error: any) {
    console.error('Public shipping areas error:', error);
    res.status(500).json({ error: 'Failed to fetch shipping areas' });
  }
});

// POST /api/shipping - Admin create with notification
router.post('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, regions, baseCost, freeThreshold, description } = req.body;

    // Fix: Check for undefined/null instead of falsy (0 is valid)
    if (!name || baseCost === undefined || baseCost === null) {
      return res.status(400).json({ error: 'Name and baseCost are required' });
    }

    // Validate baseCost is a number
    const parsedBaseCost = parseFloat(baseCost.toString());
    if (isNaN(parsedBaseCost) || parsedBaseCost < 0) {
      return res.status(400).json({ error: 'baseCost must be a valid number >= 0' });
    }

    const area = new ShippingAreaModel({
      name,
      regions: regions || [],
      baseCost: parsedBaseCost,
      freeThreshold: parseFloat(freeThreshold?.toString() || '0'),
      description,
      isActive: true
    });

    await area.save();

    // ✅ NOTIFICATION: New shipping area created
    await notifyAdmins(
      '🚚 New Shipping Area Created',
      `${req.user.email || req.user.name} created a new shipping area: "${name}" with base cost KES ${parsedBaseCost.toLocaleString()}`,
      '/dashboard/shipping',
      {
        action: 'create_shipping_area',
        createdBy: req.user.email || req.user.name,
        areaId: area._id,
        areaName: name,
        regions: regions.length,
        baseCost: parsedBaseCost,
        freeThreshold: parseFloat(freeThreshold?.toString() || '0'),
        isActive: true
      }
    );

    res.status(201).json(area);
  } catch (error: any) {
    console.error('Create shipping area error:', error);
    res.status(400).json({ error: error.message || 'Failed to create area' });
  }
});

// PUT /api/shipping/:id - Admin update with notification
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, regions, baseCost, freeThreshold, description, isActive } = req.body;

    // Get existing area for comparison
    const existingArea = await ShippingAreaModel.findById(req.params.id);
    if (!existingArea) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    // Validate baseCost if provided
    let parsedBaseCost: number | undefined;
    if (baseCost !== undefined) {
      parsedBaseCost = parseFloat(baseCost.toString());
      if (isNaN(parsedBaseCost) || parsedBaseCost < 0) {
        return res.status(400).json({ error: 'baseCost must be a valid number >= 0' });
      }
    }

    const updateData: any = {};
    const changes: string[] = [];

    if (name !== undefined && name !== existingArea.name) {
      updateData.name = name;
      changes.push(`name: "${existingArea.name}" → "${name}"`);
    }
    if (regions !== undefined && JSON.stringify(regions) !== JSON.stringify(existingArea.regions)) {
      updateData.regions = regions;
      changes.push(`regions: ${existingArea.regions.length} → ${regions.length} regions`);
    }
    if (baseCost !== undefined && parsedBaseCost !== undefined && parsedBaseCost !== existingArea.baseCost) {
      updateData.baseCost = parsedBaseCost;
      changes.push(`baseCost: KES ${existingArea.baseCost.toLocaleString()} → KES ${parsedBaseCost.toLocaleString()}`);
    }
    if (freeThreshold !== undefined) {
      const newThreshold = parseFloat(freeThreshold.toString()) || 0;
      if (newThreshold !== existingArea.freeThreshold) {
        updateData.freeThreshold = newThreshold;
        changes.push(`freeThreshold: KES ${existingArea.freeThreshold.toLocaleString()} → KES ${newThreshold.toLocaleString()}`);
      }
    }
    if (description !== undefined && description !== existingArea.description) {
      updateData.description = description;
      changes.push('description updated');
    }
    if (isActive !== undefined && isActive !== existingArea.isActive) {
      updateData.isActive = isActive;
      changes.push(`status: ${existingArea.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`);
    }

    if (Object.keys(updateData).length === 0) {
      return res.json(existingArea);
    }

    const area = await ShippingAreaModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!area) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    // ✅ NOTIFICATION: Shipping area updated
    await notifyAdmins(
      '✏️ Shipping Area Updated',
      `${req.user.email || req.user.name} updated shipping area "${area.name}": ${changes.join(', ')}`,
      '/dashboard/shipping',
      {
        action: 'update_shipping_area',
        updatedBy: req.user.email || req.user.name,
        areaId: area._id,
        areaName: area.name,
        changes,
        oldValues: {
          name: existingArea.name,
          regions: existingArea.regions,
          baseCost: existingArea.baseCost,
          freeThreshold: existingArea.freeThreshold,
          isActive: existingArea.isActive
        },
        newValues: {
          name: area.name,
          regions: area.regions,
          baseCost: area.baseCost,
          freeThreshold: area.freeThreshold,
          isActive: area.isActive
        }
      }
    );

    res.json(area);
  } catch (error: any) {
    console.error('Update shipping area error:', error);
    res.status(400).json({ error: error.message || 'Failed to update area' });
  }
});

// DELETE /api/shipping/:id - Admin delete with notification
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const area = await ShippingAreaModel.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    const areaName = area.name;
    const regionCount = area.regions.length;

    await ShippingAreaModel.findByIdAndDelete(req.params.id);

    // ✅ NOTIFICATION: Shipping area deleted - notify other admins
    await notifyAdmins(
      '🗑️ Shipping Area Deleted',
      `${req.user.email || req.user.name} deleted shipping area "${areaName}" (${regionCount} regions)`,
      '/dashboard/shipping',
      {
        action: 'delete_shipping_area',
        deletedBy: req.user.email || req.user.name,
        areaId: req.params.id,
        areaName,
        regionCount,
        baseCost: area.baseCost,
        wasActive: area.isActive,
        deletedAt: new Date().toISOString()
      }
    );

    res.json({ success: true, message: 'Area deleted' });
  } catch (error: any) {
    console.error('Delete shipping area error:', error);
    res.status(500).json({ error: 'Failed to delete area' });
  }
});

// Optional: POST /api/shipping/:id/toggle - Toggle active status with notification
router.patch('/:id/toggle', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const area = await ShippingAreaModel.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    const oldStatus = area.isActive;
    area.isActive = !area.isActive;
    await area.save();

    // ✅ NOTIFICATION: Shipping area status toggled
    const statusAction = area.isActive ? 'activated' : 'deactivated';
    await notifyAdmins(
      area.isActive ? '✅ Shipping Area Activated' : '⛔ Shipping Area Deactivated',
      `${req.user.email || req.user.name} ${statusAction} shipping area "${area.name}"`,
      '/dashboard/shipping',
      {
        action: 'toggle_shipping_area',
        updatedBy: req.user.email || req.user.name,
        areaId: area._id,
        areaName: area.name,
        oldStatus,
        newStatus: area.isActive,
        actionType: statusAction
      }
    );

    res.json({ success: true, isActive: area.isActive, area });
  } catch (error: any) {
    console.error('Toggle shipping area error:', error);
    res.status(500).json({ error: 'Failed to toggle area status' });
  }
});

// Optional: GET /api/shipping/stats - Shipping statistics for admin dashboard
router.get('/stats/overview', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [totalAreas, activeAreas, inactiveAreas, totalRegions] = await Promise.all([
      ShippingAreaModel.countDocuments(),
      ShippingAreaModel.countDocuments({ isActive: true }),
      ShippingAreaModel.countDocuments({ isActive: false }),
      ShippingAreaModel.aggregate([
        { $project: { regionCount: { $size: '$regions' } } },
        { $group: { _id: null, total: { $sum: '$regionCount' } } }
      ])
    ]);

    const areasWithFreeShipping = await ShippingAreaModel.countDocuments({
      freeThreshold: { $gt: 0, $lte: 100000 }
    });

    const averageShippingCost = await ShippingAreaModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgCost: { $avg: '$baseCost' } } }
    ]);

    res.json({
      totalAreas,
      activeAreas,
      inactiveAreas,
      totalRegions: totalRegions[0]?.total || 0,
      areasWithFreeShipping,
      averageShippingCost: averageShippingCost[0]?.avgCost || 0
    });
  } catch (error: any) {
    console.error('Shipping stats error:', error);
    res.status(500).json({ error: 'Failed to fetch shipping statistics' });
  }
});

export default router;