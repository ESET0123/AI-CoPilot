import { Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface MessageTextProps {
    text: string;
    isUser: boolean;
    isError: boolean;
}

export const MessageText = ({ text, isUser, isError }: MessageTextProps) => {
    if (isError && !isUser) {
        return (
            <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                styles={{ root: { padding: '8px 12px' } }}
            >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {text}
                </Text>
            </Alert>
        );
    }

    return (
        <Text
            size="sm"
            style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
            }}
        >
            {text}
        </Text>
    );
};
