import { BarChart, DonutChart } from '@mantine/charts';
import { Paper, Title as MantineTitle, Grid, Group, Text } from '@mantine/core';
import { ChartData as ChartDataType } from '../../services/theftService';

// --- Shared Configuration ---
const CHART_HEIGHT = 300;

// --- Components ---

interface SingleChartProps {
    data: ChartDataType;
}

export function CaseCheckedChart({ data }: SingleChartProps) {
    // Transform data for Mantine BarChart
    const chartData = data.labels.map((label, index) => ({
        label,
        consumption: data.consumption?.[index] || 0,
        consumerCount: data.consumerCount?.[index] || 0,
    }));

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="xl">
                <MantineTitle order={4} size="h5">Case Checked Vs Percent Confirmed</MantineTitle>
                <Group gap="xl">
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8b5cf6' }} />
                        <Text size="sm" c="dimmed">Consumption</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#fbbf24' }} />
                        <Text size="sm" c="dimmed">Consumer Count</Text>
                    </Group>
                </Group>
            </Group>
            <div style={{ height: CHART_HEIGHT, width: '100%', minHeight: 0 }}>
                <BarChart
                    h={CHART_HEIGHT}
                    data={chartData}
                    dataKey="label"
                    withLegend={false}
                    series={[
                        { name: 'consumption', label: 'Consumption', color: 'url(#purple-gradient)' },
                        { name: 'consumerCount', label: 'Consumer Count', color: 'url(#orange-gradient)' },
                    ]}
                    gridAxis="xy"
                    gridProps={{ vertical: false, horizontal: true, strokeDasharray: '3 3', stroke: 'var(--mantine-color-gray-2)' }}
                    yAxisProps={{ domain: [0, 'auto'], tickSize: 0, tickMargin: 10, tickCount: 5, axisLine: false }}
                    xAxisProps={{ tickSize: 0, tickMargin: 10 }}
                    barProps={{ radius: [7, 7, 0, 0] }}
                >
                    <defs>
                        <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                            <stop offset="100%" stopColor="#bef264" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </div>
        </Paper>
    );
}

export function CasesByDivisionChart({ data }: SingleChartProps) {
    // Transform data for Mantine BarChart
    const chartData = data.labels.map((label, index) => ({
        label,
        consumption: data.consumption?.[index] || 0,
        consumerCount: data.consumerCount?.[index] || 0,
    }));

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="xl">
                <MantineTitle order={4} size="h5">Cases by Division</MantineTitle>
                <Group gap="xl">
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#a78bfa' }} />
                        <Text size="sm" c="dimmed">Consumption</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#bef264' }} />
                        <Text size="sm" c="dimmed">Consumer Count</Text>
                    </Group>
                </Group>
            </Group>
            <div style={{ height: CHART_HEIGHT, width: '100%', minHeight: 0 }}>
                <BarChart
                    h={CHART_HEIGHT}
                    data={chartData}
                    dataKey="label"
                    withLegend={false}
                    series={[
                        { name: 'consumption', label: 'Consumption', color: 'url(#purple-gradient-div)' },
                        { name: 'consumerCount', label: 'Consumer Count', color: 'url(#lime-gradient-div)' },
                    ]}
                    gridAxis="xy"
                    gridProps={{ vertical: false, horizontal: true, strokeDasharray: '3 3', stroke: 'var(--mantine-color-gray-2)' }}
                    yAxisProps={{ domain: [0, 'auto'], tickSize: 0, tickMargin: 10, tickCount: 5, axisLine: false }}
                    xAxisProps={{ tickSize: 0, tickMargin: 10 }}
                    barProps={{ radius: [7, 7, 0, 0] }}
                >
                    <defs>
                        <linearGradient id="purple-gradient-div" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="lime-gradient-div" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                            <stop offset="100%" stopColor="#bef264" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </div>
        </Paper>
    );
}

export function TheftByCaseTypeChart({ data }: SingleChartProps) {
    // Transform data for Mantine DonutChart
    const chartData = [
        { name: 'Abnormal Consumption', value: data.data?.[0] || 0, color: '#a78bfa' },
        { name: 'Other', value: data.data?.[1] || 1, color: '#e2e8f0' },
    ];

    // Calculate percentage (assuming 2 data points: Theft vs Other)
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const percentage = total > 0 ? Math.round((chartData[0].value / total) * 100) : 0;

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <MantineTitle order={4} size="h5" mb="xl">Theft by Case Type</MantineTitle>
            <div style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DonutChart
                    data={chartData}
                    withTooltip={false}
                    size={200}
                    thickness={100}
                    pieProps={{ cornerRadius: 5, paddingAngle: 5, strokeWidth: 0 }}
                />
            </div>
            <Grid mt="xl">
                <Grid.Col span={6}>
                    <Group gap={4}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#a78bfa' }} />
                        <Text size="xs" c="dimmed">Abnormal Consumption</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Group gap={4}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
                        <Text size="xs" c="dimmed">Other</Text>
                    </Group>
                </Grid.Col>
            </Grid>
        </Paper>
    );
}
