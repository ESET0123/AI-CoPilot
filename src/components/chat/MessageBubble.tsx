import { Paper, Text } from '@mantine/core';

type Props = {
  role: 'user' | 'assistant';
  text: string;
};

export default function MessageBubble({ role, text }: Props) {
  const isUser = role === 'user';

  return (
    <Paper
      shadow="xs"
      p="sm"
      radius="md"
      withBorder
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '75%',
      }}
    >
      <Text size="sm">{text}</Text>
    </Paper>
  );
}
