import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('No verification token found.')
            return
        }

        authApi.verifyEmail(token)
            .then(res => {
                setStatus('success')
                setMessage(res.data.message)
            })
            .catch(err => {
                setStatus('error')
                setMessage(err.response?.data?.detail || 'Verification failed. The link may have expired.')
            })
    }, [token])

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-spin" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verifying your email...</h2>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Back to Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
