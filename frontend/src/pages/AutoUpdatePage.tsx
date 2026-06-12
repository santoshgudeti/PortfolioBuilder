import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { autoUpdateApi, GitHubRepo, MediumPost } from '@/api/auto-update'
import { Loader2, Github, BookOpen, RefreshCw, Check, ExternalLink, Star, GitFork, Globe, Import } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

export default function AutoUpdatePage() {
    const queryClient = useQueryClient()
    const [ghUsername, setGhUsername] = useState('')
    const [mdUsername, setMdUsername] = useState('')
    const [ghPreview, setGhPreview] = useState<GitHubRepo[] | null>(null)
    const [mdPreview, setMdPreview] = useState<MediumPost[] | null>(null)

    const { data: sourcesData } = useQuery({
        queryKey: ['connected-sources'],
        queryFn: () => autoUpdateApi.getSources().then(r => r.data),
    })

    const sources = sourcesData?.sources || {}

    // GitHub
    const ghPreviewMutation = useMutation({
        mutationFn: () => autoUpdateApi.previewGitHub(ghUsername.trim()),
        onSuccess: (res) => setGhPreview(res.data.repos),
        onError: () => toast.error('Failed to fetch GitHub repos'),
    })

    const ghSyncMutation = useMutation({
        mutationFn: () => autoUpdateApi.syncGitHub(ghUsername.trim()),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['connected-sources'] })
            toast.success(res.data.message)
        },
        onError: () => toast.error('GitHub sync failed'),
    })

    // Medium
    const mdPreviewMutation = useMutation({
        mutationFn: () => autoUpdateApi.previewMedium(mdUsername.trim()),
        onSuccess: (res) => setMdPreview(res.data.posts),
        onError: () => toast.error('Failed to fetch Medium posts'),
    })

    const mdSyncMutation = useMutation({
        mutationFn: () => autoUpdateApi.syncMedium(mdUsername.trim()),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['connected-sources'] })
            toast.success(res.data.message)
        },
        onError: () => toast.error('Medium sync failed'),
    })

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-brand-500" />
                    Auto Updates
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Import your GitHub repos and Medium posts into your portfolio.
                </p>
            </div>

            {/* Connected sources overview */}
            {Object.keys(sources).length > 0 && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10 p-4 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Connected Sources</p>
                    <div className="flex flex-wrap gap-3">
                        {sources.github && (
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300">
                                <Github className="w-4 h-4" /> {sources.github.username} ({sources.github.repo_count} repos)
                            </span>
                        )}
                        {sources.medium && (
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300">
                                <BookOpen className="w-4 h-4" /> {sources.medium.username} ({sources.medium.post_count} posts)
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* GitHub */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gray-900 text-white">
                        <Github className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">GitHub Repos</h2>
                        <p className="text-xs text-gray-500">Import your public repositories as portfolio projects.</p>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={ghUsername}
                        onChange={e => setGhUsername(e.target.value)}
                        placeholder="GitHub username"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                        onClick={() => ghPreviewMutation.mutate()}
                        disabled={!ghUsername.trim() || ghPreviewMutation.isPending}
                        className="btn-secondary px-4"
                    >
                        {ghPreviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preview'}
                    </button>
                    <button
                        onClick={() => ghSyncMutation.mutate()}
                        disabled={!ghUsername.trim() || ghSyncMutation.isPending || !ghPreview}
                        className="btn-primary px-4"
                    >
                        {ghSyncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Import className="w-4 h-4" /> Import</>}
                    </button>
                </div>

                {ghPreview && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {ghPreview.map(repo => (
                            <div key={repo.url} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{repo.name}</span>
                                        {repo.language && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-500">{repo.language}</span>}
                                    </div>
                                    {repo.description && <p className="text-xs text-gray-500 truncate">{repo.description}</p>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 ml-3">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 hover:text-brand-500" /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Medium */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Medium Posts</h2>
                        <p className="text-xs text-gray-500">Import your latest articles as portfolio blog entries.</p>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={mdUsername}
                        onChange={e => setMdUsername(e.target.value)}
                        placeholder="Medium username"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                        onClick={() => mdPreviewMutation.mutate()}
                        disabled={!mdUsername.trim() || mdPreviewMutation.isPending}
                        className="btn-secondary px-4"
                    >
                        {mdPreviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preview'}
                    </button>
                    <button
                        onClick={() => mdSyncMutation.mutate()}
                        disabled={!mdUsername.trim() || mdSyncMutation.isPending || !mdPreview}
                        className="btn-primary px-4"
                    >
                        {mdSyncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Import className="w-4 h-4" /> Import</>}
                    </button>
                </div>

                {mdPreview && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {mdPreview.map(post => (
                            <div key={post.url} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{post.title}</p>
                                    {post.description && <p className="text-xs text-gray-500 truncate">{post.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    <span className="text-[10px] text-gray-400">{post.published_at?.split('T')[0]}</span>
                                    <a href={post.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 text-gray-400 hover:text-brand-500" /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    )
}
