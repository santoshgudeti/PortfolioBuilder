import { useCallback, useEffect, useRef, useState } from 'react'
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
import { getErrorMessage } from '@/lib/errors'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_UPLOAD_TYPES =
    '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const APP_BUILD_INFO = __APP_BUILD_INFO__
let cachedSelectedFile: File | null = null

function formatUnknownError(reason: unknown): string {
    return getErrorMessage(reason, 'unknown')
}

export default function UploadPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { token } = useAuthStore()
    const { setParsedData, setPortfolio } = usePortfolioStore()

    const [file, setFileState] = useState<File | null>(() => cachedSelectedFile)
    const [tone, setTone] = useState('professional')
    const [mode, setMode] = useState<'replace' | 'merge'>('replace')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [debugLog, setDebugLog] = useState<string[]>(() => {
        if (typeof window === 'undefined') return []
        try {
            const stored = window.sessionStorage.getItem('upload_debug_log')
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    const wakeLockRef = useRef<any>(null)
    const forceDebug =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('debug') === 'true'
    const showDebug = forceDebug || uploadError !== null

    const setSelectedFile = useCallback((nextFile: File | null) => {
        cachedSelectedFile = nextFile
        setFileState(nextFile)
    }, [])

    const addLog = useCallback((msg: string) => {
        const entry = `${new Date().toLocaleTimeString()}: ${msg}`
        console.log(`[UploadDebug] ${msg}`)
        setDebugLog(prev => {
            const next = [...prev.slice(-49), entry]
            if (typeof window !== 'undefined') {
                try {
                    window.sessionStorage.setItem('upload_debug_log', JSON.stringify(next))
                } catch {}
            }
            return next
        })
    }, [])

    const clearLogs = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                window.sessionStorage.removeItem('upload_debug_log')
            } catch {}
        }
        setDebugLog([])
    }, [])

    useEffect(() => {
        addLog(`Upload page ready. Build=${APP_BUILD_INFO}`)
        if (cachedSelectedFile) {
            addLog(`Restored selected file from page cache: ${cachedSelectedFile.name || 'unnamed'}`)
        }

        const handleError = (event: ErrorEvent) => addLog(`Runtime error: ${event.message}`)
        const handleRejection = (event: PromiseRejectionEvent) =>
            addLog(`Unhandled rejection: ${formatUnknownError(event.reason)}`)

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleRejection)
        }
    }, [addLog])

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
                addLog('Wake lock acquired')
            }
        } catch (error: any) {
            addLog(`Wake lock unavailable: ${error?.message || 'unsupported'}`)
        }
    }

    const releaseWakeLock = () => {
        wakeLockRef.current?.release().catch(() => {})
        wakeLockRef.current = null
    }

    const { data: existingPortfolio, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: async () => {
            try {
                const response = await portfolioApi.getMyPortfolio()
                return response.data
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    addLog('No existing portfolio found for current user')
                    return null
                }
                throw error
            }
        },
        retry: false,
        enabled: !!token,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
    })
    const hasPortfolio = !!existingPortfolio

    const mutation = useMutation({
        mutationFn: (selectedFile: File) => {
            addLog(
                `Upload started: name=${selectedFile.name || 'unnamed'} type=${selectedFile.type || 'empty'} size=${selectedFile.size}`,
            )
            return resumeApi.upload(selectedFile, tone, mode).then(r => r.data)
        },
        onSuccess: (data) => {
            releaseWakeLock()
            setSelectedFile(null)
            setUploadError(null)
            addLog(`Upload complete: portfolio_id=${data.portfolio_id}`)
            setParsedData(data.parsed_data)
            setPortfolio({
                portfolioId: data.portfolio_id,
                slug: data.slug,
            })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            toast.success('Resume parsed successfully! Redirecting to editor...')
            setTimeout(() => navigate('/editor'), 1500)
        },
        onError: (err: any) => {
            releaseWakeLock()
            const msg = getErrorMessage(
                err.response?.data?.detail ?? err.response?.data ?? err,
                'Upload failed. Please try again.',
            )
            addLog(`Upload failed: ${msg}`)
            setUploadError(msg)
            toast.error(msg)
        },
    })

    const rejectSelection = useCallback(
        (message: string, logMessage: string) => {
            setSelectedFile(null)
            setUploadError(message)
            addLog(logMessage)
            toast.error(message)
        },
        [addLog, setSelectedFile],
    )

    const validateAndSetFile = useCallback(
        (selectedFile: File | null | undefined) => {
            if (!selectedFile) {
                addLog('Native input changed but no file was returned')
                return
            }

            addLog(
                `File selected: name=${selectedFile.name || 'unnamed'} type=${selectedFile.type || 'empty'} size=${selectedFile.size}`,
            )

            if (/\.doc$/i.test(selectedFile.name || '')) {
                rejectSelection(
                    'Legacy .doc files are not supported. Please convert the file to PDF or DOCX.',
                    'Rejected legacy .doc file',
                )
                return
            }

            if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
                rejectSelection('File exceeds 5MB limit', 'Rejected file larger than 5MB')
                return
            }

            if (
                selectedFile.type &&
                (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/'))
            ) {
                rejectSelection(
                    'Please upload a document (PDF/DOCX).',
                    `Rejected non-document type ${selectedFile.type}`,
                )
                return
            }

            setSelectedFile(selectedFile)
            setUploadError(null)
            addLog('File accepted and rendered in UI')
        },
        [addLog, rejectSelection, setSelectedFile],
    )

    const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        addLog('Native file input changed')
        const selectedFile = e.target.files?.[0]
        validateAndSetFile(selectedFile)
        e.target.value = ''
    }

    const handleUpload = async () => {
        if (!file) {
            addLog('Upload requested without a selected file')
            return
        }

        setUploadError(null)
        await requestWakeLock()
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
        <PageTransition className="mx-auto w-full max-w-2xl pb-24">
            {mutation.isPending && <AIProcessingOverlay />}

            {uploadError && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20 sm:p-4">
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
                <p className="mt-2 text-xs font-mono text-gray-400 dark:text-gray-500">
                    Build {APP_BUILD_INFO}
                </p>
            </div>

            {hasPortfolio && (
                <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/10 sm:p-5">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Portfolio already exists</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Uploading again will update your existing portfolio. Use <strong>Merge</strong> to keep edits or <strong>Replace</strong> to start fresh.
                            </p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                <button onClick={() => navigate('/editor')} className="btn-secondary w-full text-sm sm:w-auto">
                                    Go To Editor
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline sm:self-center">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40 sm:p-6"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                        <Upload className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                            Choose your resume file
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Plain native file input for maximum mobile compatibility. PDF or DOCX only, max 5MB.
                        </p>
                    </div>
                </div>

                <input
                    type="file"
                    accept={ACCEPTED_UPLOAD_TYPES}
                    onChange={handleNativeInput}
                    className="mt-4 block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-brand-500 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-gray-200 dark:file:bg-white dark:file:text-gray-900"
                />

                <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    If the same file does not trigger on some phones, change to another file once and then switch back. This input resets after each selection.
                </div>
            </div>

            {file && (
                <div className="mt-4 card flex items-start gap-3 rounded-3xl p-4 sm:items-center sm:p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name || 'Selected file'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="self-start rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 sm:self-auto">
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
                <div className="mt-4 card rounded-3xl p-4 sm:p-6">
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

            <div className="mt-8 card rounded-3xl border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10 sm:p-6">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Tips for best results</p>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li>- Use a text-based PDF (not scanned)</li>
                            <li>- Include skills, projects, and work experience</li>
                            <li>- Make sure contact info is clearly visible</li>
                        </ul>
                    </div>
                </div>
            </div>

            {showDebug && (
                <div className="mt-6 p-3 rounded-xl bg-gray-900 text-xs font-mono max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-bold">Debug Log</span>
                        <button onClick={clearLogs} className="text-gray-500 text-xs">Clear</button>
                    </div>
                    <div className="mb-2 text-gray-500">Build {APP_BUILD_INFO}</div>
                    {debugLog.length > 0 ? (
                        debugLog.map((log, i) => (
                            <div
                                key={i}
                                className={`py-0.5 ${
                                    log.includes('failed') || log.includes('Rejected')
                                        ? 'text-red-400'
                                        : log.includes('accepted') ||
                                          log.includes('complete') ||
                                          log.includes('started')
                                          ? 'text-green-400'
                                          : 'text-gray-300'
                                }`}
                            >
                                {log}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400">No diagnostic events recorded yet.</div>
                    )}
                </div>
            )}
        </PageTransition>
    )
}
