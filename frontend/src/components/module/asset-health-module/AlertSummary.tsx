import { Paper, Title, Text, Stack, Group, Box } from '@mantine/core';
import { AlertSummaryItem } from '../../../services/assetHealthService';

interface Props {
    alerts: AlertSummaryItem[];
    activeAlerts: number;
}

export default function AlertSummary({ alerts, activeAlerts }: Props) {
    return (
        <Paper p="md" radius="md" withBorder h="100%">
            <Title order={4} size="h6" mb="xs">Alert Summary</Title>
            <Text size="xs" c="dimmed">Active Alerts</Text>
            <Title order={2} mb="md">{activeAlerts}</Title>

            <Stack gap="xs">
                {alerts.map((alert) => (
                    <Paper
                        key={alert.severity}
                        p="xs"
                        radius="md"
                        bg={alert.color}
                        style={{ border: 'none' }}
                        className="alert-item"
                    >
                        <Group justify="space-between">
                            <Text size="sm" fw={600} color={alert.severity === 'Critical' ? 'red.7' : 'inherit'}>
                                {alert.severity}: {alert.count}
                            </Text>
                        </Group>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
}
