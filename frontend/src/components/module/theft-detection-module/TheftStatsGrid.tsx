import { SimpleGrid, Paper, Text, Group, ThemeIcon, Stack, Grid, Box } from '@mantine/core';
import { TbTarget, TbCircleCheck, TbAlertTriangle, TbActivity } from 'react-icons/tb';
import { TfiTarget } from "react-icons/tfi";
import { TheftStats } from '../../../services/theftService';
import { Link } from 'react-router-dom';

interface TheftStatsGridProps {
    stats: TheftStats;
}

export default function TheftStatsGrid({ stats }: TheftStatsGridProps) {
    // Helper for uniformity
    const StatItem = ({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string | number }) => (
        <Group wrap="nowrap" gap="md">
            <ThemeIcon size={48} radius="md" bg="#f0fdf4">
                <Icon size={24} color="#22c55e" />
            </ThemeIcon>
            <Box>
                <Text size="xs" c="dimmed" fw={500} style={{ whiteSpace: 'nowrap' }}>{label}</Text>
                <Text fw={700} size="xl" lh={1.2}>{value}</Text>
            </Box>
        </Group>
    );

    return (
        <Grid gutter="md">
            {/* Theft Cases Analytics */}
            <Grid.Col span={12}>
                <Paper p="md" radius="md" withBorder>
                    <Text fw={600} size="md" mb="md">Theft Cases Analytics</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                        <StatItem
                            icon={TfiTarget}
                            color="green"
                            label="Suspected Cases"
                            value={stats.suspectedCases.toLocaleString()}
                        />
                        <StatItem
                            icon={TbCircleCheck}
                            color="green"
                            label="Cases without Theft"
                            value={stats.casesWithoutTheft}
                        />
                        <StatItem
                            icon={TbAlertTriangle}
                            color="green"
                            label="Cases with Theft"
                            value={stats.casesWithTheft.toLocaleString()}
                        />
                        <StatItem
                            icon={TbActivity}
                            color="green"
                            label="Theft Rate"
                            value={stats.theftRate}
                        />
                    </SimpleGrid>
                </Paper>
            </Grid.Col>

            {/* Financial Impact Summary */}
            <Grid.Col span={{ base: 12, sm: 7 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                    <Text fw={600} size="md" mb="md">Financial Impact Summary</Text>
                    <Stack gap="xl">
                        <StatItem
                            icon={TbCircleCheck}
                            color="green"
                            label="Total Amount"
                            value={stats.totalAmount.toLocaleString()}
                        />
                        <StatItem
                            icon={TbAlertTriangle}
                            color="green"
                            label="Highest Amount"
                            value={stats.highestAmount.toLocaleString()}
                        />
                    </Stack>
                </Paper>
            </Grid.Col>

            {/* Activity */}
            <Grid.Col span={{ base: 12, sm: 5 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                    <Text fw={600} size="md" mb="md">Activity</Text>
                    <Stack gap="lg">
                        <Box>
                            <Text size="xs" c="dimmed" mb={4} fw={500}>Pending Cases</Text>
                            <Group justify="space-between" align="flex-end">
                                <Text fw={700} size="xl" lh={1}>{stats.pendingCases}</Text>
                                <Text component={Link} to="#" c="violet" fw={500} size="xs" style={{ textDecoration: 'none' }}>View</Text>
                            </Group>
                        </Box>
                        <Box>
                            <Text size="xs" c="dimmed" mb={4} fw={500}>Pending Panchnama</Text>
                            <Group justify="space-between" align="flex-end">
                                <Text fw={700} size="xl" lh={1}>{stats.pendingPanchnama}</Text>
                                <Text component={Link} to="#" c="violet" fw={500} size="xs" style={{ textDecoration: 'none' }}>View</Text>
                            </Group>
                        </Box>
                    </Stack>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
