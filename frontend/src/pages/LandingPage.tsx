import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Globe, Palette, Edit3, CheckCircle, Briefcase, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const features = [
    { icon: Zap, title: 'AI-Powered Parsing', desc: 'Upload your resume and our Groq LLM instantly extracts and structures your data.' },
    { icon: Palette, title: '4 Beautiful Themes', desc: 'Choose from Minimal, Corporate, Developer, or Creative themes.' },
    { icon: Edit3, title: 'Live Editor', desc: 'Edit every section inline. Change colors, toggle sections, and preview instantly.' },
    { icon: Globe, title: 'Publish Instantly', desc: 'Get a unique public URL like yourapp.com/u/your-name in one click.' },
]

const steps = [
    { num: '01', title: 'Upload Resume', desc: 'PDF or DOCX, up to 5MB.' },
    { num: '02', title: 'AI Generates Portfolio', desc: 'Groq LLM extracts and enhances your data.' },
    { num: '03', title: 'Edit & Customize', desc: 'Tweak content, pick a theme, change colors.' },
    { num: '04', title: 'Publish & Share', desc: 'Get your public URL and share it everywhere.' },
]

export default function LandingPage() {
    const { theme, toggleTheme, token } = useAuthStore()

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">Resume2Portfolio</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="btn-ghost p-2">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {token ? (
                            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">Sign In</Link>
                                <Link to="/register" className="btn-primary">Get Started <ArrowRight className="w-4 h-4" /></Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-1.5 text-sm text-brand-600 dark:text-brand-400 mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            Powered by Groq AI (llama3-70b)
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            Turn your resume into a{' '}
                            <span className="gradient-text">stunning portfolio</span>
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                            Upload your resume. AI extracts your data, generates a beautiful portfolio website, and publishes it with a unique URL — in under 60 seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn-primary text-base px-8 py-3">
                                Build My Portfolio <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/u/demo" className="btn-secondary text-base px-8 py-3">
                                View Demo Portfolio
                            </Link>
                        </div>
                    </motion.div>

                    {/* Hero visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 shadow-2xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="ml-2 text-xs text-gray-400 font-mono">resume2portfolio.ai/u/john-doe</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-left">
                            <div className="col-span-1 space-y-3">
                                <div className="skeleton h-4 w-3/4" />
                                <div className="skeleton h-3 w-full" />
                                <div className="skeleton h-3 w-2/3" />
                                <div className="mt-4 space-y-2">
                                    {['React', 'Python', 'FastAPI', 'PostgreSQL'].map(s => (
                                        <span key={s} className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mr-1">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2 space-y-3">
                                <div className="skeleton h-4 w-1/2" />
                                <div className="skeleton h-3 w-full" />
                                <div className="skeleton h-3 w-full" />
                                <div className="skeleton h-3 w-3/4" />
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                            <div className="skeleton h-3 w-2/3 mb-2" />
                                            <div className="skeleton h-2 w-full" />
                                            <div className="skeleton h-2 w-3/4 mt-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
                        <p className="text-gray-500 dark:text-gray-400">A complete platform to build and publish your professional portfolio.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="card hover:shadow-md transition-shadow"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <h3 className="font-semibold mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">How it works</h2>
                        <p className="text-gray-500 dark:text-gray-400">From resume to published portfolio in 4 simple steps.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {steps.map(({ num, title, desc }) => (
                            <div key={num} className="flex gap-4">
                                <div className="text-3xl font-black text-brand-200 dark:text-brand-900 w-12 flex-shrink-0">{num}</div>
                                <div>
                                    <h3 className="font-semibold mb-1">{title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-brand-500">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to stand out?</h2>
                    <p className="text-brand-100 mb-8">Join thousands of professionals who built their portfolio in minutes.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition-colors">
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
                © 2026 Resume2Portfolio AI. Built with FastAPI + React + Groq.
            </footer>
        </div>
    )
}
