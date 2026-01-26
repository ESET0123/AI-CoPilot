import { Box } from '@mantine/core';
import { useRef } from 'react';
import ChatWindow from '../chat/ChatWindow';
import ChatInput from '../chat/ChatInput';
import QuickAccessCategories from '../dashboard/QuickAccessCategories';

export default function ActiveConversationView() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <Box display="flex" style={{ flexDirection: 'column' }}>
            {/* Primary View: Chat Window + Input (90% height) */}
            <Box display="flex" style={{ flexDirection: 'column', height: '70vh', overflow: 'hidden' }}>
                {/* Chat Content expands to fill available space */}
                <Box
                    ref={scrollContainerRef}
                    w="100%"
                    mt="md"
                    style={{ flex: 1, overflowY: 'auto' }}
                >
                    <ChatWindow scrollContainerRef={scrollContainerRef} />
                </Box>

                
            </Box>
            {/* Input Area */}
                <Box
                    // p="md"
                    w="100%"
                    display="flex"
                    style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'transparent'
                    }}
                >
                    <Box maw={900} w="100%">
                        <ChatInput />
                    </Box>
                </Box>
            {/* Below the Fold: Action Categories (Scrollable and Hidden by default) */}
            <Box py="xl" display="flex" style={{ justifyContent: 'center' }}>
                <QuickAccessCategories />
            </Box>
        </Box>
    );
}
