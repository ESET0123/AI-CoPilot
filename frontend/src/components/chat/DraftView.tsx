import { Box } from '@mantine/core';
import DashboardHero from './DashboardHero';
import ChatInput from './ChatInput';
import QuickAccessCategories from './QuickAccessCategories';

export default function DraftView() {
    return (
        <Box w="100%" mih="100%" display="flex" style={{ flexDirection: 'column' }}>
            <Box style={{ flex: 1 }}>
                <DashboardHero />
            </Box>
            <Box w="100%" maw={800} mx="auto" mb="4rem">
                <ChatInput isHeroMode />
            </Box>
            <Box w="100%" maw={900} mx="auto" mb="2rem">
                <QuickAccessCategories />
            </Box>
        </Box>
    );
}
