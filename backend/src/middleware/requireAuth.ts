import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { keycloakServerUrl, keycloakRealm, keycloakClientId } from "../config/keycloak.config";
import { AuthService } from "../services/auth.service";

const client = jwksClient({
  jwksUri: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 86400000,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else if (!key) {
      callback(new Error('Signing key not found'));
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

export async function requireAuth(req: Request & { user?: any }, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded: any) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      const user = await AuthService.findUserByKeycloakId(decoded.sub);
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = {
        id: user.id,
        email: user.email,
        roles: decoded.realm_access?.roles || [],
        groups: decoded.groups || [],
      };

      next();
    });
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
