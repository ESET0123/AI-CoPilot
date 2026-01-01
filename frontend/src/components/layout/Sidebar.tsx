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
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconPlus,
  IconMessage,
  IconPencil,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { designTokens } from '../../styles/designTokens';

import UserMenu from './UserMenu';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setActiveConversation,
  fetchMessages,
  renameConversation,
  deleteConversation,
  startNewChat,
} from '../../features/chat/chatSlice';

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

  return (
    <Stack h="100%" p="sm" gap="sm">
      {/* ================= TOP ================= */}
      <Group justify={collapsed ? 'center' : 'space-between'}>
        {!collapsed && (
          <img src="/ai_icon.png" alt="Logo" style={{ height: 38 }} />
        )}

        <ActionIcon
          variant="subtle"
          radius="xl"
          type="button"
          onClick={() => onToggle(!collapsed)}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </ActionIcon>
      </Group>

      {/* ================= MIDDLE ================= */}
      <Stack style={{ flex: 1, overflow: 'hidden' }}>
        {collapsed && (
          <ActionIcon
            radius="xl"
            size="lg"
            variant="filled"
            type="button"
            onClick={() => dispatch(startNewChat())}
          >
            <IconPlus size={18} />
          </ActionIcon>
        )}

        {!collapsed && (
          <>
            <Button
              type="button"
              leftSection={<IconPlus size={16} />}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 135 }}
              onClick={() => dispatch(startNewChat())}
              styles={{
                root: {
                  transition: designTokens.transitions.normal,
                  boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(79, 172, 254, 0.4)',
                  },
                },
              }}
            >
              New chat
            </Button>

            <Group
              justify="space-between"
              align="center"
              onClick={() => setOpen((o) => !o)}
              style={{ cursor: 'pointer' }}
            >
              <Group gap={6}>
                <IconMessage size={16} />
                <Text size="sm" fw={500}>
                  Your chats
                </Text>
              </Group>

              {open ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
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
                  // ✅ ONLY FIX: hide empty / invalid conversations
                  .filter(
                    (c) => c.title && c.title.trim().length > 0
                  )
                  .map((c) => {
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
                          borderRadius: 12,
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)'
                            : 'transparent',
                          border: isActive ? '1px solid rgba(79, 172, 254, 0.3)' : '1px solid transparent',
                          transition: designTokens.transitions.normal,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)';
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
                            }}
                            styles={{
                              root: {
                                flexGrow: 1,
                                background: 'transparent',
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
      {collapsed && (
        <img src="/ai_icon.png" alt="Logo" style={{ height: 28 }} />
      )}
      <Divider />
      <UserMenu collapsed={collapsed} />
    </Stack>
  );
}
