import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
    { label: 'Product', href: '#product' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Templates', href: '#templates' },
    { label: 'FAQ', href: '#faq' },
]

const Navbar: React.FC = () => {
    const { theme, toggleTheme, user } = useAuthStore()

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur dark:border-white/10 dark:bg-[#0b0e12]/90">
            <nav
                className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
                role="navigation"
                aria-label="Main navigation"
            >
                <Link
                    to="/"
                    className="rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label="PortfolioBuilder home"
                >
                    <span className="font-space text-xl font-bold tracking-[-0.04em] text-stone-950 dark:text-white">
                        PortfolioBuilder<span className="text-brand-600 dark:text-brand-400">.AI</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={toggleTheme}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    {user ? (
                        <Link to="/dashboard" className="btn-primary px-4 py-2 text-sm">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white sm:inline-flex"
                            >
                                Sign in
                            </Link>
                            <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                                Start free
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar
