/**
 * @name TiltedCard
 * @description A 3D tilt card effect
 */

import React, { useRef, useState } from 'react';

interface TiltedCardProps extends React.PropsWithChildren {
    className?: string;
    rotateAmplitude?: number;
    scaleOnHover?: number;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({
    children,
    className = '',
    rotateAmplitude = 12,
    scaleOnHover = 1.05,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -rotateAmplitude;
        const rotateY = ((x - centerX) / centerX) * rotateAmplitude;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div
            className={`perspective-1000 ${className}`}
            style={{ perspective: '1000px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardRef}
                className="w-full h-full transition-transform duration-200 ease-out will-change-transform"
                style={{
                    transform: isHovered
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scaleOnHover})`
                        : 'rotateX(0deg) rotateY(0deg) scale(1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default TiltedCard;
