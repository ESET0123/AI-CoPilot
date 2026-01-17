export const designTokens = {
    colors: {
        brand: [
            '#e8f5e9',
            '#c8e6c9',
            '#a5d6a7',
            '#81c784',
            '#66bb6a',
            '#4caf50', // Primary Green (Index 5)
            '#43a047',
            '#388e3c',
            '#2e7d32',
            '#1b5e20',
        ],
        dark: [
            '#C1C1C1',
            '#A6A6A6',
            '#909090',
            '#666666',
            '#4D4D4D',
            '#333333',
            '#262626',
            '#1A1A1A', // Primary Dark (Index 7)
            '#101010',
            '#000000',
        ],
        glass: 'rgba(255, 255, 255, 0.15)',
    },
    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        vh: (val: number) => `${val}vh`,
        vw: (val: number) => `${val}vw`,
    },
    radius: {
        xs: '4px',
        sm: '8px',
        md: '10px',
        lg: '16px',
        xl: '32px',
    },
    animations: {
        slow: '0.3s ease',
        medium: '0.2s ease',
        fast: '0.1s ease',
    },
    gradients: {
        loginPanel: `
      radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 0%),
      radial-gradient(circle at 85% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 0%),
      linear-gradient(170deg, #ffffff 0%, #4caf50 100%)
    `,
    },
};
