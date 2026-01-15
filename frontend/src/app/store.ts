import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '../features/auth/authSlice';
import chatReducer, { ChatState } from '../features/chat/chatSlice';

export interface RootState {
  auth: AuthState;
  chat: ChatState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
