/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../services/axiosClient";
import type { User, LoginCredentials } from "../../types/types";

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  roles: string[];
  groups: string[];
  isAuthenticated: boolean;
  error: string | null;
}

export const loginWithCredentials = createAsyncThunk(
  "auth/login",
  async (payload: LoginCredentials, thunkAPI) => {
    try {
      // Direct call to backend (BFF)
      const res = await axiosClient.post("/auth/login", {
        username: payload.username,
        password: payload.password,
      });

      const data = res.data;

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
    try {
      localStorage.removeItem("auth");
    } catch (storageError) {
      console.error("Failed to clear legacy auth key:", storageError);
    }

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const user = JSON.parse(stored) as User;
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
    console.error("Failed to load auth from storage:", e);
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

      try {
        localStorage.removeItem("auth_user");
      } catch (error) {
        console.error("Failed to remove auth_user from localStorage:", error);
      }

      axiosClient.post("/auth/logout").catch(console.error);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginWithCredentials.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.user.roles;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;

      try {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      } catch (error) {
        console.error("Failed to save user to localStorage:", error);
      }
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
