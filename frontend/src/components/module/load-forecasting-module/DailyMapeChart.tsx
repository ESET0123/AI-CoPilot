import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { MdFilterList } from "react-icons/md";

interface DailyMapeChartProps {
    data: { day: string; value: number }[];
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
                <div>Mape: {payload[0].value}</div>
            </div>
        );
    }
    return null;
};

export default function DailyMapeChart({ data }: DailyMapeChartProps) {
    return (
        <Paper p="md" radius="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" align="start" mb="xs">
                <Text fw={700} size="15px">Daily Mape</Text>
                <Group gap={4} align="center">
                    <ActionIcon variant="subtle" size="sm">
                        <MdFilterList size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm">
                        <TbDotsVertical size={16} />
                    </ActionIcon>
                </Group>
            </Group>

            {/* Legend - shifted to right and slightly down */}
            <Group justify="flex-end" px="xs" mb="xs">
                <Group gap={6}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: '#8b9ef8' }} />
                    <Text size="13px" c="dimmed" fw={500}>Mape</Text>
                </Group>
            </Group>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="daily-mape-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b9ef8" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#8b9ef8" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--mantine-color-gray-2)" strokeDasharray="0" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={8}
                        />
                        <YAxis
                            domain={[0, 8]}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickMargin={10}
                            tickCount={8}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" fill="url(#daily-mape-gradient)" radius={[7, 7, 0, 0]}>
                            <LabelList dataKey="value" position="top" fill="#8b9ef8" fontSize={10} fontWeight={700} offset={4} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}
