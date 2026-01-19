import { useEffect, useState } from 'react';
import { Container, Title, Button, Group, Box, LoadingOverlay, Text, ThemeIcon, Grid } from '@mantine/core';
import { TbArrowLeft, TbRobot, TbShieldCheck } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import TheftFilters from '../components/theft/TheftFilters';
import TheftStatsGrid from '../components/theft/TheftStatsGrid';
import { CaseCheckedChart, CasesByDivisionChart, TheftByCaseTypeChart } from '../components/theft/TheftCharts';
import TheftAdditionalCharts from '../components/theft/TheftAdditionalCharts';
import { theftService, TheftDashboardData } from '../services/theftService';

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
        <Container fluid px="xl" py="xs" pos="relative">
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
                        <ThemeIcon size={32} radius="xl" color="green">
                            <TbShieldCheck size={20} />
                        </ThemeIcon>
                        <Title order={2} size="h2" fw={700}>Theft Detection- Real time analytics</Title>
                    </Group>
                    <Button
                        bg="#1e1e1e"
                        leftSection={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#84cc16' }} />}
                        radius="xl"
                    >
                        Ask Ai
                    </Button>
                </Group>
            </Box>

            <TheftFilters />

            {data && (
                <>
                    <Grid gutter="xl" mb="xl" align="stretch">
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <TheftStatsGrid stats={data.stats} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <CaseCheckedChart data={data.charts.caseCheckedVsConfirmed} />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter="xl" mb="xl">
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <CasesByDivisionChart data={data.charts.casesByDivision} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TheftByCaseTypeChart data={data.charts.theftByCaseType} />
                        </Grid.Col>
                    </Grid>

                    <Box mt="xl">
                        <TheftAdditionalCharts data={data.charts} />
                    </Box>
                </>
            )}
        </Container>
    );
}


