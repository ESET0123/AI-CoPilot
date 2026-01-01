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

    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
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
