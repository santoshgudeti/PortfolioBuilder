import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#workflow' },
    { label: 'Templates', href: '#templates' },
    { label: 'FAQ', href: '#faq' },
]

const Navbar: React.FC = () => {
    const { theme, toggleTheme, user } = useAuthStore()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
                <nav
                    className="flex h-14 items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/80 px-5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]"
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {/* Logo */}
                    <Link
                        to="/"
                        className="rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label="PortfolioBuilder home"
                    >
                        <span className="font-space text-lg font-bold tracking-[-0.04em] text-zinc-950 dark:text-white">
                            Portfolio<span className="text-brand-500">Builder</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden items-center gap-1 md:flex">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Right side: theme toggle + auth */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {user ? (
                            <Link
                                to="/dashboard"
                                className="hidden rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:inline-flex"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white sm:inline-flex"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="hidden rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:inline-flex"
                                >
                                    Get started free
                                </Link>
                            </>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile menu dropdown */}
                {mobileOpen && (
                    <div className="mt-2 rounded-2xl border border-zinc-200/80 bg-white/95 p-4 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-zinc-950/95">
                        <div className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-white/10">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="rounded-xl bg-zinc-950 px-4 py-2.5 text-center text-sm font-bold text-white dark:bg-white dark:text-zinc-950"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 dark:border-white/10 dark:text-zinc-300"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="rounded-xl bg-zinc-950 px-4 py-2.5 text-center text-sm font-bold text-white dark:bg-white dark:text-zinc-950"
                                    >
                                        Get started free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Navbar
