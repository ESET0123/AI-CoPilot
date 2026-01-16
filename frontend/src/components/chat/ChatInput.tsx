/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Textarea, Group, ActionIcon, Paper, Tooltip, Box, Text
  // ThemeIcon
} from '@mantine/core';
import { IconPlayerStop, IconMicrophone, IconSearch, IconBulb, IconWorld, IconPaperclip, IconWaveSine, IconX } from '@tabler/icons-react'; // Added IconX
import { useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  sendMessage,
  addUserMessage,
  createConversation,
  addAssistantLoading,
  setActiveConversation,
  stopMessage,
} from '../../features/chat/chatSlice';

interface ChatInputProps {
  isHeroMode?: boolean;
}

// Keep track of active requests globally to handle component unmounting/remounting
// (e.g. when switching from DashboardHero to ChatWindow)
const activeRequests = new Map<string, { abort: () => void }>();

export default function ChatInput({ isHeroMode = false }: ChatInputProps) {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pendingThunkRef = useRef<any>(null);

  const { activeConversationId, draftMessageMode, sendingConversationIds } =
    useAppSelector((s) => s.chat);

  const isCurrentSending = activeConversationId
    ? sendingConversationIds.includes(activeConversationId)
    : false;

  const { isRecording, isLoading: isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder((text) => {
      setValue((prev) => (prev ? prev + ' ' + text : text));
      inputRef.current?.focus();
    });

  useEffect(() => {
    if (draftMessageMode && !isCurrentSending) {
      inputRef.current?.focus();
    }
  }, [draftMessageMode, isCurrentSending]);

  const handleStop = () => {
    if (!isCurrentSending) return;

    // Try to find the active request in the global map first (handles remounting)
    if (activeConversationId) {
      const globalPromise = activeRequests.get(activeConversationId);
      if (globalPromise) {
        globalPromise.abort();
        activeRequests.delete(activeConversationId);
      }
    }

    // Fallback to local ref if needed
    if (pendingThunkRef.current) {
      pendingThunkRef.current.abort();
      pendingThunkRef.current = null;
    }

    if (activeConversationId) {
      dispatch(stopMessage(activeConversationId));
    }
  };

  const handleSend = async () => {
    // If already sending, stop instead
    if (isCurrentSending) {
      handleStop();
      return;
    }

    const message = value.trim();
    if (!message) return;

    setValue('');

    let targetConvoId = activeConversationId;

    try {
      if (draftMessageMode) {
        const convo = await dispatch(
          createConversation(message.slice(0, 40))
        ).unwrap();
        dispatch(setActiveConversation(convo.id));
        targetConvoId = convo.id;
      }

      if (targetConvoId) {
        dispatch(addUserMessage(message));
        dispatch(addAssistantLoading());

        const promise = dispatch(
          sendMessage({
            conversationId: targetConvoId,
            message,
          })
        );

        // Store promise globally and locally
        pendingThunkRef.current = promise;
        activeRequests.set(targetConvoId, promise);

        await promise.unwrap();
      }
    } catch (err: unknown) {
      const error = err as any;
      if (error?.name !== 'AbortError' && error?.message !== 'Aborted' && error?.message !== 'Request cancelled') {
        console.error('Failed to send message:', err);
      }
    } finally {
      pendingThunkRef.current = null;
      if (targetConvoId) {
        activeRequests.delete(targetConvoId);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper
      shadow={isHeroMode ? 'sm' : 'xs'}
      p="md"
      radius="lg"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'relative',
        transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: isHeroMode ? 140 : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >




      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {selectedFile && (
          <Box px="sm" py="xs" mb="xs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(132, 204, 22, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(132, 204, 22, 0.2)',
            width: 'fit-content'
          }}>
            <IconPaperclip size={16} color="#65a30d" />
            <Text size="sm" fw={600} style={{ color: '#1a1a1a' }}>{selectedFile.name}</Text>
            <ActionIcon size="xs" variant="subtle" color="gray" onClick={removeFile}>
              <IconX size={14} />
            </ActionIcon>
          </Box>
        )}

        <Box style={{ flex: 1, display: 'flex' }}>
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder={
              isHeroMode
                ? "𝗔𝗦𝗞 𝗔𝗡𝗬𝗧𝗛𝗜𝗡𝗚. TYPE @ FOR MENTIONS AND / FOR SHORTCUTS"
                : (isCurrentSending ? "Waiting for response..." : "Message...")
            }
            autosize
            minRows={isHeroMode ? 3 : 1}
            maxRows={8}
            variant="unstyled"
            disabled={isCurrentSending}
            style={{ flex: 1, marginTop: 0 }}
            styles={{
              input: {
                padding: '8px 4px',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#000000', // Force black text
              },
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </Box>

        <Group justify="space-between" align="center" mt="xs">
          {/* Left Actions (Search Toggle, etc) - Only in Hero Mode for now as per design */}

          {/* Search / Reason Toggle */}
          <Box

            style={{
              backgroundColor: '#ecfccb',
              padding: '4px',
              borderRadius: 8,
              display: 'flex',
              gap: '4px',
              border: '1px solid #d9f99d',
            }}
          >
            {/* Search Mode (Active by default for now) */}
            <ActionIcon
              variant="transparent"
              size="lg"
              radius="l"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #84cc16',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                color: '#000000',
              }}
            >
              {/* Use IconZoomExclamation or similar if available, or just IconSearch with a small badge if needed. 
                   Standard IconSearch is fine based on request "style like this" which shows a magnifying glass. 
                   The image has a star inside, IconMessageSearch or IconSparkles inside? 
                   I'll use IconSearch for now as it's cleaner. */}
              <IconSearch size={18} stroke={2.5} />
            </ActionIcon>

            {/* Reasoning/Idea Mode */}
            <ActionIcon
              variant="transparent"
              size="lg"
              radius="xl"
              style={{
                color: '#000000', // Was #1a1a1a, making pure black
                border: '1px solid transparent',
              }}
            >
              <IconBulb size={20} stroke={2} />
            </ActionIcon>
          </Box>

          <Group gap="xs">
            {/* Globe & Attach Icons (Visual only for now) */}
            <Tooltip label="Search web">
              <ActionIcon variant="subtle" style={{ color: '#000000' }} radius="xl" size="lg">
                <IconWorld size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Attach file">
              <ActionIcon
                variant="subtle"
                style={{ color: '#000000' }}
                radius="xl"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconPaperclip size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={isRecording ? 'Stop recording' : 'Record voice'}>
              <ActionIcon
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  color: isRecording ? 'red' : '#000000',
                  transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                }}
                variant={isRecording ? 'filled' : 'subtle'}
                radius="xl"
                size="lg"
                disabled={isCurrentSending || isTranscribing}
                loading={isTranscribing}
              >
                <IconMicrophone size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={isCurrentSending ? 'Stop generating' : 'Send message'}>
              <ActionIcon
                type="submit"
                color={isCurrentSending ? 'red' : '#000000'}
                variant="filled"
                radius="md"
                size="xl"
                disabled={!isCurrentSending && !value.trim()}
                style={{
                  transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: !isCurrentSending && value.trim()
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none',
                }}
              >
                {isCurrentSending ? (
                  <IconPlayerStop size={20} />
                ) : (
                  // Use WaveSine for that specific "AI" feel in the design, or standard Send
                  <IconWaveSine color='white' size={20} />)}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </form>
    </Paper>
  );
}