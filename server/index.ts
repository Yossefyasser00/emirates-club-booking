import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import courtsRouter from './routes/courts.js';
import slotsRouter from './routes/slots.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import promosRouter from './routes/promos.js';
import complaintsRouter from './routes/complaints.js';
import settingsRouter from './routes/settings.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import { adminAuth } from './middleware/adminAuth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipts
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ========== PUBLIC ROUTES (no auth needed) ==========
app.use('/api/auth', authRouter);
app.use('/api/courts', courtsRouter);           // GET courts - public
app.use('/api/slots', slotsRouter);             // GET slots - public
app.use('/api/settings', settingsRouter);       // GET settings - public (for deposit info etc)
app.use('/api/promos', promosRouter);           // POST validate - public
app.use('/api/complaints', complaintsRouter);   // POST complaint - public, GET all - protected inside route

// ========== CUSTOMER ROUTES (no auth needed for creating bookings/payments) ==========
app.use('/api/bookings', bookingsRouter);       // POST create & GET lookup - public; admin actions guarded inside
app.use('/api/payments', paymentsRouter);       // POST upload-receipt - public; verify - protected inside

// ========== ADMIN-ONLY ROUTES (require JWT) ==========
app.use('/api/analytics', adminAuth, analyticsRouter);

// Root health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', system: 'cLub Football Platform API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 cLub Football Backend running on http://localhost:${PORT}`);
  console.log(`🔐 Admin panel: http://localhost:5173/management`);
});