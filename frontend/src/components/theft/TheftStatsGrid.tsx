import { SimpleGrid, Paper, Text, Group, ThemeIcon, Stack, Grid, Box } from '@mantine/core';
import { TbTarget, TbCircleCheck, TbActivity } from 'react-icons/tb';
import { TheftStats } from '../../services/theftService';
import { Link } from 'react-router-dom';

interface TheftStatsGridProps {
    stats: TheftStats;
}

export default function TheftStatsGrid({ stats }: TheftStatsGridProps) {
    // Helper for uniformity
    const StatItem = ({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string | number }) => (
        <Group>
            <ThemeIcon color={color} variant="light" size={48} radius="md" style={{ backgroundColor: `var(--mantine-color-${color}-1)` }}>
                <Icon size={24} color={`var(--mantine-color-${color}-filled)`} />
                {/* Note: In real app, might need accurate color mapping or just use specific hexes if theme is standard */}
            </ThemeIcon>
            <div>
                <Text size="xs" c="dimmed" fw={500}>{label}</Text>
                <Text fw={700} size="xl" lh={1}>{value}</Text>
            </div>
        </Group>
    );

    return (
        <Grid gutter="lg">
            {/* Theft Cases Analytics - Spans full width or 2 cols */}
            <Grid.Col span={12}>
                <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="md" mb="xl">Theft Cases Analytics</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                        <StatItem
                            icon={TbTarget}
                            color="lime"
                            label="Suspected Cases"
                            value={stats.suspectedCases.toLocaleString()}
                        />
                        <StatItem
                            icon={TbCircleCheck}
                            color="lime"
                            label="Cases without Theft"
                            value={stats.casesWithoutTheft}
                        />
                        <StatItem
                            icon={TbCircleCheck}
                            color="lime"
                            label="Cases with Theft"
                            value={stats.casesWithTheft.toLocaleString()}
                        />
                        <StatItem
                            icon={TbActivity}
                            color="lime"
                            label="Theft Rate"
                            value={stats.theftRate}
                        />
                    </SimpleGrid>
                </Paper>
            </Grid.Col>

            {/* Financial Impact Summary */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                    <Text fw={600} size="md" mb="xl">Financial Impact Summary</Text>
                    <Stack gap="xl">
                        <StatItem
                            icon={TbCircleCheck}
                            color="lime"
                            label="Total Amount"
                            value={stats.totalAmount.toLocaleString()}
                        />
                        <StatItem
                            icon={TbCircleCheck}
                            color="lime"
                            label="Highest Amount"
                            value={stats.highestAmount.toLocaleString()}
                        />
                    </Stack>
                </Paper>
            </Grid.Col>

            {/* Activity */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                    <Text fw={600} size="md" mb="xl">Activity</Text>
                    <Stack gap="xl">
                        <Group justify="space-between" align="center">
                            <div>
                                <Text size="sm" c="dimmed" mb={4}>Pending Cases</Text>
                                <Text fw={700} size="xl" lh={1}>{stats.pendingCases}</Text>
                            </div>
                            <Text component={Link} to="#" c="violet" fw={500} size="sm">View</Text>
                        </Group>
                        <Group justify="space-between" align="center">
                            <div>
                                <Text size="sm" c="dimmed" mb={4}>Pending Panchnama</Text>
                                <Text fw={700} size="xl" lh={1}>{stats.pendingPanchnama}</Text>
                            </div>
                            <Text component={Link} to="#" c="violet" fw={500} size="sm">View</Text>
                        </Group>
                    </Stack>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
