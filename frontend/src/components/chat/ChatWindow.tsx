import { Stack } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import MessageBubble from './MessageBubble';
import React, { useEffect } from 'react';
import { sendMessage, addAssistantLoading } from '../../features/chat/chatSlice';

interface ChatWindowProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({ scrollContainerRef }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, sendingConversationIds } = useAppSelector(
    (s) => s.chat
  );
  const { primaryLanguage } = useAppSelector((s) => s.settings);

  const convo = conversations.find(
    (c) => c.id === activeConversationId
  );

  const isCurrentSending = activeConversationId
    ? sendingConversationIds.includes(activeConversationId)
    : false;

  useEffect(() => {
    if (!convo || !scrollContainerRef.current) return;

    // Use scrollTo on the container instead of scrollIntoView on an element
    // This prevents the parent page from scrolling down
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [convo, scrollContainerRef]);

  const handleRefresh = (messageIndex: number) => {
    if (!convo || !activeConversationId || isCurrentSending) return;

    // Find the previous user message
    let userMessage = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (convo.messages[i].role === 'user') {
        userMessage = convo.messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // Resend the user message
    dispatch(addAssistantLoading());
    dispatch(
      sendMessage({
        conversationId: activeConversationId,
        message: userMessage.text,
        optimisticId: crypto.randomUUID(),
        language: primaryLanguage,
      })
    );
  };

  if (!convo) return null;

  return (
    <Stack style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '2rem 0',
    }}>
      {convo.messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          {...msg}
          onRefresh={msg.role === 'assistant' && !msg.loading ? () => handleRefresh(index) : undefined}
        />
      ))}
    </Stack>
  );
}
