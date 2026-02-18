import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resumeApi } from '@/api/resume'
import { usePortfolioStore } from '@/store/portfolioStore'
import { Upload, FileText, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'

export default function UploadPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { setParsedData, setPortfolio } = usePortfolioStore()
    const [file, setFile] = useState<File | null>(null)

    const mutation = useMutation({
        mutationFn: (f: File) => resumeApi.upload(f).then(r => r.data),
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

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) setFile(accepted[0])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
        onDropRejected: (files) => {
            const err = files[0]?.errors[0]
            if (err?.code === 'file-too-large') toast.error('File exceeds 5MB limit')
            else toast.error('Only PDF and DOCX files are accepted')
        },
    })

    const handleUpload = () => {
        if (file) mutation.mutate(file)
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Your Resume</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Our AI will extract your data and generate a beautiful portfolio in seconds.
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                        : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
        `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-500' : 'text-gray-400'}`} />
                    </div>
                    {isDragActive ? (
                        <p className="text-brand-600 dark:text-brand-400 font-medium">Drop your resume here!</p>
                    ) : (
                        <>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Drag & drop your resume</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse files</p>
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
        </div>
    )
}
