import jwt from 'jsonwebtoken';

export function generateJwt(userId: string): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );
}
