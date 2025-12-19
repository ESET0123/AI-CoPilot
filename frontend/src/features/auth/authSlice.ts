import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import type { User } from '../chat/types';

/* ================= STATE ================= */

type AuthStep = 'email' | 'otp';

type AuthState = {
  user: User | null;
  token: string | null;
  step: AuthStep;
  email: string | null;
  error: string | null;
};

const storedAuth = localStorage.getItem('auth');

const initialState: AuthState = storedAuth
  ? {
      ...JSON.parse(storedAuth),
      step: 'email',
      email: null,
      error: null,
    }
  : {
      user: null,
      token: null,
      step: 'email',
      email: null,
      error: null,
    };

/* ================= THUNKS ================= */

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
      return data as { user: User; token: string };
    } catch {
      return rejectWithValue('Invalid or expired OTP');
    }
  }
);


/* ================= SLICE ================= */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      localStorage.removeItem('auth');
      return initialState;
    },

    resetAuthStep(state) {
      state.step = 'email';
      state.email = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== SEND OTP ===== */
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.step = 'otp';
        state.email = action.payload;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* ===== VERIFY OTP ===== */
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;

        localStorage.setItem(
          'auth',
          JSON.stringify({
            user: state.user,
            token: state.token,
          })
        );
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

/* ================= EXPORTS ================= */

export const { logout, resetAuthStep } = authSlice.actions;
export default authSlice.reducer;
