import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import PromoCodeModel from '../models/PromoCode';

const router = Router();

// GET /api/promo - Admin list (paginated)
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
      query.code = { $regex: search.toUpperCase(), $options: 'i' };
    }

    const [promos, total] = await Promise.all([
      PromoCodeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PromoCodeModel.countDocuments(query)
    ]);

    res.json({
      promos,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    console.error('Promo codes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// GET /api/promo/validate/:code - Public validate for specific subtotal
router.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const subtotal = parseFloat(req.query.subtotal as string) || 0;

    const promo = await PromoCodeModel.findOne({ code: code.toUpperCase() });
    if (!promo || !promo.canUse(subtotal)) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired promo code' });
    }

    res.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount: promo.type === 'percent' 
        ? (subtotal * promo.value / 100)
        : Math.min(promo.value, subtotal),
      maxDiscount: promo.type === 'percent' ? null : promo.value
    });
  } catch (error: any) {
    console.error('Promo validate error:', error);
    res.status(500).json({ valid: false, error: 'Validation error' });
  }
});

// POST /api/promo - Admin create
router.post('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { code, type, value, maxUses, minSubtotal, expiryDate, description } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: 'Code, type, and value required' });
    }

    const promo = new PromoCodeModel({
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value.toString()),
      maxUses: parseInt(maxUses?.toString() || '0'),
      minSubtotal: parseFloat(minSubtotal?.toString() || '0'),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      description,
      isActive: true
    });

    await promo.save();
    res.status(201).json(promo);
  } catch (error: any) {
    console.error('Create promo error:', error);
    res.status(400).json({ error: error.message || 'Failed to create promo' });
  }
});

// PUT /api/promo/:id - Admin update
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const promo = await PromoCodeModel.findByIdAndUpdate(
      req.params.id,
      {
        code: req.body.code?.toUpperCase().trim(),
        type: req.body.type,
        value: parseFloat(req.body.value.toString()),
        maxUses: parseInt(req.body.maxUses?.toString() || '0'),
        minSubtotal: parseFloat(req.body.minSubtotal?.toString() || '0'),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        description: req.body.description,
        isActive: req.body.isActive !== undefined ? req.body.isActive : undefined
      },
      { new: true, runValidators: true }
    );

    if (!promo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json(promo);
  } catch (error: any) {
    console.error('Update promo error:', error);
    res.status(400).json({ error: error.message || 'Failed to update promo' });
  }
});

// DELETE /api/promo/:id - Admin delete
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const promo = await PromoCodeModel.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ success: true, message: 'Promo deleted' });
  } catch (error: any) {
    console.error('Delete promo error:', error);
    res.status(500).json({ error: 'Failed to delete promo' });
  }
});

export default router;
