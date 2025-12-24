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
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { Box } from '@mantine/core';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

type ChartWidgetProps = {
    data: any[];
    xKey: string;
    yKey: string;
    label?: string;
    color?: string;
};

export default function ChartWidget({
    data,
    xKey,
    yKey,
    label,
    color = '#2563EB',
}: ChartWidgetProps) {
    if (!data || data.length === 0) return null;

    const isTimeScale = xKey === 'ts' || xKey === 'date' || xKey === 'timestamp';

    const chartData = {
        datasets: [
            {
                label: label || 'Value',
                data: data.map((row) => {
                    let x = row[xKey];

                    if (isTimeScale) {
                        if (typeof x === 'string' && x.includes(' ')) {
                            x = x.replace(' ', 'T');
                        }
                        return { x: new Date(x), y: Number(row[yKey]) };
                    }

                    // For non-time (e.g. Year), keep as is (category/linear)
                    return { x, y: Number(row[yKey]) };
                }),
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: isTimeScale ? 'time' : 'category',
                ...(isTimeScale
                    ? {
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'MMM d, HH:mm',
                            },
                            tooltipFormat: 'MMM d, yyyy HH:mm',
                        },
                    }
                    : {}),
                grid: {
                    display: false,
                },
                ticks: {
                    maxTicksLimit: 6,
                },
            },
            y: {
                beginAtZero: false,
                grace: '5%',
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    return (
        <Box
            style={{
                height: 250,
                width: '100%',
                marginTop: 10,
                marginBottom: 10,
                background: 'var(--mantine-color-body)',
                borderRadius: 8,
                padding: 8,
            }}
        >
            <Line data={chartData} options={options} />
        </Box>
    );
}
