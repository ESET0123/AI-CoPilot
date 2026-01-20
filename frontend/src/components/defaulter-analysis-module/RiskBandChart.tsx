import { DonutChart } from '@mantine/charts';
import { Paper, Title, Group, Text } from '@mantine/core';
import { RiskBandDistributionData } from '../../services/defaulterService';

interface RiskBandChartProps {
    data: RiskBandDistributionData;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number | string }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                position: 'relative'
            }}>
                {payload[0].value}%
                {/* Tooltip arrow */}
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

export default function RiskBandChart({ data }: RiskBandChartProps) {
    // Transform data for Mantine DonutChart
    const chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.data[index],
        color: data.colors[index],
    }));

    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Title order={4} size="14px" mb="sm">Risk Band Distribution</Title>
            <div style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DonutChart
                    data={chartData}
                    size={160}
                    thickness={40}
                    tooltipDataSource="segment"
                    tooltipProps={{ content: <CustomTooltip /> }}
                    pieProps={{ cornerRadius: 5, paddingAngle: 5, strokeWidth: 0 }}
                />
            </div>
            <Group justify="center" mt="sm" gap="md">
                {data.labels.map((label, index) => (
                    <Group gap={6} key={label}>
                        <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: data.colors[index]
                        }} />
                        <Text size="11px" c="dimmed">{label}: {data.data[index]}%</Text>
                    </Group>
                ))}
            </Group>
        </Paper>
    );
}
