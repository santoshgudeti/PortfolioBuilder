import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolio'
import { Helmet } from 'react-helmet-async'
import StandardTemplate from '@/templates/StandardTemplate'
import TechGridTemplate from '@/templates/TechGridTemplate'
import CorporateTemplate from '@/templates/CorporateTemplate'
import FreelancerTemplate from '@/templates/FreelancerTemplate'
import AcademicTemplate from '@/templates/AcademicTemplate'

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) {
        return '99, 102, 241' // fallback: brand-500 indigo
    }
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

export interface PublicPortfolioPageProps {
    previewData?: any;
    previewTheme?: string;
    previewTemplateId?: string;
    previewMode?: string;
    previewColor?: string;
    previewHiddenSections?: string[];
}

export default function PublicPortfolioPage({ previewData, previewTheme, previewTemplateId, previewMode, previewColor, previewHiddenSections }: PublicPortfolioPageProps = {}) {
    const { slug } = useParams<{ slug: string | undefined }>()
    const isPreview = !!previewData
    const [searchParams] = useSearchParams()
    const isPdf = searchParams.get('pdf') === 'true'

    const hostname = window.location.hostname
    const isCustomDomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('vercel.app') && hostname !== import.meta.env.VITE_APP_DOMAIN

    const { data: fetchedData, isLoading, isError } = useQuery({
        queryKey: isCustomDomain ? ['public-portfolio-domain', hostname] : ['public-portfolio', slug],
        queryFn: () => isCustomDomain
            ? portfolioApi.getByDomain(hostname).then(r => r.data)
            : portfolioApi.getPublic(slug!).then(r => r.data),
        enabled: (!isPreview) && (isCustomDomain || !!slug),
        retry: false,
    })

    if (isLoading && !isPreview) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="space-y-6 w-full max-w-2xl px-6">
                    <div className="skeleton h-10 w-1/2 mx-auto rounded-xl" />
                    <div className="skeleton h-5 w-1/3 mx-auto rounded-lg" />
                    <div className="skeleton h-40 rounded-2xl" />
                    <div className="skeleton h-56 rounded-2xl" />
                </div>
            </div>
        )
    }

    if ((isError || !fetchedData) && !isPreview) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-8xl font-black text-gray-800 mb-4">404</div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Portfolio not found or not published.</p>
                    <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors">
                        Go Home
                    </a>
                </div>
            </div>
        )
    }

    const data = isPreview ? { view_count: 0 } : fetchedData
    const pd = isPreview ? previewData : data?.parsed_data
    const color = isPreview ? previewColor : data?.primary_color || '#6366f1'
    const templateId = isPreview ? previewTemplateId : data?.template_id || 'standard'
    const mode = isPreview ? (previewMode || 'light') : data?.mode || 'light'
    const rgb = hexToRgb(color)
    const initials = pd.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
    const publicUrl = window.location.href
    const hiddenSections = isPreview ? new Set<string>(previewHiddenSections || []) : new Set<string>((data?.hidden_sections || '').split(',').filter(Boolean))

    const props = { pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }

    return (
        <>
            {!isPreview && (
                <Helmet>
                    <body className={mode === 'dark' ? 'bg-[#050505]' : 'bg-white'} />
                    <html className={mode === 'dark' ? 'dark' : ''} />
                </Helmet>
            )}
            {templateId === 'tech' ? (
                <TechGridTemplate {...props} />
            ) : templateId === 'corporate' ? (
                <CorporateTemplate {...props} />
            ) : templateId === 'freelancer' ? (
                <FreelancerTemplate {...props} />
            ) : templateId === 'student' ? (
                <AcademicTemplate {...props} />
            ) : (
                <StandardTemplate {...props} />
            )}
        </>
    )
}
