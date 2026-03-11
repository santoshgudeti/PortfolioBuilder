import * as React from 'react'

import { cn } from '@/lib/utils'

const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
    link: 'text-primary underline-offset-4 hover:underline',
} as const

const sizeClasses = {
    default: 'h-9 gap-1.5 px-2.5',
    xs: 'h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs [&_svg:not([class*=size-])]:size-3',
    sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5',
    lg: 'h-10 gap-1.5 px-2.5',
    icon: 'size-9',
    'icon-xs': 'size-6 rounded-[min(var(--radius-md),8px)] [&_svg:not([class*=size-])]:size-3',
    'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)]',
    'icon-lg': 'size-10',
} as const

const buttonBaseClass =
    "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export type ButtonVariant = keyof typeof variantClasses
export type ButtonSize = keyof typeof sizeClasses

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

function buttonVariants({
    variant = 'default',
    size = 'default',
    className,
}: {
    variant?: ButtonVariant
    size?: ButtonSize
    className?: string
}) {
    return cn(buttonBaseClass, variantClasses[variant], sizeClasses[size], className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = 'default', size = 'default', type = 'button', ...props },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            data-slot="button"
            className={buttonVariants({ variant, size, className })}
            {...props}
        />
    )
})

export { Button, buttonVariants }
