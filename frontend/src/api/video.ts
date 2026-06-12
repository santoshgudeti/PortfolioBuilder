import apiClient from './client'

export interface VideoScene {
    scene_number: number
    type: string
    visual_description: string
    narration: string
    duration_seconds: string
    on_screen_text: string
    transition: string
    music_mood: string
}

export interface VideoScript {
    title: string
    tagline: string
    duration_seconds: number
    total_scenes: number
    scenes: VideoScene[]
    total_narration_words: number
    estimated_read_time_seconds: number
    suggested_background_music: string
    production_notes: string[]
}

export interface SavedScript {
    id: string
    created_at: string
    duration: number
    tone: string
    script: VideoScript
}

export const videoApi = {
    getOptions: () =>
        apiClient.get<{ durations: number[]; tones: string[] }>('/video/options'),

    generate: (duration_seconds: number, tone: string) =>
        apiClient.post<SavedScript>('/video/generate', { duration_seconds, tone }),

    getScripts: () =>
        apiClient.get<{ scripts: SavedScript[] }>('/video/scripts'),
}
