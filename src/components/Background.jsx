import React, { useMemo } from 'react';

export default function Background() {

    // 1. Generate random stars efficiently
    const generateStars = (count) => {
        let value = '';
        for (let i = 0; i < count; i++) {
            // Random X and Y positions
            const x = Math.floor(Math.random() * 2000);
            const y = Math.floor(Math.random() * 2000);
            // Box shadow format: "x y color, x y color..."
            value += `${x}px ${y}px #FFF, `;
        }
        return value.slice(0, -2); // Remove trailing comma
    };

    // 2. Memoize them so they don't change on re-renders
    const smallStars = useMemo(() => generateStars(700), []);
    const mediumStars = useMemo(() => generateStars(200), []);
    const bigStars = useMemo(() => generateStars(100), []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505]">

            {/* Layer 1: Small Stars (Far away, slow) */}
            <div
                className="absolute w-[1px] h-[1px] bg-transparent animate-fly-slow opacity-40"
                style={{ boxShadow: smallStars }}
            />

            {/* Layer 2: Medium Stars (Mid range, normal speed) */}
            <div
                className="absolute w-[2px] h-[2px] bg-transparent animate-fly-mid opacity-70"
                style={{ boxShadow: mediumStars }}
            />

            {/* Layer 3: Big Stars (Close, fast) */}
            <div
                className="absolute w-[3px] h-[3px] bg-transparent animate-fly-fast opacity-90"
                style={{ boxShadow: bigStars }}
            />

            {/* Optional: A very subtle blue vignette for "Atmosphere" */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-50"></div>
        </div>
    );
}