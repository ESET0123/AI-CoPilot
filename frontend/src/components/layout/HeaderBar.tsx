import { Group, Title, Burger } from '@mantine/core';
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
        />
        <Title order={4}>Esyasoft AI CoPilot</Title>
      </Group>
    </Group>
  );
}
