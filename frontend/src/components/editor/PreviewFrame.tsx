import { Monitor, Tablet, Smartphone, Maximize2, Minimize2, EyeOff, Loader2 } from 'lucide-react'
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
    isMobile,
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
            ${previewFullscreen ? 'fixed inset-0 z-[100] bg-white dark:bg-gray-900 p-4' : 'hidden lg:flex lg:w-[45%] flex-col'} 
            transition-all duration-300
        `}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => onSetDevice('desktop')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-400'}`}><Monitor className="w-4 h-4" /></button>
                    <button onClick={() => onSetDevice('tablet')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-400'}`}><Tablet className="w-4 h-4" /></button>
                    <button onClick={() => onSetDevice('mobile')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-400'}`}><Smartphone className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onSetFullscreen(!previewFullscreen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all">
                        {previewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    {previewFullscreen ? (
                        <button onClick={() => onSetFullscreen(false)} className="btn-primary text-sm px-4">Done Previewing</button>
                    ) : (
                        <button onClick={() => onSetShowPreview(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all"><EyeOff className="w-4 h-4" /></button>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                <div
                    className="bg-white dark:bg-gray-900 shadow-2xl transition-all duration-500 overflow-y-auto"
                    style={{
                        width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                        height: '100%',
                        borderRadius: previewDevice === 'desktop' ? '0' : '24px',
                        border: previewDevice === 'desktop' ? 'none' : '8px solid #1f2937'
                    }}
                >
                    {isMobile && !previewFullscreen ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <Maximize2 className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">To see the preview on mobile, tap the Eye icon above.</p>
                        </div>
                    ) : (
                        <div className="h-full relative overflow-y-auto custom-scrollbar">
                            <PublicPortfolioPage
                                previewData={localData}
                                previewTheme={theme}
                                previewTemplateId={templateId}
                                previewMode={mode}
                                previewColor={primaryColor}
                                previewHiddenSections={Array.from(hiddenSections || [])}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
