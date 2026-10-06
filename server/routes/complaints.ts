import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Helper to generate ticket number CMP-XXXX
function generateTicketNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${num}`;
}

// POST submit complaint (Customer)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, bookingCode, subject, message } = req.body;
    if (!customerName || !customerPhone || !subject || !message) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، الموضوع، والرسالة)' });
    }

    const ticketNumber = generateTicketNumber();

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        customerName,
        customerPhone,
        bookingCode: bookingCode ? String(bookingCode).trim().toUpperCase() : null,
        subject,
        message,
        status: 'NEW',
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال الشكوى / المقترح بنجاح ووصلت لإدارة المجمع',
      complaint,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الشكوى' });
  }
});

// GET customer complaints by phone
router.get('/my', async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    const complaints = await prisma.complaint.findMany({
      where: { customerPhone: { contains: String(phone).trim() } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching customer complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET all complaints (Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where = status && status !== 'ALL' ? { status: String(status) } : {};

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// PATCH reply or update status (Admin)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminReply !== undefined ? { adminReply } : {}),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// DELETE complaint (Admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.complaint.delete({ where: { id } });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

export default router;