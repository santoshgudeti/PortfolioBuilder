import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const Navbar: React.FC = () => {
    const { theme, toggleTheme, user } = useAuthStore()

    return (
        <div className="fixed top-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
            <nav className="max-w-5xl w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm rounded-xl h-14 flex items-center justify-between px-6 pointer-events-auto" role="navigation" aria-label="Main navigation">
                <Link to="/" className="flex items-center gap-2" aria-label="PortfolioBuilder.AI Home">
                    <span className="text-lg font-bold tracking-tight text-gray-950 dark:text-white">
                        PortfolioBuilder<span className="text-brand-500">.AI</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['Solutions', 'Features', 'Templates', 'FAQ'].map(item => (
                        <a key={item} href={`/#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors">
                            {item}
                        </a>
                    ))}

                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    {user ? (
                        <Link to="/dashboard" className="btn-primary py-1.5 px-4 text-xs">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white px-2">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary py-1.5 px-4 text-xs">
                                Start Free
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Navbar
