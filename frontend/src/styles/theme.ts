import type { MantineThemeOverride } from '@mantine/core';
import { designTokens } from './designTokens';

export const theme: MantineThemeOverride = {
  primaryColor: 'lime',
  colors: {
    lime: [
      designTokens.colors.lime[50],
      designTokens.colors.lime[100],
      designTokens.colors.lime[200],
      designTokens.colors.lime[300],
      designTokens.colors.lime[400],
      designTokens.colors.lime[500],
      designTokens.colors.lime[600],
      designTokens.colors.lime[700],
      designTokens.colors.lime[800],
      designTokens.colors.lime[900],
    ] as any,
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
};
