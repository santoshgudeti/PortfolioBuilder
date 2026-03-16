import { Link } from 'react-router-dom'
import {
    Link2, FileDown, ExternalLink, ToggleRight, ToggleLeft, Eye,
    EyeOff, Globe, Save, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'

interface EditorHeaderProps {
    slug: string | null
    isPublished: boolean
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
        <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-editor-title m-0">Editor</h1>
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${isDirty
                                ? 'border-amber-200 bg-amber-50 text-amber-700 animate-pulse'
                                : isPublished
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-gray-200 bg-gray-50 text-gray-500'
                            }`}>
                            {isDirty ? 'Unsaved' : isPublished ? 'Live' : 'Draft'}
                        </div>
                    </div>
                    {slug ? (
                        <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-500 transition-colors text-[11px] flex items-center gap-1.5 font-bold uppercase tracking-widest group">
                            <Globe className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            portfoliobuilder.ai/u/{slug}
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                        </a>
                    ) : (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Workspace / Narrative Design
                        </p>
                    )}
                </div>

                <div className="flex items-center flex-wrap gap-2 bg-white dark:bg-white/[0.02] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-1 pr-2 mr-2 border-r border-gray-100 dark:border-white/10">
                        {slug && isPublished && (
                            <button onClick={onDownloadPDF} disabled={isExportingPDF}
                                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-all" title="Download as PDF">
                                {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={onTogglePreview}
                            className={`p-2.5 rounded-xl transition-all ${showPreview ? 'bg-brand-500/10 text-brand-500' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400'}`}
                            title={showPreview ? "Hide Live Preview" : "Show Live Preview"}
                        >
                            {showPreview ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                    </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPublish}
                                disabled={isPublishPending || isDirty}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDirty 
                                    ? 'opacity-30 cursor-not-allowed text-gray-400' 
                                    : isPublished 
                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                                        : 'bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white'
                                }`}
                            >
                                {isPublishPending ? <Loader2 className="w-3 h-3 animate-spin" /> : isPublished ? <EyeOff className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                {isPublished ? 'Go Offline' : 'Go Live'}
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSavePending}
                                className={`btn-primary !py-2.5 !px-5 text-[10px] ${isDirty ? 'shadow-glow-brand ring-4 ring-brand-500/10' : 'opacity-80'}`}
                            >
                                {isSavePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {isSavePending ? 'Syncing...' : 'Sync Changes'}
                            </button>
                        </div>
                </div>
            </div>

            {isDirty && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unsaved changes in workspace</span>
                </div>
            )}
        </div>
    )
}
