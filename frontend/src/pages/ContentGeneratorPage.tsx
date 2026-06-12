import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { contentApi, GeneratedContent } from '@/api/content'
import { Loader2, FileText, Copy, Check, RefreshCw, Sparkles, MessageSquare, Twitter, BookOpen, Newspaper, ListTree, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

const TYPE_ICONS: Record<string, React.ReactNode> = {
    linkedin_post: <MessageSquare className="w-5 h-5" />,
    twitter_thread: <Twitter className="w-5 h-5" />,
    case_study: <BookOpen className="w-5 h-5" />,
    newsletter_intro: <Newspaper className="w-5 h-5" />,
    blog_outline: <ListTree className="w-5 h-5" />,
}

const TYPE_COLORS: Record<string, string> = {
    linkedin_post: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    twitter_thread: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    case_study: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    newsletter_intro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    blog_outline: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

export default function ContentGeneratorPage() {
    const [contentType, setContentType] = useState('linkedin_post')
    const [tone, setTone] = useState('professional')
    const [instructions, setInstructions] = useState('')
    const [result, setResult] = useState<GeneratedContent | null>(null)
    const [feedback, setFeedback] = useState('')
    const [copied, setCopied] = useState(false)

    const { data: typesData } = useQuery({
        queryKey: ['content-types'],
        queryFn: () => contentApi.getTypes().then(r => r.data),
    })

    const contentTypes = typesData?.content_types || {}
    const toneOptions = typesData?.tone_options || ['professional', 'enthusiastic', 'thoughtful', 'conversational', 'inspiring']

    const generateMutation = useMutation({
        mutationFn: () => contentApi.generate(contentType, tone, instructions),
        onSuccess: (res) => {
            setResult(res.data)
            setFeedback('')
        },
        onError: () => toast.error('Generation failed'),
    })

    const regenerateMutation = useMutation({
        mutationFn: () => contentApi.regenerate(result?.content || '', feedback),
        onSuccess: (res) => {
            setResult(res.data)
            setFeedback('')
            toast.success('Content regenerated')
        },
        onError: () => toast.error('Regeneration failed'),
    })

    const handleCopy = async () => {
        if (!result?.content) return
        try {
            await navigator.clipboard.writeText(result.content)
            setCopied(true)
            toast.success('Copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-brand-500" />
                    AI Content Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Generate LinkedIn posts, Twitter threads, case studies, and more from your portfolio.
                </p>
            </div>

            {/* Type selector */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Content Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(contentTypes).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setContentType(key)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                                contentType === key
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                        >
                            <span className={TYPE_COLORS[key] || 'bg-gray-100 text-gray-600'}>
                                {TYPE_ICONS[key] || <FileText className="w-5 h-5" />}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tone + instructions */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tone</label>
                        <select
                            value={tone}
                            onChange={e => setTone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {toneOptions.map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Additional Instructions</label>
                        <input
                            type="text"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            placeholder="e.g. Focus on my React work"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                <button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="btn-primary w-full py-3"
                >
                    {generateMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Content</>
                    )}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[result.content_type || contentType] || 'bg-gray-100 text-gray-600'}`}>
                                        {contentTypes[result.content_type || contentType] || result.content_type || contentType}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{tone}</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{result.title}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleCopy} className="btn-secondary px-3 py-2 text-xs" title="Copy to clipboard">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                            {result.content}
                        </div>

                        {result.hashtags && result.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                {result.hashtags.map((tag, i) => (
                                    <span key={i} className="text-xs text-brand-600 dark:text-brand-400">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {result.key_topics_covered && result.key_topics_covered.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {result.key_topics_covered.map((topic, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] text-gray-600 dark:text-gray-400">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Regenerate with feedback */}
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Refine with feedback</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="e.g. Make it shorter, focus on leadership..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button
                                onClick={() => regenerateMutation.mutate()}
                                disabled={!feedback.trim() || regenerateMutation.isPending}
                                className="btn-secondary px-5"
                            >
                                {regenerateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <><RefreshCw className="w-4 h-4" /> Refine</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    )
}
