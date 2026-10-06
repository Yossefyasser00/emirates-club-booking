import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET all courts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isActive: true };
    const courts = await prisma.court.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    res.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// GET single court
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const court = await prisma.court.findUnique({
      where: { id },
    });
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    res.json(court);
  } catch (error) {
    console.error('Error fetching court:', error);
    res.status(500).json({ error: 'Failed to fetch court' });
  }
});

// POST create court (Admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, pricePerHour, peakPricePerHour, description, image, features, isActive } = req.body;
    if (!name || !type || !pricePerHour) {
      return res.status(400).json({ error: 'Missing required court fields' });
    }
    const court = await prisma.court.create({
      data: {
        name,
        type: type || 'FIVE_A_SIDE',
        pricePerHour: Number(pricePerHour),
        peakPricePerHour: Number(peakPricePerHour || pricePerHour),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1529900245534-47fbf82a60e1?auto=format&fit=crop&w=1200&q=80',
        features: features || '',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
    res.status(201).json(court);
  } catch (error) {
    console.error('Error creating court:', error);
    res.status(500).json({ error: 'Failed to create court' });
  }
});

// PUT update court (Admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, pricePerHour, peakPricePerHour, description, image, features, isActive } = req.body;
    const court = await prisma.court.update({
      where: { id },
      data: {
        name,
        type,
        pricePerHour: Number(pricePerHour),
        peakPricePerHour: Number(peakPricePerHour),
        description,
        image,
        features,
        isActive: Boolean(isActive),
      },
    });
    res.json(court);
  } catch (error) {
    console.error('Error updating court:', error);
    res.status(500).json({ error: 'Failed to update court' });
  }
});

// PATCH toggle court status (Admin)
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const current = await prisma.court.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Court not found' });
    
    const updated = await prisma.court.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error toggling court:', error);
    res.status(500).json({ error: 'Failed to toggle court' });
  }
});

// DELETE court (Admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.court.delete({ where: { id } });
    res.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Error deleting court:', error);
    res.status(500).json({ error: 'Failed to delete court' });
  }
});

export default router;