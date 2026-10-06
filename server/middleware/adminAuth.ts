import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_prod';

export interface AdminRequest extends Request {
  admin?: { role: string };
}

export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح - يجب تسجيل الدخول كمدير' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'ليس لديك صلاحية الوصول' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة منتهية أو رمز غير صالح - يرجى إعادة تسجيل الدخول' });
  }
};