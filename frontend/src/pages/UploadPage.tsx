import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resumeApi } from '@/api/resume'
import { portfolioApi } from '@/api/portfolio'
import { usePortfolioStore } from '@/store/portfolioStore'
import { Upload, FileText, CheckCircle, Loader2, X, AlertCircle, RefreshCw, GitMerge } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import AIProcessingOverlay from '@/components/AIProcessingOverlay'
import ToneSelector from '@/components/ToneSelector'

export default function UploadPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { setParsedData, setPortfolio } = usePortfolioStore()
    const [file, setFile] = useState<File | null>(null)
    const [tone, setTone] = useState('professional')
    const [mode, setMode] = useState<'replace' | 'merge'>('replace')

    const { data: existingPortfolio, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data),
        retry: false,
    })
    const hasPortfolio = !!existingPortfolio

    const mutation = useMutation({
        mutationFn: (f: File) => resumeApi.upload(f, tone, mode).then(r => r.data),
        onSuccess: (data) => {
            setParsedData(data.parsed_data)
            setPortfolio({ portfolioId: data.portfolio_id, slug: data.slug })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            toast.success('Resume parsed successfully! Redirecting to editor...')
            setTimeout(() => navigate('/editor'), 1500)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Upload failed. Please try again.')
        },
    })

    // Validate files loosely (crucial for mobile where extensions/MIMEs might be stripped)
    const validateAndSetFile = (f: File) => {
        if (!f) {
            toast.error('Passed file object is null/undefined')
            return;
        }

        toast.success(`Checking file: ${f.name} | type: ${f.type} | size: ${f.size}`)

        const size = f.size || 0
        if (size > 5 * 1024 * 1024) {
            toast.error(`File exceeds 5MB limit (${size} bytes)`)
            return
        }

        // Avoid images/videos, otherwise accept (mobile browsers often send generic files)
        if (f.type && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
            toast.error(`Cannot upload image/video. Sent type: ${f.type}`)
            return
        }

        toast.success(`File accepted: ${f.name}`)
        setFile(f)
    }

    // onDrop: handles drag-and-drop on desktop - validates all files manually
    const onDrop = useCallback((accepted: File[], rejected: any[]) => {
        toast('Dropzone event triggered')
        if (rejected.length > 0) {
            toast.error(`React-Dropzone rejected file: ${rejected[0]?.errors?.[0]?.message || 'Unknown reason'}`)
        }
        if (accepted[0]) validateAndSetFile(accepted[0])
        else if (rejected.length === 0) toast.error('No accepted or rejected files found in Dropzone')
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        // NO `accept` here — react-dropzone's MIME filtering silently discards files on mobile
        // (iOS Safari / Chrome Android often report wrong MIME types for PDF/DOCX)
        // We do our own validation by extension in validateAndSetFile instead
        noClick: true, // We handle click via a plain native <input> below for mobile reliability
        maxFiles: 1,
    })

    // Called when user taps "Browse" (native file picker — most reliable on mobile)
    const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        toast('Native file picker onChange triggered')
        const files = e.target.files
        if (!files || files.length === 0) {
            toast.error('Native input fired, but no files were found in e.target.files')
            return
        }
        toast(`Found ${files.length} files in input`)
        const f = files[0]
        if (f) validateAndSetFile(f)
        e.target.value = '' // Reset so same file can be re-selected
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
                    For now, you can only create one portfolio per account. Your generated portfolio is already set up and ready to be customized!
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

    const handleUpload = () => {
        if (file) mutation.mutate(file)
    }

    return (
        <PageTransition className="max-w-2xl mx-auto">
            {mutation.isPending && <AIProcessingOverlay />}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Your Resume</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Our AI will extract your data and generate a beautiful portfolio in seconds.
                </p>
            </div>

            {/* Dropzone — outer div handles desktop drag-drop; label+input handles mobile taps */}
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
                {/* Hidden native file input — most reliable across all mobile browsers */}
                <input
                    id="mobile-file-input"
                    type="file"
                    className="sr-only"
                    onChange={handleNativeInput}
                />
                {/* react-dropzone's own hidden input (for desktop drag-drop) */}
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4">
                    <label
                        htmlFor="mobile-file-input"
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                            }`}
                    >
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-500' : 'text-gray-400'}`} />
                    </label>
                    {isDragActive ? (
                        <p className="text-brand-600 dark:text-brand-400 font-medium">Drop your resume here!</p>
                    ) : (
                        <>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Drag & drop your resume</p>
                                <label
                                    htmlFor="mobile-file-input"
                                    className="text-sm text-brand-500 dark:text-brand-400 mt-1 cursor-pointer underline underline-offset-2 block hover:text-brand-600 transition-colors"
                                >
                                    or tap here to browse files
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">PDF or DOCX • Max 5MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Selected file */}
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

            {/* Tone Selection */}
            {file && (
                <div className="mt-6">
                    <ToneSelector selected={tone} onChange={setTone} />
                </div>
            )}

            {/* Mode Selection — only for re-uploads */}
            {file && hasPortfolio && (
                <div className="mt-4 card">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">You already have a portfolio. How should we handle this?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setMode('merge')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'merge'
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
                            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'replace'
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
                            <p className="text-xs text-red-600 dark:text-red-400">⚠️ This will <strong>overwrite</strong> your current portfolio content including any manual edits.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload button */}
            {file && (
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
            )}

            {/* Success */}
            {mutation.isSuccess && (
                <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Portfolio generated! Redirecting to editor...
                </div>
            )}

            {/* Info */}
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
        </PageTransition>
    )
}
