import { Box, SimpleGrid, Text } from '@mantine/core';
import { IconAlertTriangle, IconActivity, IconCalculator, IconUsers } from '@tabler/icons-react';
import QuickActionCard from './QuickActionCard';

export default function QuickAccessCategories() {
    return (
        <Box w="100%" maw={900}>
            <Text fw={600} size="lg" mb="md" c="#334155">Quick Access Categories</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <QuickActionCard
                    title="Theft Detection"
                    description="View Real Time data and detect anomalies"
                    icon={IconAlertTriangle}
                    onClick={() => { alert("Theft Detection clicked") }}
                />
                <QuickActionCard
                    title="Load Forecasting"
                    description="View Real Time data and detect patterns"
                    icon={IconActivity}
                    onClick={() => { alert("Load Forecasting clicked") }}
                />
                <QuickActionCard
                    title="Smart Tariff"
                    description="Optimize tariff structures"
                    icon={IconCalculator}
                    onClick={() => { alert("Smart Tariff clicked") }}
                />
                <QuickActionCard
                    title="Defaulter Analysis"
                    description="Predictive analysis for payments"
                    icon={IconUsers}
                    onClick={() => { alert("Defaulter Analysis clicked") }}
                />
            </SimpleGrid>
        </Box>
    );
}
