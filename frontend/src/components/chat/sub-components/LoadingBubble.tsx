import { Box, Loader } from '@mantine/core';

export const LoadingBubble = () => (
    <Box
        style={{
            alignSelf: 'flex-start',
            paddingLeft: 8,
            paddingTop: 4,
        }}
    >
        <Loader type="dots" size="sm" />
    </Box>
);
