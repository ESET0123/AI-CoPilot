import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Paper, Title as MantineTitle, Grid, Group, Text, Box } from '@mantine/core';
import { ChartData as ChartDataType } from '../../../services/theftService';

interface TheftAdditionalChartsProps {
    data: {
        caseStatusDistribution: ChartDataType;
        assessedLossByCycle: ChartDataType;
        panchnamaBilling: ChartDataType;
        theftIntensityByZone: ChartDataType;
    };
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
                        {entry.name === 'consumption' || entry.name === 'count' ? 'Count' : entry.name}: {entry.value}
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
                {payload[0].name}: {payload[0].value}
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

export default function TheftAdditionalCharts({ data }: TheftAdditionalChartsProps) {

    const caseStatusData = data.caseStatusDistribution.labels.map((label, index) => ({
        name: label,
        value: data.caseStatusDistribution.data?.[index] || 0,
        color: index === 0 ? '#bef264' : '#ff7171',
    }));

    const assessedLossData = data.assessedLossByCycle.labels.map((label, index) => ({
        label,
        consumption: data.assessedLossByCycle.consumption?.[index] || 0,
    }));

    const panchnamaData = data.panchnamaBilling.labels.map((label, index) => ({
        label,
        count: data.panchnamaBilling.consumption?.[index] || 0,
    }));

    const theftIntensityData = data.theftIntensityByZone.labels.map((label, index) => ({
        label,
        count: data.theftIntensityByZone.consumption?.[index] || 0,
    }));

    return (
        <Grid>
            {/* Case Status Distribution */}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper p="md" radius="md" withBorder h="100%">
                    <MantineTitle order={4} size="h5" mb="xl">Case Status Distribution</MantineTitle>
                    <Box style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', margin: '0 auto' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={caseStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={0} // Thickness 90 with Size 180 means full pie
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={2}
                                    strokeWidth={0}
                                    cornerRadius="5%"
                                >
                                    {caseStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                    <Group justify="center" mt="xl">
                        <Group gap={4}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#bef264' }} />
                            <Text size="xs" c="dimmed">Resolved</Text>
                        </Group>
                        <Group gap={4}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#fca5a5' }} />
                            <Text size="sm" c="dimmed">Pending</Text>
                        </Group>
                    </Group>
                </Paper>
            </Grid.Col>

            {/* Assessed Loss by Cycle */}
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper p="md" radius="md" withBorder h="100%">
                    <Group justify="space-between" mb="xl">
                        <MantineTitle order={4} size="h5">Assessed Loss by Cycle</MantineTitle>
                        <Group gap={8}>
                            <div style={{ width: 12, height: 12, borderRadius: 4, background: '#bef264' }} />
                            <Text size="sm" c="dimmed">Consumption</Text>
                        </Group>
                    </Group>
                    <div style={{ height: 250, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={assessedLossData}
                                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="lime-gradient-add" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--mantine-color-gray-2)" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="consumption" fill="url(#lime-gradient-add)" radius={[7, 7, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            </Grid.Col>

            {/* Panchnama Billing Done Overtime */}
            <Grid.Col span={12}>
                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xl">
                        <MantineTitle order={4} size="h5">Panchnama Billing Done Overtime</MantineTitle>
                        <Group gap={8}>
                            <div style={{ width: 12, height: 12, borderRadius: 4, background: '#a78bfa' }} />
                            <Text size="sm" c="dimmed" fw={500}>Consumer Survey Count</Text>
                        </Group>
                    </Group>
                    <div style={{ height: 300, width: '85%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={panchnamaData}
                                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="purple-gradient-panchnama" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--mantine-color-gray-2)" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="url(#purple-gradient-panchnama)" radius={[7, 7, 0, 0]} barSize={40}>
                                    <LabelList dataKey="count" position="insideTop" fill="#fff" fontSize={10} offset={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            </Grid.Col>

            {/* Theft Intensity by Zone */}
            <Grid.Col span={12}>
                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xl">
                        <MantineTitle order={4} size="h5">Theft Intensity by Zone</MantineTitle>
                        <Group gap={8}>
                            <div style={{ width: 12, height: 12, borderRadius: 4, background: '#a78bfa' }} />
                            <Text size="sm" c="dimmed" fw={500}>Consumer Survey Count</Text>
                        </Group>
                    </Group>
                    <div style={{ height: 300, width: '85%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={theftIntensityData}
                                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="purple-gradient-intensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#f9f2f2" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--mantine-color-gray-2)" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#868e96' }} tickMargin={10} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="url(#purple-gradient-intensity)" radius={[10, 10, 0, 0]} barSize={40}>
                                    <LabelList dataKey="count" position="insideTop" fill="#fff" fontSize={10} offset={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
