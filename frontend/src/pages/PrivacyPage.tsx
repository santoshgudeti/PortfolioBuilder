import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pb-20">
            <Helmet>
                <title>Privacy Policy — PortfolioBuilder.AI</title>
                <meta name="description" content="Privacy Policy for PortfolioBuilder.AI. Learn how we collect, use, and protect your personal data." />
            </Helmet>

            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand-500 transition-colors" />
                        <span className="font-bold text-sm">Back to Home</span>
                    </Link>
                    <span className="font-black text-xl tracking-tighter">
                        PortfolioBuilder<span className="bg-gradient-to-r from-brand-500 to-indigo-500 text-transparent bg-clip-text">.AI</span>
                    </span>
                </div>
            </nav>

            <div className="pt-32 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">Last Updated: March 16, 2026</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Lock className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Data Encryption</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">All your data is encrypted at rest and in transit using industry-standard protocols including TLS and AES-256.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Eye className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Transparency</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">We are clear about what data we collect and why we need it to build your portfolio. We do not sell your personal data.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Shield className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Your Rights</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">You have full control over your data, including the right to delete, export, or rectify it at any time via your settings.</p>
                        </div>
                    </div>

                    <article className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-500" />
                                1. Information We Collect
                            </h2>
                            <p>We collect information that you provide directly to us when you create an account, upload a resume, or contact us. This includes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Account Details:</strong> Name and email address. If using Google Sign-In, we collect your basic profile information (name, email, profile picture).</li>
                                <li><strong>Professional Data:</strong> Experience, education, skills, and projects extracted from your uploaded resume.</li>
                                <li><strong>Usage Information:</strong> IP address, browser type, and interactions with our platform to improve service quality and detect fraud.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Key Data Rights (GDPR)</h2>
                            <p>For users in the European Economic Area (EEA), you have the following rights under the GDPR:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Right to be Forgotten:</strong> You can delete your account and all associated data instantly in your account settings.</li>
                                <li><strong>Right to Portability:</strong> You can download a machine-readable copy of your personal data at any time.</li>
                                <li><strong>Right to Object:</strong> You can withdraw your consent for data processing by deleting your account.</li>
                                <li><strong>Right to Access:</strong> You can request a summary of the data we hold about you.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Third-Party Processors</h2>
                            <p>We work with the following trusted partners to deliver our service:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Groq AI:</strong> For processing and summarizing resume text using advanced LLMs.</li>
                                <li><strong>AWS/Vercel:</strong> For secure cloud hosting and static asset delivery.</li>
                                <li><strong>Google OAuth:</strong> For secure, passwordless authentication.</li>
                            </ul>
                        </section>
                    </article>

                    <div className="mt-16 p-8 rounded-3xl bg-brand-500/5 border border-brand-500/20 text-center">
                        <h2 className="text-xl font-bold mb-4">Privacy Questions?</h2>
                        <p className="text-sm text-gray-500 mb-6">If you have any questions about your data or wish to exercise your rights, please contact our Data Protection Officer.</p>
                        <a href="mailto:support@portfoliobuilder.ai" className="btn-primary">Contact support@portfoliobuilder.ai</a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
