import { env } from "./env";

export const keycloakServerUrl = env.KEYCLOAK_URL;
export const keycloakRealm = env.KEYCLOAK_REALM;
export const keycloakClientId = env.KEYCLOAK_CLIENT_ID;
export const keycloakClientSecret = env.KEYCLOAK_CLIENT_SECRET;

/**
 * Token endpoints used by AuthService
 */
export const keycloakEndpoints = {
  token: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
  logout: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`,
  jwks: `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
};
