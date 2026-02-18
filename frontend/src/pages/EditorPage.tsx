import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'
import { usePortfolioStore, ParsedData } from '@/store/portfolioStore'
import {
    Globe, Eye, EyeOff, Save, Loader2, Palette, ExternalLink,
    Sparkles, ToggleLeft, ToggleRight
} from 'lucide-react'

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

export default function EditorPage() {
    const queryClient = useQueryClient()
    const { parsedData, theme, primaryColor, isPublished, slug, setPortfolio, setTheme, setPrimaryColor, setParsedData } = usePortfolioStore()
    const [localData, setLocalData] = useState<ParsedData | null>(parsedData)
    const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'sections'>('content')
    const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set())

    const { data: portfolioData, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
    })

    useEffect(() => {
        if (portfolioData && !parsedData) {
            const pd = JSON.parse(portfolioData.parsed_data || '{}')
            setParsedData(pd)
            setLocalData(pd)
            setPortfolio({
                portfolioId: portfolioData.id,
                slug: portfolioData.slug,
                theme: portfolioData.theme,
                primaryColor: portfolioData.primary_color,
                isPublished: portfolioData.is_published,
            })
            // Load hidden sections
            const hidden = portfolioData.hidden_sections || ''
            setHiddenSections(new Set(hidden.split(',').filter(Boolean)))
        } else if (parsedData && !localData) {
            setLocalData(parsedData)
        }
    }, [portfolioData, parsedData])

    const saveMutation = useMutation({
        mutationFn: () => portfolioApi.updateMyPortfolio({
            parsed_data: localData,
            theme,
            primary_color: primaryColor,
            hidden_sections: Array.from(hiddenSections).join(','),
        }),
        onSuccess: () => {
            setParsedData(localData!)
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            toast.success('Portfolio saved!')
        },
        onError: () => toast.error('Failed to save'),
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
    }

    const toggleSection = (key: string) => {
        setHiddenSections(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
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
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Editor</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {slug ? `yourapp.com/u/${slug}` : 'Edit your portfolio content and theme'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {slug && (
                        <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                            <ExternalLink className="w-4 h-4" /> Preview
                        </a>
                    )}
                    <button
                        onClick={() => publishMutation.mutate()}
                        disabled={publishMutation.isPending}
                        className={`btn-secondary text-sm ${isPublished ? 'text-red-500' : 'text-green-600'}`}
                    >
                        {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className="btn-primary text-sm"
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="card">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Choose Theme
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
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
                                    onClick={() => setPrimaryColor(color)}
                                    className={`w-10 h-10 rounded-full transition-all ${primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={e => setPrimaryColor(e.target.value)}
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
    )
}
