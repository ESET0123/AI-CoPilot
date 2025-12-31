import { Paper, Text, Loader, Box, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import ChartWidget from './ChartWidget';

import { parseMessageContent } from '../../utils/contentParser';

type Props = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

export default function MessageBubble({ role, text, loading }: Props) {
  const isUser = role === 'user';

  // Parse structured data if assistant
  const content = useMemo(() => {
    const p = parseMessageContent(text, isUser);
    // if (!isUser) console.log('[MessageBubble] Parsed Content:', p);
    return p;
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

  // Handle error messages
  const isError = content.type === 'error' || content.text.toLowerCase().includes('error');

  return (
    <Paper
      shadow="xs"
      p="sm"
      radius="md"
      withBorder
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '85%' : '100%',
        backgroundColor: isUser
          ? 'var(--mantine-color-blue-filled)'
          : isError
            ? 'var(--mantine-color-red-light)'
            : 'var(--mantine-color-default)',
        color: isUser ? 'var(--mantine-color-white)' : 'inherit',
      }}
    >
      {isError && !isUser ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          styles={{ root: { padding: '8px 12px' } }}
        >
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {content.text}
          </Text>
        </Alert>
      ) : (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
          {content.text}
        </Text>
      )}

      {/* RENDER WIDGETS */}
      {content.type === 'chart' && content.data && Array.isArray(content.data) && (
        <ChartWidget
          data={content.data}
          xKey={content.extras?.xKey || 'ts'}
          yKey={content.extras?.yKey || 'value'}
          label={content.extras?.yLabel}
        />
      )}



      {/* VIEW DETAILS BUTTON */}
      {['sql', 'table', 'chart'].includes(content.type) && content.data && (
        <Box mt="xs">
          <Text
            size="xs"
            c="dimmed"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              // Dispatch event to open panel
              window.dispatchEvent(new CustomEvent('OPEN_DATA_PANEL'));
            }}
          >
            View details in Data Panel
          </Text>
        </Box>
      )}

    </Paper>
  );
}