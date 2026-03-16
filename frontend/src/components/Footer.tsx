import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
    return (
        <footer className="py-24 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-block mb-8">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                PortfolioBuilder.AI
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xs text-sm leading-relaxed">
                            The ultimate digital identity engine for modern professionals. Powered by AI, designed by experts.
                        </p>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-8">Product</div>
                        <ul className="space-y-4">
                            {['Features', 'Templates', 'API'].map(item => (
                                <li key={item}><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-8">Legal</div>
                        <ul className="space-y-4">
                            {['Privacy', 'Terms', 'Cookies', 'Security'].map(item => (
                                <li key={item}><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-500 space-y-2">
                        <div>© {new Date().getFullYear()} PortfolioBuilder.AI. All rights reserved.</div>
                        <div className="font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest text-[10px]">Built by HamathOPC Pvt Ltd</div>
                    </div>
                    <div className="flex gap-8">
                        {['Twitter', 'LinkedIn', 'YouTube'].map(item => (
                            <a key={item} href="#" className="text-xs text-gray-500 dark:text-gray-500 hover:text-brand-500 transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
