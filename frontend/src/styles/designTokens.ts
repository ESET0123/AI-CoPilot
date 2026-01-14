/**
 * Design Tokens for Consistent Styling
 * Professional and stylish design system
 */

export const designTokens = {
    // Transitions
    transitions: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
        spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // Border Radius
    radius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    },

    // Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
    },

    // Animations
    animations: {
        fadeIn: {
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        slideUp: {
            from: { transform: 'translateY(10px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
        },
        scaleIn: {
            from: { transform: 'scale(0.95)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
        },
    },

    // Colors
    colors: {
        lime: {
            50: '#f7fee7',
            100: '#ecfccb',
            200: '#d9f99d',
            300: '#bef264',
            400: '#a3e635',
            500: '#84cc16',
            600: '#65a30d',
            700: '#4d7c0f',
            800: '#3f6212',
            900: '#365314',
        },
        slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
        },
    },

    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)',
        vibrant: 'linear-gradient(135deg, #bef264 0%, #a3e635 100%)',
        soft: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
        glow: 'radial-gradient(circle at 50% 50%, #f7fee7 0%, #ffffff 100%)',
        mesh: 'radial-gradient(at 0% 0%, #ecfccb 0px, transparent 50%), radial-gradient(at 100% 0%, #f7fee7 0px, transparent 50%), radial-gradient(at 100% 100%, #ecfccb 0px, transparent 50%), radial-gradient(at 0% 100%, #f7fee7 0px, transparent 50%)',
        dark: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
        success: 'linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)',
        danger: 'linear-gradient(135deg, #FF6B9D 0%, #C94B4B 100%)',
    },
};

// Helper function for creating glassmorphism effect
export const glassmorphism = (isDark: boolean) => ({
    background: isDark
        ? 'rgba(30, 30, 30, 0.7)'
        : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
});

// Helper for hover scale effect
export const hoverScale = {
    transition: designTokens.transitions.normal,
    '&:hover': {
        transform: 'scale(1.02)',
    },
    '&:active': {
        transform: 'scale(0.98)',
    },
};

// Helper for smooth focus ring
export const focusRing = (color: string = '#4facfe') => ({
    '&:focus-visible': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${color}40`,
        transition: designTokens.transitions.fast,
    },
});
