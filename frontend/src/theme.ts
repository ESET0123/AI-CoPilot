import { createTheme, MantineThemeOverride } from '@mantine/core';
import { designTokens } from './styles/designTokens';

export const theme: MantineThemeOverride = createTheme({
    primaryColor: 'brand',
    primaryShade: 5,
    colors: {
        brand: designTokens.colors.brand as [string, string, string, string, string, string, string, string, string, string],
        dark: designTokens.colors.dark as [string, string, string, string, string, string, string, string, string, string],
    },
    fontFamily: 'Inter, sans-serif',
    headings: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: '700',
    },
    defaultRadius: 'md',
    components: {
        Button: {
            defaultProps: {
                radius: 'xl',
            },
            styles: () => ({
                root: {
                    transition: `background-color ${designTokens.animations.medium}, transform ${designTokens.animations.fast}`,
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                },
            }),
        },
        TextInput: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
        },
        PasswordInput: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
        },
        Paper: {
            defaultProps: {
                radius: 'lg',
            },
        },
    },
});
