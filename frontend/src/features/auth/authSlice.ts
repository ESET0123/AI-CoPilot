/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// import { axiosClient } from "../../services/axiosClient";

// Keycloak Config
const KC_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const KC_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
const KC_TOKEN_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;

export interface AuthState {
  user: any | null;
  access_token: string | null;
  refresh_token: string | null;
  roles: string[];
  groups: string[];
  isAuthenticated: boolean;
  error: string | null;
}

export const loginWithCredentials = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      params.append("client_id", KC_CLIENT_ID);
      params.append("grant_type", "password");
      params.append("username", payload.email);
      params.append("password", payload.password);
      params.append("scope", "openid profile email");

      // Direct call to Keycloak (bypass backend)
      const res = await axios.post(KC_TOKEN_URL, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = res.data;
      const decoded: any = jwtDecode(data.access_token);

      const user = {
        email: decoded.email || decoded.preferred_username,
        // Prioritize specific name fields, fallback to email prefix
        name: decoded.name,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        roles: decoded.realm_access?.roles || [],
        groups: decoded.groups || [],
        sub: decoded.sub, // Keycloak ID
      };

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user,
      };
    } catch (err: any) {
      console.error("Login error:", err);
      // Construct a readable error message
      const msg = err.response?.data?.error_description || err.response?.data?.error || "Login failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_, thunkAPI) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth") || "{}");
      if (!storedAuth.refresh_token) {
        return thunkAPI.rejectWithValue("No refresh token found");
      }

      const params = new URLSearchParams();
      params.append("client_id", KC_CLIENT_ID);
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", storedAuth.refresh_token);

      const res = await axios.post(KC_TOKEN_URL, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = res.data;
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token, // Keycloak rotates refresh tokens by default
      };
    } catch (err) {
      console.error("Refresh error:", err);
      return thunkAPI.rejectWithValue("Token refresh failed");
    }
  }
);

const loadAuthFromStorage = (): AuthState => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure we have at least the token and user
      if (parsed.access_token && parsed.user) {
        return {
          user: parsed.user,
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token || null,
          roles: parsed.user.roles || [],
          groups: parsed.user.groups || [],
          isAuthenticated: true,
          error: null,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load auth from storage", e);
  }
  return {
    user: null,
    access_token: null,
    refresh_token: null,
    roles: [],
    groups: [],
    isAuthenticated: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthFromStorage() as AuthState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.roles = [];
      state.groups = [];
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginWithCredentials.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.roles = action.payload.user.roles;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;

      localStorage.setItem(
        "auth",
        JSON.stringify({
          access_token: action.payload.access_token,
          refresh_token: action.payload.refresh_token,
          user: action.payload.user,
        })
      );
    });

    builder.addCase(loginWithCredentials.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    builder.addCase(refreshAccessToken.fulfilled, (state, action) => {
      state.access_token = action.payload.access_token;
      if (action.payload.refresh_token) {
        state.refresh_token = action.payload.refresh_token;
      }

      const stored = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...stored,
          access_token: action.payload.access_token,
          refresh_token: state.refresh_token, // Use updated or existing
        })
      );
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
