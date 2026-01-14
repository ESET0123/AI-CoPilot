import axios from 'axios';
import { keycloakServerUrl, keycloakRealm, keycloakConfig } from '../config/keycloak.config';
import { AuthRepository } from '../repositories/auth.repository';

export class AuthService {
    /**
     * Exchange authorization code for tokens
     */
    static async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
        const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: keycloakConfig.resource,
            client_secret: keycloakConfig.credentials.secret,
            code,
            redirect_uri: redirectUri,
        });

        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data;
    }

    /**
     * Login with username and password (Direct Access Grant)
     */
    static async loginWithCredentials(username: string, password: string): Promise<any> {
        const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: keycloakConfig.resource,
            client_secret: keycloakConfig.credentials.secret,
            username,
            password,
            scope: 'openid',
        });

        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data;
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshAccessToken(refreshToken: string): Promise<any> {
        const tokenUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: keycloakConfig.resource,
            client_secret: keycloakConfig.credentials.secret,
            refresh_token: refreshToken,
        });

        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data;
    }

    /**
     * Logout user from Keycloak
     */
    static async logout(refreshToken: string): Promise<void> {
        const logoutUrl = `${keycloakServerUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`;

        const params = new URLSearchParams({
            client_id: keycloakConfig.resource,
            client_secret: keycloakConfig.credentials.secret,
            refresh_token: refreshToken,
        });

        await axios.post(logoutUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
    }

    /**
     * Upsert user in database based on Keycloak user info
     */
    static async upsertUserFromKeycloak(keycloakId: string, email: string): Promise<any> {
        return await AuthRepository.upsertUserFromKeycloak(keycloakId, email);
    }

    static async findUserByKeycloakId(keycloakId: string): Promise<any> {
        return await AuthRepository.findByKeycloakId(keycloakId);
    }
}
