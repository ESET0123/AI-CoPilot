import {
  TextInput,
  Button,
  Stack,
  Text,
  Box,
  Paper,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconSun, IconMoon, IconUserPlus } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleTheme } from '../features/theme/themeSlice';
import HeaderBar from '../components/layout/HeaderBar';
import { registerApi } from '../features/auth/authService';


export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const scheme = useAppSelector((s) => s.theme.colorScheme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await registerApi(name, email, password);

    // Success → go to login
    navigate('/', { replace: true });
  } catch (err) {
    console.error('Registration failed', err);
  }
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
        {/* Register Card */}
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
                Create account
              </Text>
              <Text size="sm" c="dimmed">
                Sign up to start using Esyasoft AI Copilot
              </Text>
            </Stack>

            <Divider />

            <form onSubmit={handleSubmit}>
              <Stack gap="sm">
                <TextInput
                  label="Full name"
                  placeholder="John Doe"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.currentTarget.value)}
                />

                <TextInput
                  label="Email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />

                <TextInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  leftSection={<IconUserPlus size={16} />}
                  mt="sm"
                >
                  Create account
                </Button>
              </Stack>
            </form>

            <Text size="sm" ta="center">
              Already have an account?{' '}
              <Text
                component={Link}
                to="/"
                fw={500}
                c="blue"
                style={{ textDecoration: 'none' }}
              >
                Sign in
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
