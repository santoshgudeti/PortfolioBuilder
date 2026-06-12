import apiClient from './client'

export interface GeneratedContent {
    title: string
    content: string
    hashtags: string[]
    estimated_read_time_minutes: string
    key_topics_covered: string[]
    content_type?: string
    tone?: string
    error?: string
}

export interface ContentTypesResponse {
    content_types: Record<string, string>
    tone_options: string[]
}

export const contentApi = {
    getTypes: () =>
        apiClient.get<ContentTypesResponse>('/content/types'),

    generate: (content_type: string, tone: string = 'professional', instructions: string = '') =>
        apiClient.post<GeneratedContent>('/content/generate', { content_type, tone, instructions }),

    regenerate: (original_content: string, feedback: string) =>
        apiClient.post<GeneratedContent>('/content/regenerate', { original_content, feedback }),
}
