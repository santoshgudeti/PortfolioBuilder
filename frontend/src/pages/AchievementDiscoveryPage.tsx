import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementsApi, Suggestion } from '@/api/achievements'
import { Loader2, Lightbulb, CheckCircle, RefreshCw, ArrowRight, Edit3, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

const CONFIDENCE_COLORS: Record<string, string> = {
    high: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
    medium: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
    low: 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]',
}

const CONFIDENCE_BADGES: Record<string, string> = {
    high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
}

export default function AchievementDiscoveryPage() {
    const queryClient = useQueryClient()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['achievements'],
        queryFn: () => achievementsApi.discover().then(r => r.data),
        retry: false,
    })

    const applyMutation = useMutation({
        mutationFn: ({ type, index, suggested }: { type: string; index: number; suggested: string }) =>
            achievementsApi.apply(type, index, suggested).then(r => r.data),
        onSuccess: () => {
            toast.success('Applied! Refresh to discover more.')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
        },
        onError: () => toast.error('Failed to apply'),
    })

    const suggestions = data?.suggestions || []

    const startEditing = (item: Suggestion) => {
        const id = `${item.type}-${item.index}`
        setEditingId(id)
        setEditText(item.suggested)
    }

    const saveEdit = (item: Suggestion) => {
        applyMutation.mutate({ type: item.type, index: item.index, suggested: editText })
        setEditingId(null)
    }

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    Achievement Discovery
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    AI finds vague descriptions in your resume and suggests metric-enriched rewrites.
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 p-6 text-center">
                    <p className="text-red-700 dark:text-red-300 font-medium">Upload a resume first to discover achievements.</p>
                </div>
            )}

            {!isLoading && suggestions.length === 0 && !isError && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No suggestions available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try uploading a resume with more detailed experience.</p>
                    <button onClick={() => refetch()} className="btn-secondary mt-4 text-sm">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="space-y-6">
                    {suggestions.map((item) => {
                        const id = `${item.type}-${item.index}`
                        const isEditing = editingId === id
                        const isApplying = applyMutation.isPending && applyMutation.variables?.index === item.index

                        return (
                            <div key={id} className={`rounded-2xl border p-5 ${CONFIDENCE_COLORS[item.confidence] || CONFIDENCE_COLORS.low}`}>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {item.type === 'experience' ? 'Experience' : 'Project'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${CONFIDENCE_BADGES[item.confidence] || CONFIDENCE_BADGES.low}`}>
                                                {item.confidence} confidence
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                    </div>
                                </div>

                                {/* Original */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">Original</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                        {item.original}
                                    </p>
                                </div>

                                {/* Suggested */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">Suggested</p>
                                    {isEditing ? (
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full rounded-xl border border-brand-500 bg-white dark:bg-black/20 p-3 text-sm text-gray-900 dark:text-white outline-none resize-y min-h-[80px]"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-black/20 rounded-lg p-3 font-medium">
                                            {item.suggested}
                                        </p>
                                    )}
                                </div>

                                {/* Rationale */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
                                    {item.rationale}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => saveEdit(item)}
                                                disabled={isApplying}
                                                className="btn-primary text-xs px-4 py-2"
                                            >
                                                {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="btn-secondary text-xs px-4 py-2"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => applyMutation.mutate({ type: item.type, index: item.index, suggested: item.suggested })}
                                                disabled={isApplying}
                                                className="btn-primary text-xs px-4 py-2"
                                            >
                                                {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => startEditing(item)}
                                                className="btn-secondary text-xs px-4 py-2"
                                            >
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    <div className="text-center pt-4">
                        <button onClick={() => refetch()} className="btn-secondary text-sm">
                            <RefreshCw className="w-4 h-4" /> Re-analyze
                        </button>
                    </div>
                </div>
            )}
        </PageTransition>
    )
}
