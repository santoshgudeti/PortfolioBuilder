import { useQuery } from '@tanstack/react-query'
import { optimizerApi, Scorecard } from '@/api/optimizer'
import { Loader2, AlertCircle, CheckCircle2, TrendingUp, FileText, Target, Zap, Layout, AlertTriangle } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

const CATEGORY_ICONS: Record<string, typeof AlertCircle> = {
    ats_compatibility: FileText,
    impact_metrics: TrendingUp,
    action_verbs: Zap,
    keyword_optimization: Target,
    length_structure: Layout,
}

const CATEGORY_LABELS: Record<string, string> = {
    ats_compatibility: 'ATS Compatibility',
    impact_metrics: 'Impact Metrics',
    action_verbs: 'Action Verbs',
    keyword_optimization: 'Keyword Optimization',
    length_structure: 'Length & Structure',
}

function ScoreGauge({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
    const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'
    const bgColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
                <div className="mt-1.5 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${bgColor}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
            <span className={`text-lg font-bold tabular-nums ${color}`}>{score}</span>
        </div>
    )
}

export default function ResumeOptimizerPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['resume-analysis'],
        queryFn: () => optimizerApi.analyze().then(r => r.data),
        retry: false,
    })

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-brand-500" />
                    Resume Optimizer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    AI-powered ATS analysis to improve your resume and stand out.
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 dark:text-red-300 font-medium">Analysis failed</p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                        {(error as any)?.response?.data?.detail || 'Upload a resume first.'}
                    </p>
                </div>
            )}

            {data && (
                <>
                    {/* Overall score */}
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-8 text-center mb-8">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Overall Resume Score</p>
                        <div className="text-6xl font-black text-gray-900 dark:text-white tabular-nums">{data.overall_score}<span className="text-2xl text-gray-400 font-bold">/100</span></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{data.score_summary}</p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3 mb-8">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Score Breakdown</h2>
                        {Object.entries(data.breakdown).map(([key, score]) => {
                            const Icon = CATEGORY_ICONS[key] || FileText
                            return (
                                <ScoreGauge
                                    key={key}
                                    label={CATEGORY_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    score={score}
                                    icon={Icon}
                                />
                            )
                        })}
                    </div>

                    {/* Strengths */}
                    {data.strengths.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Strengths</h2>
                            <div className="space-y-2">
                                {data.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-700 dark:text-green-300">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {data.suggestions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Suggestions</h2>
                            <div className="space-y-3">
                                {data.suggestions.map((s, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${s.priority === 'high'
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                        : s.priority === 'medium'
                                            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
                                            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.priority === 'high' ? 'text-red-500' : s.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                                                }`} />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.detail}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing keywords */}
                    {data.missing_keywords.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Missing Keywords</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.missing_keywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 font-medium">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ATS issues */}
                    {data.ats_issues.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">ATS Issues</h2>
                            <div className="space-y-2">
                                {data.ats_issues.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 dark:text-red-300">{issue}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </PageTransition>
    )
}
