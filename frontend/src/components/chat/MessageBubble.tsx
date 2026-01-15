import {
  Paper, Text, Loader, Box, Alert,
  // useMantineColorScheme 
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';

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
    return parseMessageContent(text, isUser);
  }, [text, isUser]);


  // const { colorScheme } = useMantineColorScheme();
  // const isDark = colorScheme === 'dark';

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
      p="md"
      radius="lg"
      withBorder={!isUser}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '85%' : '100%',
        background: isUser
          ? '#ffffff'
          : isError
            ? 'var(--mantine-color-red-light)'
            : 'transparent',
        color: isUser ? '#334155' : 'inherit',
        border: isUser ? '1px solid rgba(0,0,0,0.05)' : 'none',
        transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isUser
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          : 'none',
        animation: 'slideUp 0.3s ease-out',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}
    >
      {!isUser && (
        // <Box style={{
        //   width: 16,
        //   height: 16,
        //   borderRadius: '50%',
        //   background: 'radial-gradient(circle, rgb(152, 249, 5) 0%, rgba(132, 204, 22, 0) 70%)',
        //   marginTop: 4,
        //   flexShrink: 0,
        //   boxShadow: '0 0 10px rgba(163, 230, 53, 0.4)' // Subtle glow
        // }} />
        <Box
          style={{
            // position: 'absolute',
            // top: '50%',
            // left: '50%',
            // padding: '14px',
            // transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            marginTop: 4,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #4ade80 0%, #ece019 100%)',
            // boxShadow: '0 20px 25px -5px rgba(74, 222, 128, 0.3), inset 0 -4px 6px -1px rgba(0,0,0,0.05)',

            // zIndex: 0,
          }}
        />
      )}
      <Box style={{ flex: 1 }}>
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
      </Box>
    </Paper>
  );
}
