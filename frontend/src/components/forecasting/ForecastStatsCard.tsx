import { Divider } from '@mantine/core';
import { Paper, Text, Group, Box, ThemeIcon, ActionIcon } from '@mantine/core';
import { TbBroadcast, TbDotsVertical } from 'react-icons/tb';
import { LuFilter } from "react-icons/lu";

interface ForecastStatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    liveValue?: string | number;
    liveLabel?: string;
    icon?: any;
}

export default function ForecastStatsCard({
    title,
    value,
    subtitle,
    liveValue,
    liveLabel,
    icon: Icon = TbBroadcast
}: ForecastStatsCardProps) {
    return (
        <Paper p="lg" radius="md" withBorder h="100%" pos="relative" style={{ backgroundColor: '#ffffff' }}>
            <Group justify="space-between" mb="xs">
                <Text fw={600} size="md" c="dimmed">{title}</Text>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <LuFilter size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <TbDotsVertical size={16} />
                    </ActionIcon>
                </Group>
            </Group>

            {subtitle && (
                <Text size="xs" c="dimmed" mb={4}>{subtitle}</Text>
            )}

            <Text fw={700} size="32px" mb="lg" lh={1.2}>
                {value}
            </Text>

            <Divider my="sm" variant="dashed" />

            {liveValue !== undefined && (
                <Group gap="md" mt="md">
                    <ThemeIcon size={44} radius="md" variant="light" color="green">
                        <Icon size={24} />
                    </ThemeIcon>
                    <Box>
                        <Text size="xs" c="dimmed" fw={500}>{liveLabel || 'Live'}</Text>
                        <Text fw={700} size="xl" lh={1.2}>{liveValue}</Text>
                    </Box>
                </Group>
            )}
        </Paper>
    );
}

