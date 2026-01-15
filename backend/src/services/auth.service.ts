import axios from "axios";
import {
  keycloakServerUrl,
  keycloakRealm,
  keycloakClientId,
  keycloakClientSecret,
} from "../config/keycloak.config";
import { AuthRepository } from "../repositories/auth.repository";
import jwt from "jsonwebtoken";

export class AuthService {
  static async authenticateUser(username: string, password: string) {
    const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: "password",
      client_id: keycloakClientId,
      client_secret: keycloakClientSecret,
      username,
      password,
      scope: "openid",
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const tokens = response.data;

    // Decode and extract roles, groups
    const decoded: any = jwt.decode(tokens.access_token);

    const keycloakId = decoded.sub;
    const email = decoded.email || decoded.preferred_username;
    const realmRoles = decoded.realm_access?.roles || [];
    const clientRoles = decoded.resource_access?.[keycloakClientId]?.roles || [];
    const groups = decoded.groups || [];

    const name = decoded.name;
    const given_name = decoded.given_name;
    const family_name = decoded.family_name;

    // Upsert into local DB
    const user = await AuthRepository.upsertUserFromKeycloak(keycloakId, email);

    return {
      tokens,
      user: {
        ...user,
        name,
        given_name,
        family_name,
        roles: realmRoles.concat(clientRoles),
        groups,
      },
    };
  }

  static async refreshAccessToken(refreshToken: string) {
    const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: keycloakClientId,
      client_secret: keycloakClientSecret,
      refresh_token: refreshToken,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  }

  static async logout(refreshToken: string): Promise<void> {
    const logoutUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`;

    const params = new URLSearchParams({
      client_id: keycloakClientId,
      client_secret: keycloakClientSecret,
      refresh_token: refreshToken,
    });

    await axios.post(logoutUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  static async findUserByKeycloakId(keycloakId: string) {
    return AuthRepository.findByKeycloakId(keycloakId);
  }

  static async upsertUserFromKeycloak(keycloakId: string, email: string) {
    return AuthRepository.upsertUserFromKeycloak(keycloakId, email);
  }

  static async loginWithCredentials(email: string, password: string) {
    return this.authenticateUser(email, password);
  }

  static async exchangeCodeForTokens(code: string, redirectUri: string) {
    const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: keycloakClientId,
      client_secret: keycloakClientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  }
}
