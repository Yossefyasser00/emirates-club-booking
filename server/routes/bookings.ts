import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Helper to format hour integer to "HH:00"
function formatHour(h: number): string {
  const norm = h % 24;
  return norm.toString().padStart(2, '0') + ':00';
}

// Generate random booking code e.g. "CLUB-8921"
function generateBookingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CLUB-${num}`;
}

// POST create customer booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      courtId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      startTime,
      durationHours = 1,
      promoCode,
      notes,
      paymentMethod = 'VODAFONE_CASH',
      transactionReference,
      isRecurring = false,
      recurringWeeks = 4,
    } = req.body;

    if (!courtId || !customerName || !customerPhone || !date || !startTime) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (الملعب، الاسم، الهاتف، التاريخ، والوقت)' });
    }

    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court || !court.isActive) {
      return res.status(400).json({ error: 'الملعب المحدد غير متاح حالياً' });
    }

    const duration = parseInt(durationHours, 10) || 1;
    const startH = parseInt(startTime.split(':')[0], 10);
    const endH = startH + duration;
    const endTime = formatHour(endH);

    // 1. Check for conflicts on this day
    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId,
        date,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
    });

    const hasConflict = existingBookings.some((b) => {
      const bStart = parseInt(b.startTime.split(':')[0], 10);
      let bEnd = parseInt(b.endTime.split(':')[0], 10);
      if (bEnd < bStart) bEnd += 24;

      // Check overlap between [startH, endH] and [bStart, bEnd]
      return Math.max(startH, bStart) < Math.min(endH, bEnd);
    });

    if (hasConflict) {
      return res.status(409).json({ error: 'عذراً، هذا الموعد تم حجزه للتو. يرجى اختيار موعد آخر.' });
    }

    // Check if slot is blocked by admin
    const blockedSlots = await prisma.slot.findMany({
      where: { courtId, date, isBlocked: true },
    });
    const isBlocked = blockedSlots.some((s) => {
      const sH = parseInt(s.startTime.split(':')[0], 10);
      return sH >= startH && sH < endH;
    });

    if (isBlocked) {
      return res.status(409).json({ error: 'هذا الموعد مغلق حالياً للصيانة أو المناسبات الخاصة.' });
    }

    // 2. Calculate Total Amount
    let totalAmount = 0;
    for (let h = startH; h < endH; h++) {
      const isPeak = (h >= 17 && h < 24);
      totalAmount += isPeak ? court.peakPricePerHour : court.pricePerHour;
    }

    // Multiply if recurring weeks requested
    const weeksCount = isRecurring ? Number(recurringWeeks) || 4 : 1;
    totalAmount = totalAmount * weeksCount;

    // 3. Check Promo Code
    let discountAmount = 0;
    let validPromoCode: string | null = null;

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: String(promoCode).toUpperCase() },
      });

      if (promo && promo.isActive && (!promo.expiresAt || new Date(promo.expiresAt) > new Date())) {
        if (promo.usedCount < promo.maxUses && duration >= promo.minBookingHours) {
          validPromoCode = promo.code;
          if (promo.discountPercent > 0) {
            discountAmount = (totalAmount * promo.discountPercent) / 100;
          } else if (promo.discountAmount > 0) {
            discountAmount = promo.discountAmount;
          }
          // Increment promo usage
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const finalTotal = Math.max(0, totalAmount - discountAmount);

    // 4. Calculate Deposit Amount
    const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    let depositAmount = 100;
    if (settings) {
      if (settings.useFixedDeposit) {
        depositAmount = settings.fixedDepositAmount * (isRecurring ? weeksCount : 1);
      } else {
        depositAmount = (finalTotal * settings.depositPercentage) / 100;
      }
    }
    // Cap deposit at total
    depositAmount = Math.min(depositAmount, finalTotal);

    // 5. Determine initial status
    const autoApprove = settings?.autoApprove ?? false;
    const initialStatus = autoApprove ? 'CONFIRMED' : 'PENDING';

    // 6. Create unique booking code
    let bookingCode = generateBookingCode();
    let isUnique = false;
    while (!isUnique) {
      const exists = await prisma.booking.findUnique({ where: { bookingCode } });
      if (!exists) isUnique = true;
      else bookingCode = generateBookingCode();
    }

    // 7. Create Booking & Payment
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        courtId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        date,
        startTime,
        endTime,
        durationHours: duration,
        totalAmount: finalTotal,
        depositAmount,
        discountAmount,
        promoCode: validPromoCode,
        status: initialStatus,
        isRecurring: Boolean(isRecurring),
        recurringPattern: isRecurring ? `WEEKLY_${weeksCount}_WEEKS` : null,
        notes: notes || null,
        payment: {
          create: {
            method: paymentMethod,
            amount: depositAmount,
            transactionReference: transactionReference || null,
            status: 'PENDING_VERIFICATION',
          },
        },
      },
      include: {
        court: true,
        payment: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الحجز بنجاح!',
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الحجز' });
  }
});

// GET customer lookup (search by phone or booking code)
router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف أو كود الحجز' });
    }

    const trimmed = String(query).trim();

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customerPhone: { contains: trimmed } },
          { bookingCode: { equals: trimmed.toUpperCase() } },
        ],
      },
      include: {
        court: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error looking up bookings:', error);
    res.status(500).json({ error: 'Failed to lookup bookings' });
  }
});

// GET all bookings (Admin filterable)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, courtId, date, search, page = '1', limit = '50' } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (courtId && courtId !== 'ALL') {
      where.courtId = String(courtId);
    }
    if (date) {
      where.date = String(date);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { bookingCode: { contains: q } },
      ];
    }

    const take = parseInt(String(limit), 10);
    const skip = (parseInt(String(page), 10) - 1) * take;

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          court: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(String(page), 10),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PATCH update booking status (Admin: Confirm, Reject, Complete, Cancel)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة الحجز غير صالحة' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        cancellationReason: cancellationReason || null,
        ...(status === 'CONFIRMED'
          ? {
              payment: {
                update: {
                  status: 'VERIFIED',
                  verifiedAt: new Date(),
                },
              },
            }
          : {}),
      },
      include: {
        court: true,
        payment: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// POST customer cancel booking (according to cancellation policy)
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, phone } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { court: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'الحجز ملغى بالفعل' });
    }

    // Verify phone matches
    if (phone && booking.customerPhone.trim() !== String(phone).trim()) {
      return res.status(403).json({ error: 'رقم الهاتف غير مطابق لبيانات الحجز' });
    }

    // Check policy hours
    const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    const limitHours = settings?.cancellationHoursLimit ?? 6;

    const [slotHour] = booking.startTime.split(':').map(Number);
    const bookingDateTime = new Date(`${booking.date}T${String(slotHour).padStart(2, '0')}:00:00`);
    const now = new Date();
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < limitHours && diffHours > 0) {
      return res.status(400).json({
        error: `عذراً، تنص سياسة الملعب على أن الإلغاء يجب أن يتم قبل الموعد بـ ${limitHours} ساعات على الأقل. (المتبقي: ${diffHours.toFixed(1)} ساعة)`,
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'إلغاء بواسطة العميل',
      },
      include: { court: true, payment: true },
    });

    res.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح وفقاً لسياسة الإلغاء',
      booking: updated,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// DELETE booking (Admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف الحجز' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;