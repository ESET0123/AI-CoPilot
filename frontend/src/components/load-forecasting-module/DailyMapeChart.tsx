import { BarChart } from '@mantine/charts';
import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { MdFilterList } from "react-icons/md";

interface DailyMapeChartProps {
    data: { day: string; value: number }[];
}

export default function DailyMapeChart({ data }: DailyMapeChartProps) {
    return (
        <Paper p="md" radius="md" withBorder h="100%" style={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" align="start" mb="xs">
                <Text fw={700} size="15px" c="#454b54">Daily Mape</Text>
                <Group gap={4} align="center">
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <MdFilterList size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <TbDotsVertical size={16} />
                    </ActionIcon>
                </Group>
            </Group>

            {/* Legend - shifted to right and slightly down */}
            <Group justify="flex-end" px="xs" mb="xs">
                <Group gap={6}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: '#8b5cf6' }} />
                    <Text size="13px" c="#5c6a7e" fw={500}>Mape</Text>
                </Group>
            </Group>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <BarChart
                    h="100%"
                    data={data}
                    dataKey="day"
                    withLegend={false}
                    series={[
                        { name: 'value', label: 'Mape', color: 'url(#daily-mape-gradient)' },
                    ]}
                    gridAxis="y"
                    gridProps={{ vertical: false, strokeDasharray: '0', stroke: '#f1f5f9' }}
                    yAxisProps={{
                        domain: [0, 7],
                        tickSize: 0,
                        tickMargin: 10,
                        tickCount: 8,
                        axisLine: false,
                        style: { fontSize: '11px', fill: '#94a3b8' }
                    }}
                    xAxisProps={{
                        tickSize: 0,
                        tickMargin: 8,
                        style: { fontSize: '11px', fill: '#94a3b8' }
                    }}
                    barProps={{
                        radius: [8, 8, 8, 8],
                        barSize: 28,
                    }}
                    withBarValueLabel
                    valueLabelProps={{
                        position: 'top',
                        fill: '#8b5cf6',
                        fontSize: 10,
                        fontWeight: 700,
                        offset: 4
                    }}
                >
                    <defs>
                        <linearGradient id="daily-mape-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </div>
        </Paper>
    );
}
