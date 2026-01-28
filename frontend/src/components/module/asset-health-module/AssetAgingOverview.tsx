import { Paper, Title, SimpleGrid, Text, Group, Badge, Box, ScrollArea } from '@mantine/core';
import { AssetAgingItem } from '../../../services/assetHealthService';

interface Props {
    assets: AssetAgingItem[];
}

export default function AssetAgingOverview({ assets }: Props) {
    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Title order={4} size="h6" mb="md">Asset Aging Overview</Title>
            <ScrollArea h={350}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    {assets.map((asset, index) => (
                        <Paper key={index} p="xs" radius="md" withBorder>
                            <Text size="xs" c="dimmed">{asset.id}</Text>
                            <Text fw={700} size="md" mb="xs">{asset.serialNumber}</Text>
                            <Badge color="red" variant="light" size="sm" radius="sm">
                                • {asset.agingLost}
                            </Badge>
                        </Paper>
                    ))}
                </SimpleGrid>
            </ScrollArea>
        </Paper>
    );
}
