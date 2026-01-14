import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import type { User } from '../chat/types';
import keycloak from '../../config/keycloak';

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  idToken: string | null;
  error: string | null;
  isAuthenticated: boolean;
};

const storedAuth = localStorage.getItem('auth');

const initialState: AuthState = storedAuth
  ? {
    ...JSON.parse(storedAuth),
    error: null,
    isAuthenticated: true,
  }
  : {
    user: null,
    token: null,
    refreshToken: null,
    idToken: null,
    error: null,
    isAuthenticated: false,
  };

export const loginWithKeycloak = createAsyncThunk(
  'auth/loginWithKeycloak',
  async (_, { rejectWithValue }) => {
    try {
      const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
      const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'chatbot_keycloak_integration';
      const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'test_client';
      const redirectUri = window.location.origin + '/dashboard';

      const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth` +
        `?client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=openid`;

      console.log('[authSlice] Redirecting to Keycloak (Manual):', authUrl);
      window.location.href = authUrl;

      return null;
    } catch (error) {
      console.error('[authSlice] Login failed:', error);
      return rejectWithValue('Failed to initiate login');
    }
  }
);

export const handleKeycloakCallback = createAsyncThunk(
  'auth/handleCallback',
  async (code: string, { rejectWithValue }) => {
    try {
      const redirectUri = window.location.origin + '/dashboard';
      const { data } = await authApi.keycloakCallback(code, redirectUri);

      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: data.user,
          token: data.access_token,
          refreshToken: data.refresh_token,
          idToken: data.id_token,
        })
      );

      return data;
    } catch (error) {
      return rejectWithValue('Authentication failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const { data } = await authApi.refreshToken(refreshToken);

      const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
      localStorage.setItem(
        'auth',
        JSON.stringify({
          ...currentAuth,
          token: data.access_token,
          refreshToken: data.refresh_token,
        })
      );

      return data;
    } catch (error) {
      return rejectWithValue('Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      const idToken = state.auth.idToken;

      /* 
         Skipping manual backend logout to prevent race condition with browser redirect.
         The browser redirect to Keycloak logout endpoint will handle session invalidation
         and cookie clearing effectively.
      */
      // if (refreshToken) { ... }

      // 1. Clear local state immediately
      // We can dispatch the sync logout action, or rely on extraReducers.
      // Dispatching sync action is safer to ensure state is cleared even if redirection fails.
      dispatch(authSlice.actions.logout());

      // 2. Redirect to Keycloak Logout Endpoint
      const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
      const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'chatbot_keycloak_integration';
      const redirectUri = window.location.origin;

      let logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout` +
        `?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;

      if (idToken) {
        logoutUrl += `&id_token_hint=${idToken}`;
      }

      console.log('[authSlice] Redirecting to Keycloak Logout:', logoutUrl);
      window.location.href = logoutUrl;

      return null;
    } catch (error) {
      console.error('[authSlice] Logout error:', error);
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('auth');
      // We do NOT call keycloak.logout() here because it might crash if not initialized.
      // The logoutUser thunk handles the redirection manually.
      return {
        user: null,
        token: null,
        refreshToken: null,
        idToken: null,
        error: null,
        isAuthenticated: false,
      };
    },
    setAuthFromKeycloak(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.idToken = action.payload.idToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleKeycloakCallback.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.idToken = action.payload.id_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(handleKeycloakCallback.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        localStorage.removeItem('auth');
      });
  },
});

export const { logout, setAuthFromKeycloak } = authSlice.actions;
export default authSlice.reducer;
