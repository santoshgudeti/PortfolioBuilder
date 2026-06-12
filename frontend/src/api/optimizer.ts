import apiClient from './client'

export interface Suggestion {
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    detail: string
}

export interface Scorecard {
    overall_score: number
    breakdown: {
        ats_compatibility: number
        impact_metrics: number
        action_verbs: number
        keyword_optimization: number
        length_structure: number
    }
    strengths: string[]
    suggestions: Suggestion[]
    missing_keywords: string[]
    ats_issues: string[]
    score_summary: string
}

export const optimizerApi = {
    analyze: () =>
        apiClient.get<Scorecard>('/optimizer/analyze'),
}
