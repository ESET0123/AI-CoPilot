import { Box } from '@mantine/core';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import QuickAccessCategories from './QuickAccessCategories';

export default function ActiveConversationView() {
    return (
        <Box display="flex" style={{ flexDirection: 'column' }}>
            {/* Primary View: Chat Window + Input (90% height) */}
            <Box display="flex" style={{ flexDirection: 'column', height: '90vh', overflow: 'hidden' }}>
                {/* Chat Content expands to fill available space */}
                <Box w="100%" mt="md" style={{ flex: 1, overflowY: 'auto' }}>
                    <ChatWindow />
                </Box>

                {/* Input Area */}
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
                    <Box maw={900} w="100%" mb="md" >
                        <ChatInput />
                    </Box>
                </Box>
            </Box>

            {/* Below the Fold: Action Categories (Scrollable and Hidden by default) */}
            <Box py="xl" display="flex" style={{ justifyContent: 'center' }}>
                <QuickAccessCategories />
            </Box>
        </Box>
    );
}
