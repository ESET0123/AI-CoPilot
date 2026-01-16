import { Group, Title, Burger, Box, Image } from '@mantine/core';
import { useLayout } from './LayoutContext';

export default function HeaderBar() {
  const { mobileOpened, toggleMobile, hasSidebar } = useLayout();

  return (
    <Group h="100%" justify="space-between" align="center" style={{ width: '100%' }}>
      <Group gap="sm">
        {hasSidebar && (
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
            color="#000000"
          />
        )}
        <Title order={4} style={{ color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Box>
            <Image src="/logo-esyasoft.png" w={100} />
          </Box>
        </Title>
      </Group>
    </Group>
  );
}
