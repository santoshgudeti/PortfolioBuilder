import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { Briefcase, Eye, EyeOff, Loader2, MailWarning, RefreshCw } from 'lucide-react'
import GoogleSignInBox from '@/components/GoogleSignInBox'

interface FormData { email: string; password: string }

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
    const [resending, setResending] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setUnverifiedEmail(null)
        try {
            const res = await authApi.login(data)
            setAuth(res.data.access_token, res.data.user)
            toast.success(`Welcome back, ${res.data.user.name}! 👋`)
            
            // If we have guest data, go back to editor to save it
            const hasGuestData = usePortfolioStore.getState().parsedData && usePortfolioStore.getState().isGuest
            navigate(hasGuestData ? '/editor' : '/dashboard')
        } catch (err: any) {
            const detail = err.response?.data?.detail || 'Login failed'
            // Detect unverified email error
            if (detail.includes('verify your email')) {
                setUnverifiedEmail(data.email)
            } else if (detail.includes('sign up')) {
                toast.error(detail, {
                    icon: '👤',
                    duration: 4000,
                })
            } else {
                toast.error(detail)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!unverifiedEmail) return
        setResending(true)
        try {
            await authApi.resendVerification(unverifiedEmail)
            toast.success('Verification email resent! Check your inbox.')
        } catch {
            toast.error('Failed to resend. Please try again.')
        } finally {
            setResending(false)
        }
    }

    const email = watch('email')

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                        <span className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                            PortfolioBuilder<span className="text-gray-400">.AI</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Welcome back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to your PortfolioBuilder.AI account</p>
                </div>

                <div className="card">
                    <GoogleSignInBox />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">Or continue with email</span>
                        </div>
                    </div>

                    {/* Unverified email inline alert */}
                    {unverifiedEmail && (
                        <div className="mb-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3">
                            <MailWarning className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Email not verified</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                    Please check <span className="font-medium">{unverifiedEmail}</span> and click the verification link.
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                                >
                                    {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                    {resending ? 'Sending...' : 'Resend verification email'}
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label mb-1.5">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                autoComplete="email"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...register('password', { required: 'Password is required' })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            <div className="text-right mt-1">
                                <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full mt-2 btn-primary py-2.5">
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
