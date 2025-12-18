import { Stack } from '@mantine/core';
import { useAppSelector } from '../../app/hooks';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const { conversations, activeConversationId } = useAppSelector(
    (s) => s.chat
  );

  const convo = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (!convo) return null;

  return (
    <Stack>
      {convo.messages.map((msg, idx) => (
        <MessageBubble key={idx} {...msg} />
      ))}
    </Stack>
  );
}
