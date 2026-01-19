/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, SimpleGrid, Text } from '@mantine/core';
import { TbAlertTriangle, TbActivity, TbCalculator, TbUsers } from 'react-icons/tb';
import QuickActionCard from '../ui/QuickActionCard';
import { useAccessControl, type AccessControlConfig } from '../../hooks/useAccessControl';

import { useNavigate } from 'react-router-dom';

export default function QuickAccessCategories() {
    const navigate = useNavigate();
    const { hasAccess } = useAccessControl();

    // Define the configuration for quick actions inside to use navigate
    const QUICK_ACTIONS: (AccessControlConfig & {
        title: string;
        description: string;
        icon: any;
        onClick: () => void;
    })[] = [
            {
                title: "Theft Detection",
                description: "View Real Time data and detect anomalies",
                icon: TbAlertTriangle,
                onClick: () => { navigate("/theft-detection") },
                allowedRoles: ['ROLE_ADMINISTRATOR', 'ROLE_SUPERVISOR', 'ROLE_FIELD_OFFICER'],
                allowedGroups: ['/zones/ZONE_SOUTH'],
                requireAll: true
            },
            {
                title: "Load Forecasting",
                description: "View Real Time data and detect patterns",
                icon: TbActivity,
                onClick: () => { navigate("/load-forecasting") },
                allowedRoles: ['ROLE_ADMINISTRATOR', 'ROLE_ASSISTANT_ENGINEER'],
                allowedGroups: ['/zones/ZONE_SOUTH'],
                requireAll: true
            },
            {
                title: "Smart Tariff",
                description: "Optimize tariff structures",
                icon: TbCalculator,
                onClick: () => { navigate("/smart-tariff") },
                allowedRoles: ['ROLE_CUSTOMER', 'ROLE_ADMINISTRATOR'],
                // No specific group restriction for customer-facing tariff
                requireAll: false
            },
            {
                title: "Defaulter Analysis",
                description: "Predictive analysis for payments",
                icon: TbUsers,
                onClick: () => { navigate("/defaulter-analysis") },
                allowedRoles: ['ROLE_ADMINISTRATOR', 'ROLE_SUPERVISOR', 'ROLE_FIELD_OFFICER'],
                allowedGroups: ['/zones/ZONE_SOUTH'],
                requireAll: true
            }
        ];

    // Filter actions based on roles and groups
    const visibleActions = QUICK_ACTIONS.filter(action => {
        return hasAccess({
            allowedRoles: action.allowedRoles,
            allowedGroups: action.allowedGroups,
            requireAll: action.requireAll
        });
    });

    if (visibleActions.length === 0) return null;

    return (
        <Box w="100%" maw={900} mb="xl">
            <Text fw={600} size="lg" mb="md" c="#334155">Quick Access Categories</Text>
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 4 }} spacing="md">
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
