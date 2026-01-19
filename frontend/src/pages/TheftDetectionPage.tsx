import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid } from '@mantine/core';
import { TbArrowLeft, TbRobot, TbShieldCheck } from 'react-icons/tb';
import { LuCloudAlert } from "react-icons/lu";
import { Link } from 'react-router-dom';
import TheftFilters from '../components/theft/TheftFilters';
import TheftStatsGrid from '../components/theft/TheftStatsGrid';
import { CaseCheckedChart, CasesByDivisionChart, TheftByCaseTypeChart } from '../components/theft/TheftCharts';
import TheftAdditionalCharts from '../components/theft/TheftAdditionalCharts';
import { theftService, TheftDashboardData } from '../services/theftService';
import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';

export default function TheftDetectionPage() {
    const [data, setData] = useState<TheftDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await theftService.getDashboardData();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch theft data:', err);
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
                <Container fluid px="xl" bg="gray.0" py="xs" pos="relative" style={{ flex: 1, overflowY: 'auto' }}>
                    <LoadingOverlay visible={loading} />

                    {/* Header */}
                    <Box mb="xl">
                        <Button
                            component={Link}
                            to="/dashboard"
                            variant="subtle"
                            color="black"
                            leftSection={<TbArrowLeft />}
                            size="xs"
                            mb="md"
                            pl={0}
                        >
                            Back to Home
                        </Button>

                        <Group justify="space-between" align="center">
                            <Group>
                                <ThemeIcon size={32} radius="l" color="green">
                                    <LuCloudAlert size={20} />
                                </ThemeIcon>
                                <Title order={2} size="h2" fw={700}>Theft Detection- Real time analytics</Title>
                            </Group>
                            <Button
                                bg="#1e1e1e"
                                leftSection={
                                    <Box
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            background: 'linear-gradient(135deg, #4ade80 0%, #ece019 100%)'
                                        }}
                                    />
                                }
                                radius="xl"
                            >
                                Ask Ai
                            </Button>
                        </Group>
                    </Box>

                    <TheftFilters />

                    {data && (
                        <>
                            <Grid gutter="md" mb="s" align="stretch">
                                <Grid.Col span={{ base: 12, md: 5 }}>
                                    <TheftStatsGrid stats={data.stats} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 7 }}>
                                    <CaseCheckedChart data={data.charts.caseCheckedVsConfirmed} />
                                </Grid.Col>
                            </Grid>

                            <Grid gutter="xl" mb="s">
                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <CasesByDivisionChart data={data.charts.casesByDivision} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TheftByCaseTypeChart data={data.charts.theftByCaseType} />
                                </Grid.Col>
                            </Grid>

                            <Box mt="s">
                                <TheftAdditionalCharts data={data.charts} />
                            </Box>
                        </>
                    )}
                </Container>
            </Box>
        </AppShellLayout>
    );
}


