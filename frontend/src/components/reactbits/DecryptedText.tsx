/**
 * @name DecryptedText
 * @description A text component that reveals text via a decryption/scrambling animation
 */

import { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    useOriginalCharsOnly?: boolean;
    characters?: string;
    className?: string;
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
    text,
    speed = 50,
    maxIterations = 10,
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+{}:"|<>?,./;',
    className = '',
}) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<any>(null);

    const animate = () => {
        let iteration = 0;
        setIsAnimating(true);
        setDisplayText(text.split('').map(() => characters[Math.floor(Math.random() * characters.length)]).join(''));

        const interval = setInterval(() => {
            setDisplayText((current) => {
                return current.split('').map((char, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    if (useOriginalCharsOnly) {
                        return text[Math.floor(Math.random() * text.length)];
                    }
                    return characters[Math.floor(Math.random() * characters.length)];
                }).join('');
            });

            iteration += 1 / maxIterations;

            if (iteration >= text.length) {
                clearInterval(interval);
                setDisplayText(text);
                setIsAnimating(false);
            }
        }, speed);

        return () => clearInterval(interval);
    };

    useEffect(() => {
        if (isHovering && !isAnimating) {
            const cleanup = animate();
            return cleanup;
        }
    }, [isHovering]);

    return (
        <span
            className={`inline-block whitespace-pre-wrap ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {displayText}
        </span>
    );
};

export default DecryptedText;
