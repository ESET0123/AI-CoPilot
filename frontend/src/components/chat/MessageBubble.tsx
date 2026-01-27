import {
  Paper, Text, Loader, Box, Alert, Group, ActionIcon, Stack, Title, Tooltip
} from '@mantine/core';
import { TbAlertCircle, TbCopy, TbRefresh, TbCornerDownRight, TbFileDescription, TbCheck, TbVolume, TbVolume2 } from 'react-icons/tb';
import { useMemo, useState } from 'react';
import { useClipboard } from '@mantine/hooks';
import { ttsApi } from '../../services/api';

import { parseMessageContent } from '../../utils/contentParser';

type Props = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
  attachment?: { name: string };
};

const FileCard = ({ name }: { name: string }) => (
  <Paper
    withBorder
    p="sm"
    radius="md"
    mb="sm"
    style={{
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '300px',
      cursor: 'default',
      transition: 'transform 0.2s ease',
    }}
  >
    <Box
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: '#ecfccb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#65a30d',
      }}
    >
      <TbFileDescription size={24} />
    </Box>
    <Box style={{ flex: 1, overflow: 'hidden' }}>
      <Text size="sm" fw={600} truncate c="#1e293b">
        {name}
      </Text>
      <Text size="xs" c="dimmed">
        File Attachment
      </Text>
    </Box>
  </Paper>
);

export default function MessageBubble({ role, text, loading, attachment }: Props) {
  const isUser = role === 'user';

  // Parse structured data if assistant
  const content = useMemo(() => {
    return parseMessageContent(text, isUser);
  }, [text, isUser]);

  const clipboard = useClipboard({ timeout: 2000 });

  const getCopyableText = () => {
    const attachmentRegex = /\[(?:Extracted from|Uploaded File|Attached):?\s*(.*?)\]:?/g;
    return content.text.replace(attachmentRegex, '').trim();
  };

  const [playing, setPlaying] = useState(false);

  const handleSpeak = async () => {
    if (playing) return;

    try {
      setPlaying(true);
      const language = content.extras?.language || 'en';
      const response = await ttsApi.synthesizeText(content.text, language);

      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Playback failed:', error);
      setPlaying(false);
    }
  };

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
            width: 20,
            height: 20,
            borderRadius: '50%',
            marginTop: 4,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #4ade80 0%, #ece019 100%)'
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
            icon={<TbAlertCircle size={16} />}
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
            {/* Display explicit attachment if present */}
            {attachment && (
              <FileCard name={attachment.name} />
            )}

            {/* Parse and display embedded attachments from text */}
            {(() => {
              const attachmentRegex = /\[(?:Extracted from|Uploaded File|Attached):?\s*(.*?)\]:?/g;
              const match = attachmentRegex.exec(content.text);
              if (match) {
                const fileName = match[1];
                const cleanText = content.text.replace(attachmentRegex, '').trim();
                return (
                  <>
                    {!attachment && <FileCard name={fileName} />}
                    {cleanText && (
                      <Text
                        size="lg"
                        style={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          fontWeight: 500,
                        }}
                      >
                        {cleanText}
                      </Text>
                    )}
                  </>
                );
              }

              return (
                <Text
                  size="lg"
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {content.text}
                </Text>
              );
            })()}

            {!isUser && (
              <Box mt="md">
                {/* Action Icons: Download, Copy, Refresh */}
                <Group gap="sm" mb="md">
                  {/* <ActionIcon variant="subtle" color="gray" size="sm">
                    <TbDownload size={16} />
                  </ActionIcon> */}
                  <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy to clipboard'}>
                    <ActionIcon
                      variant="subtle"
                      color={clipboard.copied ? 'green' : 'gray'}
                      size="sm"
                      onClick={() => clipboard.copy(getCopyableText())}
                    >
                      {clipboard.copied ? <TbCheck size={16} /> : <TbCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <TbRefresh size={16} />
                  </ActionIcon>
                  <Tooltip label={playing ? 'Reading aloud...' : 'Read message'}>
                    <ActionIcon
                      variant="subtle"
                      color={playing ? 'green' : 'gray'}
                      size="sm"
                      onClick={handleSpeak}
                      loading={playing}
                    >
                      {playing ? <TbVolume2 size={16} /> : <TbVolume size={16} />}
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {/* Related Section */}
                {content.extras?.related && content.extras.related.length > 0 && (
                  <Box>
                    <Text fw={600} size="md" mb="xs" c="#334155">Related</Text>
                    <Stack gap={4}>
                      {content.extras.related.map((link: string, i: number) => (
                        <Group key={i} gap="xs" style={{ cursor: 'pointer' }}>
                          <TbCornerDownRight size={14} color="#84cc16" />
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
