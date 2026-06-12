import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { videoApi, VideoScript, SavedScript } from '@/api/video'
import { Loader2, Video, Clock, Music, Film, ChevronDown, ChevronUp, Download, Sparkles, Quote } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

const TYPE_COLORS: Record<string, string> = {
    hook: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    intro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    experience: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    projects: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    skills: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    achievements: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    outro: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    cta: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
}

export default function VideoPortfolioPage() {
    const [duration, setDuration] = useState(60)
    const [tone, setTone] = useState('professional')
    const [script, setScript] = useState<VideoScript | null>(null)
    const [expandedScene, setExpandedScene] = useState<number | null>(null)

    const { data: optionsData } = useQuery({
        queryKey: ['video-options'],
        queryFn: () => videoApi.getOptions().then(r => r.data),
    })

    const generateMutation = useMutation({
        mutationFn: () => videoApi.generate(duration, tone),
        onSuccess: (res) => {
            setScript(res.data.script)
            toast.success('Script generated')
        },
        onError: () => toast.error('Generation failed'),
    })

    const durations = optionsData?.durations || [30, 60, 90]
    const tones = optionsData?.tones || ['professional', 'inspiring', 'modern', 'creative']

    const downloadScript = () => {
        if (!script) return
        const lines = [
            `# ${script.title}`,
            `## ${script.tagline}`,
            '',
            `Duration: ${script.duration_seconds}s | Words: ${script.total_narration_words} | Read time: ${script.estimated_read_time_seconds}s`,
            '',
            '---',
            '',
        ]
        script.scenes.forEach(scene => {
            lines.push(`### Scene ${scene.scene_number}: ${scene.type.toUpperCase()}`)
            lines.push(`**Duration:** ${scene.duration_seconds}s | **Transition:** ${scene.transition} | **Music:** ${scene.music_mood}`)
            lines.push('')
            lines.push(`**Visual:** ${scene.visual_description}`)
            lines.push('')
            lines.push(`**Narration:** ${scene.narration}`)
            if (scene.on_screen_text) {
                lines.push('')
                lines.push(`**On-screen text:** ${scene.on_screen_text}`)
            }
            lines.push('')
            lines.push('---')
            lines.push('')
        })
        if (script.production_notes?.length > 0) {
            lines.push('## Production Notes')
            script.production_notes.forEach(n => lines.push(`- ${n}`))
            lines.push('')
        }
        if (script.suggested_background_music) {
            lines.push(`**Suggested Music:** ${script.suggested_background_music}`)
        }

        const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `portfolio-video-script-${script.title.toLowerCase().replace(/\s+/g, '-')}.md`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Script downloaded')
    }

    return (
        <PageTransition className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Video className="w-6 h-6 text-brand-500" />
                    AI Video Portfolio
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Generate a professional video portfolio script from your resume data.
                </p>
            </div>

            {/* Controls */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Duration</label>
                        <div className="flex gap-2">
                            {durations.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                        duration === d
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                            : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Tone</label>
                        <select
                            value={tone}
                            onChange={e => setTone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {tones.map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                            className="btn-primary w-full py-2.5"
                        >
                            {generateMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="w-4 h-4" /> Generate Script</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Script display */}
            {script && (
                <div className="space-y-4">
                    {/* Header card */}
                    <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{script.title}</h2>
                                <p className="text-brand-600 dark:text-brand-400 mt-1 italic">{script.tagline}</p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="w-3.5 h-3.5" /> {script.duration_seconds}s
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Film className="w-3.5 h-3.5" /> {script.total_scenes} scenes
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Quote className="w-3.5 h-3.5" /> {script.total_narration_words} words
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Music className="w-3.5 h-3.5" /> {script.suggested_background_music}
                                    </span>
                                </div>
                            </div>
                            <button onClick={downloadScript} className="btn-secondary px-3 py-2 text-xs flex-shrink-0">
                                <Download className="w-4 h-4" /> Download Script
                            </button>
                        </div>
                    </div>

                    {/* Scene cards */}
                    {script.scenes.map(scene => (
                        <div
                            key={scene.scene_number}
                            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedScene(expandedScene === scene.scene_number ? null : scene.scene_number)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                                        {scene.scene_number}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[scene.type] || 'bg-gray-100 text-gray-600'}`}>
                                                {scene.type}
                                            </span>
                                            <span className="text-xs text-gray-400">{scene.duration_seconds}s</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                                            {scene.narration.slice(0, 80)}...
                                        </p>
                                    </div>
                                </div>
                                {expandedScene === scene.scene_number ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {expandedScene === scene.scene_number && (
                                <div className="px-5 pb-5 pt-0 space-y-4">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Visual</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{scene.visual_description}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Narration</p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{scene.narration}</p>
                                    </div>
                                    {scene.on_screen_text && (
                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">On-Screen Text</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{scene.on_screen_text}</p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        <span>Transition: <strong>{scene.transition}</strong></span>
                                        <span>Music: <strong>{scene.music_mood}</strong></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Production notes */}
                    {script.production_notes && script.production_notes.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Production Notes</p>
                            <ul className="space-y-2">
                                {script.production_notes.map((note, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </PageTransition>
    )
}
