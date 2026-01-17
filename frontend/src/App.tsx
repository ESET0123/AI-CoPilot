import { MantineProvider } from '@mantine/core';
import AppRoutes from './routes/AppRoutes';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppRoutes />
    </MantineProvider>
  );
}
