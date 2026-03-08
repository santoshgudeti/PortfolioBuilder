import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resumeApi } from '@/api/resume'
import { portfolioApi } from '@/api/portfolio'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useAuthStore } from '@/store/authStore'
import {
    Upload, FileText, CheckCircle, Loader2, X, AlertCircle,
    RefreshCw, GitMerge, Sparkles
} from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import AIProcessingOverlay from '@/components/AIProcessingOverlay'
import ToneSelector from '@/components/ToneSelector'

export default function UploadPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { token } = useAuthStore()
    const { setParsedData, setPortfolio } = usePortfolioStore()

    const [file, setFile] = useState<File | null>(null)
    const [tone, setTone] = useState('professional')
    const [mode, setMode] = useState<'replace' | 'merge'>('replace')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [debugLog, setDebugLog] = useState<string[]>([])
    const addLog = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const openFilePicker = () => {
        addLog('openFilePicker called')
        fileInputRef.current?.click()
    }

    // Wake Lock: prevents mobile screen from dimming/locking during AI processing
    const wakeLockRef = useRef<any>(null)
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
            }
        } catch (_) { /* ignore */ }
    }
    const releaseWakeLock = () => {
        wakeLockRef.current?.release().catch(() => { })
        wakeLockRef.current = null
    }

    // Only fetch existing portfolio if logged in (prevents guest loading hang)
    const { data: existingPortfolio, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
        enabled: !!token,
    })

    const hasPortfolio = !!existingPortfolio

    const mutation = useMutation({
        mutationFn: (f: File) => {
            addLog(`Sending upload request... file=${f.name}`)
            return resumeApi.upload(f, tone, mode).then(r => {
                addLog(`Upload response received`)
                return r.data
            })
        },
        onSuccess: (data) => {
            releaseWakeLock()
            setUploadError(null)
            addLog(`SUCCESS: portfolio_id=${data.portfolio_id}`)
            setParsedData(data.parsed_data)
            setPortfolio({
                portfolioId: data.portfolio_id,
                slug: data.slug,
                isGuest: data.is_guest
            })
            if (!data.is_guest) {
                queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            }
            toast.success('Resume parsed successfully!')
            setTimeout(() => navigate('/editor'), 1000)
        },
        onError: (err: any) => {
            releaseWakeLock()
            const msg = err.response?.data?.detail || err.message || 'Upload failed'
            addLog(`ERROR: ${msg}`)
            setUploadError(msg)
            toast.error(msg)
        },
    })

    const validateAndSetFile = (f: File) => {
        if (!f) return
        addLog(`File picked: ${f.name}`)
        if (f.size > 5 * 1024 * 1024) {
            toast.error(`File exceeds 5MB limit`)
            return
        }
        if (f.type && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
            toast.error(`Please upload a document (PDF/DOCX).`)
            return
        }
        setFile(f)
    }

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) validateAndSetFile(accepted[0])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        maxFiles: 1,
    })

    const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files?.[0]) validateAndSetFile(files[0])
        e.target.value = ''
    }

    const handleUpload = async () => {
        if (file) {
            setUploadError(null)
            await requestWakeLock()
            mutation.mutate(file)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        )
    }

    if (hasPortfolio) {
        return (
            <PageTransition className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-brand-600 dark:text-brand-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Portfolio Already Created</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                    Your generated portfolio is already set up and ready to be customized!
                </p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/editor')} className="btn-primary px-8 py-3 text-lg shadow-lg shadow-brand-500/20">
                        Go To Editor
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="px-8 py-3 text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        Dashboard
                    </button>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition className="max-w-2xl mx-auto pb-24 px-4 sm:px-0">
            {mutation.isPending && <AIProcessingOverlay />}

            {uploadError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Upload Failed</p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{uploadError}</p>
                        <button onClick={() => setUploadError(null)} className="text-xs text-red-500 underline mt-1">Dismiss</button>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="uppercase">Elevate Your Story</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Upload your professional history and watch your digital presence come to life.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleNativeInput}
            />

            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-500
                    ${isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 dark:border-white/5 hover:border-brand-500/50'}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6">
                    <div
                        onClick={openFilePicker}
                        className="w-20 h-20 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 text-brand-500 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                    >
                        <Upload className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">Drop your resume</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">PDF, DOCX up to 5MB</p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={openFilePicker}
                className="mt-4 w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] text-gray-500 font-bold text-sm hover:text-brand-500 transition-all shadow-sm"
            >
                <FileText className="w-4 h-4" />
                Select File Manually
            </button>

            {file && (
                <div className="mt-4 card flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {file && <div className="mt-6"><ToneSelector selected={tone} onChange={setTone} /></div>}

            {file && hasPortfolio && (
                <div className="mt-4 card">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">How should we handle this?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => setMode('merge')}
                            className={`p-4 rounded-xl border-2 text-left ${mode === 'merge' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-1"><GitMerge className="w-4 h-4 text-brand-500" /><span className="text-sm font-bold">Merge</span></div>
                            <p className="text-xs text-gray-500">Keep edits, fill empty fields.</p>
                        </button>
                        <button
                            onClick={() => setMode('replace')}
                            className={`p-4 rounded-xl border-2 text-left ${mode === 'replace' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-1"><RefreshCw className="w-4 h-4 text-red-500" /><span className="text-sm font-bold">Replace</span></div>
                            <p className="text-xs text-gray-500">Start fresh. Overwrites all.</p>
                        </button>
                    </div>
                </div>
            )}

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={mutation.isPending}
                    className="btn-primary w-full mt-4 py-3 text-base"
                >
                    {mutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Crafting Portfolio...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> Build My Professional Site</>
                    )}
                </button>
            )}

            <div className="mt-8 card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Tips for best results</p>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li>• Use a text-based PDF</li>
                            <li>• Include skills and projects</li>
                        </ul>
                    </div>
                </div>
            </div>

            {import.meta.env.DEV && debugLog.length > 0 && (
                <div className="mt-12 p-4 rounded-2xl bg-gray-950 text-[10px] font-mono opacity-50">
                    {debugLog.map((log, i) => <div key={i} className="py-0.5 text-gray-400">{log}</div>)}
                </div>
            )}
        </PageTransition>
    )
}
