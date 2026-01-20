import { LineChart } from '@mantine/charts';
import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { MdFilterList } from "react-icons/md";

interface ModelComparisonChartProps {
    data: { timestamp: string; esyaModel: number; demand: number }[];
}

export default function ModelComparisonChart({ data }: ModelComparisonChartProps) {
    return (
        <Paper p="md" radius="md" withBorder h="100%" style={{ backgroundColor: '#ffffff' }}>
            <Group justify="space-between" mb="xs">
                <Text fw={700} size="15px" c="#454b54">Model Comparison Test</Text>
                <Group gap="xl">
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
            <Group gap="xl" justify="flex-end" px="xs">
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#bef264' }} />
                        <Text size="13px" c="#5c6a7e" fw={500}>Esya model</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8b5cf6' }} />
                        <Text size="13px" c="#5c6a7e" fw={500}>Demand</Text>
                    </Group>
                </Group>

            <div style={{ height: 280, width: '100%' }}>
                <LineChart
                    h={280}
                    data={data}
                    dataKey="timestamp"
                    withLegend={false}
                    series={[
                        { name: 'esyaModel', label: 'Esya model', color: '#bef264' },
                        { name: 'demand', label: 'Demand', color: '#8b5cf6' },
                    ]}
                    curveType="monotone"
                    strokeWidth={3}
                    dotProps={{ r: 0 }}
                    activeDotProps={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    gridAxis="y"
                    gridProps={{ vertical: false, strokeDasharray: '0', stroke: '#f1f5f9' }}
                    yAxisProps={{
                        domain: [0, 1000],
                        tickSize: 0,
                        tickMargin: 10,
                        tickCount: 6,
                        axisLine: false,
                        style: { fontSize: '11px', fill: '#94a3b8' }
                    }}
                    xAxisProps={{
                        hide: false,
                        tickSize: 0,
                        tickMargin: 15,
                        style: { fontSize: '11px', fill: '#94a3b8' }
                    }}
                />
            </div>
        </Paper>
    );
}
