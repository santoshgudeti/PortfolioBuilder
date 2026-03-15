import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { 
    LayoutDashboard, 
    Upload, 
    Palette, 
    Settings, 
    LogOut, 
    Moon, 
    Sun, 
    Menu, 
    TrendingUp, 
    User, 
    ChevronLeft, 
    ChevronRight, 
    Shield, 
    Lock, 
    LogIn 
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
        <div className="flex min-h-[100dvh] bg-gray-50 dark:bg-gray-950 lg:h-[100dvh]">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white dark:bg-black border-r border-gray-200 dark:border-white/10
                transform transition-all duration-200 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0
                ${collapsed ? 'lg:w-16' : 'lg:w-64'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo + desktop collapse toggle */}
                    {/* Logo + desktop collapse toggle */}
                    <div className={`flex items-center border-b border-gray-200 dark:border-white/10 ${collapsed ? 'justify-center px-3 py-4' : 'gap-2 px-4 py-4'}`}>
                        {collapsed ? (
                            <div className="w-8 h-8 bg-gray-950 dark:bg-white rounded flex items-center justify-center text-white dark:text-gray-950 font-bold text-[10px]">
                                PB
                            </div>
                        ) : (
                            <div className="flex items-center justify-center flex-1">
                                <span className="text-base font-bold tracking-tight text-gray-950 dark:text-white">
                                    PortfolioBuilder<span className="text-gray-400">.AI</span>
                                </span>
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
                        {user?.is_admin && (
                            <div className="mb-4">
                                <Link
                                    to="/admin"
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? "Admin Dashboard" : undefined}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${collapsed ? 'justify-center' : ''} ${location.pathname === '/admin'
                                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30'
                                        : 'bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30'
                                        }`}
                                >
                                    <Shield className="w-4 h-4 flex-shrink-0" />
                                    {!collapsed && "Admin"}
                                </Link>
                            </div>
                        )}
                        {navItems.map(({ to, icon: Icon, label }) => {
                            const active = location.pathname === to
                            const requiresAuth = ['/dashboard', '/analytics', '/profile', '/settings'].includes(to)
                            const isLocked = !user && requiresAuth
                            return (
                                <Link
                                    key={to}
                                    to={isLocked ? '/login' : to}
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? (isLocked ? `${label} (Sign in required)` : label) : undefined}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${active
                                        ? 'bg-gray-100 text-gray-950 dark:bg-white/10 dark:text-white border border-transparent'
                                        : isLocked
                                            ? 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {collapsed ? null : (
                                        <span className="flex-1 flex items-center justify-between">
                                            {label}
                                            {isLocked ? <Lock className="w-3 h-3 opacity-50" /> : null}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom actions */}
                    <div className="px-2 py-4 border-t border-gray-200 dark:border-white/5 space-y-1">
                        <button
                            onClick={toggleTheme}
                            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full hover:bg-gray-100 dark:hover:bg-white/5 ${collapsed ? 'justify-center px-3' : 'justify-start'}`}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
                            {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                        </button>
                        {user ? (
                            <button
                                onClick={logout}
                                title={collapsed ? 'Sign Out' : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 ${collapsed ? 'justify-center px-3' : 'justify-start'}`}
                            >
                                <LogOut className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && 'Sign Out'}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                title={collapsed ? 'Sign In' : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/20 ${collapsed ? 'justify-center px-3' : 'justify-start'}`}
                            >
                                <LogIn className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && 'Sign In'}
                            </Link>
                        )}
                    </div>

                    {/* User Profile Hook */}
                    <div
                        className={`border-t border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${collapsed ? 'px-3 py-4 flex justify-center' : 'px-4 py-4'}`}
                        onClick={() => { navigate(user ? '/profile' : '/register'); setMobileOpen(false) }}
                    >
                        {!user ? (
                            <div className="flex items-center gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                {!collapsed && (
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-brand-500">Guest Session</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Register to save your work</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20 shadow-sm" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{user?.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate uppercase font-bold tracking-wider">{user?.email}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest text-center border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                            Built by HamathOPC Pvt Ltd
                        </div>
                    )}
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
            <div className="flex-1 flex min-w-0 flex-col lg:overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10">
                    <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center">
                        <span className="text-base font-bold tracking-tight text-gray-950 dark:text-white">
                            PortfolioBuilder<span className="text-gray-400">.AI</span>
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
