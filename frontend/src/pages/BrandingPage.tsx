import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { brandingApi, BrandAssetType } from '@/api/branding'
import { Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

const TONES = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'executive', label: 'Executive' },
    { id: 'technical', label: 'Technical' },
]

const COPY_LABELS: Record<string, string> = {
    linkedin_bio: 'LinkedIn About',
    twitter_bio: 'Twitter/X Bio',
    github_readme: 'GitHub Profile README',
    speaker_bio: 'Speaker Bio',
    founder_bio: 'Founder / Investor Bio',
    personal_website_about: 'Personal Website About',
}

export default function BrandingPage() {
    const [tone, setTone] = useState('professional')
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

    const { data: typesData } = useQuery({
        queryKey: ['branding-types'],
        queryFn: () => brandingApi.listTypes().then(r => r.data),
    })

    const generateMutation = useMutation({
        mutationFn: (assetType: string) =>
            brandingApi.generate(assetType, tone).then(r => r.data),
        onSuccess: () => {
            toast.success('Generated!')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Generation failed')
        },
    })

    const generateAllMutation = useMutation({
        mutationFn: () => brandingApi.generateAll(tone).then(r => r.data),
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Generation failed')
        },
    })

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(key)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    const assets = typesData?.assets || []

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-brand-500" />
                    AI Personal Branding
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Generate LinkedIn bios, Twitter profiles, speaker intros, and more — from your career data.
                </p>
            </div>

            {/* Tone selector */}
            <div className="mb-8">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Tone</label>
                <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${tone === t.id
                                ? 'bg-brand-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate All button */}
            <button
                onClick={() => generateAllMutation.mutate()}
                disabled={generateAllMutation.isPending}
                className="btn-primary w-full mb-8 py-3"
            >
                {generateAllMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating all...</>
                ) : (
                    <><Sparkles className="w-4 h-4" /> Generate All Assets</>
                )}
            </button>

            {/* Asset type grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {assets.map(asset => (
                    <button
                        key={asset.id}
                        onClick={() => {
                            setSelectedAsset(asset.id)
                            if (!generateAllMutation.data?.[asset.id]) {
                                generateMutation.mutate(asset.id)
                            }
                        }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedAsset === asset.id
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                    >
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{COPY_LABELS[asset.id] || asset.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to generate</p>
                    </button>
                ))}
            </div>

            {/* Generated content */}
            {generateAllMutation.data && Object.keys(generateAllMutation.data).length > 0 && (
                <div className="space-y-6">
                    {Object.entries(generateAllMutation.data).map(([key, content]) => (
                        <div
                            key={key}
                            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                    {COPY_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => generateMutation.mutate(key)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                                        title="Regenerate"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(content, key)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                        title="Copy"
                                    >
                                        {copiedIndex === key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
                                {content}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {/* Single generated asset */}
            {generateMutation.data && selectedAsset && !generateAllMutation.data?.[selectedAsset] && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            {COPY_LABELS[selectedAsset] || selectedAsset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <button
                            onClick={() => copyToClipboard(generateMutation.data!.content, selectedAsset)}
                            className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                        >
                            {copiedIndex === selectedAsset ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
                        {generateMutation.data.content}
                    </pre>
                </div>
            )}
        </PageTransition>
    )
}
