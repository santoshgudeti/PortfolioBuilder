import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { portfolioApi } from '@/api/portfolio'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useEffect, useState } from 'react'
import { Upload, Globe, Edit3, Eye, CheckCircle, AlertCircle, ArrowRight, Mail } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import toast from 'react-hot-toast'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { setPortfolio } = usePortfolioStore()
    const [resending, setResending] = useState(false)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
    })

    useEffect(() => {
        if (data) {
            setPortfolio({
                portfolioId: data.id,
                slug: data.slug,
                parsedData: JSON.parse(data.parsed_data || '{}'),
                theme: data.theme,
                primaryColor: data.primary_color,
                isPublished: data.is_published,
            })
        }
    }, [data, setPortfolio])

    const hasPortfolio = !!data && !isError
    const showVerificationBanner = user && !user.is_verified && user.auth_provider === 'email'

    const handleResendVerification = async () => {
        if (!user) return
        setResending(true)
        try {
            await authApi.resendVerification(user.email)
            toast.success('Verification email sent! Check your inbox.')
        } catch {
            toast.error('Failed to send verification email.')
        } finally {
            setResending(false)
        }
    }

    return (
        <PageTransition className="max-w-4xl mx-auto">
            {/* Email Verification Banner */}
            {showVerificationBanner && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            <strong>Verify your email</strong> to generate portfolios. Check your inbox for the verification link.
                        </p>
                    </div>
                    <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 whitespace-nowrap underline"
                    >
                        {resending ? 'Sending...' : 'Resend'}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Good morning, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {hasPortfolio ? 'Your portfolio is ready. Keep it updated!' : 'Upload your resume to generate your portfolio.'}
                </p>
            </div>

            {/* Status card */}
            <div className={`card mb-6 border-l-4 ${hasPortfolio ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                <div className="flex items-center gap-3">
                    {hasPortfolio ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                            {hasPortfolio ? 'Portfolio Generated' : 'No Portfolio Yet'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {hasPortfolio
                                ? `Published at: ${data?.is_published ? `yourapp.com/u/${data.slug}` : 'Not published yet'}`
                                : 'Upload your resume to get started'}
                        </p>
                    </div>
                    {hasPortfolio && data?.is_published && (
                        <a
                            href={`/u/${data.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs"
                        >
                            <Globe className="w-3.5 h-3.5" /> View Live
                        </a>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {!hasPortfolio ? (
                    <Link to="/upload" className="card hover:shadow-glow transition-all hover:border-brand-300 dark:hover:border-brand-700 group">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Portfolio</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upload PDF or DOCX to generate your portfolio</p>
                        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium mt-3">
                            Start <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                ) : (
                    <Link to="/settings" className="card hover:shadow-glow transition-all hover:border-blue-300 dark:hover:border-blue-700 group">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Portfolio Active</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your connected account settings</p>
                        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium mt-3">
                            Settings <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                )}

                <Link to="/editor" className="card hover:shadow-glow-purple transition-all hover:border-purple-300 dark:hover:border-purple-700 group">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Edit Portfolio</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customize content, theme, and colors</p>
                    <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium mt-3">
                        Edit <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </Link>

                {hasPortfolio && (
                    <a href={`/u/${data?.slug}`} target="_blank" rel="noopener noreferrer" className="card hover:shadow-glow transition-all hover:border-green-300 dark:hover:border-green-700 group">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Preview Portfolio</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">See how your portfolio looks to visitors</p>
                        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium mt-3">
                            Preview <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </a>
                )}
            </div>

            {/* Portfolio details */}
            {isLoading && (
                <div className="card">
                    <div className="space-y-3">
                        <div className="skeleton h-4 w-1/3" />
                        <div className="skeleton h-3 w-full" />
                        <div className="skeleton h-3 w-2/3" />
                    </div>
                </div>
            )}

            {hasPortfolio && (() => {
                const pd = JSON.parse(data.parsed_data || '{}')
                return (
                    <div className="card">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Portfolio Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Skills', value: pd.skills?.length || 0 },
                                { label: 'Projects', value: pd.projects?.length || 0 },
                                { label: 'Experience', value: pd.experience?.length || 0 },
                                { label: 'Theme', value: data.theme },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })()}
        </PageTransition>
    )
}
