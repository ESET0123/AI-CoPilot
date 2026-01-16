import { Box, SimpleGrid, Text } from '@mantine/core';
import { IconAlertTriangle, IconActivity, IconCalculator, IconUsers } from '@tabler/icons-react';
import QuickActionCard from './QuickActionCard';
import { useAppSelector } from '../../app/hooks';

import { useNavigate } from 'react-router-dom';

export default function QuickAccessCategories() {
    const navigate = useNavigate();

    // Define the configuration for quick actions inside to use navigate
    const QUICK_ACTIONS = [
        {
            title: "Theft Detection",
            description: "View Real Time data and detect anomalies",
            icon: IconAlertTriangle,
            onClick: () => { navigate("/theft-detection") },
            allowedRoles: ['Executive'] // Only executives
        },
        {
            title: "Load Forecasting",
            description: "View Real Time data and detect patterns",
            icon: IconActivity,
            onClick: () => { navigate("/load-forecasting") },
            allowedRoles: ['Executive'] // Only executives
        },
        {
            title: "Smart Tariff",
            description: "Optimize tariff structures",
            icon: IconCalculator,
            onClick: () => { navigate("/smart-tariff") },
            allowedRoles: ['customer', 'Executive'] // Both
        },
        {
            title: "Defaulter Analysis",
            description: "Predictive analysis for payments",
            icon: IconUsers,
            onClick: () => { navigate("/defaulter-analysis") },
            allowedRoles: ['Executive'] // Only executives
        }
    ];

    // Get user roles from the store
    const userRoles = useAppSelector((state) => state.auth.roles || []);

    // Filter actions based on roles
    const visibleActions = QUICK_ACTIONS.filter(action => {
        // If no roles defined for action, show to everyone (optional safety)
        if (!action.allowedRoles || action.allowedRoles.length === 0) return true;

        // Check if user has at least one of the allowed roles
        return action.allowedRoles.some(role => userRoles.includes(role));
    });

    if (visibleActions.length === 0) return null;

    return (
        <Box w="100%" maw={900}>
            <Text fw={600} size="lg" mb="md" c="#334155">Quick Access Categories</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                {visibleActions.map((action) => (
                    <QuickActionCard
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        onClick={action.onClick}
                    />
                ))}
            </SimpleGrid>
        </Box>
    );
}
