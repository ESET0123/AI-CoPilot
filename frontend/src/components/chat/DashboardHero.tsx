import {
    Box, Container, Stack, Text, Title,
} from '@mantine/core';
import { useAppSelector } from '../../app/hooks';

export default function DashboardHero() {
    const user = useAppSelector((s) => s.auth.user);
    // console.log('User in DashboardHero:', user);
    const firstName = user?.given_name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const greeting = getGreeting();

    return (
        <Container size="lg" h="100%" display="flex" style={{ flexDirection: "column" }} p="2rem">
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                {/* Animated Glow Orb */}
                <Box style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* The soft glow behind */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            // padding: '14px',
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
                    <Title order={1} size={48} fw={800} c="#1e293b" ta="center">
                        {greeting}, {firstName}
                    </Title>
                    <Title order={2} size={48} fw={800} c="#1e293b" ta="center">
                        What's on <Text span c="#65a30d" inherit>your mind?</Text>
                    </Title>
                    <Text c="dimmed" size="lg" maw={600} ta="center" mt="sm">
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
