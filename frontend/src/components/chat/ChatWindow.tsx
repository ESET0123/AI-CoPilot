import { Stack } from '@mantine/core';
import { useAppSelector } from '../../app/hooks';
import MessageBubble from './MessageBubble';
import React, { useEffect } from 'react';

interface ChatWindowProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({ scrollContainerRef }: ChatWindowProps) {
  const { conversations, activeConversationId } = useAppSelector(
    (s) => s.chat
  );

  const convo = conversations.find(
    (c) => c.id === activeConversationId
  );

  useEffect(() => {
    if (!convo || !scrollContainerRef.current) return;

    // Use scrollTo on the container instead of scrollIntoView on an element
    // This prevents the parent page from scrolling down
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [convo, scrollContainerRef]);

  if (!convo) return null;

  return (
    <Stack style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '2rem 0',
    }}>
      {convo.messages.map((msg) => (
        <MessageBubble key={msg.id} {...msg} />
      ))}
    </Stack>
  );
}
