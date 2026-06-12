import apiClient from './client'

export interface Suggestion {
    type: 'experience' | 'project'
    index: number
    title: string
    original: string
    suggested: string
    confidence: 'high' | 'medium' | 'low'
    rationale: string
}

export const achievementsApi = {
    discover: () =>
        apiClient.get<{ suggestions: Suggestion[] }>('/achievements/discover'),

    apply: (type: string, index: number, suggested: string) =>
        apiClient.post('/achievements/apply', { type, index, suggested }),
}
