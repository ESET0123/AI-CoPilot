import {
    Box, Container, SimpleGrid, Stack, Text, Title,
} from '@mantine/core';
import { IconAlertTriangle, IconActivity, IconCalculator, IconUsers } from '@tabler/icons-react';
import ChatInput from './ChatInput';
import QuickActionCard from './QuickActionCard';
import { useAppSelector } from '../../app/hooks';

export default function DashboardHero() {
    // We can get the user name from the store, defaulting to "User"
    const user = useAppSelector((s) => s.auth.user);
    // console.log('User in DashboardHero:', user);
    const firstName = user?.email?.split('@')[0] || 'User';

    return (
        <Container size="lg" h="100%" styles={{ root: { display: "flex", flexDirection: "column", padding: "2rem", marginBottom: "14rem" } }}>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                {/* Animated Glow Orb */}
                <Box style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* The soft glow behind */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            padding: '14px',
                            transform: 'translate(-50%, -50%)',
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(34, 208, 40, 0.65) 0%, rgba(132, 204, 22, 0) 70%)',
                            filter: 'blur(20px)',
                            zIndex: 0,
                        }}
                    />
                    {/* The crisp sphere */}
                    <Box
                        style={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4ade80 0%, #ece019 100%)',
                            boxShadow: '0 20px 25px -5px rgba(74, 222, 128, 0.3), inset 0 -4px 6px -1px rgba(0,0,0,0.05)',
                            zIndex: 1,
                        }}
                    />
                </Box>

                <Stack gap="xs" align="center" mb="3rem">
                    <Title order={1} size={42} fw={700} c="#1e293b" ta="center">
                        Good Afternoon, {firstName}
                    </Title>
                    <Title order={2} size={42} fw={700} c="#1e293b" ta="center">
                        What's on <Text span c="#65a30d" inherit>your mind?</Text>
                    </Title>
                    <Text c="dimmed" size="md" maw={500} ta="center" mt="sm">
                        Find answers to your questions quickly or choose a category below to refine results
                    </Text>
                </Stack>

                <Box w="100%" maw={800} mb="4rem">
                    <ChatInput isHeroMode />
                </Box>

                <Box w="100%" maw={900}>
                    <Text fw={600} size="lg" mb="md" c="#334155">Quick Access Categories</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                        <QuickActionCard
                            title="Theft Detection"
                            description="View Real Time data and detect anomalies"
                            icon={IconAlertTriangle}
                            onClick={() => { }}
                        />
                        <QuickActionCard
                            title="Load Forecasting"
                            description="View Real Time data and detect patterns"
                            icon={IconActivity}
                            onClick={() => { }}
                        />
                        <QuickActionCard
                            title="Smart Tariff"
                            description="Optimize tariff structures"
                            icon={IconCalculator}
                            onClick={() => { }}
                        />
                        <QuickActionCard
                            title="Defaulter Analysis"
                            description="Predictive analysis for payments"
                            icon={IconUsers}
                            onClick={() => { }}
                        />
                    </SimpleGrid>
                </Box>
            </Box>
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
      `}</style>
        </Container>
    );
}
