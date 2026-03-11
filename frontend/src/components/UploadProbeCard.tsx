import { useState, type ChangeEvent } from 'react'
import { FileText, FlaskConical, Info, Upload, X } from 'lucide-react'

const ACCEPTED_UPLOAD_TYPES =
    '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function formatSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export default function UploadProbeCard() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState('Waiting for file selection')
    const [selectionCount, setSelectionCount] = useState(0)

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0] ?? null

        if (!nextFile) {
            setStatus('Picker closed without selecting a file')
            return
        }

        setSelectedFile(nextFile)
        setSelectionCount(prev => prev + 1)
        setStatus(`Selected ${nextFile.name}`)
        event.target.value = ''
    }

    const clearSelection = () => {
        setSelectedFile(null)
        setStatus('Selection cleared')
    }

    return (
        <div className="mt-8 w-full max-w-2xl rounded-[2rem] border border-amber-200 bg-white/85 p-5 text-left shadow-[0_24px_60px_rgba(245,158,11,0.12)] backdrop-blur-xl dark:border-amber-500/20 dark:bg-[#111111]/90 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Upload Input Test
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        Native file picker check
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        This does not upload anything. It only checks whether a normal file input can select a file and show it back in the UI.
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                    <div className="font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                        Status
                    </div>
                    <div className="mt-1 font-medium text-gray-700 dark:text-gray-200">{status}</div>
                </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50/50 p-4 dark:border-amber-500/25 dark:bg-amber-500/5 sm:p-5">
                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
                        <Upload className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em]">Plain file input</p>
                        <p className="text-xs text-amber-700/80 dark:text-amber-200/80">
                            Select a PDF or DOCX and confirm the filename appears below.
                        </p>
                    </div>
                </div>

                <input
                    type="file"
                    accept={ACCEPTED_UPLOAD_TYPES}
                    onChange={handleFileChange}
                    className="mt-4 block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-brand-500 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-gray-200 dark:file:bg-white dark:file:text-gray-900"
                />

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/80 p-3 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <p>
                        If this input works on mobile but the real upload page does not, the bug is in the custom upload UI path rather than the browser picker itself.
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0b0b0b] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                            Probe Output
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Selection count: {selectionCount}
                        </p>
                    </div>
                    {selectedFile && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-600 transition-colors hover:text-red-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>

                {selectedFile ? (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-4 dark:border-brand-500/20 dark:bg-white/[0.03]">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {selectedFile.name}
                            </p>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-3">
                                <div>Size: {formatSize(selectedFile.size)}</div>
                                <div>Type: {selectedFile.type || 'unknown'}</div>
                                <div>Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                        No file selected yet.
                    </div>
                )}
            </div>
        </div>
    )
}
