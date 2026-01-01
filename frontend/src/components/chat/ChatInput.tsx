import { Textarea, Group, ActionIcon, Paper, Tooltip } from '@mantine/core';
import { IconSend, IconPlayerStop, IconMicrophone } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { designTokens } from '../../styles/designTokens';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  sendMessage,
  addUserMessage,
  createConversation,
  addAssistantLoading,
  setActiveConversation,
  stopMessage,
} from '../../features/chat/chatSlice';

export default function ChatInput() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

    try {
      let targetConvoId = activeConversationId;

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
        pendingThunkRef.current = promise;
        await promise.unwrap();
      }
    } catch (err: unknown) {
      const error = err as any;
      if (error?.name !== 'AbortError' && error?.message !== 'Aborted' && error?.message !== 'Request cancelled') {
        console.error('Failed to send message:', err);
      }
    } finally {
      pendingThunkRef.current = null;
    }
  };

  return (
    <Paper
      shadow="md"
      p="sm"
      radius="xl"
      style={{
        maxWidth: 768,
        margin: '0 auto',
        width: '100%',
        transition: designTokens.transitions.normal,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(79, 172, 254, 0.1)',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder={isCurrentSending ? 'Waiting for response...' : 'Message...'}
            autosize
            minRows={1}
            maxRows={5}
            radius="xl"
            disabled={isCurrentSending}
            style={{ flex: 1 }}
            styles={{
              input: {
                transition: designTokens.transitions.fast,
                '&:focus': {
                  boxShadow: '0 0 0 2px rgba(79, 172, 254, 0.2)',
                },
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

          <Group gap="xs">
            <Tooltip label={isRecording ? 'Stop recording' : 'Record voice'}>
              <ActionIcon
                onClick={isRecording ? stopRecording : startRecording}
                color={isRecording ? 'red' : 'gray'}
                variant={isRecording ? 'filled' : 'subtle'}
                radius="xl"
                size="lg"
                disabled={isCurrentSending || isTranscribing}
                loading={isTranscribing}
                style={{
                  transition: designTokens.transitions.normal,
                  transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <IconMicrophone size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={isCurrentSending ? 'Stop generating' : 'Send message'}>
              <ActionIcon
                type="submit"
                color={isCurrentSending ? 'red' : 'blue'}
                variant="filled"
                radius="xl"
                size="lg"
                disabled={!isCurrentSending && !value.trim()}
                style={{
                  transition: designTokens.transitions.normal,
                  boxShadow: !isCurrentSending && value.trim()
                    ? '0 4px 12px rgba(79, 172, 254, 0.4)'
                    : 'none',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentSending && value.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isCurrentSending ? (
                  <IconPlayerStop size={18} />
                ) : (
                  <IconSend size={18} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </form>
    </Paper>
  );
}