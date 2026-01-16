import { Box, Title, Container } from '@mantine/core';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';

export default function LoadForecastingPage() {
    return (
        <AppShellLayout>
            <Box h="100%" display="flex" style={{ flexDirection: 'column' }}>
                <Box h={60} px="md" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center' }}>
                    <HeaderBar />
                </Box>
                <Container size="xl" pt="xl">
                    <Title>Load Forecasting</Title>
                    <p>Real-time data and pattern recognition for load forecasting.</p>
                </Container>
            </Box>
        </AppShellLayout>
    );
}
