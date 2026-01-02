import { pool } from '../db/pool';

export class AuthRepository {
    static async invalidateOldOtps(email: string): Promise<void> {
        await pool.query(
            `
      UPDATE email_otps
      SET used = true
      WHERE email = $1 AND used = false
      `,
            [email]
        );
    }

    static async createOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
        await pool.query(
            `
      INSERT INTO email_otps (email, otp, expires_at)
      VALUES ($1, $2, $3)
      `,
            [email, otp, expiresAt]
        );
    }

    static async findValidOtp(email: string, otp: string): Promise<string | null> {
        const result = await pool.query(
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
            [email, otp]
        );
        return result.rows[0]?.id || null;
    }

    static async markOtpAsUsed(otpId: string): Promise<void> {
        await pool.query(`UPDATE email_otps SET used = true WHERE id = $1`, [otpId]);
    }

    static async upsertUser(email: string): Promise<{ id: string, email: string, role: string }> {
        const result = await pool.query(
            `
      INSERT INTO users (email, is_email_verified)
      VALUES ($1, true)
      ON CONFLICT (email)
      DO UPDATE SET is_email_verified = true
      RETURNING id, email, role
      `,
            [email]
        );
        return result.rows[0];
    }
}
