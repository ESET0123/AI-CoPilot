import { Paper, Text } from '@mantine/core';

type Props = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

export default function MessageBubble({ role, text, loading }: Props) {
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
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Text size="sm">
        {loading ? 'Thinking…' : text}
      </Text>
    </Paper>
  );
}
