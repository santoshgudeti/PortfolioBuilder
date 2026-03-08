/**
 * @name TextPressure
 * @description A text component that reacts to "pressure" (font-weight animation)
 */

import React, { useState, useEffect } from 'react';

interface TextPressureProps {
    text: string;
    className?: string;
    minWeight?: number;
    maxWeight?: number;
}

export const TextPressure: React.FC<TextPressureProps> = ({
    text,
    className = "",
    minWeight = 100,
    maxWeight = 900,
}) => {
    const [weight, setWeight] = useState(minWeight);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isHovered) {
            interval = setInterval(() => {
                setWeight(prev => Math.min(prev + 40, maxWeight));
            }, 10);
        } else {
            interval = setInterval(() => {
                setWeight(prev => Math.max(prev - 20, minWeight));
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isHovered, minWeight, maxWeight]);

    return (
        <span
            className={`transition-all duration-300 ${className}`}
            style={{ fontWeight: weight, fontVariationSettings: `"wght" ${weight}` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {text}
        </span>
    );
};

export default TextPressure;
