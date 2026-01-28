import { Paper, Title, Box } from '@mantine/core';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { RiskDistribution } from '../../../services/assetHealthService';

interface Props {
    data: RiskDistribution[];
}

export default function RiskBandDistribution({ data }: Props) {
    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Title order={4} mb="md" size="h6">Risk Band Distribution</Title>
            <Box h={250}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            innerRadius={0}
                            outerRadius={100}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            strokeWidth={0}
                            cornerRadius="5%"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
