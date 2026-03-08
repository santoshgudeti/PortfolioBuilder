/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                playfair: ['Playfair Display', 'serif'],
                space: ['Space Grotesk', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
                popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
                primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
                secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
                muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
                accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
                destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
            },
            boxShadow: {
                'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.3)',
                'glow': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
                'glow-lg': '0 0 40px -5px rgba(99, 102, 241, 0.5)',
                'glow-purple': '0 0 30px -5px rgba(139, 92, 246, 0.4)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'shine': 'shine 5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shine: {
                    '0%': { 'background-position': '100%' },
                    '100%': { 'background-position': '-100%' },
                },
            },
        },
    },
    plugins: [],
}
