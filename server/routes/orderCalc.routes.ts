import { Router, Request, Response } from 'express';
import optionalAuthMiddleware from '../middleware/optionalAuth';
import ShippingAreaModel from '../models/ShippingArea';
import PromoCodeModel from '../models/PromoCode';
import { CompanySettings } from '../models/CompanySettings';
import mongoose from 'mongoose';

interface CalcRequest {
  items: Array<{ productId: string; qty: number }>;
  subtotal: number;
  shippingAreaId?: string;
  promoCode?: string;
}

interface CalcResponse {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingArea?: any;
  promoCode?: any;
  validPromo: boolean;
  validShippingArea: boolean;
  errors: string[];
}

const router = Router();

// POST /api/order/calculate - Calculate order totals with shipping/promo
router.post('/', optionalAuthMiddleware, async (req: Request<{}, CalcResponse, CalcRequest>, res: Response) => {
  try {
    const { items, subtotal, shippingAreaId, promoCode } = req.body;

    const errors: string[] = [];
    let shippingCost = 0;
    let discount = 0;
    let shippingArea = null;
    let promo = null;
    let validShippingArea = true;
    let validPromo = true;

    // Validate subtotal
    if (!items || !items.length || subtotal <= 0) {
      return res.status(400).json({ 
        subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0,
        validPromo: false, validShippingArea: false,
        errors: ['Invalid cart items or subtotal']
      });
    }

    // Calculate shipping
    if (shippingAreaId) {
      shippingArea = await ShippingAreaModel.findOne({ 
        _id: shippingAreaId, 
        isActive: true 
      });

      if (!shippingArea) {
        errors.push('Invalid shipping area');
        validShippingArea = false;
      } else {
        shippingCost = subtotal >= shippingArea.freeThreshold 
          ? 0 
          : shippingArea.baseCost;
      }
    } else {
      errors.push('Shipping area required');
      validShippingArea = false;
    }

    // Calculate promo discount
    if (promoCode) {
      promo = await PromoCodeModel.findOne({ 
        code: promoCode.toUpperCase(), 
        isActive: true 
      });

      if (!promo || !promo.canUse(subtotal)) {
        errors.push('Invalid or expired promo code');
        validPromo = false;
      } else {
        if (promo.type === 'percent') {
          discount = subtotal * (promo.value / 100);
        } else {
          discount = Math.min(promo.value, subtotal);
        }
      }
    }

    // Calculate tax
    const settings = await CompanySettings.findOne();
    const taxRate = settings?.taxRate ?? 0.16;
    const tax = subtotal * taxRate;

    // Final total
    const total = subtotal + shippingCost - discount + tax;

    res.json({
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      shippingArea,
      promoCode: promo,
      validPromo,
      validShippingArea,
      errors
    });
  } catch (error: any) {
    console.error('Order calc error:', error);
    res.status(500).json({ 
      subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0,
      validPromo: false, validShippingArea: false,
      errors: ['Calculation error']
    });
  }
});

export default router;
