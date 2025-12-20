import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { generateOtp } from '../utils/otp';
import { sendOtpEmail } from '../utils/mailer';
import { generateJwt } from '../utils/tokens';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================= SEND OTP ================= */

export async function sendLoginOtp(req: Request, res: Response) {
  try {
    let { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    email = email.toLowerCase().trim();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `
      UPDATE email_otps
      SET used = true
      WHERE email = $1 AND used = false
      `,
      [email]
    );

    await pool.query(
      `
      INSERT INTO email_otps (email, otp, expires_at)
      VALUES ($1, $2, $3)
      `,
      [email, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);

    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
}

/* ================= VERIFY OTP ================= */

export async function verifyLoginOtp(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const otpResult = await client.query(
      `
      SELECT id
      FROM email_otps
      WHERE email = $1
        AND otp = $2
        AND used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email.toLowerCase().trim(), otp]
    );

    if (otpResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await client.query(
      `UPDATE email_otps SET used = true WHERE id = $1`,
      [otpResult.rows[0].id]
    );

    const userResult = await client.query(
      `
      INSERT INTO users (email, is_email_verified)
      VALUES ($1, true)
      ON CONFLICT (email)
      DO UPDATE SET is_email_verified = true
      RETURNING id, email, role
      `,
      [email.toLowerCase().trim()]
    );

    await client.query('COMMIT');

    const user = userResult.rows[0];
    const token = generateJwt(user.id);

    res.json({ token, user });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('VERIFY OTP ERROR:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  } finally {
    client.release();
  }
}
