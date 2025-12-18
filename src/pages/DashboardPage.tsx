import { Box, Center, Stack, Text } from '@mantine/core';
import { useEffect, useRef } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { hydrateChats, resetForUser } from '../features/chat/chatSlice';
import { chatStorage } from '../services/chatStorage';

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const chatState = useAppSelector((s) => s.chat);

  const hasHydratedRef = useRef(false);

  const activeConversation = chatState.conversations.find(
    (c) => c.id === chatState.activeConversationId
  );

  const isEmpty =
    !activeConversation || activeConversation.messages.length === 0;

  /* ================= RESET + HYDRATE (ON USER CHANGE ONLY) ================= */
  useEffect(() => {
    if (!user) return;

    const userId = String(user.id);

    // reset hydration gate
    hasHydratedRef.current = false;

    // 1️⃣ reset chat state for this user
    dispatch(resetForUser(userId));

    // 2️⃣ load stored chats
    const storedChats = chatStorage.load(userId);

    dispatch(
      hydrateChats({
        userId,
        chatState: storedChats,
      })
    );

    // 3️⃣ mark hydration done AFTER reducer runs
    queueMicrotask(() => {
      hasHydratedRef.current = true;
    });
  }, [user?.id, dispatch]);

  /* ================= SAVE (ONLY AFTER HYDRATION COMPLETES) ================= */
  useEffect(() => {
    if (!user) return;
    if (!chatState.hydrated) return;
    if (!hasHydratedRef.current) return;

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
