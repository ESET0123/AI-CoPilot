import { BarChart, DonutChart } from '@mantine/charts';
import { Paper, Title as MantineTitle, Grid, Group, Text, Box } from '@mantine/core';
import { ChartData as ChartDataType } from '../../services/theftService';

interface TheftAdditionalChartsProps {
    data: {
        caseStatusDistribution: ChartDataType;
        assessedLossByCycle: ChartDataType;
        panchnamaBilling: ChartDataType;
        theftIntensityByZone: ChartDataType;
    };
}

export default function TheftAdditionalCharts({ data }: TheftAdditionalChartsProps) {
    // --- Data Prep ---

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
                    <Box style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '220px', margin: '0 auto' }}>
                        <DonutChart
                            data={caseStatusData}
                            withTooltip={false}
                            size={180}
                            thickness={90}
                            pieProps={{ cornerRadius: 5, paddingAngle: 5, strokeWidth: 0 }}
                        />
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
                        <BarChart
                            h={250}
                            data={assessedLossData}
                            dataKey="label"
                            series={[{ name: 'consumption', label: 'Consumption', color: 'url(#lime-gradient-add)' }]}
                            gridAxis="xy"
                            gridProps={{ vertical: false, horizontal: true, strokeDasharray: '3 3', stroke: 'var(--mantine-color-gray-2)' }}
                            yAxisProps={{ domain: ['auto', 'auto'], tickLine: false, axisLine: false }}
                            xAxisProps={{ tickLine: false, axisLine: false }}
                            barProps={{ radius: [7, 7, 0, 0] }}
                        >
                            <defs>
                                <linearGradient id="lime-gradient-add" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#bef264" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
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
                    <div style={{ height: 300, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <BarChart
                            h={300}
                            data={panchnamaData}
                            dataKey="label"
                            withLegend={false}
                            series={[{ name: 'count', label: 'Consumer Survey Count', color: 'url(#purple-gradient-panchnama)' }]}
                            gridAxis="xy"
                            gridProps={{ vertical: false, horizontal: true, strokeDasharray: '3 3', stroke: 'var(--mantine-color-gray-2)' }}
                            yAxisProps={{ domain: ['auto', 'auto'], tickLine: false, axisLine: false }}
                            xAxisProps={{ tickLine: false, axisLine: false }}
                            barProps={{ radius: [7, 7, 0, 0], label: { position: 'insideTop', fill: '#fff', fontSize: 10, offset: 10 } }}
                        >
                            <defs>
                                <linearGradient id="purple-gradient-panchnama" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
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
                    <div style={{ height: 300, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <BarChart
                            h={300}
                            data={theftIntensityData}
                            dataKey="label"
                            withLegend={false}
                            series={[{ name: 'count', label: 'Consumer Survey Count', color: 'url(#purple-gradient-intensity)' }]}
                            gridAxis="xy"
                            gridProps={{ vertical: false, horizontal: true, strokeDasharray: '3 3', stroke: 'var(--mantine-color-gray-2)' }}
                            yAxisProps={{ domain: ['auto', 'auto'], tickLine: false, axisLine: false }}
                            xAxisProps={{ tickLine: false, axisLine: false }}
                            barProps={{ radius: [10, 10, 0, 0], label: { position: 'insideTop', fill: '#fff', fontSize: 10, offset: 10 } }}
                        >
                            <defs>
                                <linearGradient id="purple-gradient-intensity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </div>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
