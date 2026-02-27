import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'
import { usePortfolioStore, ParsedData } from '@/store/portfolioStore'
import {
    Globe, Eye, EyeOff, Save, Loader2, Palette, ExternalLink,
    Sparkles, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, Link2, FileDown,
    Smartphone, Tablet, Monitor, Maximize2, Minimize2, LayoutTemplate, SunMoon
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import PublicPortfolioPage from './PublicPortfolioPage'

const TEMPLATES = [
    { id: 'standard', label: 'Standard Layout' },
    { id: 'corporate', label: 'Corporate / HR' },
    { id: 'tech', label: 'Tech Grid' },
    { id: 'freelancer', label: 'Creative Freelancer' },
    { id: 'student', label: 'Academic / Student' }
]

const THEMES = [
    { id: 'minimal', label: 'Minimal', color: '#6366f1' },
    { id: 'corporate', label: 'Corporate', color: '#0ea5e9' },
    { id: 'developer', label: 'Developer', color: '#22c55e' },
    { id: 'creative', label: 'Creative', color: '#f59e0b' },
]

const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const SECTIONS = [
    { key: 'summary', label: 'About / Summary' },
    { key: 'skills', label: 'Skills' },
    { key: 'projects', label: 'Projects' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
]

// AI Regenerate button component
function AIButton({ field, value, context, onResult }: {
    field: string; value: string; context?: string; onResult: (v: string) => void
}) {
    const [loading, setLoading] = useState(false)

    const handleRegenerate = async () => {
        if (!value?.trim()) { toast.error('Add some text first to improve'); return }
        setLoading(true)
        try {
            const res = await portfolioApi.regenerate(field, value, context)
            onResult(res.data.improved)
            toast.success('✨ AI improved your text!')
        } catch {
            toast.error('AI regeneration failed. Check your Groq API key.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            title="Improve with AI"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? 'Improving...' : 'AI Improve'}
        </button>
    )
}

// Slug editor component
function SlugEditor({ currentSlug, onUpdated }: { currentSlug: string; onUpdated: (s: string) => void }) {
    const [slugInput, setSlugInput] = useState(currentSlug)
    const [checking, setChecking] = useState(false)
    const [available, setAvailable] = useState<boolean | null>(null)
    const [reason, setReason] = useState('')
    const [saving, setSaving] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => { setSlugInput(currentSlug) }, [currentSlug])

    const handleSlugChange = (value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
        setSlugInput(cleaned)
        setAvailable(null)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (cleaned.length < 3) { setReason('Min 3 characters'); return }
        setChecking(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await portfolioApi.checkSlug(cleaned)
                setAvailable(res.data.available)
                setReason(res.data.reason || '')
            } catch { setAvailable(false); setReason('Check failed') }
            finally { setChecking(false) }
        }, 500)
    }

    const handleSave = async () => {
        if (!available || slugInput === currentSlug) return
        setSaving(true)
        try {
            await portfolioApi.updateSlug(slugInput)
            onUpdated(slugInput)
            toast.success('🔗 Portfolio URL updated!')
            setAvailable(null)
        } catch (e: any) {
            toast.error(e.response?.data?.detail || 'Failed to update URL')
        } finally { setSaving(false) }
    }

    const isChanged = slugInput !== currentSlug && slugInput.length >= 3

    return (
        <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Portfolio URL
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customise your public portfolio link. Lowercase letters, numbers, and hyphens only.</p>
            <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                    <span className="px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">/u/</span>
                    <input
                        type="text"
                        value={slugInput}
                        onChange={e => handleSlugChange(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white outline-none font-mono"
                        placeholder="your-name"
                        maxLength={40}
                    />
                    <div className="px-3 text-sm">
                        {checking && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        {!checking && available === true && isChanged && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {!checking && available === false && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!available || !isChanged || saving}
                    className="btn-primary text-sm flex-shrink-0 disabled:opacity-40"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save URL
                </button>
            </div>
            {!checking && reason && (
                <p className={`text-xs mt-2 ${available === false ? 'text-red-500' : 'text-gray-400'}`}>{reason}</p>
            )}
            {!checking && available === true && isChanged && (
                <p className="text-xs mt-2 text-green-600">✅ Available! Click Save URL to update.</p>
            )}
        </div>
    )
}

function CustomDomainEditor({ currentDomain, onUpdated }: { currentDomain: string | null; onUpdated: (s: string) => void }) {
    const [domainInput, setDomainInput] = useState(currentDomain || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => { setDomainInput(currentDomain || '') }, [currentDomain])

    const handleSave = async () => {
        if (domainInput === currentDomain) return

        const cleaned = domainInput.trim().toLowerCase()
        if (cleaned && !/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/.test(cleaned)) {
            toast.error('Invalid domain format')
            return
        }

        setSaving(true)
        try {
            await portfolioApi.updateMyPortfolio({ custom_domain: cleaned || null })
            onUpdated(cleaned)
            toast.success('🌐 Custom domain updated!')
        } catch (e: any) {
            toast.error(e.response?.data?.detail || 'Failed to update domain')
        } finally { setSaving(false) }
    }

    const isChanged = domainInput !== (currentDomain || '')

    return (
        <div className="card mt-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Custom Domain
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Connect your own domain. Point a CNAME record from your domain to <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">yourapp.vercel.app</code>
            </p>
            <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                    <span className="px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">https://</span>
                    <input
                        type="text"
                        value={domainInput}
                        onChange={e => setDomainInput(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white outline-none font-mono"
                        placeholder="www.yourdomain.com"
                        maxLength={100}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isChanged || saving}
                    className="btn-primary text-sm flex-shrink-0 disabled:opacity-40"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Domain
                </button>
            </div>
            {currentDomain && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Domain configured: {currentDomain}
                </p>
            )}
        </div>
    )
}

export default function EditorPage() {
    const queryClient = useQueryClient()
    const { parsedData, theme, templateId, mode, primaryColor, isPublished, slug, customDomain, setPortfolio, setTheme, setTemplateId, setMode, setPrimaryColor, setParsedData } = usePortfolioStore()
    const [localData, setLocalData] = useState<ParsedData | null>(parsedData)
    const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'sections'>('content')
    const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set())
    const [isDirty, setIsDirty] = useState(false)
    const [savedOnce, setSavedOnce] = useState(false)
    const [isExportingPDF, setIsExportingPDF] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [previewFullscreen, setPreviewFullscreen] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const initializedRef = useRef(false)

    const { data: portfolioData, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
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
            })
            // Load hidden sections
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
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.top = '-10000px'
            iframe.style.width = '1200px' // desktop width for good layout
            iframe.style.height = '1600px'
            iframe.src = `/u/${slug}?pdf=true`
            document.body.appendChild(iframe)

            iframe.onload = async () => {
                // Wait for fonts and images to render
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
                <p className="text-gray-500 dark:text-gray-400 mb-4">No portfolio data found.</p>
                <a href="/upload" className="btn-primary">Upload Resume First</a>
            </div>
        )
    }

    return (
        <div className={`max-w-[1600px] mx-auto animate-fade-in flex flex-col lg:flex-row ${showPreview ? 'gap-8' : 'gap-0'} lg:h-[calc(100vh-6rem)]`}>
            {/* Editor Side */}
            <div className={`w-full ${showPreview ? 'lg:w-[55%]' : 'lg:w-full'} flex flex-col overflow-hidden transition-all duration-300`}>
                <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Editor</h1>
                                {slug ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
                                        <Link2 className="w-3.5 h-3.5" />
                                        <span className="font-mono">yourapp.com/u/{slug}</span>
                                    </p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Edit your portfolio content and theme</p>
                                )}
                            </div>

                            {/* Action buttons — clear hierarchy */}
                            <div className="flex items-center gap-2">
                                {/* 4. Quaternary: Download PDF (only when published) */}
                                {slug && isPublished && (
                                    <button onClick={handleDownloadPDF} disabled={isExportingPDF}
                                        className="btn-secondary text-sm px-3" title="Download as PDF">
                                        {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{isExportingPDF ? 'Exporting...' : 'PDF'}</span>
                                    </button>
                                )}
                                {/* 3. Tertiary: View live (only when published) */}
                                {slug && isPublished && (
                                    <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer"
                                        className="btn-secondary text-sm px-3 hidden xl:flex" title="View your live public portfolio">
                                        <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">View Live</span>
                                    </a>
                                )}
                                {/* New: Toggle Preview Button */}
                                <button
                                    onClick={() => setShowPreview(s => !s)}
                                    className="btn-secondary text-sm px-3 hidden lg:flex"
                                    title={showPreview ? 'Hide live preview to expand editor' : 'Show live preview side-by-side'}
                                >
                                    {showPreview ? <ToggleRight className="w-4 h-4 text-brand-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                    <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                                </button>
                                {/* 2. Secondary: Publish/Unpublish */}
                                <button
                                    onClick={() => publishMutation.mutate()}
                                    disabled={publishMutation.isPending || isDirty}
                                    title={isDirty ? 'Save your changes first before publishing' : isPublished ? 'Unpublish portfolio' : 'Publish to make it public'}
                                    className={`btn-secondary text-sm ${isDirty ? 'opacity-50 cursor-not-allowed' :
                                        isPublished ? 'text-red-500' : 'text-green-600'
                                        }`}
                                >
                                    {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                    {isPublished ? 'Unpublish' : 'Publish'}
                                </button>
                                {/* 1. Primary: Save */}
                                <button
                                    onClick={() => saveMutation.mutate()}
                                    disabled={saveMutation.isPending}
                                    className={`btn-primary text-sm ${isDirty ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
                                    title="Save all changes to your portfolio"
                                >
                                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Status bar */}
                        <div className={`mt-3 px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-all ${isDirty
                            ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                            : isPublished
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
                            }`}>
                            {isDirty ? (
                                <><AlertCircle className="w-4 h-4 flex-shrink-0" /> <span><strong>Unsaved changes</strong> — Click <strong>Save Changes</strong> to save, then <strong>Publish</strong> to go live.</span></>
                            ) : isPublished ? (
                                <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span><strong>Saved &amp; Published</strong> — Your portfolio is live at <a href={`/u/${slug}`} target="_blank" className="underline font-mono">/u/{slug}</a></span></>
                            ) : savedOnce ? (
                                <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span><strong>Saved</strong> — Click <strong>Publish</strong> to make your portfolio public.</span></>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span>Make your edits below, then click <strong>Save Changes</strong>.</span></>
                            )}
                        </div>
                    </div>


                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
                        {(['content', 'theme', 'sections'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab === 'sections' ? '👁 Sections' : tab === 'theme' ? '🎨 Theme' : '✏️ Content'}
                            </button>
                        ))}
                    </div>

                    {/* Content Tab */}
                    {activeTab === 'content' && (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {[
                                        { key: 'name', label: 'Full Name' },
                                        { key: 'title', label: 'Job Title' },
                                        { key: 'email', label: 'Email' },
                                        { key: 'phone', label: 'Phone' },
                                        { key: 'location', label: 'Location' },
                                        { key: 'github', label: 'GitHub URL' },
                                        { key: 'linkedin', label: 'LinkedIn URL' },
                                        { key: 'website', label: 'Website URL' },
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="label mb-1.5">{label}</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={(localData as any)[key] || ''}
                                                onChange={e => updateField(key as keyof ParsedData, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tagline & Summary with AI */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tagline & Summary</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="label">Tagline</label>
                                            <AIButton
                                                field="tagline"
                                                value={localData.tagline || ''}
                                                context={`Name: ${localData.name}, Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 5).join(', ')}`}
                                                onResult={v => updateField('tagline', v)}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="input"
                                            value={localData.tagline || ''}
                                            onChange={e => updateField('tagline', e.target.value)}
                                            placeholder="e.g. Full Stack Developer | Building scalable web apps"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="label">Professional Summary</label>
                                            <AIButton
                                                field="summary"
                                                value={localData.summary || ''}
                                                context={`Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 8).join(', ')}`}
                                                onResult={v => updateField('summary', v)}
                                            />
                                        </div>
                                        <textarea
                                            className="input min-h-[100px] resize-y"
                                            value={localData.summary || ''}
                                            onChange={e => updateField('summary', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {localData.skills?.map((skill, i) => (
                                        <span key={i} className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex items-center gap-1">
                                            {skill}
                                            <button
                                                onClick={() => updateField('skills', localData.skills.filter((_, idx) => idx !== i))}
                                                className="ml-1 hover:text-red-500"
                                            >×</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Add skill and press Enter"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            updateField('skills', [...(localData.skills || []), e.currentTarget.value.trim()])
                                            e.currentTarget.value = ''
                                        }
                                    }}
                                />
                            </div>

                            {/* Projects with AI */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Projects ({localData.projects?.length || 0})</h2>
                                <div className="space-y-4">
                                    {localData.projects?.map((proj, i) => (
                                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="label mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={proj.title}
                                                        onChange={e => {
                                                            const updated = [...localData.projects]
                                                            updated[i] = { ...proj, title: e.target.value }
                                                            updateField('projects', updated)
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label mb-1">Tech Stack (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={proj.tech?.join(', ')}
                                                        onChange={e => {
                                                            const updated = [...localData.projects]
                                                            updated[i] = { ...proj, tech: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                                                            updateField('projects', updated)
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="label">Description</label>
                                                        <AIButton
                                                            field="project_description"
                                                            value={proj.description}
                                                            context={`Project: ${proj.title}, Tech: ${proj.tech?.join(', ')}`}
                                                            onResult={v => {
                                                                const updated = [...localData.projects]
                                                                updated[i] = { ...proj, description: v }
                                                                updateField('projects', updated)
                                                            }}
                                                        />
                                                    </div>
                                                    <textarea
                                                        className="input resize-none"
                                                        rows={2}
                                                        value={proj.description}
                                                        onChange={e => {
                                                            const updated = [...localData.projects]
                                                            updated[i] = { ...proj, description: e.target.value }
                                                            updateField('projects', updated)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience with AI */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Experience ({localData.experience?.length || 0})</h2>
                                <div className="space-y-4">
                                    {localData.experience?.map((exp, i) => (
                                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="label mb-1">Role</label>
                                                    <input type="text" className="input" value={exp.role}
                                                        onChange={e => {
                                                            const updated = [...localData.experience]
                                                            updated[i] = { ...exp, role: e.target.value }
                                                            updateField('experience', updated)
                                                        }} />
                                                </div>
                                                <div>
                                                    <label className="label mb-1">Company</label>
                                                    <input type="text" className="input" value={exp.company}
                                                        onChange={e => {
                                                            const updated = [...localData.experience]
                                                            updated[i] = { ...exp, company: e.target.value }
                                                            updateField('experience', updated)
                                                        }} />
                                                </div>
                                                <div>
                                                    <label className="label mb-1">Duration</label>
                                                    <input type="text" className="input" value={exp.duration}
                                                        onChange={e => {
                                                            const updated = [...localData.experience]
                                                            updated[i] = { ...exp, duration: e.target.value }
                                                            updateField('experience', updated)
                                                        }} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="label">Description</label>
                                                        <AIButton
                                                            field="experience_description"
                                                            value={exp.description}
                                                            context={`Role: ${exp.role} at ${exp.company}, Duration: ${exp.duration}`}
                                                            onResult={v => {
                                                                const updated = [...localData.experience]
                                                                updated[i] = { ...exp, description: v }
                                                                updateField('experience', updated)
                                                            }}
                                                        />
                                                    </div>
                                                    <textarea className="input resize-none" rows={2} value={exp.description}
                                                        onChange={e => {
                                                            const updated = [...localData.experience]
                                                            updated[i] = { ...exp, description: e.target.value }
                                                            updateField('experience', updated)
                                                        }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Theme Tab */}
                    {activeTab === 'theme' && (
                        <div className="space-y-4">
                            {/* Editable Portfolio URL */}
                            <SlugEditor currentSlug={slug || ''} onUpdated={(newSlug) => {
                                setPortfolio({ slug: newSlug })
                            }} />

                            {/* Custom Domain Configuration */}
                            <CustomDomainEditor currentDomain={customDomain} onUpdated={(newDomain) => {
                                setPortfolio({ customDomain: newDomain })
                            }} />

                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" /> Choose Structural Template
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleSetTemplateId(t.id)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${templateId === t.id
                                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <p className="font-medium text-gray-900 dark:text-white">{t.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <SunMoon className="w-4 h-4" /> Theme & Mode
                                </h2>
                                <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full max-w-xs">
                                    <button
                                        onClick={() => handleSetMode('light')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                    >Light Mode</button>
                                    <button
                                        onClick={() => handleSetMode('dark')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                    >Dark Mode</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {THEMES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleSetTheme(t.id)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${theme === t.id
                                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: t.color }} />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Primary Color</h2>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => handleSetColor(color)}
                                            className={`w-10 h-10 rounded-full transition-all ${primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={e => handleSetColor(e.target.value)}
                                        className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent"
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sections Tab */}
                    {activeTab === 'sections' && (
                        <div className="card">
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Section Visibility
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                Toggle which sections appear on your public portfolio. Save after making changes.
                            </p>
                            <div className="space-y-3">
                                {SECTIONS.map(section => {
                                    const isVisible = !hiddenSections.has(section.key)
                                    return (
                                        <div
                                            key={section.key}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isVisible
                                                ? 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                                                }`}
                                            onClick={() => toggleSection(section.key)}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{section.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {isVisible ? 'Visible on portfolio' : 'Hidden from portfolio'}
                                                </p>
                                            </div>
                                            {isVisible
                                                ? <ToggleRight className="w-8 h-8 text-brand-500" />
                                                : <ToggleLeft className="w-8 h-8 text-gray-400" />
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                                💡 Click Save in the header to apply visibility changes to your live portfolio.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Side (Desktop Only) */}
            <div className={`hidden lg:flex flex-col transition-all duration-500 origin-right ${previewFullscreen
                ? 'fixed inset-4 z-50 rounded-2xl opacity-100 translate-x-0 border border-gray-200 dark:border-gray-800'
                : showPreview
                    ? 'w-[45%] opacity-100 translate-x-0 border border-gray-200 dark:border-gray-800'
                    : 'w-0 opacity-0 translate-x-12 border-0'
                } rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden shadow-inner`}>

                {/* Preview toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
                    {/* Device switcher */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        {([
                            { id: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
                            { id: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
                            { id: 'desktop', icon: Monitor, label: 'Desktop (full)' },
                        ] as const).map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setPreviewDevice(id)}
                                title={label}
                                className={`p-1.5 rounded-md transition-all ${previewDevice === id
                                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live
                        </div>
                        {/* Fullscreen toggle */}
                        <button
                            onClick={() => setPreviewFullscreen(f => !f)}
                            title={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            {previewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Preview viewport */}
                <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 flex justify-center">
                    <div
                        className={`${mode === 'dark' ? 'bg-[#050505]' : 'bg-white'} origin-top transition-all duration-300 ${previewDevice === 'mobile'
                            ? 'w-[375px] min-h-full shadow-2xl'
                            : previewDevice === 'tablet'
                                ? 'w-[768px] min-h-full shadow-xl'
                                : 'w-full min-h-full'
                            }`}
                    >
                        <PublicPortfolioPage
                            previewData={localData}
                            previewTheme={theme}
                            previewTemplateId={templateId}
                            previewMode={mode}
                            previewColor={primaryColor}
                            previewHiddenSections={Array.from(hiddenSections)}
                        />
                    </div>
                </div>
            </div>

            {/* Fullscreen backdrop */}
            {previewFullscreen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                    onClick={() => setPreviewFullscreen(false)}
                />
            )}
        </div>
    )
}
