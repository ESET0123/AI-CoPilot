import { BarChart } from '@mantine/charts';
import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { MdFilterList } from "react-icons/md";

interface DailyMapeChartProps {
    data: { day: string; value: number }[];
}

export default function DailyMapeChart({ data }: DailyMapeChartProps) {
    return (
        <Paper p="lg" radius="md" withBorder h="100%" style={{ backgroundColor: '#ffffff' }}>
            <Group justify="space-between" mb="xl">
                <Text fw={600} size="md">Daily Mape</Text>
                <Group gap="xl">
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8b5cf6' }} />
                        <Text size="sm" c="dimmed">Mape</Text>
                    </Group>
                    <Group gap={4}>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                            <MdFilterList size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                            <TbDotsVertical size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Group>

            <div style={{ height: 280, width: '100%' }}>
                <BarChart
                    h={280}
                    data={data}
                    dataKey="day"
                    withLegend={false}
                    series={[
                        { name: 'value', label: 'Mape', color: 'url(#daily-mape-gradient)' },
                    ]}
                    gridAxis="y"
                    gridProps={{ vertical: false, strokeDasharray: '0', stroke: '#f1f5f9' }}
                    yAxisProps={{ domain: [0, 7], tickSize: 0, tickMargin: 10, tickCount: 8, axisLine: false }}
                    xAxisProps={{ tickSize: 0, tickMargin: 10 }}
                    barProps={{ radius: [4, 4, 0, 0], barSize: 32 }}
                    withBarValueLabel
                >
                    <defs>
                        <linearGradient id="daily-mape-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </div>
        </Paper>
    );
}
