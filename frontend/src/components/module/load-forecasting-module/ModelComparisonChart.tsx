import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { MdFilterList } from "react-icons/md";

interface ModelComparisonChartProps {
    data: { timestamp: string; esyaModel: number; demand: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
            }}>
                <div style={{ marginBottom: 4 }}>{label}</div>
                {payload.map((entry: any, index: number) => (
                    <div key={index} style={{ color: entry.stroke }}>
                        {entry.name === 'esyaModel' ? 'Esya model' : 'Demand'}: {entry.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ModelComparisonChart({ data }: ModelComparisonChartProps) {
    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="xs">
                <Text fw={700} size="15px">Model Comparison Test</Text>
                <Group gap="xl">
                    <Group gap={4}>
                        <ActionIcon variant="subtle" size="sm">
                            <MdFilterList size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm">
                            <TbDotsVertical size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Group>
            <Group gap="xl" justify="flex-end" px="xs">
                <Group gap={8}>
                    <div style={{ width: 12, height: 12, borderRadius: 4, background: '#bef264' }} />
                    <Text size="13px" c="dimmed" fw={500}>Esya model</Text>
                </Group>
                <Group gap={8}>
                    <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8b9ef8' }} />
                    <Text size="13px" c="dimmed" fw={500}>Demand</Text>
                </Group>
            </Group>

            <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} stroke="var(--mantine-color-gray-2)" strokeDasharray="0" />
                        <XAxis
                            dataKey="timestamp"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={15}
                        />
                        <YAxis
                            domain={[0, 1000]}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={10}
                            tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--mantine-color-gray-2)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Line
                            type="monotone"
                            dataKey="esyaModel"
                            stroke="#bef264"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="demand"
                            stroke="#8b9ef8"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}
