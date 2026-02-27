import apiClient from './client'

export interface AnalyticsData {
    total_views: number
    view_count: number
    daily_views: { date: string, views: number }[]
    referrers: { source: string, count: number }[]
    devices: { mobile: number, desktop: number }
    slug: string
    is_published: boolean
}

export const analyticsApi = {
    getAnalytics: () => apiClient.get<AnalyticsData>('/portfolio/me/analytics'),
}
