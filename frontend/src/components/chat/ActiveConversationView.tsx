import { Box } from '@mantine/core';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import QuickAccessCategories from './QuickAccessCategories';

export default function ActiveConversationView() {
    return (
        <Box display="flex" style={{ flexDirection: 'column', minHeight: '100%' }}>
            {/* Chat Content expands to fill available space */}
            <Box w="100%" h="100vh" style={{ overflowY: 'auto' }}>
                <ChatWindow />
            </Box>

            {/* Input and Actions at the bottom */}
            <Box
                p="md"
                w="100%"
                display="flex"
                style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'transparent'
                }}
            >
                <Box maw={800} w="100%" mb="md" >
                    <ChatInput />
                </Box>
                <QuickAccessCategories />
            </Box>
        </Box>
    );
}
