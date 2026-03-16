import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'
import { usePortfolioStore, ParsedData } from '@/store/portfolioStore'
import { useAuthStore } from '@/store/authStore'

import { EditorHeader } from '@/components/editor/EditorHeader'
import { ContentTab } from '@/components/editor/ContentTab'
import { ThemeTab } from '@/components/editor/ThemeTab'
import { SectionsTab } from '@/components/editor/SectionsTab'
import { PreviewFrame } from '@/components/editor/PreviewFrame'
import { PenTool, Palette, Eye, Layout } from 'lucide-react'

export default function EditorPage() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    const {
        parsedData, theme, templateId, mode, primaryColor, isPublished,
        slug, customDomain, setPortfolio, setTheme, setTemplateId,
        setMode, setPrimaryColor, setParsedData
    } = usePortfolioStore()

    const [localData, setLocalData] = useState<ParsedData | null>(parsedData)
    const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'sections'>('content')
    const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set())
    const [isDirty, setIsDirty] = useState(false)
    const [savedOnce, setSavedOnce] = useState(false)
    const [isExportingPDF, setIsExportingPDF] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [previewFullscreen, setPreviewFullscreen] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
    const initializedRef = useRef(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const { data: portfolioData, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
        enabled: !!user,
    })

    useEffect(() => {
        if (portfolioData && !initializedRef.current) {
            initializedRef.current = true
            const pd = JSON.parse(portfolioData.parsed_data || '{}')
            setParsedData(pd)
            setLocalData(pd)
            setPortfolio({
                portfolioId: portfolioData.id,
                slug: portfolioData.slug,
                theme: portfolioData.theme,
                templateId: portfolioData.template_id || 'standard',
                mode: portfolioData.mode || 'light',
                primaryColor: portfolioData.primary_color,
                isPublished: portfolioData.is_published,
                customDomain: portfolioData.custom_domain,
            })
            const hidden = portfolioData.hidden_sections || ''
            setHiddenSections(new Set(hidden.split(',').filter(Boolean)))
            setSavedOnce(true)
            setIsDirty(false)
        } else if (parsedData && !localData) {
            setLocalData(parsedData)
        }
    }, [portfolioData, parsedData])

    const saveMutation = useMutation({
        mutationFn: () => portfolioApi.updateMyPortfolio({
            parsed_data: localData,
            theme,
            template_id: templateId,
            mode,
            primary_color: primaryColor,
            hidden_sections: Array.from(hiddenSections).join(','),
        }),
        onSuccess: () => {
            setParsedData(localData!)
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            setIsDirty(false)
            setSavedOnce(true)
            toast.success('✅ Portfolio saved!')
        },
        onError: () => toast.error('Failed to save. Please try again.'),
    })

    const publishMutation = useMutation({
        mutationFn: () => isPublished ? portfolioApi.unpublish() : portfolioApi.publish(),
        onSuccess: (res) => {
            setPortfolio({ isPublished: res.data.is_published })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            toast.success(res.data.is_published ? '🌐 Portfolio published!' : 'Portfolio unpublished')
        },
        onError: () => toast.error('Action failed'),
    })



    const updateField = (field: keyof ParsedData, value: any) => {
        setLocalData(prev => prev ? { ...prev, [field]: value } : prev)
        setIsDirty(true)
    }

    const handleSetTheme = (t: string) => { setTheme(t); setIsDirty(true) }
    const handleSetTemplateId = (t: string) => { setTemplateId(t); setIsDirty(true) }
    const handleSetMode = (m: string) => { setMode(m); setIsDirty(true) }
    const handleSetColor = (c: string) => { setPrimaryColor(c); setIsDirty(true) }

    const toggleSection = (key: string) => {
        setHiddenSections(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
        setIsDirty(true)
    }

    const handleDownloadPDF = async () => {
        if (!slug) return toast.error('Publish your portfolio first to download PDF')
        setIsExportingPDF(true)

        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf').then(m => ({ jsPDF: m.jsPDF }))
            ])

            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.top = '-10000px'
            iframe.style.width = '1200px'
            iframe.style.height = '1600px'
            iframe.src = `/u/${slug}?pdf=true`
            document.body.appendChild(iframe)

            iframe.onload = async () => {
                await new Promise(r => setTimeout(r, 1500))
                const doc = iframe.contentDocument || iframe.contentWindow?.document
                if (!doc) {
                    document.body.removeChild(iframe)
                    setIsExportingPDF(false)
                    return toast.error('Cannot access content for PDF')
                }

                const element = doc.body
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    windowWidth: 1200,
                    height: element.scrollHeight,
                    y: 0
                })

                const imgData = canvas.toDataURL('image/png')
                const customPdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                })
                customPdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
                customPdf.save(`${slug}-portfolio.pdf`)

                document.body.removeChild(iframe)
                setIsExportingPDF(false)
                toast.success('PDF downloaded!')
            }
        } catch (e) {
            setIsExportingPDF(false)
            console.error(e)
            toast.error('Failed to generate PDF')
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
                </div>
            </div>
        )
    }

    if (!localData) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Your professional story is waiting to be told.</p>
                <Link to="/upload" className="btn-primary px-8">Elevate Your Story</Link>
            </div>
        )
    }

    return (
        <div className={`max-w-[1600px] mx-auto animate-fade-in flex flex-col lg:flex-row ${showPreview ? 'gap-10' : 'gap-0'} lg:h-[calc(100vh-5rem)]`}>
            {/* Editor Side */}
            <div className={`w-full ${showPreview ? 'lg:w-[50%]' : 'lg:w-full'} flex flex-col overflow-hidden transition-all duration-500 ease-in-out`}>
                <div className="flex-1 overflow-y-auto pr-4 pb-20 space-y-8 custom-scrollbar">
                    <EditorHeader
                        slug={slug}
                        isPublished={isPublished}
                        isDirty={isDirty}
                        savedOnce={savedOnce}
                        isExportingPDF={isExportingPDF}
                        showPreview={showPreview}
                        onDownloadPDF={handleDownloadPDF}
                        onTogglePreview={() => {
                            if (window.innerWidth < 1024) setPreviewFullscreen(true)
                            else setShowPreview(s => !s)
                        }}
                        onPublish={() => publishMutation.mutate()}
                        onSave={() => saveMutation.mutate()}
                        isPublishPending={publishMutation.isPending}
                        isSavePending={saveMutation.isPending}
                    />

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-white/[0.03] rounded-2xl p-1.5 w-fit border border-gray-200 dark:border-white/5 shadow-inner">
                        {[
                            { id: 'content', label: 'Narrative', icon: PenTool },
                            { id: 'theme', label: 'Aesthetics', icon: Palette },
                            { id: 'sections', label: 'Visibility', icon: Layout }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-white dark:bg-brand-500 text-gray-900 dark:text-white shadow-xl scale-[1.05]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'content' && (
                        <ContentTab localData={localData} updateField={updateField} />
                    )}

                    {activeTab === 'theme' && (
                        <ThemeTab
                            slug={slug}
                            customDomain={customDomain}
                            templateId={templateId}
                            mode={mode}
                            primaryColor={primaryColor}
                            onUpdateSlug={(newSlug) => setPortfolio({ slug: newSlug })}
                            onUpdateDomain={(newDomain) => setPortfolio({ customDomain: newDomain })}
                            onSetTemplate={handleSetTemplateId}
                            onSetMode={handleSetMode}
                            onSetColor={handleSetColor}
                        />
                    )}

                    {activeTab === 'sections' && (
                        <SectionsTab
                            hiddenSections={hiddenSections}
                            onToggleSection={toggleSection}
                        />
                    )}
                </div>
            </div>

            {/* Preview Side */}
            <PreviewFrame
                slug={slug}
                previewDevice={previewDevice}
                previewFullscreen={previewFullscreen}
                showPreview={showPreview}
                isMobile={isMobile}
                localData={localData}
                theme={theme}
                templateId={templateId}
                mode={mode}
                primaryColor={primaryColor}
                hiddenSections={hiddenSections}
                onSetDevice={setPreviewDevice}
                onSetFullscreen={setPreviewFullscreen}
                onSetShowPreview={setShowPreview}
            />
        </div>
    )
}
