import { Group, Select, Button, Text, Box } from '@mantine/core';

export default function TheftFilters() {
    return (
        <Group justify="space-between" mb="lg">
            <Group>
                <Box>
                    <Text size="sm" fw={500} mb={5}>Filter by Days:</Text>
                    <Group gap="xs">
                        <Select
                            placeholder="Select"
                            data={['Last 7 days', 'Last 30 days']}
                            w={200}
                            radius="xs"
                        />
                        <Button variant="outline" color="red" radius="s">Clear Days</Button>
                    </Group>
                </Box>
            </Group>

            <Group>
                <Box>
                    <Text size="sm" fw={500} mb={5}>Filter by Circle:</Text>
                    <Select
                        placeholder="Select"
                        data={['Circle A', 'Circle B']}
                        w={150}
                        radius="xs"
                    />
                </Box>
                <Box>
                    <Text size="sm" fw={500} mb={5}>Filter by Division:</Text>
                    <Group gap="xs">
                        <Select
                            placeholder="Select"
                            data={['Division X', 'Division Y']}
                            w={150}
                            radius="xs"
                        />
                        <Button variant="outline" color="red" radius="s">Clear Circle/Division</Button>
                    </Group>
                </Box>
            </Group>
        </Group>
    );
}
