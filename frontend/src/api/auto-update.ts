import apiClient from './client'

export interface GitHubRepo {
    name: string
    description: string
    url: string
    homepage: string
    language: string
    topics: string[]
    stars: number
    forks: number
    updated_at: string
}

export interface MediumPost {
    title: string
    url: string
    description: string
    published_at: string
}

export interface ConnectedSources {
    github?: { username: string; last_synced: string; repo_count: number }
    medium?: { username: string; last_synced: string; post_count: number }
}

export const autoUpdateApi = {
    getSources: () =>
        apiClient.get<{ sources: ConnectedSources }>('/auto-update/sources'),

    previewGitHub: (username: string) =>
        apiClient.post<{ username: string; repos: GitHubRepo[]; count: number }>('/auto-update/github/preview', { username }),

    syncGitHub: (username: string) =>
        apiClient.post<{ imported: number; message: string; repos: GitHubRepo[] }>('/auto-update/github/sync', { username }),

    previewMedium: (username: string) =>
        apiClient.post<{ username: string; posts: MediumPost[]; count: number }>('/auto-update/medium/preview', { username }),

    syncMedium: (username: string) =>
        apiClient.post<{ imported: number; message: string; posts: MediumPost[] }>('/auto-update/medium/sync', { username }),
}
