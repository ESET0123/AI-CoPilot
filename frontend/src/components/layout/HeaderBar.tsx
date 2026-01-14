import { Group, Title, Burger, Box } from '@mantine/core';
import { useLayout } from './AppShellLayout';

export default function HeaderBar() {
  const { mobileOpened, toggleMobile } = useLayout();

  return (
    <Group h="100%" px="md" justify="space-between" align="center" style={{ width: '100%' }}>
      <Group gap="sm">
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          size="sm"
          color="#000000"
        />
        <Title order={4} style={{ color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Box component="span" style={{ fontWeight: 800 }}>esyasoft</Box>
          {/* <Box component="span" style={{ fontWeight: 400, color: '#94a3b8' }}>AI CoPilot</Box> */}
        </Title>
      </Group>
    </Group>
  );
}
