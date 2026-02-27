import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
    LayoutDashboard, Upload, Palette, Settings, LogOut,
    Moon, Sun, Menu, Briefcase, TrendingUp, User, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/upload', icon: Upload, label: 'Upload Resume' },
    { to: '/editor', icon: Palette, label: 'Portfolio Editor' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, theme, toggleTheme } = useAuthStore()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    // Desktop collapse state — persisted across navigation
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                transform transition-all duration-200 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0
                ${collapsed ? 'lg:w-16' : 'lg:w-64'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo + desktop collapse toggle */}
                    <div className={`flex items-center border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center px-3 py-5' : 'gap-2 px-4 py-5'}`}>
                        {!collapsed && (
                            <>
                                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white truncate">Resume2Portfolio</span>
                            </>
                        )}
                        {collapsed && (
                            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-white" />
                            </div>
                        )}
                        {/* Desktop collapse button */}
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors flex-shrink-0 ${collapsed ? 'mt-0' : 'ml-auto'}`}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navItems.map(({ to, icon: Icon, label }) => {
                            const active = location.pathname === to
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? label : undefined}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''} ${active
                                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {!collapsed && label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom actions */}
                    <div className={`px-2 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1`}>
                        <button
                            onClick={toggleTheme}
                            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
                            className={`btn-ghost w-full ${collapsed ? 'justify-center px-3' : 'justify-start'}`}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
                            {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                        </button>
                        <button
                            onClick={logout}
                            title={collapsed ? 'Sign Out' : undefined}
                            className={`btn-ghost w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 ${collapsed ? 'justify-center px-3' : 'justify-start'}`}
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && 'Sign Out'}
                        </button>
                    </div>

                    {/* User */}
                    <div
                        className={`border-t border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${collapsed ? 'px-3 py-3 flex justify-center' : 'px-4 py-3'}`}
                        onClick={() => { navigate('/profile'); setMobileOpen(false) }}
                        title={collapsed ? `${user?.name} — My Profile` : 'My Profile'}
                    >
                        {collapsed ? (
                            user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )
                        ) : (
                            <div className="flex items-center gap-3">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                </div>
                                <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
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
