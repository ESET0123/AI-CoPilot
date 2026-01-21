import { MantineProvider } from '@mantine/core';
import AppRoutes from './routes/AppRoutes';
import { theme } from './theme';
import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuthStatus } from './features/auth/authSlice';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Get initial color scheme from localStorage or default to 'light'
  const defaultColorScheme = (localStorage.getItem('mantine-color-scheme') as 'light' | 'dark' | 'auto') || 'light';

  return (
    <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
      <AppRoutes />
    </MantineProvider>
  );
}
