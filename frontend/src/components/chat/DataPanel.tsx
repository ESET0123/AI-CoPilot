import { Box, Paper, Text, Stack, Center } from '@mantine/core';
import { IconChartBar, IconDatabase } from '@tabler/icons-react';
import AdvancedChartWidget from './AdvancedChartWidget';
import TableWidget from './TableWidget';
import { ParsedContent } from '../../utils/contentParser';

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
            shadow="xs"
            p="md"
            radius="md"
            withBorder
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--mantine-color-body)',
                overflowY: 'auto',
            }}
        >
            <Stack gap="sm" style={{ height: '100%' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconChartBar size={20} color="var(--mantine-primary-color-filled)" />
                    <Text fw={600} size="lg">Data Analysis</Text>
                </Box>

                <Text size="sm" c="dimmed">
                    Generated from your latest query.
                </Text>

                <Box mt="md" style={{ flex: 1 }}>
                    <Stack gap="lg">
                        {/* Always Render Chart */}
                        <Box >
                            <AdvancedChartWidget
                                data={data}
                                xKey={extras?.xKey} /* Let internal auto-detect handle fallbacks */
                                yKey={extras?.yKey}
                                label={extras?.yLabel}
                                title={extras?.yLabel ? `${extras.yLabel} Trend` : 'Data Trend'}
                            />
                        </Box>

                        {/* Always Render Table */}
                        <Box>
                            <Box mb="xs" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <IconDatabase size={16} color="gray" />
                                <Text fw={600} size="sm" c="dimmed">Source Data</Text>
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
