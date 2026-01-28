import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Paper, Title as MantineTitle, Group, Text } from '@mantine/core';
import { ChartData as ChartDataType } from '../../../services/theftService';

const CHART_HEIGHT = 300;

interface SingleChartProps {
    data: ChartDataType;
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
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
                    <div key={index} style={{ color: entry.fill.includes('purple') ? '#a78bfa' : '#bef264' }}>
                        {entry.name === 'consumption' ? 'Consumption' : 'Consumer Count'}: {entry.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
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
                {payload[0].value}
                <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #000000',
                }} />
            </div>
        );
    }
    return null;
};

export function CaseCheckedChart({ data }: SingleChartProps) {
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
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8b9ef8' }} />
                        <Text size="sm" c="dimmed">Consumption</Text>
                    </Group>
                    <Group gap={8}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: '#bef264' }} />
                        <Text size="sm" c="dimmed">Consumer Count</Text>
                    </Group>
                </Group>
            </Group>
            <div style={{ height: CHART_HEIGHT, width: '100%', minHeight: 0, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--mantine-color-gray-2)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="consumption" fill="url(#purple-gradient)" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="consumerCount" fill="url(#orange-gradient)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}

export function CasesByDivisionChart({ data }: SingleChartProps) {
    const chartData = data.labels.map((label, index) => ({
        label,
        consumption: data.consumption?.[index] || 0,
        consumerCount: data.consumerCount?.[index] || 0,
    }));

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="xl">
                <MantineTitle order={4} size="h5">Cases by Division</MantineTitle>
                <Group gap="md">
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
            <div style={{ height: CHART_HEIGHT, width: '100%', minHeight: 0, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="purple-gradient-div" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="lime-gradient-div" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--mantine-color-gray-2)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="consumption" fill="url(#purple-gradient-div)" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="consumerCount" fill="url(#lime-gradient-div)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}

export function TheftByCaseTypeChart({ data }: SingleChartProps) {
    const chartData = [
        { name: 'Abnormal Consumption', value: data.data?.[0] || 0, color: '#a78bfa' },
        { name: 'Other', value: data.data?.[1] || 1, color: '#e2e8f0' },
    ];

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <MantineTitle order={4} size="h5" mb="xl">Theft by Case Type</MantineTitle>
            <div style={{ height: '220px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={100}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            strokeWidth={0}
                            cornerRadius="5%"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <Group justify="center" mt="xl">
                <Group gap={4}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#a78bfa' }} />
                    <Text size="xs" c="dimmed">Abnormal Consumption</Text>
                </Group>
                <Group gap={4}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
                    <Text size="xs" c="dimmed">Other</Text>
                </Group>
            </Group>
        </Paper>
    );
}
