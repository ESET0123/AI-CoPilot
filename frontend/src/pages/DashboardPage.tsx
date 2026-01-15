import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import DraftView from '../components/chat/DraftView';
import ActiveConversationView from '../components/chat/ActiveConversationView';
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
      <Box h="100%" style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zoom: '0.8',
        background: 'radial-gradient(circle at 50% 0%, rgba(236, 252, 203, 0.8) 10%, #ffffff 70%)'
      }}>

        {/* HEADER SECTION */}
        <Box
          h={60}
          px="xl"
          style={{
            background: 'transparent',
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
          p="xl"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            overflow: 'hidden',
            background: 'transparent'
          }}>

          {/* LEFT: CHAT AREA */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '100%', overflowY: 'auto' }}>

            {isEmpty ? (
              // DRAFT MODE: Hero Section + Input + Quick Access
              <DraftView />
            ) : (
              // ACTIVE MODE: Chat Window + Input + Quick Access
              <ActiveConversationView />
            )}
          </Box>
        </Box>
      </Box>
    </AppShellLayout>
  );
}
