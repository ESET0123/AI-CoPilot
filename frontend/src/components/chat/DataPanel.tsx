import { Box, Paper, Text, Stack, Center } from '@mantine/core';
import { IconChartBar, IconDatabase } from '@tabler/icons-react';
import AdvancedChartWidget from './AdvancedChartWidget';
import TableWidget from './TableWidget';
import { ParsedContent } from '../../utils/contentParser';
import { designTokens } from '../../styles/designTokens';

type Props = {
    content: ParsedContent | null;
};

export default function DataPanel({ content }: Props) {
    if (!content) {
        return <EmptyState message="Select a conversation to view details." />;
    }

    const { type, data, extras } = content;
    const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

    if (!hasData || (type === 'text' || type === 'error')) {
        return <EmptyState message="No data visualization available for this message." />;
    }

    return (
        <Paper
            shadow="md"
            p="lg"
            radius="lg"
            withBorder
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--mantine-color-body)',
                overflowY: 'auto',
                borderColor: 'rgba(79, 172, 254, 0.15)',
                transition: designTokens.transitions.normal,
            }}
        >
            <Stack gap="md" style={{ height: '100%' }}>
                <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    paddingBottom: 8,
                    borderBottom: '2px solid rgba(79, 172, 254, 0.2)',
                }}>
                    <IconChartBar size={24} style={{ color: '#4facfe' }} />
                    <Text fw={700} size="xl" style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>Data Analysis</Text>
                </Box>

                <Text size="sm" c="dimmed" style={{ marginTop: -4 }}>
                    Generated from your latest query.
                </Text>

                <Box mt="sm" style={{ flex: 1 }}>
                    <Stack gap="xl">
                        {/* Always Render Chart */}
                        <Box style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            <AdvancedChartWidget
                                data={data}
                                xKey={extras?.xKey} /* Let internal auto-detect handle fallbacks */
                                yKey={extras?.yKey}
                                label={extras?.yLabel}
                                title={extras?.yLabel ? `${extras.yLabel} Trend` : 'Data Trend'}
                            />
                        </Box>

                        {/* Always Render Table */}
                        <Box style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <Box mb="sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <IconDatabase size={18} style={{ color: '#4facfe' }} />
                                <Text fw={600} size="md" c="dimmed">Source Data</Text>
                            </Box>
                            <TableWidget data={data} />
                        </Box>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Center style={{ height: '100%', p: 20, textAlign: 'center' }}>
            <Stack align="center" gap="xs">
                <IconChartBar size={48} color="var(--mantine-color-gray-4)" />
                <Text c="dimmed" size="sm">
                    {message}
                </Text>
            </Stack>
        </Center>
    );
}
