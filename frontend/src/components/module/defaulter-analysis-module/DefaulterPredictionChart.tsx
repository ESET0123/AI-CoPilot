import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Title, Group, Text, Badge } from '@mantine/core';
import { DefaulterPredictionTrendData } from '../../../services/defaulterService';

interface DefaulterPredictionChartProps {
    data: DefaulterPredictionTrendData;
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
                        {entry.name}: {entry.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DefaulterPredictionChart({ data }: DefaulterPredictionChartProps) {
    const chartData = data.labels.map((label, index) => ({
        label,
        Actual: data.actual[index],
        Predicted: data.predicted[index],
    }));

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between">
                <Group justify="space-between" flex="row" mb="sm">
                    <Title order={4} size="14px">Defaulter Prediction Trend</Title>
                    <Badge variant="light" color="green" size="xs">6 Months</Badge>
                </Group>
                <Group justify="flex-end" mb="xs" gap="xl">
                    <Group gap={8}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8b9ef8' }} />
                        <Text size="11px" c="dimmed">Actual</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#a3e635' }} />
                        <Text size="11px" c="dimmed">Predicted</Text>
                    </Group>
                </Group>
            </Group>
            <div style={{ height: 220, width: '100%', minHeight: 0, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} stroke="var(--mantine-color-gray-2)" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={10}
                        />
                        <YAxis
                            domain={[0, 'auto']}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={10}
                            tickCount={5}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--mantine-color-gray-2)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Line
                            type="monotone"
                            dataKey="Actual"
                            stroke="#8b9ef8"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="Predicted"
                            stroke="#a3e635"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}
