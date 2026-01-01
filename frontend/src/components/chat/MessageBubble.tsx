import { Paper, Text, Loader, Box, Alert, useMantineColorScheme } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
// import ChartWidget from './ChartWidget';
import { designTokens } from '../../styles/designTokens';

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


  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

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
      shadow="sm"
      p="md"
      radius="lg"
      withBorder
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '85%' : '100%',
        background: isUser
          ? 'linear-gradient(135deg, #4facfe 0%, #0e7c81ff 100%)'
          : isError
            ? 'var(--mantine-color-red-light)'
            : isDark
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-default)',
        color: isUser ? 'white' : 'inherit',
        borderColor: isUser
          ? 'transparent'
          : isDark && !isError
            ? 'var(--mantine-color-dark-4)'
            : undefined,
        transition: designTokens.transitions.normal,
        boxShadow: isUser
          ? '0 4px 12px rgba(79, 172, 254, 0.3)'
          : isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        animation: 'slideUp 0.3s ease-out',
        transform: 'translateZ(0)', // GPU acceleration
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
        <Text
          size="sm"
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
          }}
        >
          {content.text}
        </Text>
      )}

      {/* RENDER WIDGETS */}
      {/* {content.type === 'chart' && content.data && Array.isArray(content.data) && (
        <Box mt="md">
          <ChartWidget
            data={content.data}
            xKey={content.extras?.xKey || 'ts'}
            yKey={content.extras?.yKey || 'value'}
            label={content.extras?.yLabel}
          />
        </Box>
      )} */}



      {/* VIEW DETAILS BUTTON */}
      {['sql', 'table', 'chart'].includes(content.type) && content.data && (
        <Box mt="sm">
          <Text
            size="xs"
            c={isUser ? 'rgba(255, 255, 255, 0.9)' : 'dimmed'}
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: designTokens.transitions.fast,
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            onClick={() => {
              // Dispatch event to open panel with specific content
              window.dispatchEvent(new CustomEvent('OPEN_DATA_PANEL', { detail: content }));
            }}
          >
            View details in Data Panel →
          </Text>
        </Box>
      )}

    </Paper>
  );
}