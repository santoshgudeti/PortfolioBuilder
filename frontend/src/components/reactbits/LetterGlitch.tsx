/**
 * @name LetterGlitch
 * @description A text effect that glitches the characters on hover
 */

import React, { useState, useEffect, useCallback } from 'react';

interface LetterGlitchProps {
    text: string;
    speed?: number;
    glitchChance?: number;
    className?: string;
}

export const LetterGlitch: React.FC<LetterGlitchProps> = ({
    text,
    speed = 50,
    glitchChance = 0.1,
    className = "",
}) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovered, setIsHovered] = useState(false);
    const chars = '!@#$%^&*()_+{}:"|<>?,./;[]';

    const glitch = useCallback(() => {
        if (!isHovered) {
            setDisplayText(text);
            return;
        }

        const glitched = text.split('').map(char => {
            if (Math.random() < glitchChance) {
                return chars[Math.floor(Math.random() * chars.length)];
            }
            return char;
        }).join('');

        setDisplayText(glitched);
    }, [text, glitchChance, isHovered]);

    useEffect(() => {
        let interval: any;
        if (isHovered) {
            interval = setInterval(glitch, speed);
        } else {
            setDisplayText(text);
        }
        return () => clearInterval(interval);
    }, [isHovered, glitch, speed, text]);

    return (
        <span
            className={`cursor-default ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {displayText}
        </span>
    );
};

export default LetterGlitch;
