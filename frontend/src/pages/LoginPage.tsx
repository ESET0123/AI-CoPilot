import { Button, Stack, Text, Box, Paper, ActionIcon, Divider, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconSun, IconMoon, IconLogin } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { handleKeycloakCallback, loginWithKeycloak } from '../features/auth/authSlice';
import HeaderBar from '../components/layout/HeaderBar';
import { toggleTheme } from '../features/theme/themeSlice';
import keycloak from '../config/keycloak';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, error } = useAppSelector(s => s.auth);
  const scheme = useAppSelector(s => s.theme.colorScheme);

  const [loading, setLoading] = useState(false);

  // Handle OAuth2 callback
  useEffect(() => {
    // Check both query string and hash fragment for code
    const code = searchParams.get('code') ||
      new URLSearchParams(window.location.hash.substring(1)).get('code');
    console.log('[LoginPage] OAuth callback check - code:', code);
    if (code) {
      setLoading(true);
      console.log('[LoginPage] Dispatching handleKeycloakCallback');
      dispatch(handleKeycloakCallback(code))
        .unwrap()
        .then((data) => {
          console.log('[LoginPage] Callback success, data:', data);
          console.log('[LoginPage] Navigating to /dashboard');
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error('[LoginPage] Callback failed:', err);
          setLoading(false);
        });
    }
  }, [searchParams, dispatch, navigate]);

  useEffect(() => {
    console.log('[LoginPage] User state changed:', user);
    if (user) {
      console.log('[LoginPage] User exists, navigating to /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = () => {
    dispatch(loginWithKeycloak());
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Authenticating...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <Box
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          padding: '12px 24px',
        }}
      >
        <HeaderBar />
      </Box>

      {/* ================= PAGE ================= */}
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
        <Paper withBorder radius="xl" shadow="lg" p="xl" w={360}>
          <Stack gap="md">
            <Stack gap={4}>
              <Text size="xl" fw={600}>
                Sign in
              </Text>
              <Text size="sm" c="dimmed">
                Login using Keycloak
              </Text>
            </Stack>

            <Divider />

            <Stack gap="sm">
              {error && <Text c="red">{error}</Text>}

              {/* ================= KEYCLOAK LOGIN BUTTON ================= */}
              <Button
                type="button"
                fullWidth
                leftSection={<IconLogin size={16} />}
                onClick={handleLogin}
                variant="gradient"
                gradient={{ from: '#BFFF00', to: '#99FF33', deg: 135 }}
                styles={{
                  root: {
                    color: '#1A1A1A',
                    fontWeight: 700,
                  },
                }}
              >
                Sign in with Keycloak
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* ================= THEME TOGGLE ================= */}
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
        }}
      >
        {scheme === 'dark' ? <IconSun /> : <IconMoon />}
      </ActionIcon>
    </>
  );
}
