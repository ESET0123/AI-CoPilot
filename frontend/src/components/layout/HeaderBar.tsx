import { Group, Title, Burger, ActionIcon, Tooltip } from '@mantine/core';
import { useLayout } from './AppShellLayout';
import { IconLayoutSidebarRightCollapse, IconLayoutSidebarRightExpand } from '@tabler/icons-react';

type Props = {
  onToggleDataPanel?: () => void;
  showDataPanel?: boolean;
};

export default function HeaderBar({ onToggleDataPanel, showDataPanel }: Props) {
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

      {onToggleDataPanel && (
        <Tooltip label={showDataPanel ? 'Hide Data Panel' : 'Show Data Panel'}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onToggleDataPanel}
            size="lg"
          >
            {showDataPanel ? (
              <IconLayoutSidebarRightExpand stroke={1.5} />
            ) : (
              <IconLayoutSidebarRightCollapse stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
