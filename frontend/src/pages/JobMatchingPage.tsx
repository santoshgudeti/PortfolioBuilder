import { useQuery } from '@tanstack/react-query'
import { jobsApi, JobMatch } from '@/api/jobs'
import { Loader2, Briefcase, TrendingUp, AlertCircle, CheckCircle2, Target, ArrowUpRight } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

const CONFIDENCE_COLORS: Record<string, string> = {
    high: 'text-green-500',
    medium: 'text-amber-500',
    low: 'text-gray-400',
}

function MatchCard({ match }: { match: JobMatch }) {
    const scoreColor = match.match_score >= 80 ? 'text-green-500' : match.match_score >= 60 ? 'text-amber-500' : 'text-red-500'

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-brand-500" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${CONFIDENCE_COLORS[match.confidence]}`}>
                            {match.confidence} confidence
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{match.role_category}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className={`text-3xl font-black tabular-nums ${scoreColor}`}>{match.match_score}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Match %</div>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{match.rationale}</p>

            {/* Tailored summary */}
            <div className="mb-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">Tailored Summary</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{match.tailored_summary}</p>
            </div>

            {/* Growth direction */}
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{match.growth_direction}</p>
            </div>

            {/* Skill gaps */}
            {match.skill_gaps.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Skill Gaps</p>
                    <div className="flex flex-wrap gap-2">
                        {match.skill_gaps.map((gap, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
                                {gap}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Alternative titles */}
            {match.alternative_titles.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Search for these titles</p>
                    <div className="flex flex-wrap gap-2">
                        {match.alternative_titles.map((title, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400">
                                {title}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function JobMatchingPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['job-matches'],
        queryFn: () => jobsApi.getMatches().then(r => r.data),
        retry: false,
    })

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-brand-500" />
                    Job Matching
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    AI analyzes your career profile and finds roles that fit your skills and experience.
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
                    <p className="text-red-700 dark:text-red-300 font-medium">Upload a resume first to get job matches.</p>
                </div>
            )}

            {data && (
                <>
                    {/* Career advice */}
                    {data.career_advice && (
                        <div className="rounded-2xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10 p-5 mb-8 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-brand-700 dark:text-brand-300">{data.career_advice}</p>
                        </div>
                    )}

                    {/* Matches */}
                    {data.matches.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No matches found. Add more details to your profile.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.matches
                                .sort((a, b) => b.match_score - a.match_score)
                                .map((match, i) => (
                                    <MatchCard key={i} match={match} />
                                ))}
                        </div>
                    )}
                </>
            )}
        </PageTransition>
    )
}
