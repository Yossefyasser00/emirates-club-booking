import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_prod';

// In production: store hashed password in DB or env
// Default admin password: Emirates2026!
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Emirates2026!', 10);

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'كلمة المرور مطلوبة' });
  }

  const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (!isValid) {
    // Generic message to prevent enumeration
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  const token = jwt.sign(
    { role: 'ADMIN', loginAt: new Date().toISOString() },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    expiresIn: '8h',
    message: 'تم تسجيل الدخول بنجاح'
  });
});

// POST /api/auth/verify - verify token validity
router.post('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'ADMIN') return res.status(403).json({ valid: false });
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false, error: 'انتهت صلاحية الجلسة' });
  }
});

export default router;