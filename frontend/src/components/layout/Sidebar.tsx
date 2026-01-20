import {
  Stack,
  Button,
  Text,
  Group,
  ActionIcon,
  Collapse,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  TbChevronRight,
  TbMenu2,
  TbSearch,
  TbTrash,
  TbEdit,
  TbChevronDown,
} from 'react-icons/tb';
import { useState } from 'react';

import UserMenu from './UserMenu';
import { useLayout } from './LayoutContext';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setActiveConversation,
  fetchMessages,
  deleteConversation,
  startNewChat,
} from '../../features/chat/chatSlice';
import type { Conversation } from '../../features/chat/chatSlice';

type Props = {
  collapsed: boolean;
  onToggle: (v: boolean) => void;
};

export default function Sidebar({ collapsed, onToggle }: Props) {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId } = useAppSelector(
    (s) => s.chat
  );

  const [open, setOpen] = useState(true);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toggleMobile } = useLayout();

  return (
    <Stack h="100%" p="sm" gap="sm" style={{ backgroundColor: '#ffffff' }}>
      {/* ================= TOP ================= */}
      <Group justify={collapsed ? 'center' : 'space-between'} px="xs" >
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="md"
          size="lg"
          onClick={() => {
            if (isMobile) {
              toggleMobile();
            } else {
              onToggle(!collapsed);
            }
          }}
        >
          <TbMenu2 size={22} strokeWidth={1.5} color="#334155" />
        </ActionIcon>

        {!collapsed && (
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="md"
            size="lg"
          >
            <TbSearch size={22} strokeWidth={1.5} color="#334155" />
          </ActionIcon>
        )}
      </Group>

      {/* ================= MIDDLE ================= */}
      <Stack align={collapsed ? 'center' : 'stretch'} style={{ flex: 1, overflow: 'hidden' }}>
        {collapsed && (
          <ActionIcon
            style={{ backgroundColor: '#ffffff', color: '#000000', justifyContent: 'center' }}
            type="button"
            onClick={() => {
              dispatch(startNewChat());
              if (isMobile) toggleMobile();
            }}
          >
            <TbEdit size={18} />
          </ActionIcon>
        )}

        {!collapsed && (
          <>
            <Button
              type="button"
              leftSection={<TbEdit size={20} style={{ opacity: 0.8 }} />}
              variant="subtle"
              color="gray"
              fullWidth
              justify="flex-start"
              onClick={() => {
                dispatch(startNewChat());
                if (isMobile) toggleMobile();
              }}
              styles={{
                root: {
                  height: 24,
                  padding: '0 16px',
                  // marginBottom: 8,
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1e293b',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  },
                },
                section: {
                  marginRight: 16
                }
              }}
            >
              New Chat
            </Button>

            <Divider />

            <Group
              justify="space-between"
              align="center"
              px="xs"
              mt="xs"
              mb={1}
              onClick={() => setOpen((o) => !o)}
              style={{ cursor: 'pointer' }}
            >
              <Text size="xs" fw={700} style={{ letterSpacing: '0.05em', color: '#94a3b8' }}>
                CHATS
              </Text>

              {open ? (
                <TbChevronDown size={14} color="#000000" />
              ) : (
                <TbChevronRight size={14} color="#000000" />
              )}
            </Group>
          </>
        )}

        {/* ================= CHAT LIST ================= */}
        {!collapsed && (
          <ScrollArea style={{ flex: 1 }} scrollbarSize={0}>
            <Collapse in={open}>
              <Stack gap={4}>
                {conversations
                  .filter(
                    (c: Conversation) => c.title && c.title.trim().length > 0
                  )
                  .map((c: Conversation) => {
                    const isActive = c.id === activeConversationId;

                    return (
                      <Group
                        key={c.id}
                        wrap="nowrap"
                        align="center"
                        px="xs"
                        py={6}
                        style={{
                          borderRadius: 22,
                          background: isActive
                            ? '#f7fee7'
                            : 'transparent',
                          border: 'none',
                          transition: 'background-color 150ms ease',
                          cursor: 'pointer',
                        }}
                        className="chat-item-group"
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                          }
                          const delBtn = e.currentTarget.querySelector('.delete-chat-btn') as HTMLElement;
                          if (delBtn) delBtn.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                          const delBtn = e.currentTarget.querySelector('.delete-chat-btn') as HTMLElement;
                          if (delBtn) delBtn.style.opacity = '0';
                        }}
                      >
                        {/* ================= TITLE ================= */}
                        <Button
                          type="button"
                          variant="subtle"
                          radius="md"
                          fullWidth
                          justify="flex-start"
                          onClick={() => {
                            dispatch(setActiveConversation(c.id));
                            dispatch(fetchMessages(c.id));
                            if (isMobile) toggleMobile();
                          }}
                          styles={{
                            root: {
                              flexGrow: 1,
                              background: 'transparent',
                              color: '#1e293b',
                              fontWeight: isActive ? 700 : 500,
                              fontSize: '14px',
                            },
                          }}
                        >
                          {c.title}
                        </Button>

                        {/* ================= DELETE BUTTON ================= */}
                        <ActionIcon
                          className="delete-chat-btn"
                          type="button"
                          variant="subtle"
                          color="gray"
                          radius="xl"
                          size="sm"
                          style={{
                            opacity: 0,
                            transition: 'opacity 150ms ease',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(deleteConversation(c.id));
                          }}
                        >
                          <TbTrash size={16} />
                        </ActionIcon>
                      </Group>
                    );
                  })}
              </Stack>
            </Collapse>
          </ScrollArea>
        )}
      </Stack>

      {/* ================= BOTTOM ================= */}
      {!collapsed && (
        <Divider />
      )}
      <UserMenu collapsed={collapsed} />
    </Stack>
  );
}
