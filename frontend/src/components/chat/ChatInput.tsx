import { Textarea, Group, ActionIcon, Paper } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  sendMessage,
  addUserMessage,
  createConversation,
  addAssistantLoading,
} from '../../features/chat/chatSlice';

export default function ChatInput() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  
  const {
    activeConversationId,
    draftMessageMode,
  } = useAppSelector(s => s.chat);
  
  useEffect(() => {
    if (draftMessageMode) {
      inputRef.current?.focus();
    }
  }, [draftMessageMode]);

  const handleSend = async () => {
    const message = value.trim();
    if (!message) return;

    // Draft chat → create conversation now
    if (draftMessageMode) {
      const convo = await dispatch(
        createConversation(message.slice(0, 40))
      ).unwrap();

      dispatch(addUserMessage(message));

      dispatch(addAssistantLoading());

      dispatch(
        sendMessage({
          conversationId: convo.id,
          message,
        })
      );

      setValue('');
      return;
    }

    // Existing conversation
    if (activeConversationId) {
      dispatch(addUserMessage(message));
      dispatch(
        sendMessage({
          conversationId: activeConversationId,
          message,
        })
      );
      setValue('');
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
            placeholder="Message..."
            autosize
            minRows={1}
            maxRows={5}
            radius="xl"
            style={{ flex: 1 }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <ActionIcon
            type="submit"
            color="blue"
            radius="xl"
            size="lg"
            disabled={!value.trim()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </form>
    </Paper>
  );
}
