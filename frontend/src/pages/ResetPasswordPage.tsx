import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        if (!token) {
            toast.error('Invalid reset link')
            return
        }

        setLoading(true)
        try {
            await authApi.resetPassword(token, password)
            setSuccess(true)
            toast.success('Password reset successfully!')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Reset failed. The link may have expired.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <PageTransition>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                    <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                        <Lock className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <button onClick={() => navigate('/forgot-password')} className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Request a new link
                        </button>
                    </div>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    {success ? (
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your password has been updated. You can now log in.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <Lock className="w-12 h-12 mx-auto mb-3 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a strong password for your account.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
