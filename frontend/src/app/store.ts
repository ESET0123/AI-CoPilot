import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '../features/auth/authSlice';
import chatReducer, { ChatState } from '../features/chat/chatSlice';
import settingsReducer, { SettingsState } from '../features/settings/settingsSlice';

export interface RootState {
  auth: AuthState;
  chat: ChatState;
  settings: SettingsState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    settings: settingsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
