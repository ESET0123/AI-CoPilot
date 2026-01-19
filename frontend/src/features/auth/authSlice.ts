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
  isInitialLoading: boolean;
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

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, thunkAPI) => {
    try {
      const res = await axiosClient.get("/auth/me");
      return res.data; // Expected { user: { ... } }
    } catch (err) {
      return thunkAPI.rejectWithValue("Not authenticated");
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

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    access_token: null,
    refresh_token: null,
    roles: [],
    groups: [],
    isAuthenticated: false,
    error: null,
    isInitialLoading: true, // New flag for initial session check
  } as AuthState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.roles = [];
      state.groups = [];
      state.isAuthenticated = false;
      state.error = null;

      axiosClient.post("/auth/logout").catch(console.error);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginWithCredentials.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.user.roles;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;
      state.error = null;
    });

    builder.addCase(loginWithCredentials.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    builder.addCase(loginWithCredentials.pending, (state) => {
      state.error = null;
    });

    builder.addCase(refreshAccessToken.fulfilled, (state) => {
      // Nothing to update in state, tokens are in cookies
      state.isAuthenticated = true;
    });

    builder.addCase(checkAuthStatus.pending, (state) => {
      state.isInitialLoading = true;
    });

    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.user.roles;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;
      state.isInitialLoading = false;
    });

    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.isAuthenticated = false;
      state.isInitialLoading = false;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
