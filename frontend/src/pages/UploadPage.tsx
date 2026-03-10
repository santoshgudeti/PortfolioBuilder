import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { portfolioApi } from '@/api/portfolio'
import { resumeApi } from '@/api/resume'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import {
    AlertCircle,
    CheckCircle,
    FileText,
    GitMerge,
    Loader2,
    RefreshCw,
    Upload,
    X,
} from 'lucide-react'
import AIProcessingOverlay from '@/components/AIProcessingOverlay'
import PageTransition from '@/components/PageTransition'
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addLog = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])

    const openFilePicker = () => {
        addLog('openFilePicker called')
        fileInputRef.current?.click()
    }

    const wakeLockRef = useRef<any>(null)
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
            }
        } catch (_) {}
    }
    const releaseWakeLock = () => {
        wakeLockRef.current?.release().catch(() => {})
        wakeLockRef.current = null
    }

    const { data: existingPortfolio, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
        enabled: !!token,
    })
    const hasPortfolio = !!existingPortfolio

    const mutation = useMutation({
        mutationFn: (selectedFile: File) => {
            addLog(`Sending upload request... file=${selectedFile.name} size=${selectedFile.size} type=${selectedFile.type}`)
            return resumeApi.upload(selectedFile, tone, mode).then(r => {
                addLog('Upload response received: status=OK')
                return r.data
            })
        },
        onSuccess: (data) => {
            releaseWakeLock()
            setUploadError(null)
            addLog(`SUCCESS: portfolio_id=${data.portfolio_id}, slug=${data.slug}`)
            setParsedData(data.parsed_data)
            setPortfolio({
                portfolioId: data.portfolio_id,
                slug: data.slug,
                isGuest: data.is_guest,
            })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            toast.success('Resume parsed successfully! Redirecting to editor...')
            setTimeout(() => navigate('/editor'), 1500)
        },
        onError: (err: any) => {
            releaseWakeLock()
            const msg = err.response?.data?.detail || err.message || 'Upload failed. Please try again.'
            addLog(`ERROR: ${msg}`)
            setUploadError(msg)
            toast.error(msg)
        },
    })

    const validateAndSetFile = (selectedFile: File) => {
        if (!selectedFile) {
            addLog('validateAndSetFile: no file')
            return
        }

        addLog(`File picked: name=${selectedFile.name} size=${selectedFile.size} type=${selectedFile.type || 'empty'}`)

        if (/\.doc$/i.test(selectedFile.name) || selectedFile.type.includes('msword')) {
            addLog('REJECTED: legacy .doc file')
            toast.error('Legacy .doc files are not supported. Please convert the file to PDF or DOCX.')
            return
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            addLog('REJECTED: file too large')
            toast.error('File exceeds 5MB limit')
            return
        }

        if (selectedFile.type && (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/'))) {
            addLog(`REJECTED: wrong type ${selectedFile.type}`)
            toast.error('Please upload a document (PDF/DOCX).')
            return
        }

        addLog('File accepted')
        setFile(selectedFile)
    }

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) {
            validateAndSetFile(accepted[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        maxFiles: 1,
    })

    const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        addLog('Native input onChange fired')
        const files = e.target.files
        if (!files || files.length === 0) {
            addLog('No files in input')
            return
        }
        validateAndSetFile(files[0])
        e.target.value = ''
    }

    const handleUpload = async () => {
        if (!file) {
            addLog('handleUpload called but no file selected')
            return
        }

        setUploadError(null)
        await requestWakeLock()
        addLog('Wake lock acquired, starting mutation...')
        mutation.mutate(file)
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Your Resume</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Our AI will extract your data and generate a portfolio in seconds.
                </p>
            </div>

            {hasPortfolio && (
                <div className="mb-6 rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10 p-5">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Portfolio already exists</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Uploading again will update your existing portfolio. Use <strong>Merge</strong> to keep edits or <strong>Replace</strong> to start fresh.
                            </p>
                            <div className="flex gap-3 mt-3">
                                <button onClick={() => navigate('/editor')} className="btn-secondary text-sm">
                                    Go To Editor
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
                onChange={handleNativeInput}
            />

            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-10 text-center transition-all
                    ${isDragActive
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                        : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4">
                    <div
                        onClick={openFilePicker}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                            isDragActive
                                ? 'bg-brand-100 dark:bg-brand-900/30'
                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                        }`}
                    >
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-500' : 'text-gray-400'}`} />
                    </div>
                    {isDragActive ? (
                        <p className="text-brand-600 dark:text-brand-400 font-medium">Drop your resume here</p>
                    ) : (
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Drag and drop your resume</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF or DOCX • Max 5MB</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={openFilePicker}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium text-sm cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
            >
                <Upload className="w-4 h-4" />
                Tap to browse files
            </button>

            {file && (
                <div className="mt-4 card flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {file && (
                <div className="mt-6">
                    <ToneSelector selected={tone} onChange={setTone} />
                </div>
            )}

            {file && hasPortfolio && (
                <div className="mt-4 card">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">You already have a portfolio. How should we handle this?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setMode('merge')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                mode === 'merge'
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <GitMerge className="w-4 h-4 text-brand-500" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Merge</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Keep your edits. Only fill in empty fields from the new resume.</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('replace')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                mode === 'replace'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <RefreshCw className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Replace</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Start fresh. Overwrites all current portfolio content.</p>
                        </button>
                    </div>
                    {mode === 'replace' && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400">This will overwrite your current portfolio content including any manual edits.</p>
                        </div>
                    )}
                </div>
            )}

            {file && (
                <>
                    {mutation.isPending && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 font-medium">
                            Keep this screen open while AI is processing...
                        </p>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={mutation.isPending}
                        className="btn-primary w-full mt-4 py-3 text-base"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Parsing with AI...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Generate Portfolio
                            </>
                        )}
                    </button>
                </>
            )}

            {mutation.isSuccess && (
                <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Portfolio generated! Redirecting to editor...
                </div>
            )}

            <div className="mt-8 card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Tips for best results</p>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li>• Use a text-based PDF (not scanned)</li>
                            <li>• Include skills, projects, and work experience</li>
                            <li>• Make sure contact info is clearly visible</li>
                        </ul>
                    </div>
                </div>
            </div>

            {debugLog.length > 0 && (
                <div className="mt-6 p-3 rounded-xl bg-gray-900 text-xs font-mono max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-bold">Debug Log</span>
                        <button onClick={() => setDebugLog([])} className="text-gray-500 text-xs">Clear</button>
                    </div>
                    {debugLog.map((log, i) => (
                        <div
                            key={i}
                            className={`py-0.5 ${
                                log.includes('ERROR')
                                    ? 'text-red-400'
                                    : log.includes('SUCCESS')
                                      ? 'text-green-400'
                                      : log.includes('REJECTED')
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                            }`}
                        >
                            {log}
                        </div>
                    ))}
                </div>
            )}
        </PageTransition>
    )
}
