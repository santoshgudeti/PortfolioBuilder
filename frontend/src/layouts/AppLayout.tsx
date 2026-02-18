import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
    LayoutDashboard, Upload, Palette, Settings, LogOut,
    Moon, Sun, Menu, X, Briefcase
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Resume' },
    { to: '/editor', icon: Palette, label: 'Portfolio Editor' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, theme, toggleTheme } = useAuthStore()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">Resume2Portfolio</span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navItems.map(({ to, icon: Icon, label }) => {
                            const active = location.pathname === to
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                            ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom */}
                    <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
                        <button
                            onClick={toggleTheme}
                            className="btn-ghost w-full justify-start"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button onClick={logout} className="btn-ghost w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    {/* User */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">Resume2Portfolio</span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
