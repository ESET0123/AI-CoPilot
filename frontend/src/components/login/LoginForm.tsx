import {
    Button,
    Stack,
    Text,
    Box,
    TextInput,
    PasswordInput,
    Title,
    Container,
    Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLock, IconMail } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginWithCredentials } from '../../features/auth/authSlice';

export default function LoginForm({ setLoading }: { setLoading: (loading: boolean) => void }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { error } = useAppSelector((s) => s.auth);

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
                                styles={{
                                    input: {
                                        backgroundColor: 'white',
                                        color: 'black',
                                    },
                                }}
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                required
                                size="md"
                                radius="md"
                                leftSection={<IconLock size={18} />}
                                styles={{
                                    input: {
                                        backgroundColor: 'white',
                                        color: 'black',
                                    },
                                }}
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
    );
}
