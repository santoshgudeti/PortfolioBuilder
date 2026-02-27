import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import PageTransition from '@/components/PageTransition'
import { BarChart3, TrendingUp, Users, Monitor, Smartphone, Globe, ArrowUpRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsPage() {
    const [copied, setCopied] = useState(false)
    const { data: analytics, isLoading, isError } = useQuery({
        queryKey: ['portfolio-analytics'],
        queryFn: () => analyticsApi.getAnalytics().then(res => res.data),
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        )
    }

    if (isError || !analytics) {
        return (
            <div className="text-center py-20 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analytics Available</h3>
                <p>Generate and publish your portfolio to start tracking views.</p>
            </div>
        )
    }

    const { total_views, daily_views, referrers, devices, slug } = analytics
    const maxViews = Math.max(...daily_views.map(d => d.views), 1)

    return (
        <PageTransition className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your portfolio's performance</p>
                </div>
                {analytics.is_published && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyLink}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy link'}
                        </button>
                        <a
                            href={`/u/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex items-center gap-2"
                        >
                            View Live <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{total_views}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Desktop Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.desktop}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.mobile}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-medium">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        Views (Last 7 Days)
                    </div>

                    <div className="h-64 flex items-end gap-2 mt-4 px-2">
                        {daily_views.map((day, i) => {
                            const height = `${(day.views / maxViews) * 100}%`
                            const dateObj = new Date(day.date)
                            const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative h-full flex flex-col justify-end">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {day.views} views<br />
                                            <span className="text-gray-400">{day.date}</span>
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full bg-brand-500 hover:bg-brand-400 rounded-t-sm transition-all duration-500 ease-out"
                                            style={{ height: day.views > 0 ? height : '2px', minHeight: '2px' }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 truncate w-full text-center">{label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Top Traffic Sources */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-medium">
                        <Globe className="w-5 h-5 text-gray-400" />
                        Top Traffic Sources
                    </div>

                    {referrers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            No traffic sources recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {referrers.map((ref, i) => {
                                const percent = Math.round((ref.count / total_views) * 100)
                                return (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            {ref.source === 'Direct' ? (
                                                <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                                            )}
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                {ref.source}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm flex-shrink-0">
                                            <span className="font-medium text-gray-900 dark:text-white">{ref.count}</span>
                                            <span className="text-gray-400 w-8 text-right">{percent}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
