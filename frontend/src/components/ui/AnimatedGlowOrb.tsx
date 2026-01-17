import { Box } from '@mantine/core';

interface AnimatedGlowOrbProps {
    size?: number;
    color1?: string;
    color2?: string;
    color3?: string;
    glowIntensity?: number;
}

export default function AnimatedGlowOrb({
    size = 120,
    color1 = '#4ade80', // Vibrant Lime
    color2 = '#84cc16', // Neon Green
    color3 = '#facc15', // Bright Yellow
    glowIntensity = 1
}: AnimatedGlowOrbProps) {
    return (
        <Box
            style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* The Revolving Gradient Layer (Matched to Image) */}
            <Box
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, ${color1}, ${color3}, ${color2}, ${color1})`,
                    animation: 'revolve 6s linear infinite',
                    filter: `blur(${size / 10}px)`,
                    opacity: 0.9 * glowIntensity,
                    boxShadow: `0 0 ${size / 2}px ${color3}66`,
                }}
            />

            {/* The Inner Core for depth (Softening white point) */}
            <Box
                style={{
                    position: 'absolute',
                    width: '90%',
                    height: '90%',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color1} 0%, ${color3} 100%)`,
                    zIndex: 2,
                    opacity: 0.9,
                }}
            />

            {/* The Extra Vibrant Bloom */}
            <Box
                style={{
                    position: 'absolute',
                    width: '140%',
                    height: '140%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${color1} 0%, ${color3} 40%, transparent 70%)`,
                    filter: `blur(${size / 2}px)`,
                    opacity: 0.3 * glowIntensity,
                    animation: 'pulse 4s ease-in-out infinite',
                    zIndex: 0,
                }}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes revolve {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.15; }
                    50% { transform: scale(1.1); opacity: 0.25; }
                }
            `}} />
        </Box>
    );
}
