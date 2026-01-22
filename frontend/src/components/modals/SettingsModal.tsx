import { Modal, Tabs, Box, Text, Group, Select, Switch, Stack, Divider, Button, useMantineColorScheme } from '@mantine/core';
import { TbUser, TbBell, TbLock, TbPalette, TbMicrophone } from 'react-icons/tb';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { deleteAllConversations } from '../../features/chat/chatSlice';
import { useDisclosure } from '@mantine/hooks';
import DeleteAllConversationsModal from './DeleteAllConversationsModal';

interface SettingsModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const dispatch = useAppDispatch();

    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [speechRecognitionMethod, setSpeechRecognitionMethod] = useState('google-webkit');

    // Load speech recognition method from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('speechRecognitionMethod');
        if (saved) {
            setSpeechRecognitionMethod(saved);
        }
    }, []);

    // Save speech recognition method to localStorage
    const handleSpeechMethodChange = (value: string | null) => {
        if (value) {
            console.log(`[Settings] 🎤 Speech recognition method changed to: ${value}`);
            setSpeechRecognitionMethod(value);
            localStorage.setItem('speechRecognitionMethod', value);
        }
    };

    const handleDeleteAll = async () => {
        setIsDeleting(true);
        try {
            await dispatch(deleteAllConversations()).unwrap();
            closeDeleteModal();
        } catch (err) {
            console.error('Failed to delete all chats:', err);
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="lg">Settings</Text>}
            centered
            size="xl"
            radius="lg"
            padding="xl"
            styles={{
                title: { fontSize: '1.2rem' },
                content: { minHeight: 180 }
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
                tabLabel: {
                    textAlign: 'left',
                    width: '100%',
                },
                panel: {
                    paddingLeft: 30,
                    maxHeight: 300,
                    overflowY: 'auto'
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
                    <Tabs.Tab value="speech" leftSection={<TbMicrophone size={18} />}>
                        Speech Recognition
                    </Tabs.Tab>
                </Tabs.List>

                {/* ===== General Panel ===== */}
                <Tabs.Panel value="general">
                    <Stack gap="xl">
                        <Box>
                            <Text fw={600} mb="xs">Language</Text>
                            <Select
                                placeholder="Select language"
                                data={['English', 'Hindi']}
                                defaultValue="English"
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
                                <Text size="xs" c="dimmed">Get notified about system updates and maintenance</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Outage Notifications</Text>
                                <Text size="xs" c="dimmed">Alerts for scheduled or unexpected power outages</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Group justify="space-between">
                            <Box>
                                <Text fw={600}>Performance Reports</Text>
                                <Text size="xs" c="dimmed">Weekly summary of energy usage and efficiency</Text>
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
                                <Text size="xs" c="dimmed">Save new chats into your history</Text>
                            </Box>
                            <Switch defaultChecked color="lime" />
                        </Group>

                        <Divider />

                        <Box>
                            <Text fw={600} mb="sm">Data Export</Text>
                            <Text size="xs" c="dimmed" mb="md">Export your conversation data and account details</Text>
                            <Button variant="light" color="gray" size="xs">Export Data</Button>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fw={600} mb="sm">Delete Chat History</Text>
                            <Text size="xs" c="dimmed" mb="md">Permanently delete all your conversations. This cannot be undone.</Text>
                            <Button variant="light" color="red" size="xs" onClick={openDeleteModal}>Delete all conversations</Button>
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

                    </Stack>
                </Tabs.Panel>

                {/* ===== Speech Recognition Panel ===== */}
                <Tabs.Panel value="speech">
                    <Stack gap="lg">
                        <Box>
                            <Text fw={600} mb="xs">Speech Recognition Method</Text>
                            <Text size="xs" c="dimmed" mb="sm">Choose how voice input is processed</Text>
                            <Select
                                placeholder="Select method"
                                data={[
                                    { value: 'google-webkit', label: 'Google Webkit (Browser API)' },
                                    { value: 'review', label: 'Review (Whisper + Translation)' },
                                    { value: 'translate-direct', label: 'Translate Direct (Whisper Direct Translation)' }
                                ]}
                                value={speechRecognitionMethod}
                                onChange={handleSpeechMethodChange}
                            />
                        </Box>

                        <Box>
                            <Text size="xs" c="dimmed">
                                <strong>Google Webkit:</strong> Uses browser's built-in speech recognition for real-time transcription.<br/>
                                <strong>Review:</strong> Uses Whisper model for accurate transcription, with optional translation.<br/>
                                <strong>Translate Direct:</strong> Uses Whisper with direct translation to English.
                            </Text>
                        </Box>
                    </Stack>
                </Tabs.Panel>
            </Tabs>

            <Box mt={40} pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Group justify="flex-end">
                    <Button variant="filled" color="lime" onClick={onClose} radius="md">Done</Button>
                </Group>
            </Box>
            <DeleteAllConversationsModal
                opened={deleteModalOpened}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteAll}
                loading={isDeleting}
            />
        </Modal>
    );
}
