import { Box, Center, Stack, Text, Collapse } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import DataPanel from '../components/chat/DataPanel';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchConversations,
  fetchMessages,
  setDataPanelOpen,
  setSelectedData as setSelectedDataAction
} from '../features/chat/chatSlice';
import { parseMessageContent } from '../utils/contentParser';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const chatState = useAppSelector((s) => s.chat);
  const { dataPanelOpen, selectedData, activeConversationId, conversations } = chatState;

  const isMobile = useMediaQuery('(max-width: 425px)');

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const isEmpty = !activeConversation || activeConversation.messages.length === 0;

  // DERIVE LATEST DATA CONTENT (Fallback if no specific data is selected)
  const latestDataContent = useMemo(() => {
    if (!activeConversation) return null;

    const messages = [...activeConversation.messages].reverse();
    const dataMessage = messages.find(m => {
      if (m.role !== 'assistant') return false;
      const parsed = parseMessageContent(m.text, false);
      return parsed.type !== 'text' && parsed.type !== 'error' && parsed.data;
    });

    if (!dataMessage) return null;
    return parseMessageContent(dataMessage.text, false);
  }, [activeConversation]);

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

  // RESET SELECTED DATA ON CONVERSATION SWITCH
  useEffect(() => {
    dispatch(setSelectedDataAction(null));
  }, [activeConversationId, dispatch]);

  return (
    <AppShellLayout>
      <Box h="100%" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER SECTION */}
        <Box
          h={60}
          px="md"
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HeaderBar
            showDataPanel={dataPanelOpen}
            onToggleDataPanel={() => dispatch(setDataPanelOpen(!dataPanelOpen))}
          />
        </Box>

        {/* MAIN BODY SECTION */}
        <Box style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden'
        }}>

          {/* LEFT: CHAT AREA */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box style={{ flex: 1, overflowY: 'auto', position: 'relative' }} p="md">
              {isEmpty && (
                <Center style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <Stack align="center" maw={640} px="md">
                    <Text size="xl" fw={600} ta="center">How can I help you today?</Text>
                  </Stack>
                </Center>
              )}
              <ChatWindow />
            </Box>

            <Box p="md">
              <ChatInput />
            </Box>
          </Box>

          {/* RIGHT: DATA PANEL CONTAINER */}
          <Collapse in={dataPanelOpen} transitionDuration={200}>
            <Box
              w={isMobile ? '100%' : 400}
              h={isMobile ? 350 : "100%"}
              p="md"
              style={{
                borderLeft: isMobile ? 'none' : '1px solid var(--mantine-color-default-border)',
                borderTop: isMobile ? '1px solid var(--mantine-color-default-border)' : 'none',
                backgroundColor: 'var(--mantine-color-body)',
                overflowY: 'auto'
              }}
            >
              <DataPanel content={selectedData || latestDataContent} />
            </Box>
          </Collapse>
        </Box>
      </Box>
    </AppShellLayout>
  );
}
