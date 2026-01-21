import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid, Stack } from '@mantine/core';
import { FaAngleLeft } from "react-icons/fa6";
import { LuCloudAlert } from "react-icons/lu";
import { Link } from 'react-router-dom';
import TheftFilters from '../components/module/theft-detection-module/TheftFilters';
import TheftStatsGrid from '../components/module/theft-detection-module/TheftStatsGrid';
import { CaseCheckedChart, CasesByDivisionChart, TheftByCaseTypeChart } from '../components/module/theft-detection-module/TheftCharts';
import TheftAdditionalCharts from '../components/module/theft-detection-module/TheftAdditionalCharts';
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
                    <Box mb="xl" mt="xs">
                        <Group justify="space-between" align="center">
                            {/* Left column */}
                            <Stack>
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
                                        <LuCloudAlert size={20} />
                                    </ThemeIcon>

                                    <Title order={2} size="h4" fw={700}>
                                        Theft Detection – Real time analytics
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


