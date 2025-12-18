import {
  Group,
  Text,
  Menu,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconLogout,
  IconSun,
  IconMoon,
  IconUser,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
// import { resetChats } from '../../features/chat/chatSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import { useNavigate } from 'react-router-dom';

type Props = {
  collapsed?: boolean;
};

export default function UserMenu({ collapsed = false }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((s) => s.auth.user);
  const scheme = useAppSelector((s) => s.theme.colorScheme);

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
          label={collapsed ? user?.name ?? 'User' : undefined}
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
              <IconUser size={collapsed ? 22 : 18} />
            </ActionIcon>

            {!collapsed && (
              <Text size="sm" fw={500}>
                {user?.name ?? 'User'}
              </Text>
            )}
          </Group>
        </Tooltip>
      </Menu.Target>

      {/* ===== Dropdown ===== */}
      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            scheme === 'dark'
              ? <IconSun size={16} />
              : <IconMoon size={16} />
          }
          onClick={() => dispatch(toggleTheme())}
        >
          Toggle theme
        </Menu.Item>

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => {
            dispatch(logout());
            // dispatch(resetChats());
            navigate('/', { replace: true });
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
