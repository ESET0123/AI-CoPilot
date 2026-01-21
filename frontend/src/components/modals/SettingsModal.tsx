import { Modal, Tabs, Box, Text, Group, Select, Switch, Stack, Divider, Button, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { TbUser, TbBell, TbLock, TbPalette, TbChevronRight, TbExternalLink } from 'react-icons/tb';

interface SettingsModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="lg">Settings</Text>}
            size="xl"
            radius="lg"
            padding="xl"
            styles={{
                title: { fontSize: '1.2rem' },
                content: { minHeight: 450 }
            }}
        >
            <Tabs variant="pills" defaultValue="general" orientation="vertical" styles={{
                tab: {
                    justifyContent: 'flex-start',
                    padding: '10px 15px',
                    fontWeight: 500,
                    '&[data-active]': {
                        backgroundColor: 'var(--mantine-color-brand-light)',
                        color: 'var(--mantine-color-brand-text)',
                    }
                },
                panel: {
                    paddingLeft: 30
                }
            }}>
                <Tabs.List w={200}>
                    <Tabs.Tab value="general" leftSection={<TbUser size={18} />}>
                        General
                    </Tabs.Tab>
                    <Tabs.Tab value="notifications" leftSection={<TbBell size={18} />}>
                        Notifications
                    </Tabs.Tab>
                    <Tabs.Tab value="privacy" leftSection={<TbLock size={18} />}>
                        Privacy & Data
                    </Tabs.Tab>
                    <Tabs.Tab value="display" leftSection={<TbPalette size={18} />}>
                        Display
                    </Tabs.Tab>
                </Tabs.List>

                {/* ===== General Panel ===== */}
                <Tabs.Panel value="general">
                    <Stack gap="xl">
                        <Box>
                            <Text fw={600} mb="xs">Language</Text>
                            <Select
                                placeholder="Select language"
                                data={['English', 'Hindi', 'Spanish', 'French', 'German']}
                                defaultValue="English"
                            />
                        </Box>

                        <Box>
                            <Text fw={600} mb="xs">Units</Text>
                            <Select
                                placeholder="Select units"
                                data={['Metric (Celsius, km)', 'Imperial (Fahrenheit, miles)']}
                                defaultValue="Metric (Celsius, km)"
                            />
                        </Box>

                        <Box>
                            <Text fw={600} mb="xs">Dashboard Defaults</Text>
                            <Select
                                placeholder="Default view"
                                data={['Classic', 'Compact', 'Detailed Analysis']}
                                defaultValue="Detailed Analysis"
                            />
                        </Box>
                    </Stack>
                </Tabs.Panel>

                {/* ===== Notifications Panel ===== */}
                <Tabs.Panel value="notifications">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>System Alerts</Text>
                                <Text size="xs" color="dimmed">Get notified about system updates and maintenance</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Outage Notifications</Text>
                                <Text size="xs" color="dimmed">Alerts for scheduled or unexpected power outages</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Performance Reports</Text>
                                <Text size="xs" color="dimmed">Weekly summary of energy usage and efficiency</Text>
                            </Box>
                            <Switch color="lime" />
                        </Group>
                    </Stack>
                </Tabs.Panel>

                {/* ===== Privacy Panel ===== */}
                <Tabs.Panel value="privacy">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Chat History & Training</Text>
                                <Text size="xs" color="dimmed">Save new chats into your history</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Divider />

                        <Box>
                            <Text fw={600} mb="sm">Data Export</Text>
                            <Text size="xs" color="dimmed" mb="md">Export your conversation data and account details</Text>
                            <Button variant="light" color="gray" size="xs">Export Data</Button>
                        </Box>

                        <Box>
                            <Text fw={600} color="red" mb="sm">Delete Account</Text>
                            <Text size="xs" color="dimmed" mb="md">Permanently delete your account and all associated data</Text>
                            <Button variant="outline" color="red" size="xs">Delete Account</Button>
                        </Box>
                    </Stack>
                </Tabs.Panel>

                {/* ===== Display Panel ===== */}
                <Tabs.Panel value="display">
                    <Stack gap="lg">
                        <Box>
                            <Text fw={600} mb="xs">Theme</Text>
                            <Select
                                placeholder="Choose theme"
                                data={[
                                    { value: 'auto', label: 'System' },
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' }
                                ]}
                                value={colorScheme}
                                onChange={(value) => setColorScheme(value as 'auto' | 'light' | 'dark')}
                            />
                        </Box>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>High Contrast Mode</Text>
                                <Text size="xs" color="dimmed">Increase visibility for text and elements</Text>
                            </Box>
                            <Switch color="lime" />
                        </Group>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Screen Reader Optimized</Text>
                                <Text size="xs" color="dimmed">Enable enhanced metadata for accessibility</Text>
                            </Box>
                            <Switch color="lime" />
                        </Group>
                    </Stack>
                </Tabs.Panel>
            </Tabs>

            <Box mt={40} pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Group justify="flex-end">
                    <Button variant="filled" color="lime" onClick={onClose} radius="md">Done</Button>
                </Group>
            </Box>
        </Modal>
    );
}
