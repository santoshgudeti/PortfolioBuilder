/**
 * @name BlurText
 * @description A text component that reveals its content with a blur/fade animation
 */

import { useEffect, useMemo, useRef, useState } from 'react'

interface BlurTextProps {
    text?: string
    delay?: number
    className?: string
    animateBy?: 'words' | 'letters'
    direction?: 'top' | 'bottom'
    threshold?: number
    rootMargin?: string
    animationFrom?: React.CSSProperties
    animationTo?: React.CSSProperties[]
    easing?: string
    onAnimationComplete?: () => void
}

const FALLBACK_OBSERVER_THRESHOLD = 0.1

export const BlurText: React.FC<BlurTextProps> = ({
    text = '',
    delay = 200,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = FALLBACK_OBSERVER_THRESHOLD,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
    onAnimationComplete,
}) => {
    const ref = useRef<HTMLParagraphElement>(null)
    const timeoutRef = useRef<number | null>(null)
    const [inView, setInView] = useState(false)

    const elements = useMemo(
        () => (animateBy === 'words' ? text.split(' ') : text.split('')),
        [animateBy, text]
    )

    const defaultFrom: React.CSSProperties =
        direction === 'top'
            ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-24px,0)' }
            : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,24px,0)' }

    const finalStep: React.CSSProperties =
        animationTo?.[animationTo.length - 1] || {
            filter: 'blur(0px)',
            opacity: 1,
            transform: 'translate3d(0,0,0)',
        }

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
        if (!inView || !onAnimationComplete || elements.length === 0) {
            return
        }

        timeoutRef.current = window.setTimeout(onAnimationComplete, delay * Math.max(elements.length - 1, 0) + 650)

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current)
            }
        }
    }, [delay, elements.length, inView, onAnimationComplete])

    return (
        <p ref={ref} className={`blur-text ${className} flex flex-wrap`}>
            {elements.map((element, index) => {
                const style: React.CSSProperties = inView
                    ? {
                        ...(animationFrom || defaultFrom),
                        ...finalStep,
                        transitionProperty: 'opacity, transform, filter',
                        transitionDuration: '650ms',
                        transitionTimingFunction: easing,
                        transitionDelay: `${index * delay}ms`,
                        willChange: 'opacity, transform, filter',
                    }
                    : {
                        ...(animationFrom || defaultFrom),
                        transitionProperty: 'opacity, transform, filter',
                        transitionDuration: '650ms',
                        transitionTimingFunction: easing,
                        willChange: 'opacity, transform, filter',
                    }

                return (
                    <span
                        key={`${element}-${index}`}
                        style={style}
                        className="inline-block"
                    >
                        {element === ' ' ? '\u00A0' : element}
                        {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                    </span>
                )
            })}
        </p>
    )
}

export default BlurText
