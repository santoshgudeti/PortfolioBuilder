import { useState } from 'react'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface Props {
    text?: string
}

function getGoogleButtonText(text: string): 'signin_with' | 'signup_with' | 'continue_with' {
    const normalized = text.trim().toLowerCase()
    if (normalized.includes('sign up')) {
        return 'signup_with'
    }
    if (normalized.includes('sign in') || normalized.includes('log in') || normalized.includes('login')) {
        return 'signin_with'
    }
    return 'continue_with'
}

export default function GoogleSignInBox({ text = 'Continue with Google' }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        const credential = credentialResponse.credential
        if (!credential) {
            toast.error('Google Sign-In did not return a valid credential.')
            return
        }

        setIsLoading(true)
        try {
            const res = await authApi.googleLogin(credential)
            setAuth(res.data.user)
            toast.success(`Welcome back, ${res.data.user.name}!`)
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Google Sign-In failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="w-full h-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-200 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-brand-500" />
                <span className="text-[15px] font-semibold">Connecting...</span>
            </div>
        )
    }

    return (
        <div className="w-full flex justify-center overflow-hidden rounded-lg">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error('Could not connect to Google.')}
                theme="outline"
                size="large"
                text={getGoogleButtonText(text)}
                shape="rectangular"
                logo_alignment="left"
                width={320}
                containerProps={{ className: 'w-full flex justify-center' }}
            />
        </div>
    )
}
