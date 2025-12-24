import { Paper, Text, Loader, Box } from '@mantine/core';
import { useMemo } from 'react';
import ChartWidget from './ChartWidget';
import TableWidget from './TableWidget';

type Props = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

export default function MessageBubble({ role, text, loading }: Props) {
  const isUser = role === 'user';

  // Parse structured data if assistant
  const content = useMemo(() => {
    if (isUser || !text) return { text, type: 'text', data: null, extras: {} };

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(text);
      if (parsed && parsed.text && parsed.type) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, fall back to plain text
    }
    return { text, type: 'text', data: null, extras: {} };
  }, [text, isUser]);

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
        maxWidth: isUser ? '85%' : '100%', // Full width for assistant on mobile
        backgroundColor: isUser
          ? 'var(--mantine-color-blue-light)'
          : 'var(--mantine-color-default)',
      }}
    >
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {content.text}
      </Text>

      {/* RENDER WIDGETS */}
      {content.type === 'chart' && content.data && (
        <ChartWidget
          data={content.data}
          xKey={content.extras?.xKey || 'ts'}
          yKey={content.extras?.yKey || 'value'}
          label={content.extras?.yLabel}
        />
      )}

      {/* RENDER TABLE FOR SQL/TABLE/CHART TYPES */}
      {['sql', 'table', 'chart'].includes(content.type) && content.data && (
        <TableWidget data={content.data} />
      )}
    </Paper>
  );
}

