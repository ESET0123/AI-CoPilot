import { Box, Title, Container } from '@mantine/core';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';

export default function SmartTariffPage() {
    return (
        <AppShellLayout>
            <Box h="100%" display="flex" style={{ flexDirection: 'column' }}>
                <Box h={60} px="md" style={{ borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center' }}>
                    <HeaderBar />
                </Box>
                <Container size="xl" pt="xl">
                    <Title>Smart Tariff</Title>
                    <p>Optimized tariff structures and analysis.</p>
                </Container>
            </Box>
        </AppShellLayout>
    );
}
