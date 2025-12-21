import { Stack } from '@mantine/core';
import { useAppSelector } from '../../app/hooks';
import MessageBubble from './MessageBubble';
import { useEffect, useRef } from 'react';

export default function ChatWindow() {
  const { conversations, activeConversationId } = useAppSelector(
    (s) => s.chat
  );

  const convo = conversations.find(
    (c) => c.id === activeConversationId
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!convo) return;

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [convo]);

  if (!convo) return null;

  return (
    <Stack>
      {convo.messages.map((msg, idx) => (
        <MessageBubble key={idx} {...msg} />
      ))}

      {/* Scroll target */}
      <div ref={bottomRef} />
    </Stack>
  );
}
