import { createTheme, MantineThemeOverride } from '@mantine/core';
import { designTokens } from './styles/designTokens';

export const theme: MantineThemeOverride = createTheme({
    primaryColor: 'brand',
    primaryShade: 5,
    colors: {
        brand: designTokens.colors.brand as any,
        dark: designTokens.colors.dark as any,
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
            styles: (theme: any) => ({
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
