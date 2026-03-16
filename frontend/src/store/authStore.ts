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
    user: User | null
    theme: 'light' | 'dark'
    setAuth: (user: User | null) => void
    logout: () => Promise<void>
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
    initTheme: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            theme: 'light',

            setAuth: (user) => set({ user }),

            logout: async () => {
                try {
                    // Try to notify backend to clear cookie
                    const { default: apiClient } = await import('@/api/client')
                    await apiClient.post('/auth/logout')
                } catch (e) {
                    console.error("Logout cookie clear failed", e)
                }
                set({ user: null })
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
