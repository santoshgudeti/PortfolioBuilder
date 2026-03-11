import { Briefcase, Sparkles, Rocket } from 'lucide-react'

const tones = [
    {
        id: 'professional',
        label: 'Professional',
        desc: 'Clean, corporate, and formal',
        icon: Briefcase,
        color: 'from-blue-500 to-cyan-500',
        ring: 'ring-blue-500/30',
    },
    {
        id: 'creative',
        label: 'Creative',
        desc: 'Bold, expressive, and artistic',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        ring: 'ring-purple-500/30',
    },
    {
        id: 'startup',
        label: 'Startup',
        desc: 'Fast-paced, modern, and techy',
        icon: Rocket,
        color: 'from-amber-500 to-orange-500',
        ring: 'ring-amber-500/30',
    },
]

interface ToneSelectorProps {
    selected: string
    onChange: (tone: string) => void
}

export default function ToneSelector({ selected, onChange }: ToneSelectorProps) {
    return (
        <div>
            <label className="label mb-3">Choose AI Tone</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tones.map(tone => {
                    const Icon = tone.icon
                    const isActive = selected === tone.id
                    return (
                        <button
                            key={tone.id}
                            type="button"
                            onClick={() => onChange(tone.id)}
                            className={`relative min-w-0 rounded-xl border p-3 text-left transition-all duration-200 sm:p-4 ${isActive
                                    ? `border-transparent ring-2 ${tone.ring} shadow-glow-sm bg-gray-50 dark:bg-gray-800`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tone.color} flex items-center justify-center mb-2`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{tone.label}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tone.desc}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
