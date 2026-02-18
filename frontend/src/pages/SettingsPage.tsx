import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import toast from 'react-hot-toast'
import { User, Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
    const { user, logout } = useAuthStore()
    const { reset } = usePortfolioStore()
    const [showDanger, setShowDanger] = useState(false)

    const handleDeleteAccount = () => {
        toast.error('Account deletion requires backend implementation.')
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
            </div>

            {/* Profile */}
            <div className="card mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile
                </h2>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        {user?.is_admin && (
                            <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mt-1">Admin</span>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    To update your name or email, contact support. Password change coming soon.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-200 dark:border-red-900">
                <h2 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account on this device</p>
                        </div>
                        <button onClick={logout} className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10">
                            Sign Out
                        </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
                        </div>
                        <button
                            onClick={() => setShowDanger(true)}
                            className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm modal */}
            {showDanger && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="card max-w-sm w-full mx-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This will permanently delete your account and all portfolio data. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowDanger(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleDeleteAccount} className="btn-primary flex-1 bg-red-500 hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
