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
                    <p className="text-gray-500 dark:text-gray-400 mb-12">Last Updated: March 8, 2026</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Lock className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Data Encryption</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">All your data is encrypted at rest and in transit using industry-standard protocols.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Eye className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Transparency</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">We are clear about what data we collect and why we need it to build your portfolio.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Shield className="w-6 h-6 text-brand-500 mb-4" />
                            <h3 className="font-bold mb-2 text-sm">Your Rights</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">You have full control over your data, including the right to delete or export it at any time.</p>
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
                                <li><strong>Personal Details:</strong> Name, email address, and profile picture (via Google Sign-In or manual upload).</li>
                                <li><strong>Resume Data:</strong> Professional experience, education, skills, and projects extracted from your uploaded files.</li>
                                <li><strong>Portfolio Content:</strong> Any edits or additional information you provide through our visual editor.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                            <p>We use the data we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Generate and host your personal portfolio website.</li>
                                <li>Improve our AI parsing algorithms for better resume extraction.</li>
                                <li>Provide customer support and respond to your inquiries.</li>
                                <li>Track website performance and usage via anonymized analytics.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Retention & Deletion (GDPR)</h2>
                            <p>In accordance with GDPR, you have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Right to Access:</strong> You can view all processed data in your dashboard.</li>
                                <li><strong>Right to Rectification:</strong> You can edit any information using our live editor.</li>
                                <li><strong>Right to Erasure:</strong> You can delete your account and all associated data from your settings page instantly.</li>
                                <li><strong>Right to Data Portability:</strong> You can export your portfolio data via our API or settings dashboard.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Third-Party Services</h2>
                            <p>We use the following third-party processors to provide our services:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Groq AI:</strong> For processing and enhancing resume text.</li>
                                <li><strong>AWS / DigitalOcean:</strong> For secure database and file storage.</li>
                                <li><strong>Google OAuth:</strong> For secure authentication.</li>
                            </ul>
                        </section>
                    </article>

                    <div className="mt-16 p-8 rounded-3xl bg-brand-500/5 border border-brand-500/20 text-center">
                        <h2 className="text-xl font-bold mb-4">Questions about your privacy?</h2>
                        <p className="text-sm text-gray-500 mb-6">If you have any questions about this Privacy Policy, please reach out to our data protection officer.</p>
                        <a href="mailto:privacy@portfoliobuilder.ai" className="btn-primary">Contact Privacy Team</a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
