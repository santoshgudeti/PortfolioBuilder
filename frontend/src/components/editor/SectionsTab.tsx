import { Eye, EyeOff, Layout } from 'lucide-react'

interface SectionsTabProps {
    hiddenSections: Set<string>
    onToggleSection: (key: string) => void
}

const SECTIONS = [
    { key: 'summary', label: 'About / Summary' },
    { key: 'skills', label: 'Skills' },
    { key: 'projects', label: 'Projects' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
]

export function SectionsTab({ hiddenSections, onToggleSection }: SectionsTabProps) {
    return (
        <div className="card-premium group">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Layout className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Visibility</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Show or hide portfolio sections</p>
                </div>
            </div>
            
            <div className="space-y-3">
                {SECTIONS.map(s => (
                    <button
                        key={s.key}
                        onClick={() => onToggleSection(s.key)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group/item ${!hiddenSections.has(s.key)
                                ? 'border-brand-500/20 bg-brand-500/5 text-gray-900 dark:text-white'
                                : 'border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-600'
                            }`}
                    >
                        <span className={`text-sm font-black uppercase tracking-[0.1em] ${!hiddenSections.has(s.key) ? 'text-brand-600 dark:text-brand-400' : ''}`}>{s.label}</span>
                        {!hiddenSections.has(s.key) ? (
                            <div className="flex items-center gap-3 text-brand-500">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live</span>
                                <div className="p-2 rounded-lg bg-brand-500/10">
                                    <Eye className="w-4 h-4" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 opacity-40 group-hover/item:opacity-70 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest">Hidden</span>
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5">
                                    <EyeOff className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
