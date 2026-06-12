import apiClient from './client'

export interface RoleVersion {
    role: string
    data: {
        title: string
        summary: string
        skills: string[]
        experience: Array<{
            role: string
            company: string
            description: string
            start_date: string | null
            end_date: string | null
        }>
        projects: Array<{
            title: string
            description: string
            tech: string[]
            link: string | null
        }>
        achievements: string[]
        tailoring_notes: string
        _role: string
    }
    is_active: boolean
}

export const dynamicPortfolioApi = {
    getSuggestedRoles: () =>
        apiClient.get<{ suggested_roles: string[] }>('/portfolio/dynamic/suggested-roles'),

    getVersions: () =>
        apiClient.get<{ versions: RoleVersion[]; active_role: string | null }>('/portfolio/dynamic/versions'),

    generate: (target_role: string) =>
        apiClient.post<{ role: string; data: RoleVersion['data']; message: string }>(
            '/portfolio/dynamic/generate', { target_role }
        ),

    activate: (role: string) =>
        apiClient.post<{ active_role: string; message: string }>('/portfolio/dynamic/activate', { role }),

    reset: () =>
        apiClient.post<{ message: string }>('/portfolio/dynamic/reset'),
}
