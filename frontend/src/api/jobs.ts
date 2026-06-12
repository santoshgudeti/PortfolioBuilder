import apiClient from './client'

export interface JobMatch {
    role_category: string
    match_score: number
    confidence: 'high' | 'medium' | 'low'
    rationale: string
    skill_gaps: string[]
    tailored_summary: string
    alternative_titles: string[]
    growth_direction: string
}

export interface JobMatchesResponse {
    matches: JobMatch[]
    career_advice: string
}

export const jobsApi = {
    getMatches: () =>
        apiClient.get<JobMatchesResponse>('/jobs/matches'),
}
