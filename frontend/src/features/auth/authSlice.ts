import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import type { User } from '../chat/types';

type AuthState = {
  user: User | null;
  token: string | null;
  email: string | null;
  error: string | null;
};

const storedAuth = localStorage.getItem('auth');

const initialState: AuthState = storedAuth
  ? {
      user: JSON.parse(storedAuth).user,
      token: JSON.parse(storedAuth).token,
      email: null,
      error: null,
    }
  : {
      user: null,
      token: null,
      email: null,
      error: null,
    };

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      await authApi.sendOtp(email);
      return email;
    } catch {
      return rejectWithValue('Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authApi.verifyOtp(payload);
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: data.user,
          token: data.token,
        })
      );
      return data;
    } catch {
      return rejectWithValue('Invalid or expired OTP');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      localStorage.removeItem('auth');
      return {
        user: null,
        token: null,
        email: null,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.email = action.payload;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
