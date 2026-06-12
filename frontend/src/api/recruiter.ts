import apiClient from './client'

export interface TalentProfile {
    id: string
    slug: string
    name: string
    avatar_url: string | null
    title: string
    summary: string
    skills: string[]
    top_skills: string[]
    industries: string[]
    experience_years: number | null
    career_level: string
    experience_count: number
    project_count: number
    updated_at: string
}

export interface SearchResult {
    profiles: TalentProfile[]
    total: number
    limit: number
    offset: number
}

export const recruiterApi = {
    search: (params: { query?: string; skills?: string; role?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams()
        if (params.query) searchParams.set('query', params.query)
        if (params.skills) searchParams.set('skills', params.skills)
        if (params.role) searchParams.set('role', params.role)
        if (params.limit) searchParams.set('limit', String(params.limit))
        if (params.offset) searchParams.set('offset', String(params.offset))
        return apiClient.get<SearchResult>(`/recruiter/search?${searchParams.toString()}`)
    },

    getVisibility: () =>
        apiClient.get<{ visible_to_recruiters: boolean }>('/recruiter/visibility'),

    toggleVisibility: () =>
        apiClient.post<{ visible_to_recruiters: boolean; message: string }>('/recruiter/visibility'),
}
