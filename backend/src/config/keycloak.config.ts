import { config } from "dotenv";
config();

export const keycloakServerUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
export const keycloakRealm = process.env.KEYCLOAK_REALM || "my_realm";
export const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID || "my_client";
export const keycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET || "my_secret";

/**
 * Token endpoints used by AuthService
 */
export const keycloakEndpoints = {
  token: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
  logout: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`,
  jwks: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
};
