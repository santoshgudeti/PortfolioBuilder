import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import toast from 'react-hot-toast'
import {
    Users, Globe, Eye, TrendingUp, Search, CheckCircle2,
    Shield, ExternalLink, Loader2, BarChart3, Ban, CheckCircle, Trash2, PowerOff,
    History, MoreVertical, LayoutDashboard, Database, ShieldAlert, ShieldCheck,
    Cpu, HardDrive, Zap, Info, RefreshCcw
} from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

type Tab = 'dashboard' | 'users' | 'portfolios' | 'logs' | 'system'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard')
    const [search, setSearch] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([])
    
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean,
        title: string,
        message: string,
        confirmText: string,
        isDestructive: boolean,
        onConfirm: () => void
    }>({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', isDestructive: true, onConfirm: () => { }
    })

    const openConfirm = (title: string, message: string, confirmText: string, isDestructive: boolean, onConfirm: () => void) => {
        setConfirmState({ isOpen: true, title, message, confirmText, isDestructive, onConfirm })
    }

    const closeConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }))
    }

    const queryClient = useQueryClient()

    // --- Queries ---
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

    const { data: logs } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: () => apiClient.get('/admin/logs').then(r => r.data),
        enabled: activeTab === 'logs'
    })

    const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
        queryKey: ['admin-system-health'],
        queryFn: () => apiClient.get('/admin/system/health').then(r => r.data),
        enabled: activeTab === 'system',
        refetchInterval: activeTab === 'system' ? 30000 : false // auto-refresh every 30s when on system tab
    })

    // --- Mutations ---
    const toggleUserMutation = useMutation({
        mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/toggle-active`),
        onSuccess: () => {
            toast.success('User status updated')
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
    })

    const toggleAdminMutation = useMutation({
        mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/toggle-admin`),
        onSuccess: () => {
            toast.success('Admin privileges updated')
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
    })

    const verifyUserMutation = useMutation({
        mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/verify`),
        onSuccess: () => {
            toast.success('User verified manually')
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
    })

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            toast.success('User deleted permanently')
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
            setSelectedUsers(prev => prev.filter(id => !prev.includes(id)))
        }
    })

    const unpublishPortfolioMutation = useMutation({
        mutationFn: (id: string) => apiClient.patch(`/admin/portfolios/${id}/unpublish`),
        onSuccess: () => {
            toast.success('Portfolio unpublished')
            queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
    })

    const deletePortfolioMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/admin/portfolios/${id}`),
        onSuccess: () => {
            toast.success('Portfolio deleted permanently')
            queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
    })

    const analyzeSpamMutation = useMutation({
        mutationFn: (portfolioId: string) => apiClient.post(`/admin/portfolios/${portfolioId}/analyze-spam`),
        onSuccess: (res) => {
            const data = res.data
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
                    <div className="flex-1">
                        <div className="flex items-start">
                            <div className="shrink-0 pt-0.5">
                                {data.is_spam ? <ShieldAlert className="h-10 w-10 text-red-500" /> : <ShieldCheck className="h-10 w-10 text-green-500" />}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    AI Moderation Result: {data.category?.toUpperCase()}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Confidence: {Math.round(data.confidence * 100)}%
                                </p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    {data.reason}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 6000 })
            queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
        }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                        <h1 className="text-xl inline">Admin Panel</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Platform overview and management</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
                    {(['dashboard', 'users', 'portfolios', 'logs', 'system'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white dark:bg-brand-500 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <>
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
                                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-xl">
                                                    {d.count} signups
                                                </div>
                                                <div className="w-full rounded-t-lg bg-brand-500/80 group-hover:bg-brand-500 transition-all" style={{ height: `${h}%` }} />
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
                </>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4" /> Users ({users?.length || 0})
                            {selectedUsers.length > 0 && <span className="text-xs text-brand-500 font-bold ml-2">{selectedUsers.length} selected</span>}
                        </h2>
                        <div className="flex items-center gap-2">
                            {selectedUsers.length > 0 && (
                                <button 
                                    onClick={() => openConfirm('Bulk Delete', `Delete ${selectedUsers.length} users and all their data?`, 'Bulk Delete', true, () => {
                                        selectedUsers.forEach(id => deleteUserMutation.mutate(id))
                                        closeConfirm()
                                    })}
                                    className="btn-secondary text-xs py-1.5 px-3 text-red-500 border-red-200"
                                >
                                    Delete Selection
                                </button>
                            )}
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
                    </div>
                    <div className="overflow-x-auto -mx-5 border-t border-gray-100 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/2">
                                    <th className="py-2.5 px-5 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" 
                                            onChange={e => setSelectedUsers(e.target.checked ? users?.map((u: any) => u.id) || [] : [])}
                                            checked={selectedUsers.length === users?.length && users?.length > 0}
                                        />
                                    </th>
                                    <th className="text-left py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                                    <th className="text-right py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersLoading ? (
                                    <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
                                ) : users?.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No users found</td></tr>
                                ) : (
                                    users?.map((u: any) => (
                                        <tr key={u.id} className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selectedUsers.includes(u.id) ? 'bg-brand-500/5 dark:bg-brand-500/10' : ''}`}>
                                            <td className="py-3 px-5">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" 
                                                    checked={selectedUsers.includes(u.id)}
                                                    onChange={e => setSelectedUsers(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))}
                                                />
                                            </td>
                                            <td className="py-3 px-2">
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
                                                <div className="flex flex-wrap gap-1">
                                                    {u.is_verified && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">verified</span>}
                                                    {u.is_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">admin</span>}
                                                    {!u.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">disabled</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!u.is_verified && (
                                                        <button onClick={() => verifyUserMutation.mutate(u.id)} disabled={verifyUserMutation.isPending} title="Verify Email" className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => toggleAdminMutation.mutate(u.id)} disabled={toggleAdminMutation.isPending} title={u.is_admin ? "Demote from Admin" : "Promote to Admin"} className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                                        {u.is_admin ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => toggleUserMutation.mutate(u.id)} disabled={toggleUserMutation.isPending} title={u.is_active ? "Suspend User" : "Activate User"} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                                        {u.is_active ? <Ban className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => openConfirm('Delete User', `Delete ${u.name} and all data?`, 'Delete', true, () => { deleteUserMutation.mutate(u.id); closeConfirm() })} disabled={deleteUserMutation.isPending} title="Delete User" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'portfolios' && (
                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Portfolios ({portfolios?.length || 0})
                    </h2>
                    <div className="overflow-x-auto -mx-5 border-t border-gray-100 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/2">
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Theme</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Views</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                    <th className="text-right py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolios?.map((p: any) => (
                                    <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="py-3 px-5">
                                            <a href={`/u/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline flex items-center gap-1 font-mono text-sm font-bold tracking-tight">
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
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.is_published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {p.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5 text-gray-400">{p.view_count}</td>
                                        <td className="py-3 px-5 text-xs text-gray-400 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {p.is_published && (
                                                    <button onClick={() => openConfirm('Unpublish Portfolio', `Force unpublish ${p.slug}?`, 'Unpublish', false, () => { unpublishPortfolioMutation.mutate(p.id); closeConfirm() })} disabled={unpublishPortfolioMutation.isPending} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => analyzeSpamMutation.mutate(p.id)} 
                                                    disabled={analyzeSpamMutation.isPending} 
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                    title="AI Spam Check"
                                                >
                                                    {analyzeSpamMutation.isPending && analyzeSpamMutation.variables === p.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                    ) : (
                                                        <ShieldAlert className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button onClick={() => openConfirm('Delete Portfolio', `Delete ${p.slug} permanently?`, 'Delete', true, () => { deletePortfolioMutation.mutate(p.id); closeConfirm() })} disabled={deletePortfolioMutation.isPending} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <History className="w-4 h-4" /> Audit Logs
                    </h2>
                    <div className="space-y-4">
                        {logs?.length ? logs.map((log: any) => (
                            <div key={log.id} className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 items-start">
                                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-brand-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {log.admin_name} <span className="text-gray-400 font-normal">performed</span> {log.action.replace('_', ' ')}
                                        </p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{log.details}</p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Target: {log.target_type} ({log.target_id?.slice(0, 8)}...)</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <History className="w-10 h-10 text-gray-200 dark:text-gray-800 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No activity recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Service Status */}
                        <div className="card lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Service Connectivity
                                </h2>
                                <button 
                                    onClick={() => refetchHealth()} 
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    title="Refresh Health"
                                >
                                    <RefreshCcw className={`w-4 h-4 text-gray-400 ${healthLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {health?.services ? Object.entries(health.services).map(([name, status]: any) => (
                                    <div key={name} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/1">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{name.replace('_', ' ')}</span>
                                            {status === 'healthy' ? (
                                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                            )}
                                        </div>
                                        <p className={`text-lg font-bold capitalize ${status === 'healthy' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {status}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="col-span-3 py-10 text-center">
                                         <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400 mb-2" />
                                         <p className="text-xs text-gray-400">Loading health data...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System Summary */}
                        <div className="card">
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Info className="w-4 h-4" /> System Info
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${health?.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {health?.status || 'UNKNOWN'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Last Checked</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resource Usage */}
                        <div className="card lg:col-span-3">
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Resource Utilization
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Memory */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{health?.resources?.memory?.percent || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${(health?.resources?.memory?.percent || 0) > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${health?.resources?.memory?.percent || 0}%` }} 
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        {((health?.resources?.memory?.total || 0) / (1024**3)).toFixed(1)}GB Total / {((health?.resources?.memory?.available || 0) / (1024**3)).toFixed(1)}GB Available
                                    </p>
                                </div>

                                {/* Disk */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage (Uploads)</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{health?.resources?.disk?.percent || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${(health?.resources?.disk?.percent || 0) > 80 ? 'bg-red-500' : 'bg-purple-500'}`} 
                                            style={{ width: `${health?.resources?.disk?.percent || 0}%` }} 
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        {((health?.resources?.disk?.total || 0) / (1024**3)).toFixed(1)}GB Total / {((health?.resources?.disk?.free || 0) / (1024**3)).toFixed(1)}GB Free
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                {...confirmState}
                onClose={closeConfirm}
            />
        </div>
    )
}
