import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginApi } from './authService';
import type { User } from './../chat/types';

const storedAuth = localStorage.getItem('auth');

type AuthState = {
  user: User | null;
  token: string | null;
  error: string | null;
};

const initialState: AuthState = storedAuth
  ? JSON.parse(storedAuth)
  : { user: null, token: null, error: null };

export const login = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await loginApi(payload.email, payload.password);
      return data as { user: User; token: string };
    } catch {
      return rejectWithValue('Invalid credentials');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;

        state.token = action.payload.token;

        localStorage.setItem(
        'auth',
        JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
            error: null,
        })
        );

      })
      .addCase(login.rejected, (state) => {
        state.error = 'Invalid credentials';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
