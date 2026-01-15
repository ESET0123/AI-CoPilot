import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../services/axiosClient";

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
      const res = await axiosClient.post("/auth/login", payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_, thunkAPI) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth") || "{}");

      const res = await axiosClient.post("/auth/refresh", {
        refresh_token: storedAuth.refresh_token,
      });

      return res.data;
    } catch (err) {
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

const authSlice = createSlice<AuthState>({
  name: "auth",
  initialState: loadAuthFromStorage(),
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

      const stored = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...stored,
          access_token: action.payload.access_token,
          refresh_token: action.payload.refresh_token,
        })
      );
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
