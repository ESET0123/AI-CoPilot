import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    BarElement,
    ChartOptions,
    ChartData
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { Box, Paper, Text, SegmentedControl, Group, useMantineTheme } from '@mantine/core';
import { useState, useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

type DataPoint = Record<string, string | number | Date>;

type AdvancedChartWidgetProps = {
    data: DataPoint[];
    xKey?: string;
    yKey?: string;
    label?: string;
    title?: string;
};

export default function AdvancedChartWidget({
    data,
    xKey: propXKey,
    yKey: propYKey,
    label,
    title
}: AdvancedChartWidgetProps) {
    const theme = useMantineTheme();
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    // 1. Smart Key Detection
    const { xKey, yKey, isTimeScale } = useMemo(() => {
        if (!data || data.length === 0) return { xKey: '', yKey: '', isTimeScale: false };

        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        // Detect X Key (Date/Time)
        let detectedX = propXKey;
        if (!detectedX || !Object.prototype.hasOwnProperty.call(firstRow, detectedX)) {
            detectedX = keys.find(k =>
                ['date', 'time', 'ts', 'day', 'hour', 'timestamp'].some(term => k.toLowerCase().includes(term))
            );
        }
        // Fallback X: First non-numeric key
        if (!detectedX) {
            detectedX = keys.find(k => typeof firstRow[k] === 'string');
        }

        // Detect Y Key (Numeric)
        let detectedY = propYKey;
        if (!detectedY || !Object.prototype.hasOwnProperty.call(firstRow, detectedY)) {
            detectedY = keys.find(k =>
                typeof firstRow[k] === 'number' && k !== detectedX && !k.toLowerCase().includes('id')
            );
        }

        // Determine Scale Type
        const isTime = detectedX ? ['date', 'time', 'ts', 'timestamp'].some(t => detectedX!.toLowerCase().includes(t)) : false;

        return { xKey: detectedX || '', yKey: detectedY || '', isTimeScale: isTime };
    }, [data, propXKey, propYKey]);


    if (!data || data.length === 0 || !xKey || !yKey) {
        return (
            <Paper p="md" withBorder>
                <Text c="dimmed" size="sm" ta="center">Insufficient data to generate chart.</Text>
            </Paper>
        );
    }

    // 2. Prepare Data
    const chartData: ChartData<'line' | 'bar'> = {
        labels: isTimeScale ? undefined : data.map(d => String(d[xKey])), // Only needed for category scale
        datasets: [
            {
                label: label || yKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                data: data.map((row) => {
                    const xVal = row[xKey];
                    const yVal = Number(row[yKey]);

                    if (isTimeScale) {
                        // Parse potential SQL timestamp formats
                        let parsedX = xVal;
                        if (typeof xVal === 'string' && xVal.includes(' ')) {
                            parsedX = xVal.replace(' ', 'T');
                        }
                        return { x: new Date(parsedX).getTime(), y: yVal };
                    }
                    return yVal; // For category scale, just return Y. Labels handle X.
                }) as (number | { x: number; y: number })[],
                borderColor: theme.colors.blue[6],
                backgroundColor: chartType === 'bar' ? theme.colors.blue[2] : theme.colors.blue[6],
                borderWidth: 2,
                pointRadius: chartType === 'line' ? 2 : 0,
                pointHoverRadius: 6,
                tension: 0.3, // Smooth curves
                fill: chartType === 'bar',
            },
        ],
    };

    // 3. Chart Options
    const options: ChartOptions<'line' | 'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, boxWidth: 8 }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: theme.colors.gray[9],
                padding: 12,
            }
        },
        scales: {
            x: {
                type: isTimeScale ? 'time' : 'category',
                grid: { display: false },
                ...(isTimeScale ? {
                    time: {
                        unit: 'hour', // Auto-scaling works fairly well, but unit: 'auto' is not standard ChartJS. Let adapter handle most.
                        displayFormats: {
                            hour: 'MMM d, HH:mm',
                            day: 'MMM d'
                        },
                        tooltipFormat: 'MMM d, HH:mm'
                    }
                } : {})
            },
            y: {
                beginAtZero: false,
                grid: { color: theme.colors.gray[1] },
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <Paper p="md" shadow="sm" radius="md" withBorder style={{
            backgroundColor: theme.white,
            transition: 'all 0.2s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Group justify="space-between" mb="md">
                <Text fw={600} size="sm" c="dimmed">
                    {title || 'Analysis Visualization'}
                </Text>

                <SegmentedControl
                    size="xs"
                    value={chartType}
                    onChange={(val) => setChartType(val as 'line' | 'bar')}
                    data={[
                        { label: 'Line', value: 'line' },
                        { label: 'Bar', value: 'bar' }
                    ]}
                />
            </Group>

            <Box style={{ flex: 1, minHeight: 250, width: '100%' }}>
                {chartType === 'line' ? (
                    <Line data={chartData as ChartData<'line'>} options={options as ChartOptions<'line'>} />
                ) : (
                    <Bar data={chartData as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
                )}
            </Box>
        </Paper>
    );
}
