import { Box, Center, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchConversations,
  fetchMessages,
} from '../features/chat/chatSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const chatState = useAppSelector((s) => s.chat);

  const activeConversation = chatState.conversations.find(
    (c) => c.id === chatState.activeConversationId
  );

  const isEmpty =
    !activeConversation || activeConversation.messages.length === 0;

  /* ================= LOAD CONVERSATIONS + FIRST CHAT ================= */
  useEffect(() => {
    if (!user) return;

    dispatch(fetchConversations())
      .unwrap()
      .then((conversations) => {
        const savedId = localStorage.getItem('activeConversationId');
        const targetId = conversations.find((c) => c.id === savedId)?.id || conversations[0]?.id;

        if (targetId) {
          dispatch(fetchMessages(targetId));
        }
      });
  }, [user, dispatch]);

  return (
    <AppShellLayout>
      <Box
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)',
            padding: '8px 16px',
          }}
        >
          <HeaderBar />
        </Box>

        {/* ================= CHAT AREA ================= */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            position: 'relative',
          }}
        >
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

          <ChatWindow />
        </Box>

        {/* ================= INPUT ================= */}
        <Box style={{ padding: '16px' }}>
          <ChatInput />
        </Box>
      </Box>
    </AppShellLayout>
  );
}
