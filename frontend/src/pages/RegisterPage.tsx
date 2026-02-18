import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react'

interface FormData { name: string; email: string; password: string; confirm: string }

export default function RegisterPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const res = await authApi.register({ name: data.name, email: data.email, password: data.password })
            setAuth(res.data.access_token, res.data.user)
            toast.success('Account created! Upload your resume to get started.')
            navigate('/upload')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
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
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
