import { Table, Box, Button, Collapse } from '@mantine/core';
import { useState } from 'react';

type TableWidgetProps = {
    data: any[];
};

export default function TableWidget({ data }: TableWidgetProps) {
    const [opened, setOpened] = useState(false);

    if (!data || data.length === 0) return null;

    // Get headers from first row keys
    const headers = Object.keys(data[0]);

    return (
        <Box mt="xs">
            <Button
                variant="subtle"
                size="xs"
                onClick={() => setOpened((o) => !o)}
                style={{ marginBottom: 4 }}
            >
                {opened ? 'Hide Data Table' : `Show Data Table (${data.length} rows)`}
            </Button>

            <Collapse in={opened}>
                <Box style={{ overflowX: 'auto', border: '1px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
                    <Table striped highlightOnHover withTableBorder={false} withColumnBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                {headers.map((h) => (
                                    <Table.Th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</Table.Th>
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
