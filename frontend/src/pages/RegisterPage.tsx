import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { Briefcase, Eye, EyeOff, Loader2, Mail, CheckCircle2, RefreshCw } from 'lucide-react'
import GoogleSignInBox from '@/components/GoogleSignInBox'

interface FormData { name: string; email: string; password: string; confirm: string }

export default function RegisterPage() {
    const navigate = useNavigate()
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [registered, setRegistered] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const [resending, setResending] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            await authApi.register({ name: data.name, email: data.email, password: data.password })
            setRegisteredEmail(data.email)
            setRegistered(true)
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        try {
            await authApi.resendVerification(registeredEmail)
            toast.success('Verification email resent! Check your inbox.')
        } catch {
            toast.error('Failed to resend. Please try again.')
        } finally {
            setResending(false)
        }
    }

    // ── Email sent confirmation screen ──
    if (registered) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="card">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Check your inbox!</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    We've sent a verification link to<br />
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{registeredEmail}</span>
                                </p>
                            </div>

                            <div className="w-full p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 text-left space-y-2">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Open the email from <strong>Resume2Portfolio</strong></span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Click <strong>"Verify my email"</strong></span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Log in and start building your portfolio 🚀</span>
                                </div>
                            </div>

                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {resending ? 'Resending...' : "Didn't receive it? Resend"}
                            </button>

                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary w-full"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Check your spam folder if you don't see it.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Build your portfolio in minutes</p>
                </div>

                <div className="card">
                    <GoogleSignInBox />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label mb-1.5">Full Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="John Doe"
                                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="label mb-1.5">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
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
                                    placeholder="Min 8 characters"
                                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="label mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                {...register('confirm', {
                                    required: 'Please confirm your password',
                                    validate: (v) => v === watch('password') || 'Passwords do not match',
                                })}
                            />
                            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
