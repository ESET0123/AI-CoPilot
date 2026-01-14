import Keycloak from 'keycloak-js';

// Handle potential issues with default vs named exports in different build environments
const KeycloakConstructor = (Keycloak as any).default || Keycloak;

const keycloak = new KeycloakConstructor({
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'chatbot_keycloak_integration',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'test_client',
});

export default keycloak;
