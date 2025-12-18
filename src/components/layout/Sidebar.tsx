import {
  Stack,
  Button,
  Text,
  Group,
  ActionIcon,
  Collapse,
  Divider,
  TextInput,
  Menu,
  ScrollArea,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconPencil,
  IconDots,
  IconPlus,
  IconMessage,
} from '@tabler/icons-react';
import { useState } from 'react';

import UserMenu from './UserMenu';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  newConversation,
  setActiveConversation,
  removeConversation,
  renameConversation,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  return (
    <Stack h="100%" p="sm" gap="sm">
      {/* ================= TOP ================= */}
      <Group justify={collapsed ? 'center' : 'space-between'}>
        {!collapsed && ( <img src="/ai_icon.png" alt="Logo" style={{height: 28, objectFit: 'contain'}}/>)}

        <ActionIcon
          variant="subtle"
          radius="xl"
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
                onClick={() => dispatch(newConversation())}
            >
                <IconPlus size={18} />
            </ActionIcon>
        )}

        {!collapsed && (
          <>
            <Button
              leftSection={<IconPlus size={16} />}
              radius="xl"
              onClick={() => dispatch(newConversation())}
            >
              New chat
            </Button>

            {/* Chat history header */}
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

        {/* Chat list */}
        {!collapsed && (
          <ScrollArea
            style={{ flex: 1 }}
            scrollbarSize={0}
          >
            <Collapse in={open}>
              <Stack gap={4}>
                {conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  const isEditing = editingId === c.id;

                  return (
                    <Group
                      key={c.id}
                      wrap="nowrap"
                      align="center"
                      px="xs"
                      py={4}
                      style={{
                        borderRadius: 20,
                        backgroundColor: isActive
                          ? 'var(--mantine-color-blue-light)'
                          : 'transparent',
                      }}
                    >
                      {/* Title / rename */}
                      {isEditing ? (
                        <TextInput
                          size="xs"
                          autoFocus
                          value={draftTitle}
                          onChange={(e) =>
                            setDraftTitle(e.currentTarget.value)
                          }
                          onBlur={() => {
                            dispatch(
                              renameConversation({
                                id: c.id,
                                title: draftTitle,
                              })
                            );
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              dispatch(
                                renameConversation({
                                  id: c.id,
                                  title: draftTitle,
                                })
                              );
                              setEditingId(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          styles={{
                            input: {
                              background: 'transparent',
                            },
                          }}
                        />
                      ) : (
                        <Button
                          variant="subtle"
                          radius="md"
                          fullWidth
                          justify="flex-start"
                          onClick={() =>
                            dispatch(setActiveConversation(c.id))
                          }
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

                      {/* Menu */}
                      {!isEditing && (
                        <Menu position="right" withinPortal>
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              radius="xl"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconDots size={14} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconPencil size={14} />}
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
                              leftSection={<IconTrash size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(removeConversation(c.id));
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
      {collapsed && (<img src="/ai_icon.png" alt="Logo" style={{height: 28, objectFit: 'contain'}}/>)}
      <Divider />
      <UserMenu collapsed={collapsed} />
    </Stack>
  );
}
