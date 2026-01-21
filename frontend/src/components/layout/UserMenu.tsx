import { useState } from 'react';
import {
  Group,
  Text,
  Menu,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  TbLogout,
  TbSettings,
  TbTrash,
  TbQuestionMark,
  TbUser,
  TbBell,
  TbLock,
  TbPalette,
} from 'react-icons/tb';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { deleteAllConversations } from '../../features/chat/chatSlice';
import { useDisclosure } from '@mantine/hooks';
import DeleteAllConversationsModal from '../modals/DeleteAllConversationsModal';
import SettingsModal from '../modals/SettingsModal';
import HelpModal from '../modals/HelpModal';

type Props = {
  collapsed?: boolean;
};

export default function UserMenu({ collapsed = false }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const [helpOpened, { open: openHelp, close: closeHelp }] = useDisclosure(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAllConversations()).unwrap();
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete all chats:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Menu
        position={collapsed ? 'right-end' : 'top-start'}
        withArrow
        shadow="md"
        width={220}
        radius="md"
        styles={{
          item: {
            padding: '10px 12px',
          }
        }}
      >
        {/* ===== Trigger ===== */}
        <Menu.Target>
          <Tooltip
            label={collapsed ? user?.email ?? 'User' : undefined}
            position="right"
            disabled={!collapsed}
          >
            <Group
              p="xs"
              gap="xs"
              align="center"
              justify={collapsed ? 'center' : 'flex-start'}
              style={{
                cursor: 'pointer',
                borderRadius: 12,
                width: '100%',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ActionIcon variant="subtle" radius="xl" size={collapsed ? 'lg' : 'md'} color="gray">
                <TbSettings size={collapsed ? 22 : 18} />
              </ActionIcon>

              {!collapsed && (
                <Text size="sm" fw={600} style={{ color: 'var(--mantine-color-text)' }}>
                  Settings & Help
                </Text>
              )}
            </Group>
          </Tooltip>
        </Menu.Target>

        {/* ===== Dropdown ===== */}
        <Menu.Dropdown>
          <Menu.Label>Preferences</Menu.Label>

          <Menu.Item
            leftSection={<TbSettings size={16} />}
            onClick={openSettings}
          >
            Settings
          </Menu.Item>

          <Menu.Item
            leftSection={<TbQuestionMark size={16} />}
            onClick={openHelp}
          >
            Help & FAQ
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Danger Zone</Menu.Label>
          <Menu.Item
            leftSection={<TbTrash size={16} />}
            onClick={openDeleteModal}
            color="red.6"
          >
            Delete all chats
          </Menu.Item>

          <Menu.Item
            color="red.7"
            leftSection={<TbLogout size={16} />}
            onClick={() => {
              dispatch(logout());
            }}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <SettingsModal opened={settingsOpened} onClose={closeSettings} />
      <HelpModal opened={helpOpened} onClose={closeHelp} />

      <DeleteAllConversationsModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAll}
        loading={isDeleting}
      />
    </>
  );
}
