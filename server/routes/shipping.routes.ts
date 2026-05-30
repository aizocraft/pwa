import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import ShippingAreaModel from '../models/ShippingArea';

const router = Router();

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

// POST /api/shipping - Admin create
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
    res.status(201).json(area);
  } catch (error: any) {
    console.error('Create shipping area error:', error);
    res.status(400).json({ error: error.message || 'Failed to create area' });
  }
});

// PUT /api/shipping/:id - Admin update
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, regions, baseCost, freeThreshold, description, isActive } = req.body;

    // Validate baseCost if provided
    let parsedBaseCost;
    if (baseCost !== undefined) {
      parsedBaseCost = parseFloat(baseCost.toString());
      if (isNaN(parsedBaseCost) || parsedBaseCost < 0) {
        return res.status(400).json({ error: 'baseCost must be a valid number >= 0' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (regions !== undefined) updateData.regions = regions;
    if (baseCost !== undefined) updateData.baseCost = parsedBaseCost;
    if (freeThreshold !== undefined) updateData.freeThreshold = parseFloat(freeThreshold.toString()) || 0;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const area = await ShippingAreaModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!area) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    res.json(area);
  } catch (error: any) {
    console.error('Update shipping area error:', error);
    res.status(400).json({ error: error.message || 'Failed to update area' });
  }
});

// DELETE /api/shipping/:id - Admin delete
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const area = await ShippingAreaModel.findByIdAndDelete(req.params.id);
    if (!area) {
      return res.status(404).json({ error: 'Shipping area not found' });
    }

    res.json({ success: true, message: 'Area deleted' });
  } catch (error: any) {
    console.error('Delete shipping area error:', error);
    res.status(500).json({ error: 'Failed to delete area' });
  }
});

export default router;
