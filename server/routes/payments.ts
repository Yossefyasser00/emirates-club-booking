import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma.js';

const router = Router();

// Configure multer storage
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'receipt-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST upload receipt screenshot or update transaction reference
router.post('/upload-receipt', upload.single('receipt'), async (req: Request, res: Response) => {
  try {
    const { bookingId, transactionReference, method } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const receiptImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: {
        ...(receiptImage ? { receiptImage } : {}),
        ...(transactionReference ? { transactionReference } : {}),
        ...(method ? { method } : {}),
      },
      create: {
        bookingId,
        method: method || 'VODAFONE_CASH',
        amount: 100,
        transactionReference: transactionReference || null,
        receiptImage: receiptImage || null,
        status: 'PENDING_VERIFICATION',
      },
    });

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Failed to upload receipt' });
  }
});

// PATCH verify / reject payment (Admin)
router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // VERIFIED or REJECTED

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
      include: {
        booking: true,
      },
    });

    // If verified, also confirm the booking
    if (status === 'VERIFIED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;