import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'

interface AIButtonProps {
    field: string
    value: string
    context?: string
    onResult: (v: string) => void
}

export function AIButton({ field, value, context, onResult }: AIButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleRegenerate = async () => {
        if (!value?.trim()) {
            toast.error('Add some text first to improve')
            return
        }
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
