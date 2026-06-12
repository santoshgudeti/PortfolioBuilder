import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { recruiterApi, TalentProfile } from '@/api/recruiter'
import { Loader2, Search, MapPin, Star, Briefcase, Layers, ExternalLink, UserCheck } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { Link } from 'react-router-dom'

export default function RecruiterPage() {
    const [query, setQuery] = useState('')
    const [skillsInput, setSkillsInput] = useState('')
    const [roleInput, setRoleInput] = useState('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['talent-search', query, skillsInput, roleInput],
        queryFn: () => recruiterApi.search({
            query: query || undefined,
            skills: skillsInput || undefined,
            role: roleInput || undefined,
            limit: 20,
        }).then(r => r.data),
    })

    const profiles = data?.profiles || []
    const total = data?.total || 0

    return (
        <PageTransition className="max-w-6xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-brand-500" />
                    Talent Discovery
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Browse portfolios of professionals who are open to being discovered.
                </p>
            </div>

            {/* Search */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Search</label>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Name, title, keyword..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Skills</label>
                        <input
                            type="text"
                            value={skillsInput}
                            onChange={e => setSkillsInput(e.target.value)}
                            placeholder="e.g. React, Python, AWS"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Role</label>
                        <input
                            type="text"
                            value={roleInput}
                            onChange={e => setRoleInput(e.target.value)}
                            placeholder="e.g. Product Manager"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{total} profiles found</p>
                    {(query || skillsInput || roleInput) && (
                        <button
                            onClick={() => { setQuery(''); setSkillsInput(''); setRoleInput('') }}
                            className="text-xs text-brand-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            )}

            {!isLoading && profiles.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No profiles found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                    <TalentCard key={profile.id} profile={profile} />
                ))}
            </div>
        </PageTransition>
    )
}

function TalentCard({ profile }: { profile: TalentProfile }) {
    const allSkills = profile.top_skills.length > 0 ? profile.top_skills : profile.skills

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 hover:border-brand-500/50 transition-all">
            <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg flex-shrink-0 overflow-hidden">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        profile.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{profile.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.title}</p>
                        </div>
                        <a
                            href={`/u/${profile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary px-2.5 py-1.5 text-xs flex-shrink-0"
                            title="View portfolio"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>

            {profile.summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{profile.summary}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
                {profile.career_level && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/20 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                        <Star className="w-3 h-3" /> {profile.career_level}
                    </span>
                )}
                {profile.experience_years && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/20 text-[10px] font-medium text-green-700 dark:text-green-300">
                        <Briefcase className="w-3 h-3" /> {profile.experience_years}y
                    </span>
                )}
                {profile.industries.slice(0, 2).map(ind => (
                    <span key={ind} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/20 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                        <Layers className="w-3 h-3" /> {ind}
                    </span>
                ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {allSkills.slice(0, 8).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[11px] text-gray-600 dark:text-gray-400">
                        {skill}
                    </span>
                ))}
                {allSkills.length > 8 && (
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[11px] text-gray-400">
                        +{allSkills.length - 8}
                    </span>
                )}
            </div>
        </div>
    )
}
