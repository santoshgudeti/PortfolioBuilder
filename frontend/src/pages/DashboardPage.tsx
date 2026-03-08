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
            <div className="mb-10">
                <h1 className="uppercase">
                    Welcome Back, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
                    {hasPortfolio ? 'Your professional brand is active. Ready to elevate further?' : 'Transform your professional story into a stunning digital home.'}
                </p>
            </div>

            {/* Status card */}
            <div className={`card mb-8 border-l-4 overflow-hidden relative ${hasPortfolio ? 'border-l-brand-500' : 'border-l-amber-500'}`}>
                {hasPortfolio && (
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 blur-3xl rounded-full" />
                )}
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasPortfolio ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-500 shadow-sm' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-500'}`}>
                        {hasPortfolio ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-950 dark:text-white text-lg tracking-tight uppercase">
                            {hasPortfolio ? 'Digital Presence Active' : 'Setup Required'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {hasPortfolio
                                ? `Live at: folioai.com/u/${data.slug}`
                                : 'Upload your history to claim your URL'}
                        </p>
                    </div>
                    {hasPortfolio && data?.is_published && (
                        <a
                            href={`/u/${data.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-100 dark:bg-white/5 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Globe className="w-3.5 h-3.5" /> View Portfolio
                        </a>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link to="/upload" className="group relative card p-8 overflow-hidden border-0 bg-white dark:bg-white/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors" />
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <Upload className="w-7 h-7 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 text-xl tracking-tight uppercase">Upload History</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-6">Import your professional story and let AI curate your brand</p>
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest mt-auto">
                        New Generation <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link to="/editor" className="group relative card p-8 overflow-hidden border-0 bg-white dark:bg-white/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <Edit3 className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 text-xl tracking-tight uppercase">Aesthetics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-6">Fine-tune your narrative, colors, and layout templates</p>
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest mt-auto">
                        Launch Designer <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {hasPortfolio && (
                    <a href={`/u/${data?.slug}`} target="_blank" rel="noopener noreferrer" className="group relative card p-8 overflow-hidden border-0 bg-white dark:bg-white/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <Eye className="w-7 h-7 text-green-600 dark:text-green-400 group-hover:text-white" />
                        </div>
                        <h3 className="font-black text-gray-900 dark:text-white mb-2 text-xl tracking-tight uppercase">Public View</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-6">Experience your identity exactly as recruiters see it</p>
                        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest mt-auto">
                            Visit Site <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
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
                    <div className="card bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-white/5">
                        <h2 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs border-b border-gray-100 dark:border-white/5 pb-4">Brand Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Skills Identified', value: pd.skills?.length || 0 },
                                { label: 'Projects Featured', value: pd.projects?.length || 0 },
                                { label: 'Experience Nodes', value: pd.experience?.length || 0 },
                                { label: 'Layout Theme', value: data.theme.toUpperCase() },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center">
                                    <p className="text-3xl font-black text-brand-500 dark:text-brand-500 tracking-tighter">{value}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 font-black uppercase tracking-widest leading-none">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })()}
        </PageTransition>
    )
}
