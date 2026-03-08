import { LayoutTemplate, Palette, SunMoon } from 'lucide-react'
import { SlugEditor } from './SlugEditor'
import { CustomDomainEditor } from './CustomDomainEditor'

interface ThemeTabProps {
    slug: string | null
    customDomain: string | null
    templateId: string
    mode: string
    primaryColor: string
    onUpdateSlug: (s: string) => void
    onUpdateDomain: (d: string) => void
    onSetTemplate: (t: string) => void
    onSetMode: (m: string) => void
    onSetColor: (c: string) => void
}

const TEMPLATE_CATEGORIES = [
    {
        name: 'Professional & Classic',
        items: [
            { id: 'standard', label: 'Standard Layout' },
            { id: 'corporate', label: 'Corporate / HR' },
            { id: 'student', label: 'Academic / Student' },
            { id: 'tech', label: 'Tech Grid' },
            { id: 'freelancer', label: 'Creative Freelancer' },
        ]
    },
    {
        name: 'Modern & UI Trends',
        items: [
            { id: 'split', label: 'Split Screen' },
            { id: 'terminal', label: 'Terminal / Retro' },
            { id: 'neobrutalism', label: 'Neobrutalism' },
            { id: 'glassmorphism', label: 'Glassmorphism' },
            { id: 'notion', label: 'Notion Minimalist' },
        ]
    },
    {
        name: 'Advanced & Immersive',
        items: [
            { id: 'apple', label: 'Apple Desktop (macOS)' },
            { id: 'material', label: 'Material App' },
            { id: 'cyberpunk', label: 'Cyberpunk / Synthwave' },
            { id: 'bauhaus', label: 'Swiss / Bauhaus' },
            { id: 'biolink', label: 'Bio-Link Mobile' },
        ]
    }
]

const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function ThemeTab({
    slug,
    customDomain,
    templateId,
    mode,
    primaryColor,
    onUpdateSlug,
    onUpdateDomain,
    onSetTemplate,
    onSetMode,
    onSetColor
}: ThemeTabProps) {
    return (
        <div className="space-y-4">
            {/* Editable Portfolio URL */}
            <SlugEditor currentSlug={slug || ''} onUpdated={onUpdateSlug} />

            {/* Custom Domain Configuration */}
            <CustomDomainEditor currentDomain={customDomain} onUpdated={onUpdateDomain} />

            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" /> Choose Structural Template
                </h2>
                <div className="flex flex-col gap-6">
                    {TEMPLATE_CATEGORIES.map(cat => (
                        <div key={cat.name}>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1 border-l-2 border-brand-500">{cat.name}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {cat.items.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => onSetTemplate(t.id)}
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
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <SunMoon className="w-4 h-4" /> Visual Mode
                    </h2>
                    <div className="flex gap-2">
                        {['light', 'dark'].map(m => (
                            <button
                                key={m}
                                onClick={() => onSetMode(m)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 capitalize transition-all ${mode === m
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                                    : 'border-gray-100 dark:border-gray-700 text-gray-500'
                                    }`}
                            >
                                {m} Mode
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Primary Color
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => onSetColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-gray-900 dark:border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
