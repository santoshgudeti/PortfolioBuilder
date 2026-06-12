import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dynamicPortfolioApi, RoleVersion } from '@/api/dynamic-portfolio'
import { Loader2, Layers, Check, RefreshCw, Eye, FileText, Star, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

export default function DynamicPortfolioPage() {
    const queryClient = useQueryClient()
    const [customRole, setCustomRole] = useState('')
    const [viewing, setViewing] = useState<RoleVersion | null>(null)

    const { data: rolesData } = useQuery({
        queryKey: ['suggested-roles'],
        queryFn: () => dynamicPortfolioApi.getSuggestedRoles().then(r => r.data),
    })

    const { data: versionsData, isLoading } = useQuery({
        queryKey: ['role-versions'],
        queryFn: () => dynamicPortfolioApi.getVersions().then(r => r.data),
    })

    const versions = versionsData?.versions || []
    const activeRole = versionsData?.active_role
    const suggestedRoles = rolesData?.suggested_roles || []

    const generateMutation = useMutation({
        mutationFn: (role: string) => dynamicPortfolioApi.generate(role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-versions'] })
            toast.success('Role version generated')
        },
        onError: () => toast.error('Generation failed'),
    })

    const activateMutation = useMutation({
        mutationFn: (role: string) => dynamicPortfolioApi.activate(role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-versions'] })
            toast.success('Activated')
        },
        onError: () => toast.error('Activation failed'),
    })

    const resetMutation = useMutation({
        mutationFn: () => dynamicPortfolioApi.reset(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-versions'] })
            toast.success('Reset to original')
        },
        onError: () => toast.error('Reset failed'),
    })

    const existingRoles = new Set(versions.map(v => v.role))

    return (
        <PageTransition className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Layers className="w-6 h-6 text-brand-500" />
                    Dynamic Portfolios
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Generate role-specific versions of your portfolio from the same resume data.
                </p>
            </div>

            {/* Suggested roles grid */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Generate for a role</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {suggestedRoles.map(role => {
                        const done = existingRoles.has(role)
                        const active = activeRole === role
                        return (
                            <button
                                key={role}
                                onClick={() => {
                                    if (done) {
                                        activateMutation.mutate(role)
                                    } else {
                                        generateMutation.mutate(role)
                                    }
                                }}
                                disabled={generateMutation.isPending}
                                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                                    active
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500'
                                        : done
                                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                                            : 'border-gray-200 dark:border-white/10 hover:border-brand-500/50'
                                }`}
                            >
                                {active && <Star className="absolute top-2 right-2 w-3.5 h-3.5 text-brand-500" />}
                                {done && !active && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-green-500" />}
                                <span className={`text-xs font-bold ${done ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {role}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {active ? 'Active' : done ? 'Click to activate' : 'Click to generate'}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Custom role */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={customRole}
                        onChange={e => setCustomRole(e.target.value)}
                        placeholder="e.g. AI Engineer, Design Lead..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                        onClick={() => {
                            if (!customRole.trim()) return
                            generateMutation.mutate(customRole.trim())
                            setCustomRole('')
                        }}
                        disabled={!customRole.trim() || generateMutation.isPending}
                        className="btn-primary px-5"
                    >
                        {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Generate</>}
                    </button>
                </div>
            </div>

            {/* Generated versions list */}
            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            )}

            {versions.length > 0 && (
                <div className="space-y-3 mb-6">
                    {versions.map(v => (
                        <div
                            key={v.role}
                            className={`rounded-2xl border p-5 transition-all ${
                                v.is_active
                                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-xl ${v.is_active ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">{v.role}</span>
                                            {v.is_active && (
                                                <span className="px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/20 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">Active</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                            {v.data.title} &middot; {v.data.skills.length} skills &middot; {v.data.experience.length} roles
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setViewing(viewing?.role === v.role ? null : v)}
                                        className="btn-secondary px-3 py-1.5 text-xs"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> {viewing?.role === v.role ? 'Hide' : 'Preview'}
                                    </button>
                                    {!v.is_active && (
                                        <button
                                            onClick={() => activateMutation.mutate(v.role)}
                                            className="btn-brand px-3 py-1.5 text-xs"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Activate
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded preview */}
                            {viewing?.role === v.role && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-4 text-sm max-h-96 overflow-y-auto">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Title</p>
                                        <p className="text-gray-900 dark:text-white font-semibold">{v.data.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Summary</p>
                                        <p className="text-gray-700 dark:text-gray-300">{v.data.summary}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {v.data.skills.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[11px] text-gray-600 dark:text-gray-400">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tailoring Notes</p>
                                        <p className="text-gray-500 dark:text-gray-400 italic">{v.data.tailoring_notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Reset button */}
            {activeRole && (
                <div className="text-center">
                    <button
                        onClick={() => resetMutation.mutate()}
                        disabled={resetMutation.isPending}
                        className="btn-secondary text-sm"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset to Original
                    </button>
                </div>
            )}
        </PageTransition>
    )
}
