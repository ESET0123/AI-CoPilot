import { Group, Title, Burger, Box, Image, Avatar, Menu, UnstyledButton, rem } from '@mantine/core';
import { TbLogout } from 'react-icons/tb';
import { useLayout } from './LayoutContext';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

export default function HeaderBar() {
  const { mobileOpened, toggleMobile, hasSidebar } = useLayout();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const getInitials = (u: any) => {
    if (u?.given_name && u?.family_name) {
      return `${u.given_name[0]}${u.family_name[0]}`.toUpperCase();
    }
    if (u?.name) {
      return u.name.substring(0, 2).toUpperCase();
    }
    if (u?.email) {
      return u.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

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
      <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
        <Menu.Target>
          <UnstyledButton>
            <Avatar
              radius="xl"
              src={null}
              alt="User profile"
              color="green"
              style={{ cursor: 'pointer' }}
            >
              {getInitials(user)}
            </Avatar>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            color="red"
            leftSection={<TbLogout style={{ width: rem(14), height: rem(14) }} />}
            onClick={() => dispatch(logout())}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
