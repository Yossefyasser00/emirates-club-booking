import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Helper to format hour integer to "HH:00"
function formatHour(h: number): string {
  const norm = h % 24;
  return norm.toString().padStart(2, '0') + ':00';
}

// GET slots for a specific court and date
router.get('/', async (req: Request, res: Response) => {
  try {
    const { courtId, date } = req.query;
    if (!courtId || !date) {
      return res.status(400).json({ error: 'courtId and date are required' });
    }

    const court = await prisma.court.findUnique({
      where: { id: String(courtId) },
    });

    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }

    const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    const openHour = settings?.openHour ?? 10;
    const closeHour = settings?.closeHour ?? 26;

    // Fetch existing bookings for this court and date
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: String(courtId),
        date: String(date),
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
    });

    // Fetch blocked slots for this court and date
    const blockedSlots = await prisma.slot.findMany({
      where: {
        courtId: String(courtId),
        date: String(date),
        isBlocked: true,
      },
    });

    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      const startTime = formatHour(h);
      const endTime = formatHour(h + 1);
      const isPeak = (h >= 17 && h < 24);
      const price = isPeak ? court.peakPricePerHour : court.pricePerHour;

      // Check if blocked
      const blocked = blockedSlots.find((s) => s.startTime === startTime);
      
      // Check if booked
      // A booking might span 1 or 2 hours (e.g. 19:00 to 21:00 spans 19:00-20:00 and 20:00-21:00)
      const booking = bookings.find((b) => {
        const bStart = parseInt(b.startTime.split(':')[0], 10);
        let bEnd = parseInt(b.endTime.split(':')[0], 10);
        if (bEnd < bStart) bEnd += 24; // midnight wrap
        let cur = h;
        return cur >= bStart && cur < bEnd;
      });

      let status = 'AVAILABLE';
      let bookingInfo = undefined;

      if (blocked) {
        status = 'BLOCKED';
      } else if (booking) {
        status = booking.status === 'CONFIRMED' ? 'BOOKED' : 'PENDING';
        bookingInfo = {
          bookingCode: booking.bookingCode,
          customerName: booking.customerName,
          status: booking.status,
          durationHours: booking.durationHours,
          isRecurring: booking.isRecurring,
        };
      }

      slots.push({
        courtId: court.id,
        courtName: court.name,
        date: String(date),
        hourIndex: h,
        startTime,
        endTime,
        isPeak,
        price,
        status,
        blockReason: blocked?.blockReason || null,
        booking: bookingInfo,
      });
    }

    res.json(slots);
  } catch (error) {
    console.error('Error computing slots:', error);
    res.status(500).json({ error: 'Failed to compute slots' });
  }
});

// GET full day schedule for all courts (Admin visual grid)
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const courts = await prisma.court.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    const openHour = settings?.openHour ?? 10;
    const closeHour = settings?.closeHour ?? 26;

    const bookings = await prisma.booking.findMany({
      where: {
        date: String(date),
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      include: {
        payment: true,
      },
    });

    const blockedSlots = await prisma.slot.findMany({
      where: {
        date: String(date),
        isBlocked: true,
      },
    });

    const timeline = courts.map((court) => {
      const courtSlots = [];
      for (let h = openHour; h < closeHour; h++) {
        const startTime = formatHour(h);
        const endTime = formatHour(h + 1);
        const isPeak = (h >= 17 && h < 24);
        const price = isPeak ? court.peakPricePerHour : court.pricePerHour;

        const blocked = blockedSlots.find((s) => s.courtId === court.id && s.startTime === startTime);
        const booking = bookings.find((b) => {
          if (b.courtId !== court.id) return false;
          const bStart = parseInt(b.startTime.split(':')[0], 10);
          let bEnd = parseInt(b.endTime.split(':')[0], 10);
          if (bEnd < bStart) bEnd += 24;
          return h >= bStart && h < bEnd;
        });

        let status = 'AVAILABLE';
        if (blocked) status = 'BLOCKED';
        else if (booking) status = booking.status; // CONFIRMED, PENDING, etc.

        courtSlots.push({
          hourIndex: h,
          startTime,
          endTime,
          isPeak,
          price,
          status,
          blockedReason: blocked?.blockReason || null,
          booking: booking || null,
        });
      }

      return {
        court,
        slots: courtSlots,
      };
    });

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// POST block a slot (Admin)
router.post('/block', async (req: Request, res: Response) => {
  try {
    const { courtId, date, startTime, endTime, blockReason } = req.body;
    if (!courtId || !date || !startTime) {
      return res.status(400).json({ error: 'courtId, date, and startTime are required' });
    }

    const calculatedEnd = endTime || formatHour(parseInt(startTime.split(':')[0], 10) + 1);

    // Remove existing if any
    await prisma.slot.deleteMany({
      where: {
        courtId,
        date,
        startTime,
      },
    });

    const slot = await prisma.slot.create({
      data: {
        courtId,
        date,
        startTime,
        endTime: calculatedEnd,
        isBlocked: true,
        blockReason: blockReason || 'موعد محظور بواسطة الإدارة',
      },
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error('Error blocking slot:', error);
    res.status(500).json({ error: 'Failed to block slot' });
  }
});

// POST unblock a slot (Admin)
router.post('/unblock', async (req: Request, res: Response) => {
  try {
    const { courtId, date, startTime } = req.body;
    await prisma.slot.deleteMany({
      where: {
        courtId,
        date,
        startTime,
      },
    });

    res.json({ success: true, message: 'Slot unblocked' });
  } catch (error) {
    console.error('Error unblocking slot:', error);
    res.status(500).json({ error: 'Failed to unblock slot' });
  }
});

export default router;