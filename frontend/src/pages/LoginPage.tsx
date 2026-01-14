import {
  Button,
  Stack,
  Text,
  Box,
  TextInput,
  PasswordInput,
  Title,
  Image,
  // List,
  ThemeIcon,
  // Center,
  Container,
  LoadingOverlay,
  Divider,
  SimpleGrid,
  Group,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChartPie, IconAlertTriangle, IconUsers, IconActivity, IconCalculator, IconLock, IconMail } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginWithCredentials } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 1 ? 'Password is required' : null),
    },
  });

  useEffect(() => {
    if (isAuthenticated || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (values: typeof form.values) => {
    setLoading(true);
    dispatch(loginWithCredentials(values))
      .unwrap()
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('[LoginPage] Login failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

      {/* ================= LEFT PANEL (Features) ================= */}
      <Box
        style={{
          flex: 1.2,
          backgroundImage: 'url("/login_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '4vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // Push content to edges
          position: 'relative',
        }}
        visibleFrom="md"
      >
        <Box>
          <Image src="/logo-esyasoft.png" w={180} />
        </Box>

        <Stack gap="xl">
          <Box>
            <Title order={1} size={36} fw={700} style={{ color: '#1A1A1A', lineHeight: 1.2, marginBottom: 8 }}>
              See the Network Thinking
            </Title>
            <Text size="md" c="#1A1A1A" fw={500}>
              Utility Analytics Platform
            </Text>
            <Box w={60} h={4} bg="#4CAF50" mt="xs" style={{ borderRadius: 2 }} />
          </Box>

          <Paper p="xl" radius="lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
            <SimpleGrid cols={2} spacing="xl" verticalSpacing="xl">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon color="green" variant="light" size="lg" radius="md">
                  <IconChartPie size={20} />
                </ThemeIcon>
                <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                  AI-Powered Analytics & Insights
                </Text>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon color="green" variant="light" size="lg" radius="md">
                  <IconActivity size={20} />
                </ThemeIcon>
                <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                  Real-time Load Forecasting
                </Text>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon color="green" variant="light" size="lg" radius="md">
                  <IconAlertTriangle size={20} />
                </ThemeIcon>
                <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                  Theft & Anomaly Detection
                </Text>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon color="green" variant="light" size="lg" radius="md">
                  <IconCalculator size={20} />
                </ThemeIcon>
                <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                  Smart Tariff Management
                </Text>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon color="green" variant="light" size="lg" radius="md">
                  <IconUsers size={20} />
                </ThemeIcon>
                <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                  Predictive Defaulter Analysis
                </Text>
              </Group>
            </SimpleGrid>
          </Paper>
        </Stack>
      </Box>

      {/* ================= RIGHT PANEL (Form) ================= */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}
      >
        <Container size={420} w="100%">
          <Stack gap="xl">
            <Stack gap={4}>
              <Title order={2} fw={700} size={32} c="#1A1A1A">
                Welcome Back
              </Title>
              <Text c="dimmed" size="sm">
                Sign in to access your utility analytics dashboard
              </Text>
            </Stack>

            <Divider />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                {error && (
                  <Text c="red" size="sm" fw={500}>
                    {error}
                  </Text>
                )}

                <TextInput
                  label="Email Address"
                  placeholder="name@company.com"
                  required
                  size="md"
                  radius="md"
                  leftSection={<IconMail size={18} />}
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  size="md"
                  radius="md"
                  leftSection={<IconLock size={18} />}
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  size="md"
                  radius="xl"
                  mt="xl"
                  color="dark"
                  styles={{
                    root: {
                      width: 'fit-content',
                      backgroundColor: '#1A1A1A',
                      height: 48,
                      '&:hover': {
                        backgroundColor: '#000',
                      },
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>


          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
