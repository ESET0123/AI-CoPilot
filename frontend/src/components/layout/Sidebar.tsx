import {
  Stack,
  Button,
  Text,
  Group,
  ActionIcon,
  Collapse,
  Divider,
  Menu,
  ScrollArea,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconChevronDown,
  // IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconSearch,
  IconDots,
  // IconPlus,
  // IconMessage,
  IconPencil,
  IconEdit,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
// import { IconLayoutSidebarRightCollapse, IconLayoutSidebarRightExpand } from '@tabler/icons-react';
import { useState } from 'react';

import UserMenu from './UserMenu';
import { useLayout } from './AppShellLayout';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setActiveConversation,
  fetchMessages,
  renameConversation,
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

  /* ================= INLINE RENAME STATE ================= */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const saveRename = (id: string) => {
    const title = draftTitle.trim();
    if (title) {
      dispatch(renameConversation({ conversationId: id, title }));
    }
    setEditingId(null);
    setDraftTitle('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toggleMobile } = useLayout();

  return (
    <Stack h="100%" p="sm" gap="sm" style={{ backgroundColor: '#ffffff' }}>
      {/* ================= TOP ================= */}
      <Group justify={collapsed ? 'center' : 'space-between'}>

        <ActionIcon
          variant="subtle"
          radius="xl"
          type="button"
          onClick={() => {
            if (isMobile) {
              toggleMobile();
            } else {
              onToggle(!collapsed);
            }
          }}
        >
          <IconMenu2 stroke={1.5} color="#000000" />
        </ActionIcon>
        {!collapsed && (
          <IconSearch color="#000000" size={20} />
        )}
      </Group>

      {/* ================= MIDDLE ================= */}
      <Stack style={{ flex: 1, overflow: 'hidden' }}>
        {collapsed && (
          <ActionIcon
            style={{ backgroundColor: '#ffffff', color: '#000000', justifyContent: 'center' }}
            type="button"
            onClick={() => {
              dispatch(startNewChat());
              if (isMobile) toggleMobile();
            }}
          >
            <IconEdit stroke={1.5} />
          </ActionIcon>
        )}

        {!collapsed && (
          <>
            <Button
              type="button"
              leftSection={<IconEdit size={18} stroke={1.5} />}
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
                  height: 48,
                  padding: '0 12px',
                  marginBottom: 0,
                  fontWeight: 600,
                  fontSize: '15.5px',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                },
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
              mb={4}
              onClick={() => setOpen((o) => !o)}
              style={{ cursor: 'pointer' }}
            >
              <Text size="xs" fw={700} style={{ letterSpacing: '0.08em', color: '#000000' }}>
                CHATS
              </Text>

              {open ? (
                <IconChevronDown size={14} color="#000000" />
              ) : (
                <IconChevronRight size={14} color="#000000" />
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
                    const isEditing = editingId === c.id;

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
                            ? 'linear-gradient(135deg, rgba(163, 230, 53, 0.1) 0%, rgba(132, 204, 22, 0.1) 100%)'
                            : 'transparent',
                          border: isActive ? '1px solid rgba(132, 204, 22, 0.2)' : '1px solid transparent',
                          transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {/* ================= TITLE / INPUT ================= */}
                        {isEditing ? (
                          <Group
                            gap={6}
                            style={{
                              flex: 1,
                              alignItems: 'center',
                            }}
                          >
                            <TextInput
                              value={draftTitle}
                              autoFocus
                              size="xs"
                              variant="unstyled"
                              onChange={(e) =>
                                setDraftTitle(e.currentTarget.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter')
                                  saveRename(c.id);
                                if (e.key === 'Escape')
                                  cancelRename();
                              }}
                              styles={{
                                input: {
                                  paddingLeft: 12,
                                  paddingRight: 4,
                                },
                              }}
                              style={{ flex: 1 }}
                            />

                            <ActionIcon
                              size="sm"
                              radius="xl"
                              variant="subtle"
                              type="button"
                              onClick={() => saveRename(c.id)}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                          </Group>
                        ) : (
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
                                color: '#000000',
                                fontWeight: isActive ? 600 : 400,
                              },
                            }}
                          >
                            {c.title}
                          </Button>
                        )}

                        {/* ================= MENU ================= */}
                        {!isEditing && (
                          <Menu position="right" withinPortal>
                            <Menu.Target>
                              <ActionIcon
                                type="button"
                                variant="subtle"
                                radius="xl"
                                size="sm"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                <IconDots size={14} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={
                                  <IconPencil size={14} />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(c.id);
                                  setDraftTitle(c.title);
                                }}
                              >
                                Rename
                              </Menu.Item>

                              <Menu.Item
                                color="red"
                                leftSection={
                                  <IconTrash size={14} />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(
                                    deleteConversation(c.id)
                                  );
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
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
