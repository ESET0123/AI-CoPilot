import { Paper, Text, Group, Progress, SimpleGrid, Box } from '@mantine/core';
import { AssetHealthStats } from '../../../services/assetHealthService';

interface Props {
    stats: AssetHealthStats;
}

export default function AssetHealthStatsCard({ stats }: Props) {
    return (
        <Paper p="md" radius="md" withBorder>
            <SimpleGrid cols={2} spacing="xl">
                <Box>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500} c="dimmed">Overloaded (&gt;90%)</Text>
                        <Text size="sm" fw={700}>{stats.overloadedCount}</Text>
                    </Group>
                    <Progress
                        value={stats.overloadedPercent}
                        color="red"
                        size="lg"
                        radius="xl"
                        bg="red.0"
                    />
                </Box>
                <Box>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500} c="dimmed">Normal Condition</Text>
                        <Text size="sm" fw={700}>{stats.normalCount}</Text>
                    </Group>
                    <Progress
                        value={stats.normalPercent}
                        color="green"
                        size="lg"
                        radius="xl"
                        bg="green.0"
                    />
                </Box>
            </SimpleGrid>
        </Paper>
    );
}
