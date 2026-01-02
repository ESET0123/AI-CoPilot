import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthController {
  static async sendLoginOtp(req: Request, res: Response) {
    try {
      let { email } = req.body;

      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      email = email.toLowerCase().trim();
      await AuthService.initiateLogin(email);

      return res.json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error('SEND OTP ERROR:', err);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
  }

  static async verifyLoginOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP required' });
      }

      const result = await AuthService.verifyLogin(email.toLowerCase().trim(), otp);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'INVALID_OTP') {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      console.error('VERIFY OTP ERROR:', err);
      res.status(500).json({ message: 'OTP verification failed' });
    }
  }
}
