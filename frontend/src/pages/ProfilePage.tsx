import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { User, Camera, Lock, Shield, Calendar, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import apiClient from '@/api/client'

interface NameFormData { name: string }
interface PasswordFormData { current_password: string; new_password: string; confirm_password: string }

export default function ProfilePage() {
    const { user, setAuth, token } = useAuthStore()
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [nameSaving, setNameSaving] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)

    const { register: registerName, handleSubmit: handleNameSubmit, formState: { errors: nameErrors } } = useForm<NameFormData>({
        defaultValues: { name: user?.name || '' }
    })

    const { register: registerPwd, handleSubmit: handlePwdSubmit, watch: watchPwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordFormData>()

    if (!user) return null

    const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
        setAvatarUploading(true)
        const reader = new FileReader()
        reader.onload = async (ev) => {
            const dataUrl = ev.target?.result as string
            try {
                const res = await apiClient.patch('/auth/me', { avatar_url: dataUrl })
                setAuth(token!, { ...user, avatar_url: res.data.avatar_url })
                toast.success('Profile photo updated!')
            } catch {
                toast.error('Failed to update photo')
            } finally { setAvatarUploading(false) }
        }
        reader.readAsDataURL(file)
    }

    const onNameSubmit = async (data: NameFormData) => {
        if (data.name.trim() === user.name) { toast('No changes to save'); return }
        setNameSaving(true)
        try {
            const res = await apiClient.patch('/auth/me', { name: data.name.trim() })
            setAuth(token!, { ...user, name: res.data.name })
            toast.success('Name updated!')
        } catch {
            toast.error('Failed to update name')
        } finally { setNameSaving(false) }
    }

    const onPasswordSubmit = async (data: PasswordFormData) => {
        if (data.new_password !== data.confirm_password) { toast.error('Passwords do not match'); return }
        setPasswordSaving(true)
        try {
            await apiClient.patch('/auth/me/password', {
                current_password: data.current_password,
                new_password: data.new_password,
            })
            toast.success('Password changed successfully!')
            resetPwd()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to change password')
        } finally { setPasswordSaving(false) }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account information</p>
            </div>

            {/* Avatar + Name Card */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile Information
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative group">
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-brand-500/30"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center ring-2 ring-brand-500/30">
                                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{initials}</span>
                            </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            {avatarUploading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-white" />
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {user.auth_provider === 'google' ? (
                                <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">Google Account</span>
                            ) : (
                                <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">Email Account</span>
                            )}
                            {user.is_verified ? (
                                <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">Unverified</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click the photo to change it</p>
                    </div>
                </div>

                {/* Edit Name */}
                <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-4">
                    <div>
                        <label className="label mb-1.5">Display Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input flex-1"
                                {...registerName('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                            />
                            <button type="submit" disabled={nameSaving} className="btn-primary text-sm flex-shrink-0">
                                {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {nameSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        {nameErrors.name && <p className="text-red-500 text-xs mt-1">{nameErrors.name.message}</p>}
                    </div>
                    <div>
                        <label className="label mb-1.5">Email</label>
                        <input type="email" className="input opacity-60 cursor-not-allowed" value={user.email} readOnly />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                </form>
            </div>

            {/* Account Info card */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Account Info
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" /> Sign-in method
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {user.auth_provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="w-4 h-4" /> Email status
                        </div>
                        <span className={`text-sm font-medium ${user.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {user.is_verified ? 'Verified' : 'Not verified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Change Password — only for email users */}
            {user.auth_provider !== 'google' && (
                <div className="card">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Change Password
                    </h2>
                    <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="space-y-4">
                        <div>
                            <label className="label mb-1.5">Current Password</label>
                            <input
                                type="password" className="input"
                                {...registerPwd('current_password', { required: 'Required' })}
                            />
                        </div>
                        <div>
                            <label className="label mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'} className="input pr-10"
                                    placeholder="Min 8 characters"
                                    {...registerPwd('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {pwdErrors.new_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.new_password.message}</p>}
                        </div>
                        <div>
                            <label className="label mb-1.5">Confirm New Password</label>
                            <input
                                type="password" className="input"
                                {...registerPwd('confirm_password', {
                                    required: 'Required',
                                    validate: v => v === watchPwd('new_password') || 'Passwords do not match'
                                })}
                            />
                            {pwdErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirm_password.message}</p>}
                        </div>
                        <button type="submit" disabled={passwordSaving} className="btn-primary text-sm">
                            {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            {passwordSaving ? 'Saving...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            )}

            {/* Google users: show note about password */}
            {user.auth_provider === 'google' && (
                <div className="card border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Google Account</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                                Your account is secured by Google. To change your password, visit your <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline">Google Account settings</a>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
