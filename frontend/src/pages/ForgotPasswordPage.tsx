import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        try {
            await authApi.forgotPassword(email)
            setSent(true)
            toast.success('Reset link sent! Check your inbox.')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    {sent ? (
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                If <strong>{email}</strong> is registered, you'll receive a password reset link. Check your inbox (and spam folder).
                            </p>
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                ← Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <Mail className="w-12 h-12 mx-auto mb-3 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-500 flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
