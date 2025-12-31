import { Box, Center, Stack, Text, Collapse } from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';

import AppShellLayout from '../components/layout/AppShellLayout';
import HeaderBar from '../components/layout/HeaderBar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import DataPanel from '../components/chat/DataPanel';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchConversations, fetchMessages, } from '../features/chat/chatSlice';
import { parseMessageContent } from '../utils/contentParser';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [selectedData, setSelectedData] = useState<any | null>(null);

  // LISTENER FOR 'OPEN_DATA_PANEL'
  useEffect(() => {
    const handleOpen = (event: Event) => {
      console.log('[Dashboard] Opening Data Panel via event');
      setShowDataPanel(true);

      // Check if event has data payload (CustomEvent)
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        console.log('[Dashboard] Setting selected data from event');
        setSelectedData(customEvent.detail);
      }
    };
    window.addEventListener('OPEN_DATA_PANEL', handleOpen);
    return () => window.removeEventListener('OPEN_DATA_PANEL', handleOpen);
  }, []);

  const user = useAppSelector((s) => s.auth.user);
  const chatState = useAppSelector((s) => s.chat);

  const activeConversation = chatState.conversations.find(
    (c) => c.id === chatState.activeConversationId
  );

  const isEmpty =
    !activeConversation || activeConversation.messages.length === 0;

  // Reset selected data when switching conversations
  useEffect(() => {
    setSelectedData(null);
  }, [chatState.activeConversationId]);

  // DERIVE LATEST DATA CONTENT
  const latestDataContent = useMemo(() => {
    if (!activeConversation) return null;

    // Find last assistant message with structured data
    const messages = [...activeConversation.messages].reverse();
    const dataMessage = messages.find(m => {
      if (m.role !== 'assistant') return false;
      const parsed = parseMessageContent(m.text, false);
      return parsed.type !== 'text' && parsed.type !== 'error' && parsed.data;
    });

    if (!dataMessage) return null;
    return parseMessageContent(dataMessage.text, false);
  }, [activeConversation]);

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
          width: '100%',
          overflow: 'hidden', // Prevent page scroll
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)',
            padding: '8px 16px',
            height: '60px',
            flexShrink: 0,
          }}
        >
          <HeaderBar
            showDataPanel={showDataPanel}
            onToggleDataPanel={() => setShowDataPanel(o => !o)}
          />
        </Box>

        {/* ================= MAIN CONTENT ROW ================= */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* LEFT: CHAT AREA */}
          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0, // Flex child fix
            }}
          >
            <Box
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                position: 'relative',
              }}
              p={{ base: 'xs', sm: 'md' }}
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
                    <Text size="xl" fw={600} ta="center">
                      How can I help you today?
                    </Text>
                  </Stack>
                </Center>
              )}

              <ChatWindow />
            </Box>

            <Box p={{ base: 'xs', sm: 'md' }}>
              <ChatInput />
            </Box>
          </Box>

          {/* RIGHT: DATA PANEL (Third Partition) */}
          <Collapse
            in={showDataPanel}
            transitionDuration={200}
            animateOpacity
          >
            <Box
              style={{
                width: 400,
                height: '100%',
                borderLeft: '1px solid var(--mantine-color-default-border)',
                padding: 16,
                backgroundColor: 'var(--mantine-color-body)',
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
