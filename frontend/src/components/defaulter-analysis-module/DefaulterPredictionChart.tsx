import { LineChart } from '@mantine/charts';
import { Paper, Title, Group, Text, Badge } from '@mantine/core';
import { DefaulterPredictionTrendData } from '../../services/defaulterService';

interface DefaulterPredictionChartProps {
    data: DefaulterPredictionTrendData;
}

export default function DefaulterPredictionChart({ data }: DefaulterPredictionChartProps) {
    // Transform data for Mantine LineChart
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
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8b5cf6' }} />
                        <Text size="11px" c="dimmed">Actual</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#a3e635' }} />
                        <Text size="11px" c="dimmed">Predicted</Text>
                    </Group>
                </Group>
            </Group>
            <div style={{ height: 220, width: '100%', minHeight: 0, minWidth: 0 }}>
                <LineChart
                    h={220}
                    data={chartData}
                    dataKey="label"
                    withLegend={false}
                    series={[
                        { name: 'Actual', color: '#8b5cf6' },
                        { name: 'Predicted', color: '#a3e635' },
                    ]}
                    gridAxis="xy"
                    gridProps={{
                        vertical: false,
                        horizontal: true,
                        strokeDasharray: '3 3',
                        stroke: 'var(--mantine-color-gray-2)'
                    }}
                    yAxisProps={{
                        domain: [0, 'auto'],
                        tickSize: 0,
                        tickMargin: 10,
                        tickCount: 5,
                        axisLine: false
                    }}
                    xAxisProps={{ tickSize: 0, tickMargin: 10 }}
                    curveType="monotone"
                    strokeWidth={3}
                    connectNulls
                />
            </div>
        </Paper>
    );
}
