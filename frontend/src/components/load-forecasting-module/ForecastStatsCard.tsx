import { Divider } from '@mantine/core';
import { Paper, Text, Group, Box, ThemeIcon, ActionIcon } from '@mantine/core';
import { TbDotsVertical } from 'react-icons/tb';
import { LiaBroadcastTowerSolid } from "react-icons/lia";
import { MdFilterList } from "react-icons/md";

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
    icon: Icon = LiaBroadcastTowerSolid
}: ForecastStatsCardProps) {
    return (
        <Paper p="md" radius="md" withBorder h="100%" pos="relative" style={{ backgroundColor: '#ffffff' }}>
            <Group justify="space-between" mb="xs">
                <Text fw={600} size="14px" c="#5c6a7e">{title}</Text>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <MdFilterList size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <TbDotsVertical size={16} />
                    </ActionIcon>
                </Group>
            </Group>

            {subtitle && (
                <Text size="xs" c="dimmed" mb={4}>{subtitle}</Text>
            )}

            <Text fw={700} size="32px" mb={liveValue !== undefined ? "md" : 0} lh={1.2}>
                {value}
            </Text>

            {liveValue !== undefined && (
                <>
                    <Divider my="sm" />
                    <Group gap="md" mt="md">
                        <ThemeIcon size={44} radius="md" variant="light" color="green">
                            <Icon size={24} />
                        </ThemeIcon>
                        <Box>
                            <Text size="xs" c="dimmed" fw={500}>{liveLabel || 'Live'}</Text>
                            <Text fw={700} size="xl" lh={1.2}>{liveValue}</Text>
                        </Box>
                    </Group>
                </>
            )}
        </Paper>
    );
}

