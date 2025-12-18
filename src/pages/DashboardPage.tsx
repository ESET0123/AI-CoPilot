import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { Box, Center, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { chatStorage } from '../services/chatStorage';

export default function DashboardPage() {
  const chatState = useAppSelector((s) => s.chat);
  const user = useAppSelector((s) => s.auth.user);

  const activeConversation = chatState.conversations.find(
    (c) => c.id === chatState.activeConversationId
  );

  const isEmpty =
    !activeConversation || activeConversation.messages.length === 0;

  /* ================= Persist chats per user ================= */
  useEffect(() => {
    if (!user) return;
    chatStorage.save(String(user.id), chatState);
  }, [chatState, user]);

  return (
    <AppShellLayout>
      <Box
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)',
            padding: '8px 16px',
          }}
        >
          <HeaderBar />
        </Box>

        {/* Messages area */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            position: 'relative',
          }}
        >
          {/* Empty state overlay */}
          {isEmpty && (
            <Center
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              <Stack align="center" maw={640} px="md">
                <Text size="xl" fw={600}>
                  How can I help you today?
                </Text>
              </Stack>
            </Center>
          )}

          {/* Always render messages */}
          <ChatWindow />
        </Box>

        {/* Input ALWAYS mounted */}
        <Box style={{ padding: '16px' }}>
          <ChatInput />
        </Box>
      </Box>
    </AppShellLayout>
  );
}
