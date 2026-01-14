import { config } from 'dotenv';
config();

export const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM || 'chatbot_keycloak_integration',
    'auth-server-url': process.env.KEYCLOAK_URL || 'http://localhost:8080',
    'ssl-required': 'external',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'test_client',
    credentials: {
        secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    },
    'confidential-port': 0,
    'bearer-only': true,
};

export const keycloakServerUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
export const keycloakRealm = process.env.KEYCLOAK_REALM || 'chatbot_keycloak_integration';
