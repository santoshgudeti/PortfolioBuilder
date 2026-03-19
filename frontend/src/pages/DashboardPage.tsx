import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { portfolioApi } from '@/api/portfolio'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useEffect, useState } from 'react'
import { Upload, Edit3, Eye, CheckCircle, AlertCircle, ArrowRight, Mail, Settings2 } from 'lucide-react'
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
                templateId: data.template_id || 'standard',
                mode: data.mode || 'light',
                primaryColor: data.primary_color,
                isPublished: data.is_published,
                customDomain: data.custom_domain,
            })
        }
    }, [data, setPortfolio])

    const hasPortfolio = !!data && !isError
    const showVerificationBanner = user && !user.is_verified && user.auth_provider === 'email'
    const firstName = user?.name?.split(' ')?.[0] || 'there'

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

    const pd = hasPortfolio ? JSON.parse(data.parsed_data || '{}') : null
    const isConfigured =
        !!data?.template_id &&
        !!data?.mode &&
        !!data?.primary_color &&
        // “configured” means the user changed something from the defaults OR set a custom domain
        (data.template_id !== 'standard' || data.mode !== 'light' || data.primary_color !== '#6366f1' || !!data.custom_domain)

    const nextSteps = [
        {
            key: 'upload',
            title: 'Upload your resume',
            done: hasPortfolio,
            to: '/upload',
        },
        {
            key: 'review',
            title: 'Review and edit content',
            done: !!pd && ((pd.summary && pd.summary.trim().length > 0) || (pd.projects?.length || 0) > 0),
            to: '/editor',
        },
        {
            key: 'design',
            title: 'Choose template and colors',
            done: isConfigured,
            to: '/editor',
        },
        {
            key: 'share',
            title: 'Share your link',
            done: hasPortfolio,
            to: '/editor',
        },
    ] as const

    const completedCount = nextSteps.filter(s => s.done).length
    const totalCount = nextSteps.length

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
            <div className="mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white">
                    Welcome back, {firstName}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {hasPortfolio ? 'Finish setup and publish to make it public.' : 'Upload your resume to generate your portfolio.'}
                </p>
            </div>

            {/* Next steps */}
            <div className="card mb-8 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-950 dark:text-white">
                            Next steps
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {completedCount}/{totalCount} complete
                        </p>
                    </div>
                    {hasPortfolio ? (
                        <div className="flex items-center gap-2">
                            <a
                                href={`/u/${data.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary px-4 py-2 text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                View
                            </a>
                            <Link to="/editor" className="btn-secondary px-4 py-2 text-sm">
                                <Settings2 className="w-4 h-4" />
                                Customize
                            </Link>
                        </div>
                    ) : (
                        <Link to="/upload" className="btn-brand px-4 py-2 text-sm">
                            <Upload className="w-4 h-4" />
                            Upload resume
                        </Link>
                    )}
                </div>

                <div className="mt-4 space-y-2">
                    {nextSteps.map((step) => (
                        <div key={step.key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-white/10 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {step.done ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium text-gray-950 dark:text-white truncate">
                                    {step.title}
                                </p>
                            </div>
                            <Link to={step.to} className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap">
                                {step.done ? 'Review' : 'Do this'}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status card */}
            <div className={`card mb-8 border-l-4 ${hasPortfolio ? 'border-l-brand-500' : 'border-l-amber-500'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasPortfolio ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400'}`}>
                        {hasPortfolio ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-950 dark:text-white text-base sm:text-lg">
                            {hasPortfolio ? 'Live' : 'No portfolio yet'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {hasPortfolio
                                ? `URL: /u/${data.slug}`
                                : 'Upload your resume to generate your portfolio.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link to="/upload" className="card p-6 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-950 dark:text-white">Upload resume</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Generate or update your portfolio from your latest resume.</p>
                        </div>
                        <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                    </div>
                    <div className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-2">
                        Continue <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </div>
                </Link>

                <Link to="/editor" className="card p-6 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-950 dark:text-white">Edit and design</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Adjust content, template, colors, and sections.</p>
                        </div>
                        <Edit3 className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                    </div>
                    <div className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-2">
                        Open editor <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </div>
                </Link>

                {hasPortfolio && (
                    <a href={`/u/${data?.slug}`} target="_blank" rel="noopener noreferrer" className="card p-6 hover:shadow-md">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-gray-950 dark:text-white">Preview public link</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Open your portfolio in a new tab.
                                </p>
                            </div>
                            <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                        </div>
                        <div className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-2">
                            Open <ArrowRight className="w-4 h-4" aria-hidden="true" />
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

            {hasPortfolio && pd && (
                <div className="card p-6">
                    <h2 className="text-base font-semibold text-gray-950 dark:text-white mb-4">Portfolio summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Skills', value: pd.skills?.length || 0 },
                            { label: 'Projects', value: pd.projects?.length || 0 },
                            { label: 'Experience', value: pd.experience?.length || 0 },
                            { label: 'Template', value: data.template_id || 'standard' },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-lg border border-gray-200 dark:border-white/10 p-4">
                                <p className="text-lg font-semibold text-gray-950 dark:text-white tabular-nums">{value}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PageTransition>
    )
}
