import { Eye, EyeOff } from 'lucide-react'

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
        <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Section Visibility</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose which sections to show or hide on your public portfolio.</p>
            <div className="space-y-3">
                {SECTIONS.map(s => (
                    <button
                        key={s.key}
                        onClick={() => onToggleSection(s.key)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${!hiddenSections.has(s.key)
                                ? 'border-brand-100 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-900/10 text-gray-900 dark:text-white'
                                : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600'
                            }`}
                    >
                        <span className="font-medium">{s.label}</span>
                        {!hiddenSections.has(s.key) ? (
                            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Visible</span>
                                <Eye className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Hidden</span>
                                <EyeOff className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
