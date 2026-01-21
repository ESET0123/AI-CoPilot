import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid, Stack } from '@mantine/core';
import { FaAngleLeft } from "react-icons/fa6";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { Link } from 'react-router-dom';
import DefaulterStatsGrid from '../components/module/defaulter-analysis-module/DefaulterStatsGrid';
import DefaulterPredictionChart from '../components/module/defaulter-analysis-module/DefaulterPredictionChart';
import RiskBandChart from '../components/module/defaulter-analysis-module/RiskBandChart';
import { defaulterService, DefaulterDashboardData } from '../services/defaulterService';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';

export default function DefaulterAnalysisPage() {
    const [data, setData] = useState<DefaulterDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await defaulterService.getDashboardData();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch defaulter data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <Container size="xl" py="xl">
                <Text c="red">{error}</Text>
            </Container>
        );
    }

    return (
        <AppShellLayout>
            <Box h="100%" display="flex" style={{ flexDirection: 'column' }}>
                <Box h={60} px="md" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center' }}>
                    <HeaderBar />
                </Box>
                <Box px="xl" bg="gray.0" py="xs" pos="relative" style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                    <LoadingOverlay visible={loading} />

                    {/* Header */}
                    <Box mb="xl" mt="xs">
                        <Group justify="space-between" align="center">
                            {/* Left column */}
                            <Stack >
                                <Button
                                    component={Link}
                                    to="/dashboard"
                                    variant="subtle"
                                    color="black"
                                    leftSection={<FaAngleLeft />}
                                    size="s"
                                    justify='left'
                                    w="fit-content"
                                    pl={0}
                                >
                                    Back to Home
                                </Button>

                                <Group align="center">
                                    <ThemeIcon size={32} radius="md" color="green" variant="filled">
                                        <MdOutlineAccountBalanceWallet size={20} />
                                    </ThemeIcon>

                                    <Title order={2} size="h4" fw={700}>
                                        Default Predictions and Key Metrics – Real time analytics
                                    </Title>
                                </Group>
                            </Stack>

                            {/* Right button */}
                            <Button
                                component={Link}
                                to="/dashboard"
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
                        <>
                            <Box mb="xs">
                                <DefaulterStatsGrid stats={data.stats} />
                            </Box>

                            <Grid gutter="xs" mb="xs" align="stretch">
                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <DefaulterPredictionChart data={data.charts.defaulterPredictionTrend} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <RiskBandChart data={data.charts.riskBandDistribution} />
                                </Grid.Col>
                            </Grid>
                        </>
                    )}
                </Box>
            </Box>
        </AppShellLayout>
    );
}
