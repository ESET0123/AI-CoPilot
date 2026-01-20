import { Textarea, Group, ActionIcon, Paper, Tooltip, Box, Text, Loader } from '@mantine/core';
import {
  TbPlayerStopFilled, TbMicrophone,
  // TbWorld, TbBulb, 
  TbPaperclip, TbX, TbCheck, TbArrowUpRight, TbSearch,
} from 'react-icons/tb';
// import { MdSavedSearch } from "react-icons/md";
import { BsSoundwave } from 'react-icons/bs';
// import { GoLightBulb } from "react-icons/go";
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
import { ocrApi } from '../../services/api';

interface ChatInputProps {
  isHeroMode?: boolean;
}

const activeRequests = new Map<string, { abort: () => void }>();

export default function ChatInput({ isHeroMode = false }: ChatInputProps) {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

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
        const newValue = baseValue ? `${baseValue.trim()} ${text}` : text;
        setValue(newValue);
        inputRef.current?.focus();
      },
      (interimText) => {
        const newValue = baseValue ? `${baseValue.trim()} ${interimText}` : interimText;
        setValue(newValue);
      }
    );

  const DEFAULT_SUGGESTIONS = [
    "What was my recent bill?",
    "How do I pay my invoice?",
    "Check my power usage trends",
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused && value.trim().length === 0 && !isCurrentSending && !isRecording) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [isFocused, value, isCurrentSending, isRecording]);

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    handleSend(suggestion);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setBaseValue(value);
      startRecording();
    }
  };


  const handleStop = () => {
    if (!isCurrentSending) return;

    if (activeConversationId) {
      const globalPromise = activeRequests.get(activeConversationId);
      if (globalPromise) {
        globalPromise.abort();
        activeRequests.delete(activeConversationId);
      }
    }

    if (pendingThunkRef.current) {
      pendingThunkRef.current.abort();
      pendingThunkRef.current = null;
    }

    if (activeConversationId) {
      dispatch(stopMessage(activeConversationId));
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    if (isCurrentSending) {
      handleStop();
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    const messageContent = overrideMessage !== undefined ? overrideMessage.trim() : value.trim();
    if (!messageContent && !ocrText) return;

    const finalMessage = ocrText
      ? `${messageContent}${messageContent ? '\n\n' : ''}[Extracted from ${selectedFile?.name}]:\n${ocrText}`
      : messageContent;

    setValue('');
    setOcrText('');
    setSelectedFile(null);

    let targetConvoId = activeConversationId;

    try {
      if (draftMessageMode) {
        const convo = await dispatch(
          createConversation(messageContent.slice(0, MAX_CONVERSATION_TITLE_LENGTH) || 'New Chat')
        ).unwrap();
        dispatch(setActiveConversation(convo.id));
        targetConvoId = convo.id;
      }

      if (targetConvoId) {
        const optimisticId = crypto.randomUUID();
        dispatch(addUserMessage({
          id: optimisticId, // Pass the ID here
          text: messageContent,
          attachment: selectedFile ? { name: selectedFile.name } : undefined
        }));
        dispatch(addAssistantLoading());

        const promise = dispatch(
          sendMessage({
            conversationId: targetConvoId,
            message: finalMessage,
            optimisticId, // Pass the same ID here
          })
        );

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessingOcr(true);
      setOcrText('');

      try {
        const response = await ocrApi.extractText(file);
        setOcrText(response.data.text);
      } catch (error) {
        console.error('Failed to process file:', error);
      } finally {
        setIsProcessingOcr(false);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setOcrText('');
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
        minHeight: 'auto',
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
          accept="image/*,application/pdf,text/plain"
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
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text size="sm" fw={600} style={{ color: '#1a1a1a' }}>{selectedFile.name}</Text>
              {isProcessingOcr && <Loader size="xs" color="lime" />}
              {!isProcessingOcr && ocrText && <TbCheck size={14} color="#65a30d" />}
            </Box>
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
            minRows={isHeroMode ? 2 : 1}
            maxRows={8}
            variant="unstyled"
            disabled={isCurrentSending}
            style={{ flex: 1, marginTop: 0 }}
            styles={{
              input: {
                padding: '8px 4px',
                fontSize: '16px',
                lineHeight: 1,
                color: '#000000',
                backgroundColor: 'transparent',
                '&:disabled': {
                  backgroundColor: 'transparent',
                  color: '#000000',
                  opacity: 1,
                  cursor: 'not-allowed',
                },
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay slightly to allow click event on suggestions to fire first
              setTimeout(() => setIsFocused(false), 200);
            }}
          />
        </Box>



        <Group justify="end" align="center" mt="xs">
          <Group gap="xs">
            {!isRecording && (
              <>
                <Tooltip label="Attach file">
                  <ActionIcon
                    variant="subtle"
                    style={{ color: '#000000' }}
                    radius="xl"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingOcr || isCurrentSending}
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
                <TbPlayerStopFilled stroke='1.5' size={20} />
              </ActionIcon>
            )}

            <Tooltip label={isCurrentSending ? 'Stop generating' : (isRecording ? 'Finish recording' : 'Send message')}>
              <ActionIcon
                onClick={() => handleSend()}
                color={isCurrentSending ? 'red' : (isRecording ? 'green' : '#000000')}
                variant="filled"
                radius="md"
                size="xl"
                disabled={(!isCurrentSending && !isRecording && !value.trim() && !ocrText) || isProcessingOcr}
                style={{
                  transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: !isCurrentSending && (value.trim() || isRecording || ocrText)
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none',
                }}
              >
                {isCurrentSending ? (
                  <TbPlayerStopFilled size={20} />
                ) : isRecording ? (
                  <TbCheck size={24} />
                ) : (
                  <BsSoundwave color='white' size={20} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {showSuggestions && (
          <Box
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              paddingTop: '12px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
              <Box
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blurring the input before the click fires
                  handleSuggestionClick(suggestion);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(132, 204, 22, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Group gap="sm">
                  <TbSearch />
                  <Text size="sm" style={{ color: '#495057' }}>{suggestion}</Text>
                </Group>
                <TbArrowUpRight />
              </Box>
            ))}
          </Box>
        )}
      </form >
    </Paper >
  );
}