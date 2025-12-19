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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSun, IconMoon, IconLogin } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { sendOtp, verifyOtp } from '../features/auth/authSlice';
import HeaderBar from '../components/layout/HeaderBar';
import { toggleTheme } from '../features/theme/themeSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, step, email, error } = useAppSelector(s => s.auth);
  const scheme = useAppSelector(s => s.theme.colorScheme);

  const [emailInput, setEmailInput] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendOtp(emailInput));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    dispatch(verifyOtp({ email, otp }));
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

      {/* Page */}
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
                Login using email OTP
              </Text>
            </Stack>

            <Divider />

            {step === 'email' ? (
              <form onSubmit={handleSendOtp}>
                <Stack gap="sm">
                  <TextInput
                    label="Email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) =>
                      setEmailInput(e.currentTarget.value)
                    }
                  />

                  {error && <Text c="red">{error}</Text>}

                  <Button
                    type="submit"
                    fullWidth
                    leftSection={<IconLogin size={16} />}
                  >
                    Send OTP
                  </Button>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <Stack gap="sm">
                  <TextInput
                    label="Enter OTP"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.currentTarget.value)
                    }
                  />

                  {error && <Text c="red">{error}</Text>}

                  <Button type="submit" fullWidth>
                    Verify OTP
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Theme toggle */}
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
