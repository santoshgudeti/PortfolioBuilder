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
        <div className="space-y-6">
            {/* Editable Portfolio URL */}
            <div className="card-premium group">
                <SlugEditor currentSlug={slug || ''} onUpdated={onUpdateSlug} />
            </div>

            {/* Custom Domain Configuration */}
            <div className="card-premium group">
                <CustomDomainEditor currentDomain={customDomain} onUpdated={onUpdateDomain} />
            </div>

            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Choose Template</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Select how your portfolio looks</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-8">
                    {TEMPLATE_CATEGORIES.map(cat => (
                        <div key={cat.name} className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 pl-4 border-l-2 border-brand-500/30">{cat.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {cat.items.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => onSetTemplate(t.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group/btn ${templateId === t.id
                                            ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
                                            : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`font-bold text-sm ${templateId === t.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-400'}`}>{t.label}</p>
                                        </div>
                                        {templateId === t.id && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform">
                            <SunMoon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Color Theme</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Dark or Light appearance</p>
                        </div>
                    </div>
                    <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/5">
                        {['light', 'dark'].map(m => (
                            <button
                                key={m}
                                onClick={() => onSetMode(m)}
                                className={`flex-1 py-2.5 px-4 rounded-xl capitalize text-xs font-black tracking-widest transition-all ${mode === m
                                    ? 'bg-white dark:bg-brand-500 text-gray-900 dark:text-white shadow-lg scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-premium group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Brand Color</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Choose your highlight color</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => onSetColor(c)}
                                className={`w-9 h-9 rounded-full border-2 transition-all relative ${primaryColor === c 
                                    ? 'border-gray-900 dark:border-white scale-110 shadow-xl' 
                                    : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            >
                                {primaryColor === c && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-white mix-blend-difference" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
