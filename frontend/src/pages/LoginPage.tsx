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

  const { user, email, error } = useAppSelector(s => s.auth);
  const scheme = useAppSelector(s => s.theme.colorScheme);

  const [emailInput, setEmailInput] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingOtp || otpSent) return;

    setSendingOtp(true);
    try {
      await dispatch(sendOtp(emailInput)).unwrap();
      setOtpSent(true);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    dispatch(verifyOtp({ email, otp }));
  };

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
                Login using email OTP
              </Text>
            </Stack>

            <Divider />

            <form
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            >
              <Stack gap="sm">
                {/* ================= EMAIL ================= */}
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  value={otpSent ? email ?? emailInput : emailInput}
                  onChange={(e) =>
                    setEmailInput(e.currentTarget.value)
                  }
                  disabled={otpSent}
                  required
                />

                {/* ================= OTP (AFTER SEND) ================= */}
                {otpSent && (
                  <TextInput
                    label="Enter OTP"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.currentTarget.value)
                    }
                    required
                  />
                )}

                {error && <Text c="red">{error}</Text>}

                {/* ================= ACTION BUTTON ================= */}
                <Button
                  type="submit"
                  fullWidth
                  leftSection={
                    !otpSent ? (
                      <IconLogin size={16} />
                    ) : undefined
                  }
                  disabled={
                    sendingOtp ||
                    (otpSent && otp.trim().length === 0)
                  }
                >
                  {otpSent ? 'Verify OTP' : 'Send OTP'}
                </Button>
              </Stack>
            </form>
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
