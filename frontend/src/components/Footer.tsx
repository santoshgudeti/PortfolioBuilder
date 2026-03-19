import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-stone-200 bg-stone-100/80 py-16 dark:border-white/10 dark:bg-[#10141a]">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <div>
                    <Link
                        to="/"
                        className="inline-block rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        <span className="font-space text-2xl font-bold tracking-[-0.04em] text-stone-950 dark:text-white">
                            PortfolioBuilder<span className="text-brand-600 dark:text-brand-400">.AI</span>
                        </span>
                    </Link>
                    <p className="mt-4 max-w-md text-sm leading-7 text-stone-600 dark:text-stone-300">
                        A resume-first portfolio builder for people who want something cleaner than a template dump and faster than building a site from scratch.
                    </p>
                </div>

                <div>
                    <h2 className="font-space text-lg font-bold text-stone-950 dark:text-white">Explore</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <a href="#product" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Product
                        </a>
                        <a href="#workflow" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Workflow
                        </a>
                        <a href="#templates" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Templates
                        </a>
                        <a href="#faq" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            FAQ
                        </a>
                    </div>
                </div>

                <div>
                    <h2 className="font-space text-lg font-bold text-stone-950 dark:text-white">Company</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link to="/login" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Sign in
                        </Link>
                        <Link to="/register" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Create account
                        </Link>
                        <Link to="/privacy" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Privacy
                        </Link>
                        <Link to="/terms" className="block text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-6xl border-t border-stone-200 px-4 pt-6 text-sm text-stone-500 dark:border-white/10 dark:text-stone-400 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>&copy; {new Date().getFullYear()} PortfolioBuilder.AI</span>
                    <span>Built by HamathOPC Pvt Ltd</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
