import { Paper, Text, Loader, Box } from '@mantine/core';

type Props = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

export default function MessageBubble({ role, text, loading }: Props) {
  const isUser = role === 'user';

  if (loading) {
    return (
      <Box
        style={{
          alignSelf: 'flex-start',
          paddingLeft: 8,
          paddingTop: 4,
        }}
      >
        <Loader type="dots" size="sm" />
      </Box>
    );
  }

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
