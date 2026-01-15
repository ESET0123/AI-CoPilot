import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await AuthService.authenticateUser(email, password);

      return res.json({
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token,
        expires_in: result.tokens.expires_in,
        user: result.user,
      });
    } catch (err: any) {
      console.error("[Login Error]", err.response?.data || err.message);
      return res.status(401).json({ message: "Invalid credentials" });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token missing" });
      }

      const tokens = await AuthService.refreshAccessToken(refresh_token);

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      });
    } catch (err: any) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      if (refresh_token) {
        await AuthService.logout(refresh_token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(500).json({ message: "Logout failed" });
    }
  }
}
