import { MantineProvider } from '@mantine/core';
import { useAppSelector } from './app/hooks';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const scheme = useAppSelector((s) => s.theme.colorScheme);

  return (
    <MantineProvider
      defaultColorScheme={scheme}
      forceColorScheme={scheme}
    >
      <AppRoutes />
    </MantineProvider>
  );
}
