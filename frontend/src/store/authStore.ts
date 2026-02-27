import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    name: string
    email: string
    is_admin: boolean
    is_verified: boolean
    avatar_url: string | null
    auth_provider: string
}

interface AuthState {
    token: string | null
    user: User | null
    theme: 'light' | 'dark'
    setAuth: (token: string, user: User) => void
    logout: () => void
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
    initTheme: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            theme: 'light',

            setAuth: (token, user) => set({ token, user }),

            logout: () => {
                set({ token: null, user: null })
                window.location.href = '/login'
            },

            setTheme: (theme) => {
                set({ theme })
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            },

            toggleTheme: () => {
                const current = get().theme
                get().setTheme(current === 'light' ? 'dark' : 'light')
            },

            initTheme: () => {
                const theme = get().theme
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark')
                }
            },
        }),
        { name: 'auth-storage' }
    )
)
