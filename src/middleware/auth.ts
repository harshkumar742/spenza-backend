import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.body.userId = (payload as any).userId;
    next();
  } catch {
    return res.status(403).json({ msg: 'Invalid token' });
  }
};
