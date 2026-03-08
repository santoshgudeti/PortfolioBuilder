export interface Project {
    title: string;
    description: string;
    tech?: string[];
    url?: string | null;
    github?: string | null;
}

export interface Experience {
    company: string;
    role: string;
    duration: string;
    description: string;
}

export interface Education {
    institution: string;
    degree: string;
    year: string;
}

export interface ParsedResumeData {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    tagline: string;
    skills: string[];
    projects: Project[];
    experience: Experience[];
    education: Education[];
    github?: string | null;
    linkedin?: string | null;
    website?: string | null;
}

export interface PortfolioData {
    id?: string;
    user_id?: string;
    slug?: string;
    avatar_url?: string;
    view_count: number;
    is_published?: boolean;
    template_id?: string;
    primary_color?: string;
    mode?: string;
    hidden_sections?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TemplateProps {
    pd: ParsedResumeData;
    data: PortfolioData;
    color: string;
    rgb: string;
    mode: 'light' | 'dark' | string;
    hiddenSections: Set<string>;
    initials: string;
    isPdf: boolean;
    publicUrl: string;
    isPreview: boolean;
}
