import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen, onClose, onConfirm, title, message,
    confirmText = 'Confirm', cancelText = 'Cancel',
    isDestructive = true, isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in-up border border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDestructive ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
                        <div className="flex gap-3 justify-end mt-2">
                            <button onClick={onClose} disabled={isLoading} className="btn-secondary">
                                {cancelText}
                            </button>
                            <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
                                {isLoading ? 'Processing...' : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
