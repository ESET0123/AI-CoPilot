import { MantineProvider } from '@mantine/core';
import AppRoutes from './routes/AppRoutes';
import { theme } from './theme';
import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuthStatus } from './features/auth/authSlice';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppRoutes />
    </MantineProvider>
  );
}
