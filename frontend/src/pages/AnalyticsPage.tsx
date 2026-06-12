import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import PageTransition from '@/components/PageTransition'
import {
    BarChart3, TrendingUp, Users, Monitor, Smartphone, Globe,
    ArrowUpRight, Copy, Check, Target, Repeat, UserCheck,
    AlertTriangle, Zap, Eye, Search,
} from 'lucide-react'

const SEGMENT_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    recruiter: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', icon: <UserCheck className="w-4 h-4" /> },
    professional: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', icon: <BriefcaseIcon className="w-4 h-4" /> },
    peer: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', icon: <Users className="w-4 h-4" /> },
    direct: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', icon: <Zap className="w-4 h-4" /> },
    social: { bg: 'bg-sky-100 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', icon: <Globe className="w-4 h-4" /> },
    search: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', icon: <Search className="w-4 h-4" /> },
    researcher: { bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', icon: <Eye className="w-4 h-4" /> },
    referral: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: <ArrowUpRight className="w-4 h-4" /> },
    bot: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', icon: <AlertTriangle className="w-4 h-4" /> },
    unknown: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', icon: <BarChart3 className="w-4 h-4" /> },
}

function BriefcaseIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> }

export default function AnalyticsPage() {
    const [copied, setCopied] = useState(false)
    const [chartRange, setChartRange] = useState<'7d' | '30d'>('30d')

    const { data: analytics, isLoading, isError } = useQuery({
        queryKey: ['portfolio-analytics-v2'],
        queryFn: () => analyticsApi.getAnalytics().then(r => r.data),
    })

    const copyLink = () => {
        if (!analytics) return
        navigator.clipboard.writeText(`${window.location.origin}/u/${analytics.slug}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
            </div>
        )
    }

    if (isError || !analytics) {
        return (
            <div className="text-center py-20 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analytics Available</h3>
                <p>Publish your portfolio to start tracking visitors.</p>
            </div>
        )
    }

    const dailyViews = chartRange === '7d' ? analytics.daily_views_7d : analytics.daily_views_30d
    const maxViews = Math.max(...dailyViews.map(d => d.views), 1)
    const totalViews30d = analytics.daily_views_30d.reduce((s, d) => s + d.views, 0)

    const segmentColors: Record<string, string> = {
        recruiter: '#7c3aed',
        professional: '#2563eb',
        peer: '#059669',
        direct: '#d97706',
        social: '#0284c7',
        search: '#10b981',
        researcher: '#e11d48',
        referral: '#6b7280',
        bot: '#dc2626',
        unknown: '#9ca3af',
    }

    return (
        <PageTransition className="max-w-6xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-brand-500" />
                        Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Visitor intelligence, intent scoring, and segment breakdown.</p>
                </div>
                {analytics.is_published && (
                    <div className="flex items-center gap-2">
                        <button onClick={copyLink} className="btn-secondary flex items-center gap-2 text-sm">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy link'}
                        </button>
                        <a href={`/u/${analytics.slug}`} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm">
                            View Live <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>

            {/* Top stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Eye className="w-6 h-6" />} label="Total Views" value={analytics.total_views} color="brand" />
                <StatCard icon={<Target className="w-6 h-6" />} label="Avg Intent Score" value={`${analytics.intent.average}`} color="purple" suffix="/100" />
                <StatCard icon={<Repeat className="w-6 h-6" />} label="Repeat Visitors" value={analytics.repeat_visitors} color="amber" />
                <StatCard icon={<UserCheck className="w-6 h-6" />} label="Recruiters (30d)" value={analytics.segments.find(s => s.type === 'recruiter')?.count || 0} color="green" />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart */}
                <div className="card lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <TrendingUp className="w-4 h-4 text-brand-500" />
                            Visitor Trends
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                            <button onClick={() => setChartRange('30d')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartRange === '30d' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>30D</button>
                            <button onClick={() => setChartRange('7d')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartRange === '7d' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>7D</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-1.5">
                        {dailyViews.map((day, i) => {
                            const height = `${Math.max((day.views / maxViews) * 100, 2)}%`
                            const dateObj = new Date(day.date + 'T00:00:00')
                            const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                    <div className="w-full relative h-full flex flex-col justify-end">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                            {day.views} views on {day.date}
                                        </div>
                                        <div
                                            className="w-full rounded-sm transition-all duration-300 bg-brand-500 hover:bg-brand-400"
                                            style={{ height, minHeight: day.views > 0 ? '4px' : '2px' }}
                                        />
                                    </div>
                                    {chartRange === '7d' && (
                                        <span className="text-[9px] text-gray-400 truncate w-full text-center">{label}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 text-center">{totalViews30d} visits in last 30 days</p>
                </div>

                {/* Intent distribution */}
                <div className="card p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Intent Distribution
                    </div>
                    {analytics.intent.total_scored > 0 ? (
                        <div className="space-y-4">
                            <IntentBar label="High" count={analytics.intent.high} total={analytics.intent.total_scored} color="bg-green-500" />
                            <IntentBar label="Medium" count={analytics.intent.medium} total={analytics.intent.total_scored} color="bg-amber-500" />
                            <IntentBar label="Low" count={analytics.intent.low} total={analytics.intent.total_scored} color="bg-red-500" />
                            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Average Score</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{analytics.intent.average}/100</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No scored visits yet</p>
                    )}
                </div>
            </div>

            {/* Segment breakdown + Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitor segments */}
                <div className="card p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        <Users className="w-4 h-4 text-brand-500" />
                        Visitor Segments (30d)
                    </div>
                    {analytics.segments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No visitors yet</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.segments.map(seg => {
                                const sc = SEGMENT_COLORS[seg.type] || SEGMENT_COLORS.unknown
                                const pct = analytics.segments_total > 0 ? Math.round((seg.count / analytics.segments_total) * 100) : 0
                                return (
                                    <div key={seg.type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`p-1.5 rounded-lg ${sc.bg} ${sc.text}`}>{sc.icon}</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{seg.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="font-bold text-gray-900 dark:text-white tabular-nums">{seg.count}</span>
                                            <span className="text-gray-400 w-8 text-right text-xs">{pct}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Referrers */}
                <div className="card p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        <Globe className="w-4 h-4 text-gray-500" />
                        Top Traffic Sources (30d)
                    </div>
                    {analytics.referrers.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No traffic sources yet</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.referrers.map((ref, i) => {
                                const pct = analytics.segments_total > 0 ? Math.round((ref.count / analytics.segments_total) * 100) : 0
                                return (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ref.source === 'Direct' ? 'bg-gray-400' : 'bg-brand-500'}`} />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{ref.source}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm flex-shrink-0">
                                            <span className="font-bold text-gray-900 dark:text-white">{ref.count}</span>
                                            <span className="text-gray-400 w-8 text-right text-xs">{pct}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Device breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 lg:col-span-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        Devices (30d)
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{analytics.devices.desktop}</p>
                                <p className="text-[10px] text-gray-500">Desktop</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-fuchsia-100 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{analytics.devices.mobile}</p>
                                <p className="text-[10px] text-gray-500">Mobile</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

function StatCard({ icon, label, value, color, suffix }: {
    icon: React.ReactNode; label: string; value: string | number; color: string; suffix?: string
}) {
    const colors: Record<string, string> = {
        brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    }
    return (
        <div className="card flex items-center gap-4 p-5 overflow-hidden relative">
            <div className={`p-3 rounded-2xl ${colors[color] || colors.brand}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
                    {value}{suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}
                </p>
            </div>
        </div>
    )
}

function IntentBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
                <span className="text-gray-900 dark:text-white font-bold tabular-nums">{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}
