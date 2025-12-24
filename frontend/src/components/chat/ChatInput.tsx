import { Textarea, Group, ActionIcon, Paper, Tooltip } from '@mantine/core';
import { IconSend, IconPlayerStop } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRequest = useRef<any>(null);

  const {
    activeConversationId,
    draftMessageMode,
    sendingConversationIds,
  } = useAppSelector(s => s.chat);

  const isCurrentSending = activeConversationId ? sendingConversationIds.includes(activeConversationId) : false;

  useEffect(() => {
    if (draftMessageMode && !isCurrentSending) {
      inputRef.current?.focus();
    }
  }, [draftMessageMode, isCurrentSending]);

  const handleStop = () => {
    if (activeConversationId) {
      dispatch(stopMessage(activeConversationId));
    }
    if (currentRequest.current) {
      currentRequest.current.abort();
      currentRequest.current = null;
    }
  };

  const handleSend = async () => {
    if (isCurrentSending) {
      handleStop();
      return;
    }

    const message = value.trim();
    if (!message) return;

    setValue('');

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

      currentRequest.current = dispatch(
        sendMessage({
          conversationId: targetConvoId,
          message,
        })
      );

      try {
        await currentRequest.current.unwrap();
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'Aborted') {
          console.error('Failed to send message:', err);
        }
      } finally {
        currentRequest.current = null;
      }
    }
  };


  return (
    <Paper withBorder radius="xl" p="xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Group wrap="nowrap">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder={isCurrentSending ? "Waiting for response..." : "Message..."}
            autosize
            minRows={1}
            maxRows={5}
            radius="xl"
            disabled={isCurrentSending}
            style={{ flex: 1 }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Tooltip label={isCurrentSending ? "Stop generating" : "Send message"}>
            <ActionIcon
              type="submit"
              color={isCurrentSending ? "red" : "blue"}
              radius="xl"
              size="lg"
              disabled={!isCurrentSending && !value.trim()}
              loading={false} // We show the stop icon instead of a generic loader
            >
              {isCurrentSending ? <IconPlayerStop size={18} /> : <IconSend size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </form>
    </Paper>
  );
}
