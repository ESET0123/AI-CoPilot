import { Router, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
    keycloakEndpoints,
    keycloakClientId,
    keycloakClientSecret,
} from "../config/keycloak.config";
import { CryptoUtil } from "../utils/crypto";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in?: number;
    token_type: string;
}

interface DecodedToken {
    email?: string;
    preferred_username?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
        roles: string[];
    };
    groups?: string[];
    sub: string;
}

// Helper to set cookies
const setTokenCookies = (res: Response, tokens: TokenResponse) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    };

    if (tokens.access_token) {
        const encryptedAccess = CryptoUtil.encrypt(tokens.access_token);
        res.cookie("access_token", encryptedAccess, {
            ...cookieOptions,
            maxAge: (tokens.expires_in + 60) * 1000, // Buffer 60s
        });
    }

    if (tokens.refresh_token) {
        const encryptedRefresh = CryptoUtil.encrypt(tokens.refresh_token);
        res.cookie("refresh_token", encryptedRefresh, {
            ...cookieOptions,
            maxAge: (tokens.refresh_expires_in || 86400 * 30) * 1000, // Default 30 days
        });
    }
};

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const params = new URLSearchParams();
        params.append("client_id", keycloakClientId);
        if (keycloakClientSecret) {
            params.append("client_secret", keycloakClientSecret);
        }
        params.append("grant_type", "password");
        params.append("username", username);
        params.append("password", password);
        params.append("scope", "openid profile email");

        const response = await axios.post(keycloakEndpoints.token, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });


        setTokenCookies(res, response.data);

        // Decode user info for the frontend
        const decoded = jwt.decode(response.data.access_token) as DecodedToken;
        const user = {
            email: decoded.email || decoded.preferred_username,
            name: decoded.name,
            given_name: decoded.given_name,
            family_name: decoded.family_name,
            roles: decoded.realm_access?.roles || [],
            groups: decoded.groups || [],
            sub: decoded.sub,
        };

        res.json({
            message: "Logged in successfully",
            user,
            expires_in: response.data.expires_in,
        });
    } catch (error: any) {
        console.error("[Backend Auth] Login failed:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal server error" });
    }
});

router.post("/refresh", async (req, res) => {
    const encryptedRefreshToken = req.cookies?.refresh_token;

    if (!encryptedRefreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const refreshToken = CryptoUtil.decrypt(encryptedRefreshToken);
        const params = new URLSearchParams();
        params.append("client_id", keycloakClientId);
        if (keycloakClientSecret) {
            params.append("client_secret", keycloakClientSecret);
        }
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);

        const response = await axios.post(keycloakEndpoints.token, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });


        setTokenCookies(res, response.data);

        res.json({
            message: "Token refreshed",
            expires_in: response.data.expires_in,
        });
    } catch (error: any) {
        console.error("[Backend Auth] Refresh failed:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal server error" });
    }
});

router.post("/logout", async (req, res) => {
    const encryptedRefreshToken = req.cookies?.refresh_token;

    if (encryptedRefreshToken) {
        try {
            const refreshToken = CryptoUtil.decrypt(encryptedRefreshToken);
            const params = new URLSearchParams();
            params.append("client_id", keycloakClientId);
            if (keycloakClientSecret) {
                params.append("client_secret", keycloakClientSecret);
            }
            params.append("refresh_token", refreshToken);

            await axios.post(keycloakEndpoints.logout, params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
        } catch (error: any) {
            console.error("[Backend Auth] Keycloak logout failed:", error.response?.data || error.message);
            // We still proceed to clear cookies locally even if Keycloak logout fails
        }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: any, res) => {
    // requireAuth middleware populates req.userId, req.userEmail, req.userRoles
    // We can also fetch groups if we store them or refresh from Keycloak
    // For now, return what we have in req
    res.json({
        user: {
            id: req.userId,
            email: req.userEmail,
            roles: req.userRoles || [],
            groups: req.userGroups || [], // We should make sure requireAuth sets this
        }
    });
});

export default router;
