import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import DashboardHero from '../components/chat/DashboardHero';
import { designTokens } from '../styles/designTokens';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchConversations,
  fetchMessages,
} from '../features/chat/chatSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const chatState = useAppSelector((s) => s.chat);
  const { activeConversationId, conversations } = chatState;

  const isMobile = useMediaQuery('(max-width: 425px)');

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const isEmpty = !activeConversation || activeConversation.messages.length === 0;

  // LOAD CONVERSATIONS ON MOUNT
  useEffect(() => {
    if (!user) return;

    dispatch(fetchConversations())
      .unwrap()
      .then((convos) => {
        const savedId = localStorage.getItem('activeConversationId');
        const targetId = convos.find((c) => c.id === savedId)?.id || convos[0]?.id;
        if (targetId) dispatch(fetchMessages(targetId));
      });
  }, [user, dispatch]);

  return (
    <AppShellLayout>
      <Box h="100%" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER SECTION */}
        <Box
          h={60}
          px="xl"
          style={{
            background: designTokens.gradients.glow,
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HeaderBar />
        </Box>

        {/* MAIN BODY SECTION */}
        <Box
          // p="xl"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            overflow: 'hidden',
            background: designTokens.gradients.glow
          }}>

          {/* LEFT: CHAT AREA */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {isEmpty ? (
              // DRAFT MODE: Hero Section
              <Box style={{ flex: 1, overflowY: 'auto' }}>
                <DashboardHero />
              </Box>
            ) : (
              // ACTIVE MODE: Chat Window + Bottom Input
              <>
                <Box style={{ flex: 1, overflowY: 'auto', position: 'relative' }} p="md">
                  <ChatWindow />
                </Box>

                <Box p="md" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Box maw={800} w="100%">
                    <ChatInput />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </AppShellLayout>
  );
}
