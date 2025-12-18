import {TextInput, Button, Stack, Text, Box, Paper, ActionIcon, Divider, } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconSun, IconMoon, IconLogin } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
// import { hydrateChats } from '../features/chat/chatSlice';
import { toggleTheme } from '../features/theme/themeSlice';
// import { chatStorage } from '../services/chatStorage';
import HeaderBar from '../components/layout/HeaderBar';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector((s) => s.auth);
  const scheme = useAppSelector((s) => s.theme.colorScheme);
  const error = useAppSelector((s) => s.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* ================= Hydrate chats after login ================= */
  // useEffect(() => {
  //   if (!auth.user) return;

  //   const userId = String(auth.user.id);
  //   const storedChats = chatStorage.load(userId);

  //   dispatch(
  //     hydrateChats(
  //       storedChats ?? {
  //         conversations: [
  //           {
  //             id: crypto.randomUUID(),
  //             title: 'New Chat',
  //             messages: [],
  //           },
  //         ],
  //         activeConversationId: '',
  //       }
  //     )
  //   );

  //   navigate('/dashboard', { replace: true });
  // }, [auth.user, dispatch, navigate]);

    useEffect(() => {
      if (auth.user) {
        navigate('/dashboard', { replace: true });
      }
    }, [auth.user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <>
      {/* Header */}
      <Box
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          padding: '12px 24px',
        }}
      >
        <HeaderBar />
      </Box>

      {/* Page Background */}
      <Box
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            scheme === 'dark'
              ? 'radial-gradient(circle at top, #1a1b1e, #0f0f10)'
              : 'radial-gradient(circle at top, #f8fafc, #eef2ff)',
        }}
      >
        {/* Login Card */}
        <Paper
          withBorder
          radius="xl"
          shadow="lg"
          p="xl"
          w={360}
        >
          <Stack gap="md">
            <Stack gap={4}>
              <Text size="xl" fw={600}>
                Welcome back
              </Text>
              <Text size="sm" c="dimmed">
                Sign in to continue to Esyasoft AI Copilot
              </Text>
            </Stack>

            <Divider />

            <form onSubmit={handleSubmit}>
              <Stack gap="sm">
                <TextInput
                  label="Username"
                  placeholder="admin"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />

                <TextInput
                  label="Password"
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />

                {error && (
                  <Text c="red" size="sm">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  fullWidth
                  leftSection={<IconLogin size={16} />}
                  mt="sm"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            
            <Text size="sm" ta="center">
              New here?{' '}
              <Text
                component={Link}
                to="/register"
                fw={500}
                c="blue"
                style={{ textDecoration: 'none' }}
              >
                Create an account
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Box>

      {/* Theme Toggle — Bottom Right */}
      <ActionIcon
        onClick={() => dispatch(toggleTheme())}
        size="lg"
        radius="xl"
        variant="filled"
        color={scheme === 'dark' ? 'yellow' : 'blue'}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 1000,
        }}
        aria-label="Toggle theme"
      >
        {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </>
  );
}
