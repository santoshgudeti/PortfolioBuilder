import apiClient from './client'

export interface DailyViews {
    date: string
    views: number
}

export interface VisitorSegment {
    type: string
    count: number
}

export interface AnalyticsOverview {
    total_views: number
    daily_views_7d: DailyViews[]
    daily_views_30d: DailyViews[]
    segments: VisitorSegment[]
    segments_total: number
    intent: {
        average: number
        high: number
        medium: number
        low: number
        total_scored: number
    }
    repeat_visitors: number
    devices: { mobile: number; desktop: number }
    referrers: { source: string; count: number }[]
    slug: string
    is_published: boolean
}

export const analyticsApi = {
    getAnalytics: () => apiClient.get<AnalyticsOverview>('/analytics/overview'),
}
