import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool';
import { createVerificationToken, generateJwt } from '../utils/tokens';
import { sendVerificationEmail } from '../utils/mailer';

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email and password are required',
    });
  }

  try {
    // 1️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 2️⃣ Insert user (DB is the source of truth)
    const userResult = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [name, email, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // 3️⃣ Create verification token
    const token = await createVerificationToken(userId);

    // 4️⃣ Send email (can fail independently)
    await sendVerificationEmail(email, token);

    // 5️⃣ Success
    return res.status(201).json({
      message: 'Registration successful. Verify your email.',
    });
  } catch (err: any) {
    // 🔥 ONLY this error means duplicate
    if (err.code === '23505') {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    console.error('REGISTER ERROR:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}



export async function verifyEmail(req: Request, res: Response) {
  const token = String(req.query.token || '').trim();

  if (!token) {
    return res.status(400).send('Verification token missing');
  }

  // 1️⃣ Find valid token
  const result = await pool.query(
    `
    SELECT user_id
    FROM email_verifications
    WHERE token = $1
      AND used = false
      AND expires_at > NOW()
    `,
    [token]
  );

  if (result.rowCount === 0) {
    return res.status(400).send('Invalid or expired token');
  }

  const userId = result.rows[0].user_id;

  // 2️⃣ Mark email as verified
  await pool.query(
    `
    UPDATE users
    SET is_email_verified = true
    WHERE id = $1
    `,
    [userId]
  );

  // 3️⃣ Mark token as used
  await pool.query(
    `
    UPDATE email_verifications
    SET used = true
    WHERE token = $1
    `,
    [token]
  );

  return res.send('Email verified successfully. You can now login.');
}
export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  const result = await pool.query(
    `
    SELECT id, name, role, password_hash, is_email_verified
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const user = result.rows[0];

  if (!user.is_email_verified) {
    return res.status(403).json({
      message: 'Email not verified',
    });
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isMatch) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  // 🔐 Generate JWT
  const token = generateJwt(user.id);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
}
