import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db/pool';

/* ================= EMAIL VERIFICATION TOKEN ================= */

export async function createVerificationToken(
  userId: string
): Promise<string> {
  // Invalidate any previous tokens for this user
  await pool.query(
    `
    UPDATE email_verifications
    SET used = true
    WHERE user_id = $1
    `,
    [userId]
  );

  // Generate secure token
  const token = crypto.randomUUID();

  // Token expires in 24 hours
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  // Store token in DB
  await pool.query(
    `
    INSERT INTO email_verifications (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    `,
    [userId, token, expiresAt]
  );

  return token;
}

/* ================= AUTH JWT ================= */

export function generateJwt(userId: string): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );
}
