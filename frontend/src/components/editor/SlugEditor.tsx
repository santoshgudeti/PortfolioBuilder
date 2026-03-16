import { useState, useEffect, useRef } from 'react'
import { Link2, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'

interface SlugEditorProps {
    currentSlug: string
    onUpdated: (s: string) => void
}

export function SlugEditor({ currentSlug, onUpdated }: SlugEditorProps) {
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
                <Link2 className="w-4 h-4" /> Personal Link
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose a unique web address for your site. Use lowercase letters, numbers, and hyphens.</p>
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
