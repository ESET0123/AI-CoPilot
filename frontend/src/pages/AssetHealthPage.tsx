import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid, Stack } from '@mantine/core';
import { TfiDashboard } from "react-icons/tfi";
import { FaAngleLeft } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import AssetHealthStatsCard from '../components/module/asset-health-module/AssetHealthStatsCard';
import RiskBandDistribution from '../components/module/asset-health-module/RiskBandDistribution';
import AlertSummary from '../components/module/asset-health-module/AlertSummary';
import AssetAgingOverview from '../components/module/asset-health-module/AssetAgingOverview';
import AssetNetworkMap from '../components/module/asset-health-module/AssetNetworkMap';
import { assetHealthService, AssetHealthData } from '../services/assetHealthService';

export default function AssetHealthPage() {
    const [data, setData] = useState<AssetHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await assetHealthService.getDashboardData();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch asset health data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <AppShellLayout>
                <Container size="xl" py="xl">
                    <Text c="red">{error}</Text>
                </Container>
            </AppShellLayout>
        );
    }

    return (
        <AppShellLayout>
            <Box h="100%" display="flex" style={{ flexDirection: 'column' }}>
                <Box h={60} px="md" style={{ borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center' }}>
                    <HeaderBar />
                </Box>
                <Container fluid px="xl" py="xs" pos="relative" style={{ flex: 1, overflowY: 'auto', width: '100%', background: 'var(--app-background-module)' }}>
                    <LoadingOverlay visible={loading} />

                    {/* Header Section */}
                    <Box mb="xl" mt="xs">
                        <Group justify="space-between" align="center">
                            {/* Left column */}
                            <Stack gap={4}>
                                <Button
                                    component={Link}
                                    to="/copilot"
                                    variant="transparent"
                                    leftSection={<FaAngleLeft />}
                                    size="xs"
                                    justify='left'
                                    w="fit-content"
                                    pl={0}
                                    c="var(--app-text-primary)"
                                >
                                    Back to Home
                                </Button>

                                <Group align="center">
                                    <ThemeIcon size={32} radius="md" color="green" variant="filled">
                                        <TfiDashboard size={20} />
                                    </ThemeIcon>

                                    <Title order={2} size="h4" fw={700}>
                                        Asset Health Overview
                                    </Title>
                                </Group>
                            </Stack>

                            {/* Right button */}
                            <Button
                                component={Link}
                                to="/copilot"
                                bg="#1e1e1e"
                                leftSection={
                                    <Box
                                        w={18}
                                        h={18}
                                        style={{
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4ade80 0%, #ece019 100%)',
                                        }}
                                    />
                                }
                                radius="xl"
                                size="md"
                                fw={600}
                            >
                                Ask Ai
                            </Button>
                        </Group>
                    </Box>

                    {data && (
                        <Stack gap="lg">
                            <Grid gutter="lg">
                                {/* Left Column: Stats and Charts */}
                                <Grid.Col span={{ base: 12, md: 5 }}>
                                    <Stack gap="lg">
                                        <AssetHealthStatsCard stats={data.stats} />
                                        <Grid gutter="md">
                                            <Grid.Col span={{ base: 12, sm: 7 }}>
                                                <RiskBandDistribution data={data.riskDistribution} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, sm: 5 }}>
                                                <AlertSummary alerts={data.alerts} activeAlerts={data.activeAlerts} />
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Grid.Col>

                                {/* Right Column: Asset Aging */}
                                <Grid.Col span={{ base: 12, md: 7 }}>
                                    <AssetAgingOverview assets={data.agingAssets} />
                                </Grid.Col>
                            </Grid>

                            {/* Bottom Row: Network Map */}
                            <Box>
                                <AssetNetworkMap />
                            </Box>
                        </Stack>
                    )}
                </Container>
            </Box>
        </AppShellLayout>
    );
}
