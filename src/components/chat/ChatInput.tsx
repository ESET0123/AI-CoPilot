import {
  Textarea,
  Group,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
  sendMessage,
  addUserMessage,
} from '../../features/chat/chatSlice';

export default function ChatInput() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');

  const handleSend = () => {
    const message = value.trim();
    if (!message) return;

    // 🔴 ADD USER MESSAGE IMMEDIATELY
    dispatch(addUserMessage(message));

    // 🔵 THEN call API
    dispatch(sendMessage(message));

    setValue('');
  };

  return (
    <Paper
      withBorder
      radius="xl"
      p="xs"
      shadow="sm"
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'var(--mantine-color-body)',
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
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="Message Chat Assistant..."
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
