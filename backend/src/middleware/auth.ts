import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
  sub: string;
}

export function requireAuth(
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = header.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
