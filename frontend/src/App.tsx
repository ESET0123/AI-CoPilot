import { MantineProvider } from '@mantine/core';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AppRoutes />
    </MantineProvider>
  );
}
