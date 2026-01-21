import { SimpleGrid, Paper, Text, Group, ThemeIcon, Box } from '@mantine/core';
import { TbFlag } from 'react-icons/tb';
import { PiWarningDiamond } from "react-icons/pi";
import { GoLightBulb } from "react-icons/go";
import { DefaulterStats } from '../../../services/defaulterService';

interface DefaulterStatsGridProps {
    stats: DefaulterStats;
}

export default function DefaulterStatsGrid({ stats }: DefaulterStatsGridProps) {
    const StatCard = ({
        icon: Icon,
        iconColor,
        iconBg,
        label,
        value,
        trend,
        trendLabel
    }: {
        icon: any;
        iconColor: string;
        iconBg: string;
        label: string;
        value: string | number;
        trend: number;
        trendLabel: string;
    }) => (
        <Paper p="sm" radius="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={500}>{label}</Text>
                <ThemeIcon size={28} radius="md" bg={iconBg}>
                    <Icon size={16} color={iconColor} />
                </ThemeIcon>
            </Group>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 6, justifyContent: 'start' }}>
                <Text fw={700} size="20px" lh={1} mb={4}>{value}</Text>
                <Group gap={4}>
                    <Text
                        size="10px"
                        fw={600}
                        c={trend >= 0 ? 'red' : 'green'}
                    >
                        {trend >= 0 ? '+' : ''}{trend}%
                    </Text>
                    <Text size="10px" c="dimmed" fw={500}>{trendLabel}</Text>
                </Group>
            </Box>
        </Paper>
    );

    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatCard
                icon={GoLightBulb}
                iconColor="#22c55e"
                iconBg="#f0fdf4"
                label="Predicted Defaulters"
                value={stats.predictedDefaulters.toLocaleString()}
                trend={stats.predictedDefaultersTrend}
                trendLabel="Next Month (Feb 2025)"
            />
            <StatCard
                icon={PiWarningDiamond}
                iconColor="#22c55e"
                iconBg="#f0fdf4"
                label="Arrears at Risk (INR)"
                value={`${stats.arrearsAtRisk.toFixed(1)} Cr`}
                trend={stats.arrearsAtRiskTrend}
                trendLabel="Total Exposure"
            />
            <StatCard
                icon={TbFlag}
                iconColor="#22c55e"
                iconBg="#f0fdf4"
                label="Actions Due Today"
                value={stats.actionsDueToday}
                trend={stats.actionsDueTodayTrend}
                trendLabel="Total Field Tasks Pending"
            />
        </SimpleGrid>
    );
}
