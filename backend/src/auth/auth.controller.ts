import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export class AuthController {
  /**
   * OAuth2 callback endpoint
   * Exchanges authorization code for tokens
   */
  static async callback(req: Request, res: Response) {
    console.log('[AuthController] Callback hit');
    try {
      const { code } = req.query;
      const redirectUri = req.query.redirect_uri as string || 'http://localhost:5173';

      console.log('[AuthController] Code:', code ? 'Present' : 'Missing');
      console.log('[AuthController] Redirect URI:', redirectUri);

      if (!code) {
        return res.status(400).json({ message: 'Authorization code missing' });
      }

      // Exchange code for tokens
      console.log('[AuthController] Exchanging code for tokens...');
      const tokens = await AuthService.exchangeCodeForTokens(code as string, redirectUri);
      console.log('[AuthController] Tokens received successfully');

      // Decode ID token to get user info
      const decoded = jwt.decode(tokens.id_token) as any;
      const keycloakId = decoded.sub;
      const email = decoded.email || decoded.preferred_username;

      const name = decoded.name;
      const given_name = decoded.given_name;
      const family_name = decoded.family_name;

      console.log('[AuthController] User decoded:', { keycloakId, email, name });

      // Upsert user in database
      const user = await AuthService.upsertUserFromKeycloak(keycloakId, email);
      console.log('[AuthController] User upserted/found');

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
        expires_in: tokens.expires_in,
        user: {
          ...user,
          name,
          given_name,
          family_name
        },
      });
    } catch (error: any) {
      console.error('[AuthController] OAuth callback error full:', error);
      if (axios.isAxiosError(error)) {
        console.error('[AuthController] Axios error data:', error.response?.data);
        console.error('[AuthController] Axios error status:', error.response?.status);
      }
      res.status(500).json({ message: 'Authentication failed', details: error.message });
    }
  }

  /**
   * Login with username and password
   */
  static async login(req: Request, res: Response) {
    console.log('[AuthController] Login hit');
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log('[AuthController] Logging in user:', email);
      const result = await AuthService.loginWithCredentials(email, password);
      console.log('[AuthController] Tokens received successfully');

      // Decode ID token to get user info
      const decoded = jwt.decode(result.tokens.id_token) as any;
      const keycloakId = decoded.sub;
      const userEmail = decoded.email || decoded.preferred_username;

      // User is already upserted in authenticateUser
      const user = result.user;

      res.json({
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token,
        id_token: result.tokens.id_token,
        expires_in: result.tokens.expires_in,
        user,
      });
    } catch (error: any) {
      console.error('[AuthController] Login error:', error.response?.data || error.message);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  /**
   * Token refresh endpoint
   */
  static async refresh(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ message: 'Refresh token missing' });
      }

      const tokens = await AuthService.refreshAccessToken(refresh_token);

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      });
    } catch (error: any) {
      console.error('Token refresh error:', error.response?.data || error.message);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  /**
   * Logout endpoint
   */
  static async logout(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (refresh_token) {
        await AuthService.logout(refresh_token);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      res.status(500).json({ message: 'Logout failed' });
    }
  }

  // Legacy OTP endpoints (kept for backward compatibility)
  static async sendLoginOtp(req: Request, res: Response) {
    res.status(410).json({
      message: 'OTP authentication is deprecated. Please use Keycloak authentication.'
    });
  }

  static async verifyLoginOtp(req: Request, res: Response) {
    res.status(410).json({
      message: 'OTP authentication is deprecated. Please use Keycloak authentication.'
    });
  }
}
