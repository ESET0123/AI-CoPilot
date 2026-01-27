import { ActionIcon, TextInput } from '@mantine/core';
import { TbX } from 'react-icons/tb';

interface ChatSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
    onClear: () => void;
}

export const ChatSearch = ({ query, onQueryChange, onClear }: ChatSearchProps) => {
    return (
        <TextInput
            placeholder="Search chats..."
            size="xs"
            variant="filled"
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            rightSection={
                <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={onClear}
                >
                    <TbX size={14} />
                </ActionIcon>
            }
            styles={{
                root: { padding: '0 8px' },
                input: {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    '&:focus': {
                        borderColor: 'var(--mantine-color-brand-filled)',
                    },
                },
            }}
        />
    );
};
