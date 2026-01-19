import { Box, Paper, Text, ThemeIcon, Group, UnstyledButton } from '@mantine/core';
import { TbArrowUpRight, TbLayoutDashboard } from 'react-icons/tb';
import { IconType } from 'react-icons';

interface QuickActionCardProps {
    title: string;
    description: string;
    icon?: IconType;
    onClick?: () => void;
}

export default function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
    const ActualIcon = Icon || TbLayoutDashboard;

    return (
        <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
            <Paper
                p="md"
                radius="lg"
                style={{
                    backgroundColor: '#f7fee7',
                    minHeight: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    cursor: 'pointer'
                }}
                className="quick-action-card"
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .quick-action-card:hover {
                        border-color: #84cc16 !important;
                        transform: translateY(-4px);
                        box-shadow: 0 10px 15px -3px rgba(132, 204, 22, 0.1);
                    }
                    .quick-action-card:hover .arrow-icon {
                        background-color: white !important;
                        color: #84cc16 !important;
                        border: 1px solid #84cc16 !important;
                    }
                    .quick-action-card .arrow-icon {
                        background-color: #334155 !important;
                        color: white !important;
                        border: 1px solid transparent !important;
                        transition: all 0.2s ease;
                    }
                `}} />

                <Group justify="space-between" align="flex-start" mb="xs">
                    <Box
                        style={{
                            width: 36,
                            height: 36,
                            backgroundColor: 'white',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                        }}
                    >
                        <ActualIcon size={20} color="#334155" />
                    </Box>

                    <ThemeIcon
                        radius="xl"
                        size="sm"
                        className="arrow-icon"
                    >
                        <TbArrowUpRight size={14} />
                    </ThemeIcon>
                </Group>

                <Box>
                    <Text fw={700} c="#1e293b" size="md" mb={8} lineClamp={1}>
                        {title}
                    </Text>
                    <Text size="xs" c="#64748b" style={{ lineHeight: 1.5 }}>
                        {description}
                    </Text>
                </Box>
            </Paper>
        </UnstyledButton>
    );
}

