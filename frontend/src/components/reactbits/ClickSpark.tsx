/**
 * @name ClickSpark
 * @description A component that creates sparks/particles on click
 */

import React, { useEffect, useRef, useState } from 'react';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkCount?: number;
    duration?: number;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = '#6366f1',
    sparkSize = 10,
    sparkCount = 8,
    duration = 0.6,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let sparks: any[] = [];
        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const createSpark = (x: number, y: number) => {
            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.PI * 2 * i) / sparkCount;
                const velocity = 2 + Math.random() * 4;
                sparks.push({
                    x,
                    y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    life: 1,
                    opacity: 1,
                });
            }
        };

        const handleClick = (e: MouseEvent) => {
            createSpark(e.clientX, e.clientY);
        };

        window.addEventListener('click', handleClick);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparks = sparks.filter((s) => s.life > 0);

            sparks.forEach((s) => {
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 1 / (60 * duration);
                s.opacity = Math.max(0, s.life);
                const radius = Math.max(0, sparkSize * s.life);

                ctx.beginPath();
                ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = sparkColor;
                ctx.globalAlpha = s.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationId);
        };
    }, [sparkColor, sparkSize, sparkCount, duration]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default ClickSpark;
