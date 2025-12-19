import { Router } from 'express';
import {
  sendLoginOtp,
  verifyLoginOtp,
} from './auth.controller';

const router = Router();

/* 🔍 ROUTE DEBUG */
router.use((req, _res, next) => {
  console.log('[AUTH ROUTE HIT]', req.method, req.originalUrl);
  next();
});

router.post('/send-otp', sendLoginOtp);
router.post('/verify-otp', verifyLoginOtp);

export default router;
