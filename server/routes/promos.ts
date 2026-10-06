import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// POST validate promo code (Customer)
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, totalAmount, durationHours = 1 } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: 'يرجى إدخال كود الخصم' });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: String(code).trim().toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return res.status(404).json({ valid: false, error: 'كود الخصم غير موجود أو غير نشط' });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'كود الخصم منتهي الصلاحية' });
    }

    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ valid: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكود' });
    }

    if (Number(durationHours) < promo.minBookingHours) {
      return res.status(400).json({
        valid: false,
        error: `هذا الكود متاح فقط للحجوزات التي تبدأ من ${promo.minBookingHours} ساعات فأكثر`,
      });
    }

    let discount = 0;
    const base = Number(totalAmount) || 0;
    if (promo.discountPercent > 0) {
      discount = (base * promo.discountPercent) / 100;
    } else if (promo.discountAmount > 0) {
      discount = Math.min(base, promo.discountAmount);
    }

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount: promo.discountAmount,
      calculatedDiscount: discount,
      finalAmount: Math.max(0, base - discount),
      message: `تم تطبيق كود الخصم بنجاح! وفرت ${discount} ج.م`,
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate promo' });
  }
});

// GET all promo codes (Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ error: 'Failed to fetch promos' });
  }
});

// POST create promo code (Admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, discountPercent, discountAmount, minBookingHours, maxUses, expiresAt, isActive } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Promo code string is required' });
    }

    const created = await prisma.promoCode.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountPercent: Number(discountPercent) || 0,
        discountAmount: Number(discountAmount) || 0,
        minBookingHours: Number(minBookingHours) || 1,
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ error: 'Failed to create promo' });
  }
});

// PUT update promo code (Admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, discountAmount, minBookingHours, maxUses, expiresAt, isActive } = req.body;

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        code: String(code).trim().toUpperCase(),
        discountPercent: Number(discountPercent) || 0,
        discountAmount: Number(discountAmount) || 0,
        minBookingHours: Number(minBookingHours) || 1,
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: Boolean(isActive),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating promo:', error);
    res.status(500).json({ error: 'Failed to update promo' });
  }
});

// DELETE promo code (Admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.promoCode.delete({ where: { id } });
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ error: 'Failed to delete promo' });
  }
});

export default router;