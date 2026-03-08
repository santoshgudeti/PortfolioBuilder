/**
 * @name TrueFocus
 * @description A text component that focuses words on hover/interaction
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TrueFocusProps {
    sentence?: string;
    className?: string;
    focusColor?: string;
    borderColor?: string;
    borderWidth?: number;
    glowColor?: string;
    animationDuration?: number;
    pauseBetweenWords?: number;
    manualMode?: boolean;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
    sentence = 'True Focus',
    className = '',
    focusColor = '#6366f1',
    borderColor = '#6366f1',
    borderWidth = 3,
    glowColor = 'rgba(99, 102, 241, 0.3)',
    animationDuration = 0.5,
    pauseBetweenWords = 0.3,
    manualMode = false,
}) => {
    const words = sentence.split(' ');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        if (!manualMode) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % words.length);
            }, (animationDuration + pauseBetweenWords) * 1000);
            return () => clearInterval(interval);
        }
    }, [words.length, animationDuration, pauseBetweenWords, manualMode]);

    useEffect(() => {
        const activeWord = wordRefs.current[currentIndex];
        if (activeWord) {
            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = activeWord;
            setFocusRect({
                x: offsetLeft,
                y: offsetTop,
                width: offsetWidth,
                height: offsetHeight,
            });
        }
    }, [currentIndex, words]);

    return (
        <div className={`relative inline-flex flex-wrap items-center justify-center p-4 ${className}`}>
            {words.map((word, index) => (
                <span
                    key={index}
                    ref={(el) => (wordRefs.current[index] = el)}
                    className="relative z-10 mx-2 cursor-pointer text-4xl font-black transition-colors duration-300"
                    style={{
                        color: index === currentIndex ? focusColor : 'inherit',
                        opacity: index === currentIndex ? 1 : 0.5,
                    }}
                    onMouseEnter={() => manualMode && setCurrentIndex(index)}
                >
                    {word}
                </span>
            ))}

            <motion.div
                className="absolute pointer-events-none z-0 rounded-lg"
                animate={{
                    x: focusRect.x - 4,
                    y: focusRect.y - 4,
                    width: focusRect.width + 8,
                    height: focusRect.height + 8,
                    opacity: 1,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                style={{
                    border: `${borderWidth}px solid ${borderColor}`,
                    boxShadow: `0 0 15px ${glowColor}`,
                }}
            />
        </div>
    );
};

export default TrueFocus;
