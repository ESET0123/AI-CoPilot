import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid, Stack } from '@mantine/core';
import { TfiReload } from "react-icons/tfi";
import { FaAngleLeft } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ForecastStatsCard from '../components/module/load-forecasting-module/ForecastStatsCard';
import DailyMapeChart from '../components/module/load-forecasting-module/DailyMapeChart';
import ModelComparisonChart from '../components/module/load-forecasting-module/ModelComparisonChart';
import { forecastingService, ForecastDashboardData } from '../services/forecastingService';

export default function LoadForecastingPage() {
    const [data, setData] = useState<ForecastDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await forecastingService.getDashboardData();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch forecasting data:', err);
                setError('Failed to load forecasting data');
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
                <Box h={60} px="md" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center' }}>
                    <HeaderBar />
                </Box>
                <Container fluid px="xl" bg="#f8fafc" py="xs" pos="relative" style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                    <LoadingOverlay visible={loading} />

                    {/* Header Section */}
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
                                    <TfiReload size={20} />
                                </ThemeIcon>

                                <Title order={2} size="h4" fw={700}>
                                    Load Forecasting – Real time analytics
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
                        <Grid gutter="lg">
                            {/* Left Column: Stats and Info */}
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <ForecastStatsCard
                                            title="Mape"
                                            value={data.stats.mape}
                                            subtitle={data.stats.date}
                                            liveValue={data.stats.liveMape}
                                            liveLabel="Live Mape"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <ForecastStatsCard
                                            title="RMSE"
                                            value={data.stats.rmse}
                                            subtitle={data.stats.date}
                                            liveValue={data.stats.liveRmse}
                                            liveLabel="Live RMSE"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <ForecastStatsCard
                                            title="No of Blocks"
                                            value={data.stats.noOfBlocks}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>

                            {/* Right Column: Daily Mape Chart */}
                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <DailyMapeChart data={data.dailyMape} />
                            </Grid.Col>

                            {/* Bottom Row: Model Comparison Chart */}
                            <Grid.Col span={12}>
                                <ModelComparisonChart data={data.comparison} />
                            </Grid.Col>
                        </Grid>
                    )}
                </Container>
            </Box>
        </AppShellLayout>
    );
}
