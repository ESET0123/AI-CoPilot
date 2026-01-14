import { MantineProvider } from '@mantine/core';
import { useAppSelector } from './app/hooks';
import AppRoutes from './routes/AppRoutes';
import { theme } from './styles/theme';

export default function App() {
  const scheme = useAppSelector((s) => s.theme.colorScheme);

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={scheme}
      forceColorScheme={scheme}
    >
      <AppRoutes />
    </MantineProvider>
  );
}
