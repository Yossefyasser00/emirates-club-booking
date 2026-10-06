import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      todayBookings,
      allBookings,
      complaintsCount,
      courts,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.findMany({
        where: { date: today, status: { notIn: ['CANCELLED', 'REJECTED'] } },
        include: { court: true, payment: true },
      }),
      prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        include: { court: true, payment: true },
      }),
      prisma.complaint.count({ where: { status: 'NEW' } }),
      prisma.court.findMany({
        include: {
          bookings: {
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          },
        },
      }),
    ]);

    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalDepositsCollected = allBookings.reduce((sum, b) => sum + b.depositAmount, 0);
    const totalRemainingAtField = Math.max(0, totalRevenue - totalDepositsCollected);

    const courtsStats = courts.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      totalBookings: c.bookings.length,
      revenue: c.bookings.reduce((sum, b) => sum + b.totalAmount, 0),
      isActive: c.isActive,
    }));

    // Status breakdown
    const statusCounts = {
      CONFIRMED: confirmedBookings,
      PENDING: pendingBookings,
      CANCELLED: await prisma.booking.count({ where: { status: 'CANCELLED' } }),
      COMPLETED: await prisma.booking.count({ where: { status: 'COMPLETED' } }),
    };

    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      todayBookingsCount: todayBookings.length,
      todayBookings,
      totalRevenue,
      totalDepositsCollected,
      totalRemainingAtField,
      activeComplaintsCount: complaintsCount,
      courtsStats,
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;