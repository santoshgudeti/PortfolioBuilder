import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const Navbar: React.FC = () => {
    const { theme, toggleTheme, user } = useAuthStore()

    return (
        <div className="fixed top-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
            <nav className="max-w-5xl w-full h-48 flex items-center justify-between px-6 pointer-events-auto" role="navigation" aria-label="Main navigation">
                <Link to="/" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1" aria-label="PortfolioBuilder.AI Home">
                    <img 
                        src={theme === 'dark' ? '/assets/branding/logo_dark.png' : '/assets/branding/logo_light.png'} 
                        alt="PortfolioBuilder.AI" 
                        className="h-40 w-auto object-contain"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['Solutions', 'Features', 'Templates', 'FAQ'].map(item => (
                        <a key={item} href={`/#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-[color,transform] focus-visible:text-brand-500 outline-none">
                            {item}
                        </a>
                    ))}
                    {user?.is_admin && (
                        <Link to="/admin" className="text-sm font-semibold text-purple-600 hover:text-purple-500 transition-colors flex items-center gap-1">
                            Admin
                        </Link>
                    )}

                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-95 outline-none" aria-label="Toggle theme">
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
