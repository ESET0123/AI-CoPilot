import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

/* 🔍 ROUTE DEBUG */
router.use((req, _res, next) => {
  console.log('[AUTH ROUTE HIT]', req.method, req.originalUrl);
  next();
});

// OAuth2 / Keycloak endpoints
router.get('/callback', AuthController.callback);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Legacy OTP endpoints (deprecated)
router.post('/send-otp', AuthController.sendLoginOtp);
router.post('/verify-otp', AuthController.verifyLoginOtp);

export default router;
