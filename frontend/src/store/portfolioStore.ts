import { create } from 'zustand'

export interface Project {
    title: string
    description: string
    tech: string[]
    url?: string | null
    github?: string | null
}

export interface Experience {
    company: string
    role: string
    duration: string
    description: string
}

export interface Education {
    institution: string
    degree: string
    year: string
}

export interface ParsedData {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    tagline: string
    skills: string[]
    projects: Project[]
    experience: Experience[]
    education: Education[]
    github?: string | null
    linkedin?: string | null
    website?: string | null
}

interface PortfolioState {
    portfolioId: string | null
    slug: string | null
    customDomain: string | null
    parsedData: ParsedData | null
    theme: string
    templateId: string
    mode: string
    primaryColor: string
    isPublished: boolean
    setPortfolio: (data: Partial<PortfolioState>) => void
    setParsedData: (data: ParsedData) => void
    setTheme: (theme: string) => void
    setTemplateId: (templateId: string) => void
    setMode: (mode: string) => void
    setPrimaryColor: (color: string) => void
    reset: () => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    portfolioId: null,
    slug: null,
    customDomain: null,
    parsedData: null,
    theme: 'minimal',
    templateId: 'standard',
    mode: 'light',
    primaryColor: '#6366f1',
    isPublished: false,

    setPortfolio: (data) => set((state) => ({ ...state, ...data })),
    setParsedData: (data) => set({ parsedData: data }),
    setTheme: (theme) => set({ theme }),
    setTemplateId: (templateId) => set({ templateId }),
    setMode: (mode) => set({ mode }),
    setPrimaryColor: (color) => set({ primaryColor: color }),
    reset: () => set({
        portfolioId: null,
        slug: null,
        customDomain: null,
        parsedData: null,
        theme: 'minimal',
        templateId: 'standard',
        mode: 'light',
        primaryColor: '#6366f1',
        isPublished: false,
    }),
}))
