import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Home, LayoutDashboard, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-[#050505]">
            <Helmet>
                <title>Page Not Found — FolioAI</title>
                <meta name="description" content="The page you're looking for doesn't exist. Head back to FolioAI to build your AI-powered portfolio." />
                <meta name="robots" content="noindex" />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h1 className="mb-2 text-9xl font-black tracking-tighter bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                    404
                </h1>
                <p className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    This page doesn't exist
                </p>
                <p className="mb-10 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    The page you're looking for may have been moved or deleted. Let's get you back on track.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        <Home className="w-4 h-4" /> Go Home
                    </Link>
                    <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
