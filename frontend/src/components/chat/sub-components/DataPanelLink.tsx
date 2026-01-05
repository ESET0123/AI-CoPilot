import { Box, Text } from '@mantine/core';
import { designTokens } from '../../../styles/designTokens';
import { useAppDispatch } from '../../../app/hooks';
import { setSelectedData } from '../../../features/chat/chatSlice';

interface DataPanelLinkProps {
    content: any;
    isUser: boolean;
}

export const DataPanelLink = ({ content, isUser }: DataPanelLinkProps) => {
    const dispatch = useAppDispatch();

    if (!['sql', 'table', 'chart'].includes(content.type) || !content.data) {
        return null;
    }

    return (
        <Box mt="sm">
            <Text
                size="xs"
                c={isUser ? 'rgba(255, 255, 255, 0.9)' : 'dimmed'}
                style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    transition: designTokens.transitions.fast,
                    display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={() => {
                    dispatch(setSelectedData(content));
                }}
            >
                View details in Data Panel →
            </Text>
        </Box>
    );
};
