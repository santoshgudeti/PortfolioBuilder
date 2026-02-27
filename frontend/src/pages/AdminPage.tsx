import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import {
    Users, Globe, Eye, TrendingUp, Search, CheckCircle2,
    Shield, ExternalLink, Loader2, BarChart3
} from 'lucide-react'

export default function AdminPage() {
    const [search, setSearch] = useState('')

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => apiClient.get('/admin/stats').then(r => r.data),
    })

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users', search],
        queryFn: () => apiClient.get(`/admin/users?search=${search}`).then(r => r.data),
    })

    const { data: portfolios } = useQuery({
        queryKey: ['admin-portfolios'],
        queryFn: () => apiClient.get('/admin/portfolios').then(r => r.data),
    })

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Verified', value: stats?.verified_users || 0, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
        { label: 'Portfolios', value: stats?.total_portfolios || 0, icon: Globe, color: 'text-purple-500 bg-purple-500/10' },
        { label: 'Published', value: stats?.published_portfolios || 0, icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10' },
        { label: 'Total Views', value: stats?.total_views || 0, icon: Eye, color: 'text-pink-500 bg-pink-500/10' },
    ]

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Platform overview and user management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map(s => (
                    <div key={s.label} className="card flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Portfolios */}
                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Top Portfolios
                    </h2>
                    {stats?.top_portfolios?.length ? (
                        <div className="space-y-2">
                            {stats.top_portfolios.map((p: any, i: number) => (
                                <div key={p.slug} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                                        <a href={`/u/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-500 hover:underline flex items-center gap-1">
                                            {p.slug} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No views yet</p>
                    )}
                </div>

                {/* Daily Signups */}
                <div className="card lg:col-span-2">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Signups (Last 7 Days)
                    </h2>
                    {stats?.daily_signups?.length ? (
                        <div className="flex items-end gap-1 h-32">
                            {stats.daily_signups.map((d: any) => {
                                const max = Math.max(...stats.daily_signups.map((x: any) => x.count), 1)
                                const h = Math.max((d.count / max) * 100, 4)
                                return (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-gray-500">{d.count}</span>
                                        <div className="w-full rounded-t-lg bg-brand-500/80 transition-all" style={{ height: `${h}%` }} />
                                        <span className="text-[10px] text-gray-500 truncate w-full text-center">{d.date.slice(5)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No signups in the last 7 days</p>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4" /> Users ({users?.length || 0})
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input pl-9 text-sm w-full sm:w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
                            ) : users?.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No users found</td></tr>
                            ) : (
                                users?.map((u: any) => (
                                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 text-xs font-bold">
                                                        {u.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className={`text-xs px-2 py-1 rounded-full ${u.auth_provider === 'google' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {u.auth_provider}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex gap-1.5">
                                                {u.is_verified && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">verified</span>}
                                                {u.is_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">admin</span>}
                                                {!u.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">disabled</span>}
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Portfolios */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Portfolios ({portfolios?.length || 0})
                </h2>
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Theme</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Views</th>
                                <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolios?.map((p: any) => (
                                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-3 px-5">
                                        <a href={`/u/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline flex items-center gap-1 font-mono text-sm">
                                            {p.slug} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary_color || '#6366f1' }} />
                                            <span className="text-gray-600 dark:text-gray-400 capitalize">{p.theme}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5">
                                        <span className={`text-xs px-2 py-1 rounded-full ${p.is_published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {p.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-5 text-gray-400">{p.view_count}</td>
                                    <td className="py-3 px-5 text-xs text-gray-400 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
