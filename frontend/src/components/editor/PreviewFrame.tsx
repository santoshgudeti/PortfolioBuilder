import { Monitor, Tablet, Smartphone, Maximize2, Minimize2, EyeOff } from 'lucide-react'
import PublicPortfolioPage from '../../pages/PublicPortfolioPage'

interface PreviewFrameProps {
    slug: string | null
    previewDevice: 'desktop' | 'tablet' | 'mobile'
    previewFullscreen: boolean
    showPreview: boolean
    isMobile: boolean
    localData: any
    theme?: string
    templateId?: string
    mode?: string
    primaryColor?: string
    hiddenSections?: Set<string>
    onSetDevice: (d: 'desktop' | 'tablet' | 'mobile') => void
    onSetFullscreen: (f: boolean) => void
    onSetShowPreview: (s: boolean) => void
}

export function PreviewFrame({
    slug,
    previewDevice,
    previewFullscreen,
    showPreview,
    isMobile: _isMobile,
    localData,
    theme,
    templateId,
    mode,
    primaryColor,
    hiddenSections,
    onSetDevice,
    onSetFullscreen,
    onSetShowPreview
}: PreviewFrameProps) {
    if (!showPreview && !previewFullscreen) return null

    return (
        <div className={`
            ${previewFullscreen ? 'fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-900 p-6' : 'hidden lg:flex lg:w-[48%] flex-col'} 
            transition-all duration-500 ease-in-out
        `}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 backdrop-blur-xl">
                    <button onClick={() => onSetDevice('desktop')} className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${previewDevice === 'desktop' ? 'bg-white dark:bg-brand-500 shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Monitor className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">Portal</span>
                    </button>
                    <button onClick={() => onSetDevice('tablet')} className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${previewDevice === 'tablet' ? 'bg-white dark:bg-brand-500 shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Tablet className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">Tablet</span>
                    </button>
                    <button onClick={() => onSetDevice('mobile')} className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${previewDevice === 'mobile' ? 'bg-white dark:bg-brand-500 shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Smartphone className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">Mobile</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onSetFullscreen(!previewFullscreen)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                        {previewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    {previewFullscreen ? (
                        <button onClick={() => onSetFullscreen(false)} className="btn-primary !py-2.5 !px-6 text-[10px]">Close Preview</button>
                    ) : (
                        <button onClick={() => onSetShowPreview(false)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10" title="Collapse Preview Panel"><EyeOff className="w-4 h-4" /></button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-gray-50 dark:bg-white/[0.01] rounded-[2.5rem] p-6 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner relative group">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />
                
                <div
                    className="bg-white dark:bg-gray-950 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-y-auto custom-scrollbar relative z-10"
                    style={{
                        width: previewDevice === 'mobile' ? 'min(375px, 100%)' : previewDevice === 'tablet' ? 'min(768px, 100%)' : '100%',
                        maxWidth: '100%',
                        height: '100%',
                        borderRadius: previewDevice === 'desktop' ? '0' : '40px',
                        border: previewDevice === 'desktop' ? 'none' : '12px solid #1a1a1a',
                        // CSS Isolation
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                        isolation: 'isolate',
                        overflowX: 'hidden',
                    }}
                >
                    <PublicPortfolioPage
                        previewData={localData}
                        previewTheme={theme}
                        previewTemplateId={templateId}
                        previewMode={mode}
                        previewColor={primaryColor}
                        previewHiddenSections={Array.from(hiddenSections || [])}
                    />
                </div>
            </div>
        </div>
    )
}
