import { Box } from '@mantine/core';
import { Paper, Text, ThemeIcon, Group, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight, Icon } from '@tabler/icons-react';

interface QuickActionCardProps {
    title: string;
    description: string;
    icon?: Icon; // Optional specific icon for the card
    onClick?: () => void;
}

export default function QuickActionCard({ title, description, onClick }: QuickActionCardProps) {
    return (
        <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
            <Paper
                p="lg"
                radius="lg"
                style={{
                    backgroundColor: '#efffa3',
                    border: 'none',
                    position: 'relative',
                    height: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                styles={{
                    root: {
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }
                    }
                }}
            >
                <Box style={{ position: 'absolute', top: 16, right: 16 }}>
                    <ThemeIcon radius="xl" size="sm" color="dark" variant="filled" style={{ backgroundColor: '#334155' }}>
                        <IconArrowUpRight size={14} />
                    </ThemeIcon>
                </Box>

                <Box
                    style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        width: 32,
                        height: 32,
                        backgroundColor: 'white',
                        borderRadius: 8,
                    }}
                />

                <Group align="flex-start" gap={4} style={{ flexDirection: 'column' }}>
                    <Text fw={700} c="#1e293b" size="sm">
                        {title}
                    </Text>
                    <Text size="xs" c="#64748b" style={{ lineHeight: 1.4 }}>
                        {description}
                    </Text>
                </Group>
            </Paper>
        </UnstyledButton>
    );
}

