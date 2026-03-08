import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Gavel, Scale, AlertCircle } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pb-20">
            <Helmet>
                <title>Terms of Service — FolioAI</title>
                <meta name="description" content="Terms of Service for FolioAI. Rules and guidelines for using our AI portfolio builder." />
            </Helmet>

            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand-500 transition-colors" />
                        <span className="font-bold text-sm">Back to Home</span>
                    </Link>
                    <span className="font-black text-xl tracking-tighter">FolioAI</span>
                </div>
            </nav>

            <div className="pt-32 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-balance">Terms of Service</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">Last Updated: March 8, 2026</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Scale className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2">Fair Usage</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">We provide FolioAI for professional use. Please do not use the platform for spam or hosting illegal content.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <AlertCircle className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2">Content Responsibility</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">You are responsible for the accuracy of the information provided in your portfolio.</p>
                        </div>
                    </div>

                    <article className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-brand-500" />
                                1. Acceptance of Terms
                            </h2>
                            <p>By accessing or using FolioAI, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. User Accounts</h2>
                            <p>When you create an account, you must provide accurate and complete information. You are responsible for maintaining the security of your account and are fully responsible for all activities that occur under the account.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Content Ownership</h2>
                            <p>You retain all rights to the content you upload or create on FolioAI. By publishing a portfolio, you grant us a worldwide, non-exclusive, royalty-free license to host and display your content for the purpose of providing the service.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Limitations of Liability</h2>
                            <p>FolioAI is provided "as is". We make no warranties regarding the accuracy of AI-generated content or the availability of the service. In no event shall FolioAI be liable for any indirect, incidental, or consequential damages.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Termination</h2>
                            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.</p>
                        </section>
                    </article>
                </motion.div>
            </div>
        </div>
    )
}
