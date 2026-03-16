import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
    return (
        <footer className="py-24 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-block mb-8 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
                            <img 
                                src="/assets/branding/logo_light.png" 
                                alt="PortfolioBuilder.AI" 
                                className="h-8 w-auto object-contain dark:hidden"
                            />
                            <img 
                                src="/assets/branding/logo_dark.png" 
                                alt="PortfolioBuilder.AI" 
                                className="h-8 w-auto object-contain hidden dark:block"
                            />
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xs text-sm leading-relaxed text-pretty">
                            The ultimate digital identity engine for modern professionals. Powered by AI, designed by experts.
                        </p>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-8">Product</div>
                        <ul className="space-y-4">
                            {['Features', 'Templates', 'API'].map(item => (
                                <li key={item}><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-[color,transform] focus-visible:text-brand-500 outline-none">{item}</a></li>
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
                        <div>© <span className="tabular-nums">{new Date().getFullYear()}</span> portfolio.hamathopc.in. All rights reserved.</div>
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
