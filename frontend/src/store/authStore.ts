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
    isInitialized: boolean
    theme: 'light' | 'dark'
    setAuth: (user: User | null) => void
    setInitialized: (val: boolean) => void
    logout: () => Promise<void>
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
    initTheme: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isInitialized: false,
            theme: 'light',

            setAuth: (user) => set({ user }),
            setInitialized: (val) => set({ isInitialized: val }),

            logout: async () => {
                const currentPath = window.location.pathname
                const isLoggingOut = get().user === null
                
                try {
                    const { default: apiClient } = await import('@/api/client')
                    await apiClient.post('/auth/logout')
                } catch (e) {
                    console.warn("Logout cookie clear skipped or failed")
                }

                set({ user: null })
                
                // Only redirect if we are not already at login and we actually had a user
                if (!isLoggingOut || (currentPath !== '/login' && currentPath !== '/')) {
                     window.location.href = '/login'
                }
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
