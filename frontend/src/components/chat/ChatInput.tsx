import { Textarea, Group, ActionIcon, Paper } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  sendMessage,
  addUserMessage,
  renameConversation,
} from '../../features/chat/chatSlice';

export default function ChatInput() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');

  const { activeConversationId, conversations } = useAppSelector(
    s => s.chat
  );

  const activeConversation = conversations.find(
    c => c.id === activeConversationId
  );

  const handleSend = () => {
    const message = value.trim();
    if (!message || !activeConversationId) return;

    dispatch(addUserMessage(message));

    if (
      activeConversation?.title === 'New Chat' &&
      activeConversation.messages.length === 0
    ) {
      dispatch(
        renameConversation({
          conversationId: activeConversationId,
          title: message.slice(0, 40),
        })
      );
    }

    dispatch(sendMessage({ conversationId: activeConversationId, message }));
    setValue('');
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
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="Message..."
            autosize
            minRows={1}
            maxRows={5}
            radius="xl"
            style={{ flex: 1 }}
            autoFocus
            styles={{
              input: {
                paddingLeft: 14,
                paddingRight: 14,
              },
            }}
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
