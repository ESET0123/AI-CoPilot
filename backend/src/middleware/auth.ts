import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { keycloakServerUrl, keycloakRealm } from '../config/keycloak.config';
import { AuthService } from '../services/auth.service';

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
    console.warn('[AUTH] Missing or malformed Bearer token:', header ? 'Present but malformed' : 'Missing');
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = header.replace('Bearer ', '');
  console.log('[AUTH] Token received length:', token.length);

  // Verify token with Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, decoded) => {
    if (err) {
      console.error('[AUTH] Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const payload = decoded as JwtPayload;
    console.log('[AUTH] Token verified successfully for Keycloak user:', payload.email || payload.sub);

    try {
      // Resolve internal DB ID from Keycloak ID (sub)
      const user = await AuthService.findUserByKeycloakId(payload.sub);

      if (!user) {
        console.log('[AUTH] User not found in database, performing JIT provisioning for:', payload.sub);
        const email = payload.email || payload.preferred_username || "";

        try {
          const newUser = await AuthService.upsertUserFromKeycloak(payload.sub, email);
          req.userId = newUser.id;
          req.userEmail = newUser.email;
          console.log('[AUTH] JIT provisioning successful. Resolved ID:', newUser.id);
        } catch (jitError: any) {
          console.error('[AUTH] JIT provisioning failed:', jitError.message);
          return res.status(500).json({ message: 'User provisioning failed' });
        }
      } else {
        req.userId = user.id;
        req.userEmail = user.email || payload.email || payload.preferred_username;
      }

      req.userRoles = payload.realm_access?.roles || [];

      next();
    } catch (dbErr: any) {
      console.error('[AUTH] Database error during user resolution:', dbErr.message);
      return res.status(500).json({ message: 'Authentication service error' });
    }
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
