import { Link } from 'react-router-dom'
import {
    Link2, FileDown, ExternalLink, ToggleRight, ToggleLeft, Eye,
    EyeOff, Globe, Save, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'

interface EditorHeaderProps {
    slug: string | null
    isPublished: boolean
    isGuest?: boolean
    isDirty: boolean
    savedOnce: boolean
    isExportingPDF: boolean
    showPreview: boolean
    onDownloadPDF: () => void
    onTogglePreview: () => void
    onPublish: () => void
    onSave: () => void
    isPublishPending: boolean
    isSavePending: boolean
}

export function EditorHeader({
    slug,
    isPublished,
    isGuest,
    isDirty,
    savedOnce,
    isExportingPDF,
    showPreview,
    onDownloadPDF,
    onTogglePreview,
    onPublish,
    onSave,
    isPublishPending,
    isSavePending
}: EditorHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                <div>
                    <h1 className="mb-0.5">Brand Designer</h1>
                    {slug && !isGuest ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            folioai.com/u/{slug}
                        </p>
                    ) : (
                        <p className="text-xs font-black text-brand-500 uppercase tracking-widest">
                            {isGuest ? 'Guest Session — Changes Not Saved' : 'Curate your professional presence'}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {slug && isPublished && (
                        <button onClick={onDownloadPDF} disabled={isExportingPDF}
                            className="btn-secondary text-sm px-3" title="Download as PDF">
                            {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isExportingPDF ? 'Exporting...' : 'PDF'}</span>
                        </button>
                    )}
                    {slug && isPublished && (
                        <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer"
                            className="btn-secondary text-sm px-3 flex" title="View your live public portfolio">
                            <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">View Live</span>
                        </a>
                    )}
                    <button
                        onClick={onTogglePreview}
                        className="btn-secondary text-sm px-3 flex"
                        title="Toggle Live Preview"
                    >
                        {showPreview ? <ToggleRight className="w-4 h-4 text-brand-500 hidden lg:block" /> : <ToggleLeft className="w-4 h-4 text-gray-400 hidden lg:block" />}
                        <Eye className="w-4 h-4 text-brand-500 lg:hidden" />
                        <span className="hidden sm:inline lg:hidden ml-1">Preview</span>
                        <span className="hidden lg:inline ml-1">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                    </button>
                    {isGuest ? (
                        <Link
                            to="/register"
                            className="btn-primary text-xs uppercase tracking-widest font-black py-2.5 px-6 shadow-glow-brand animate-pulse"
                        >
                            Claim Your Portfolio
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={onPublish}
                                disabled={isPublishPending || isDirty}
                                title={isDirty ? 'Save your changes first before going live' : isPublished ? 'Take portfolio offline' : 'Go live with your portfolio'}
                                className={`btn-secondary text-xs uppercase tracking-widest font-black py-2.5 ${isDirty ? 'opacity-50 cursor-not-allowed' :
                                    isPublished ? 'text-red-500 hover:bg-red-50' : 'text-brand-500 hover:bg-brand-50'
                                    }`}
                            >
                                {isPublishPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                {isPublished ? 'Go Offline' : 'Go Live'}
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSavePending}
                                className={`btn-primary text-xs uppercase tracking-widest font-black py-2.5 px-6 ${isDirty ? 'shadow-glow-sm' : ''}`}
                            >
                                {isSavePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSavePending ? 'Saving...' : 'Sync Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={`mt-3 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isGuest
                ? 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : isDirty
                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : isPublished
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
                }`}>
                {isGuest ? (
                    <><AlertCircle className="w-4 h-4 flex-shrink-0 animate-bounce" /> <span>Guest Session — Create an account to save your work and go live.</span></>
                ) : isDirty ? (
                    <><AlertCircle className="w-4 h-4 flex-shrink-0" /> <span><strong>Unsaved changes</strong> — Click <strong>Sync Changes</strong> to save, then <strong>Go Live</strong>.</span></>
                ) : isPublished ? (
                    <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span><strong>Live & Sync'd</strong> — Check it at <a href={`/u/${slug}`} target="_blank" className="underline">folioai.com/u/{slug}</a></span></>
                ) : savedOnce ? (
                    <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span><strong>Sync'd</strong> — Click <strong>Go Live</strong> to launch.</span></>
                ) : (
                    <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span>Design your brand, then sync to save.</span></>
                )}
            </div>
        </div>
    )
}
