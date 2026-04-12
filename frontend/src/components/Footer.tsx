import React from 'react'
import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
    Product: [
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#workflow' },
        { label: 'Templates', href: '#templates' },
        { label: 'FAQ', href: '#faq' },
    ],
    Company: [
        { label: 'Sign in', to: '/login' },
        { label: 'Create account', to: '/register' },
        { label: 'Privacy', to: '/privacy' },
        { label: 'Terms', to: '/terms' },
    ],
}

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-white/[0.06] dark:bg-[#030303]">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
                    {/* Brand column */}
                    <div>
                        <Link
                            to="/"
                            className="inline-block rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                            <span className="font-space text-xl font-bold tracking-[-0.04em] text-zinc-950 dark:text-white">
                                Portfolio<span className="text-brand-500">Builder</span>
                            </span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-500">
                            Describe yourself or upload your resume. AI builds your portfolio. Publish on your unique URL within minutes. Free forever.
                        </p>
                    </div>

                    {/* Product links */}
                    <div>
                        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                            Product
                        </h2>
                        <div className="mt-5 space-y-3 text-sm">
                            {FOOTER_LINKS.Product.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company links */}
                    <div>
                        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                            Company
                        </h2>
                        <div className="mt-5 space-y-3 text-sm">
                            {FOOTER_LINKS.Company.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to!}
                                    className="block text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-400 dark:border-white/[0.06] dark:text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>&copy; {new Date().getFullYear()} PortfolioBuilder.AI</span>
                    <div className="flex gap-4">
                        <Link to="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
                            Terms &amp; Conditions
                        </Link>
                        <Link to="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
