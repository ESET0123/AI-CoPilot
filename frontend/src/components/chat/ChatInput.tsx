/* eslint-disable @typescript-eslint/no-explicit-any */
import { Textarea, Group, ActionIcon, Paper, Tooltip, Box, Text } from '@mantine/core';
import { TbPlayerStopFilled , TbMicrophone, TbWorld, TbPaperclip, TbX, TbCheck } from 'react-icons/tb';
import { MdSavedSearch } from "react-icons/md";
import { BsSoundwave } from 'react-icons/bs';
import { GoLightBulb } from "react-icons/go";
import { useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { MAX_CONVERSATION_TITLE_LENGTH } from '../../constants';

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

  const [baseValue, setBaseValue] = useState('');

  const { isRecording, isLoading: isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder(
      (text) => {
        // Final result - append to base and focus
        const newValue = baseValue ? `${baseValue.trim()} ${text}` : text;
        setValue(newValue);
        inputRef.current?.focus();
      },
      (interimText) => {
        // Live update while speaking - append to base
        const newValue = baseValue ? `${baseValue.trim()} ${interimText}` : interimText;
        setValue(newValue);
      }
    );

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setBaseValue(value);
      startRecording();
    }
  };

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

    // If recording, stop recording before sending
    if (isRecording) {
      stopRecording();
    }

    const message = value.trim();
    if (!message) return;

    setValue('');

    let targetConvoId = activeConversationId;

    try {
      if (draftMessageMode) {
        const convo = await dispatch(
          createConversation(message.slice(0, MAX_CONVERSATION_TITLE_LENGTH))
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
            <TbPaperclip size={16} color="#65a30d" />
            <Text size="sm" fw={600} style={{ color: '#1a1a1a' }}>{selectedFile.name}</Text>
            <ActionIcon size="xs" variant="subtle" color="gray" onClick={removeFile}>
              <TbX size={14} />
            </ActionIcon>
          </Box>
        )}

        <Box style={{ flex: 1, display: 'flex' }}>
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder={
              isRecording
                ? "LISTENING"
                : isHeroMode
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
              <MdSavedSearch size={18} />
            </ActionIcon>

            {/* Reasoning/Idea Mode */}
            <ActionIcon
              variant="transparent"
              size="lg"
              radius="xl"
              style={{
                color: '#000000', 
                border: '1px solid transparent',
              }}
            >
              <GoLightBulb size={20} />
            </ActionIcon>
          </Box>

          <Group gap="xs">
            {!isRecording && (
              <>
                <Tooltip label="Search web">
                  <ActionIcon variant="subtle" style={{ color: '#000000' }} radius="xl" size="lg">
                    <TbWorld size={18} />
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
                    <TbPaperclip size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={isRecording ? 'Stop recording' : 'Record voice'}>
                  <ActionIcon
                    onClick={handleToggleRecording}
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
                    <TbMicrophone size={18} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}

            {isRecording && (
              <ActionIcon
                onClick={handleToggleRecording}
                variant="filled"
                color="gray.2"
                radius="md"
                size="xl"
                style={{
                  backgroundColor: '#f1f3f5',
                  color: '#000000'
                }}
              >
                <TbPlayerStopFilled  stroke='1.5' size={20} />
              </ActionIcon>
            )}

            <Tooltip label={isCurrentSending ? 'Stop generating' : (isRecording ? 'Finish recording' : 'Send message')}>
              <ActionIcon
                type="submit"
                color={isCurrentSending ? 'red' : (isRecording ? 'green' : '#000000')}
                variant="filled"
                radius="md"
                size="xl"
                disabled={!isCurrentSending && !isRecording && !value.trim()}
                style={{
                  transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: !isCurrentSending && (value.trim() || isRecording)
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none',
                }}
              >
                {isCurrentSending ? (
                  <TbPlayerStopFilled  size={20} />
                ) : isRecording ? (
                  <TbCheck size={24} />
                ) : (
                  // Use WaveSine for that specific "AI" feel in the design, or standard Send
                  <BsSoundwave color='white' size={20} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </form>
    </Paper>
  );
}