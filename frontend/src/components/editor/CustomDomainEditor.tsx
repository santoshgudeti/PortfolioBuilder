import { useState, useEffect } from 'react'
import { Globe, Loader2, CheckCircle2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

interface CustomDomainEditorProps {
    currentDomain: string | null
    onUpdated: (s: string) => void
}

export function CustomDomainEditor({ currentDomain, onUpdated }: CustomDomainEditorProps) {
    const [domainInput, setDomainInput] = useState(currentDomain || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => { setDomainInput(currentDomain || '') }, [currentDomain])

    const handleSave = async () => {
        if (domainInput === currentDomain) return

        const cleaned = domainInput.trim().toLowerCase()
        if (cleaned && !/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/.test(cleaned)) {
            toast.error('Invalid domain format')
            return
        }

        setSaving(true)
        try {
            await portfolioApi.updateMyPortfolio({ custom_domain: cleaned || null })
            onUpdated(cleaned)
            toast.success('🌐 Custom domain updated!')
        } catch (e: any) {
            toast.error(e.response?.data?.detail || 'Failed to update domain')
        } finally { setSaving(false) }
    }

    const isChanged = domainInput !== (currentDomain || '')
    const { user } = useAuthStore()

    return (
        <div className="card mt-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Use My Own Domain
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Connect your own domain. Point a CNAME record from your domain to <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">yourapp.vercel.app</code>
            </p>
            <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                    <span className="px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">https://</span>
                    <input
                        type="text"
                        value={domainInput}
                        onChange={e => setDomainInput(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white outline-none font-mono"
                        placeholder="www.yourdomain.com"
                        maxLength={100}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isChanged || saving}
                    className="btn-primary text-sm flex-shrink-0 disabled:opacity-40"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Domain
                </button>
            </div>
            {currentDomain && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Domain configured: {currentDomain}
                </p>
            )}
        </div>
    )
}
