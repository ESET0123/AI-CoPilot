import {
    Stack,
    Text,
    Box,
    Title,
    Image,
    ThemeIcon,
    SimpleGrid,
    Group,
    Paper,
} from '@mantine/core';
import {
    IconChartPie,
    IconAlertTriangle,
    IconUsers,
    IconActivity,
    IconCalculator,
} from '@tabler/icons-react';

export default function LoginFeaturesPanel() {
    return (
        <Box
            style={{
                flex: 1,
                background: `
            radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 0%),
            radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 0%),
            radial-gradient(circle at 85% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 0%),
            linear-gradient(170deg, #ffffffff 0%, #4caf50 100%)
          `,
                backgroundSize: '100% 100%',
                color: 'white',
                padding: '4vh',
                margin: '2vh',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
            }}
            visibleFrom="md"
        >
            {/* Decorative Circle Pattern */}
            <Box
                style={{
                    position: 'absolute',
                    top: '10%',
                    right: '-5%',
                    width: '50%',
                    height: '50%',
                    opacity: 0.2,
                    backgroundImage: 'url("/login_pattern.png")',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    pointerEvents: 'none',
                }}
            />
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
                        <FeatureItem icon={IconChartPie} label="AI-Powered Analytics & Insights" />
                        <FeatureItem icon={IconActivity} label="Real-time Load Forecasting" />
                        <FeatureItem icon={IconAlertTriangle} label="Theft & Anomaly Detection" />
                        <FeatureItem icon={IconCalculator} label="Smart Tariff Management" />
                        <FeatureItem icon={IconUsers} label="Predictive Defaulter Analysis" />
                    </SimpleGrid>
                </Paper>
            </Stack>
        </Box>
    );
}

function FeatureItem({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <Group gap="sm" align="flex-start" wrap="nowrap">
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
                <Icon size={20} />
            </ThemeIcon>
            <Text size="sm" c="#1A1A1A" fw={600} style={{ lineHeight: 1.3 }}>
                {label}
            </Text>
        </Group>
    );
}
