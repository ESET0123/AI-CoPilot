import {
    Box, Container, Stack, Text, Title,
} from '@mantine/core';
import { useAppSelector } from '../../app/hooks';

import AnimatedGlowOrb from '../ui/AnimatedGlowOrb';

export default function DashboardHero() {
    const user = useAppSelector((s) => s.auth.user);
    const firstName = user?.given_name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const greeting = getGreeting();

    return (
        <Container size="lg" h="100%" display="flex" style={{ flexDirection: "column" }}>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                {/* Animated Glow Orb */}
                <Box mb="2rem" mt="1rem">
                    <AnimatedGlowOrb size={100} />
                </Box>

                <Stack gap="xs" align="center" mb="3rem">
                    <Title order={1} size={36} fw={700} c="#1e293b" ta="center">
                        {greeting}, {firstName}
                    </Title>
                    <Title order={2} size={36} fw={700} c="#1e293b" ta="center">
                        What's on <Text span c="#65a30d" inherit>your mind?</Text>
                    </Title>
                    <Text c="dimmed" size="md" maw={500} ta="center" mt="sm">
                        Find answers to your questions quickly or choose a category below to refine results
                    </Text>
                </Stack>

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
