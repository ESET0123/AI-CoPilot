import { Box } from '@mantine/core';
import DashboardHero from '../dashboard/DashboardHero';
import ChatInput from '../chat/ChatInput';
import QuickAccessCategories from '../dashboard/QuickAccessCategories';

export default function DraftView() {
    return (
        <Box w="100%" mih="100%" display="flex" style={{ flexDirection: 'column' }}>
            <Box style={{ flex: 1 }}>
                <DashboardHero />
            </Box>
            <Box w="100%" maw={900} mx="auto" mb="4rem">
                <ChatInput isHeroMode />
            </Box>
            <Box w="100%" maw={900} mx="auto" mb="2rem">
                <QuickAccessCategories />
            </Box>
        </Box>
    );
}
