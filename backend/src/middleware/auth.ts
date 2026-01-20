import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '../config/env';
import { keycloakServerUrl, keycloakRealm } from '../config/keycloak.config';
import { AuthService } from '../services/auth.service';
import { CryptoUtil } from '../utils/crypto';

interface JwtPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
  groups?: string[];
}

// JWKS client for Keycloak public key verification
const client = jwksClient({
  jwksUri: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = '';
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.replace('Bearer ', '');
  } else if (req.cookies?.access_token) {
    try {
      token = CryptoUtil.decrypt(req.cookies.access_token);
    } catch (err) {
      console.error('[AUTH] Cookie decryption failed:', err);
      return res.status(401).json({ message: 'Invalid session' });
    }
  }

  if (!token) {
    if (env.NODE_ENV !== 'production') {
      console.warn('[AUTH] Missing token (no header or cookie)');
    }
    return res.status(401).json({ message: 'Missing token' });
  }


  // Verify token with Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, decoded) => {
    if (err) {
      console.error('[AUTH] Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const payload = decoded as JwtPayload;
    // console.log('[AUTH] Token verified for user:', payload.sub);

    try {
      // Resolve internal DB ID from Keycloak ID (sub)
      const user = await AuthService.findUserByKeycloakId(payload.sub);

      if (!user) {
        const email = payload.email || payload.preferred_username || "";

        try {
          const newUser = await AuthService.upsertUserFromKeycloak(payload.sub, email);
          req.userId = newUser.id;
          req.userEmail = newUser.email;
        } catch (jitError: any) {
          console.error('[AUTH] JIT provisioning failed:', jitError.message);
          return res.status(500).json({ message: 'User provisioning failed' });
        }
      } else {
        req.userId = user.id;
        req.userEmail = user.email || payload.email || payload.preferred_username;
      }

      req.userRoles = payload.realm_access?.roles || [];
      (req as any).userGroups = payload.groups || [];

      next();
    } catch (dbErr: any) {
      console.error('[AUTH] Database error during user resolution:', dbErr.message);
      return res.status(500).json({ message: 'Authentication service error' });
    }
  });
}

export function requireRole(role: string) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.userRoles || !req.userRoles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
