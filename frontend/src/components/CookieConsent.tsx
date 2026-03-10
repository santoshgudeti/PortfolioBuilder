import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X } from 'lucide-react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('folioai-cookie-consent')
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('folioai-cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('folioai-cookie-consent', 'declined')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-md"
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-6 h-6 text-brand-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">We value your privacy</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                                </p>
                            </div>
                            <button onClick={handleDecline} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/20"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-bold py-2.5 rounded-xl transition-all"
                            >
                                Reject Non-Essential
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 text-center">
                            Read our <a href="/privacy" className="underline hover:text-brand-500">Privacy Policy</a> to learn more.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
