import {
  Paper, Text, Loader, Box, Alert, Group, ActionIcon, Stack, Title
} from '@mantine/core';
import { IconAlertCircle, IconDownload, IconCopy, IconRefresh, IconCornerDownRight } from '@tabler/icons-react';
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
        {!isUser && content.extras?.title && (
          <Title order={4} mb="xs" c="#1e293b" style={{ fontWeight: 600 }}>
            {content.extras.title}
          </Title>
        )}

        {isError && !isUser ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            styles={{ root: { padding: '8px 12px' } }}
          >
            <Text size="md" style={{ whiteSpace: 'pre-wrap' }}>
              {content.text}
            </Text>
          </Alert>
        ) : (
          <Box>
            <Text
              size="lg"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontWeight: 500, // Slightly bolder for better visibility
              }}
            >
              {content.text}
            </Text>

            {!isUser && (
              <Box mt="md">
                {/* Action Icons: Download, Copy, Refresh */}
                <Group gap="sm" mb="md">
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDownload size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconCopy size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Group>

                {/* Related Section */}
                {content.extras?.related && content.extras.related.length > 0 && (
                  <Box>
                    <Text fw={600} size="md" mb="xs" c="#334155">Related</Text>
                    <Stack gap={4}>
                      {content.extras.related.map((link: string, i: number) => (
                        <Group key={i} gap="xs" style={{ cursor: 'pointer' }}>
                          <IconCornerDownRight size={14} color="#84cc16" />
                          <Text size="md" c="#65a30d" style={{ '&:hover': { textDecoration: 'underline' } }}>
                            {link}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
