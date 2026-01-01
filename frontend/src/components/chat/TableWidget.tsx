import { Table, Box, Button, Collapse } from '@mantine/core';
import { useState } from 'react';
import { designTokens } from '../../styles/designTokens';

type TableWidgetProps = {
    data: Record<string, string | number | boolean | object>[];
};

export default function TableWidget({ data }: TableWidgetProps) {
    const [opened, setOpened] = useState(false);

    if (!data || data.length === 0) return null;

    // Get headers from first row keys
    const headers = Object.keys(data[0]);

    return (
        <Box>
            <Button
                variant="light"
                size="sm"
                onClick={() => setOpened((o) => !o)}
                radius="md"
                styles={{
                    root: {
                        transition: designTokens.transitions.normal,
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                    },
                }}
            >
                {opened ? 'Hide Data Table' : `Show Data Table (${data.length} rows)`}
            </Button>

            <Collapse in={opened} transitionDuration={300}>
                <Box
                    mt="sm"
                    style={{
                        overflowX: 'auto',
                        border: '1px solid rgba(79, 172, 254, 0.2)',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: designTokens.transitions.normal,
                    }}
                >
                    <Table striped highlightOnHover withTableBorder={false} withColumnBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                {headers.map((h) => (
                                    <Table.Th key={h} style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{h}</Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.map((row, i) => (
                                <Table.Tr key={i}>
                                    {headers.map((h) => (
                                        <Table.Td key={h} style={{ whiteSpace: 'nowrap' }}>
                                            {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h])}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Box>
            </Collapse>
        </Box>
    );
}
