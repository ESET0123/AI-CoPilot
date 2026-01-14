import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { keycloakServerUrl, keycloakRealm } from '../config/keycloak.config';

interface JwtPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
}

// JWKS client for Keycloak public key verification
const client = jwksClient({
  jwksUri: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    }
  });
}

export function requireAuth(
  req: Request & { userId?: string; userEmail?: string; userRoles?: string[] },
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = header.replace('Bearer ', '');

  // Verify token with Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const payload = decoded as JwtPayload;
    req.userId = payload.sub;
    req.userEmail = payload.email || payload.preferred_username;
    req.userRoles = payload.realm_access?.roles || [];

    next();
  });
}

export function requireRole(role: string) {
  return (
    req: Request & { userRoles?: string[] },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.userRoles || !req.userRoles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
