/**
 * @name SplitText
 * @description A text component that animates its letters into view
 */

import { useEffect, useMemo, useRef, useState } from 'react'

interface SplitTextProps {
    text?: string
    className?: string
    delay?: number
    animationFrom?: React.CSSProperties
    animationTo?: React.CSSProperties
    easing?: string
    threshold?: number
    rootMargin?: string
    textAlign?: 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit'
    onLetterAnimationComplete?: () => void
}

export const SplitText: React.FC<SplitTextProps> = ({
    text = '',
    className = '',
    delay = 100,
    animationFrom = { opacity: 0, transform: 'translate3d(0,24px,0)' },
    animationTo = { opacity: 1, transform: 'translate3d(0,0,0)' },
    easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
    threshold = 0.1,
    rootMargin = '-50px',
    textAlign = 'center',
    onLetterAnimationComplete,
}) => {
    const ref = useRef<HTMLParagraphElement>(null)
    const timeoutRef = useRef<number | null>(null)
    const [inView, setInView] = useState(false)

    const words = useMemo(() => text.split(' ').map((word) => word.split('')), [text])
    const letters = useMemo(() => words.flat(), [words])

    useEffect(() => {
        if (typeof window === 'undefined' || !ref.current || typeof IntersectionObserver === 'undefined') {
            setInView(true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                    if (ref.current) {
                        observer.unobserve(ref.current)
                    }
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [rootMargin, threshold])

    useEffect(() => {
        if (!inView || !onLetterAnimationComplete || letters.length === 0) {
            return
        }

        timeoutRef.current = window.setTimeout(onLetterAnimationComplete, delay * Math.max(letters.length - 1, 0) + 650)

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current)
            }
        }
    }, [delay, inView, letters.length, onLetterAnimationComplete])

    return (
        <p
            ref={ref}
            className={`split-parent flex flex-wrap justify-center overflow-hidden inline-block ${className}`}
            style={{ textAlign }}
        >
            {words.map((word, wordIndex) => (
                <span key={`${word.join('')}-${wordIndex}`} className="inline-block whitespace-nowrap">
                    {word.map((letter, letterIndex) => {
                        const index = words
                            .slice(0, wordIndex)
                            .reduce((acc, currentWord) => acc + currentWord.length, 0) + letterIndex

                        const style: React.CSSProperties = inView
                            ? {
                                ...animationFrom,
                                ...animationTo,
                                transitionProperty: 'opacity, transform',
                                transitionDuration: '650ms',
                                transitionTimingFunction: easing,
                                transitionDelay: `${index * delay}ms`,
                                willChange: 'opacity, transform',
                            }
                            : {
                                ...animationFrom,
                                transitionProperty: 'opacity, transform',
                                transitionDuration: '650ms',
                                transitionTimingFunction: easing,
                                willChange: 'opacity, transform',
                            }

                        return (
                            <span
                                key={`${letter}-${index}`}
                                style={style}
                                className="inline-block"
                            >
                                {letter}
                            </span>
                        )
                    })}
                    <span className="inline-block w-[0.2em]">&nbsp;</span>
                </span>
            ))}
        </p>
    )
}

export default SplitText
