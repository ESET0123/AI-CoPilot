import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../services/axiosClient";

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
      // Direct call to backend (BFF)
      const res = await axiosClient.post("/auth/login", {
        username: payload.email,
        password: payload.password,
      });

      const data = res.data;

      // We still need the user info on the frontend.
      // Since we don't return the token in the body (or do we?), we need to parse it.
      // Actually, my backend didn't return the token in the body.
      // I should update the backend to at least return the decoded user info if the frontend needs it,
      // OR the frontend can call a /me endpoint.
      // For now, let's assume we want to keep the frontend simple and have the backend return the user info.

      // WAIT: I'll need to update the backend /login to return the user info.
      // Let's first fix the slice to expect what the backend will eventually provide.

      return {
        user: data.user,
      };
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err.response?.data?.error_description || err.response?.data?.error || "Login failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_, thunkAPI) => {
    try {
      const res = await axiosClient.post("/auth/refresh");
      return res.data;
    } catch (err) {
      console.error("Refresh error:", err);
      return thunkAPI.rejectWithValue("Token refresh failed");
    }
  }
);

const loadAuthFromStorage = (): AuthState => {
  try {
    // Clear legacy storage key if it exists
    localStorage.removeItem("auth");

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user) {
        return {
          user,
          access_token: null, // Tokens are in HttpOnly cookies
          refresh_token: null,
          roles: user.roles || [],
          groups: user.groups || [],
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
      localStorage.removeItem("auth_user");
      axiosClient.post("/auth/logout").catch(console.error);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginWithCredentials.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.user.roles;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;

      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    });

    builder.addCase(loginWithCredentials.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    builder.addCase(refreshAccessToken.fulfilled, (state) => {
      // Nothing to update in state, tokens are in cookies
      state.isAuthenticated = true;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
