import { useState } from 'react';
import {
  Group,
  Text,
  Menu,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { IconTrash } from '@tabler/icons-react';
import { deleteAllConversations } from '../../features/chat/chatSlice';
import { useDisclosure } from '@mantine/hooks';
import DeleteAllConversationsModal from '../modals/DeleteAllConversationsModal';


type Props = {
  collapsed?: boolean;
};

export default function UserMenu({ collapsed = false }: Props) {
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);

  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
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
    <Menu
      position={collapsed ? 'right-end' : 'top-start'}
      withArrow
      shadow="md"
      width={180}
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
              borderRadius: 8,
              width: '100%',
            }}
          >
            <ActionIcon variant="subtle" radius="xl" size={collapsed ? 'lg' : 'md'}>
              <IconSettings size={collapsed ? 22 : 18} color="#000000" />
            </ActionIcon>

            {!collapsed && (
              <Text size="sm" fw={500} style={{ color: '#000000' }}>
                {/* {user?.email ?? 'User'} */}
                Settings & Help
              </Text>
            )}
          </Group>
        </Tooltip>
      </Menu.Target>

      {/* ===== Dropdown ===== */}
      <Menu.Dropdown>

        <Menu.Item
          // color="red"
          leftSection={<IconTrash size={16} />}
          onClick={openDeleteModal}
        >
          Delete all chats
        </Menu.Item>

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => {
            dispatch(logout());
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>

      <DeleteAllConversationsModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAll}
        loading={isDeleting}
      />
    </Menu>
  );
}
