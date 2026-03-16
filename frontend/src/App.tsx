import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState, lazy, Suspense } from 'react'
import { authApi } from '@/api/auth'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from '@/pages/LandingPage'
// import LandingPage from '@/pages/LandingPage' // Keep eager for LCP
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const EditorPage = lazy(() => import('@/pages/EditorPage'))
const PublicPortfolioPage = lazy(() => import('@/pages/PublicPortfolioPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))

import AppLayout from '@/layouts/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieConsent from '@/components/CookieConsent'
import ClickSpark from '@/components/reactbits/ClickSpark'
import SplashCursor from '@/components/reactbits/SplashCursor'
import { normalizeHostname } from '@/lib/domain'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuthStore()
    if (!isInitialized) return null
    if (!user) return <Navigate to="/login" replace />
    return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuthStore()
    if (!isInitialized) return null
    if (user) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuthStore()
    if (!isInitialized) return null
    if (!user) return <Navigate to="/login" replace />
    if (!user.is_admin) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}

export default function App() {
    const { initTheme, user, setAuth, isInitialized, setInitialized } = useAuthStore()
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"
    const [showInteractiveEffects, setShowInteractiveEffects] = useState(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return true
        }
        return (
            window.matchMedia('(pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
    })

    useEffect(() => {
        initTheme()

        // Silently refresh user data on mount if we have a session
        authApi.me()
            .then((res: any) => {
                setAuth(res.data)
                setInitialized(true)
            })
            .catch((err: any) => {
                if (user) setAuth(null)
                setInitialized(true)
            })
    }, [initTheme, setAuth, setInitialized])

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return
        }

        const pointerQuery = window.matchMedia('(pointer: fine)')
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

        const syncEffectsPreference = () => {
            setShowInteractiveEffects(pointerQuery.matches && !motionQuery.matches)
        }

        syncEffectsPreference()

        const addListener = (query: MediaQueryList) => {
            if (typeof query.addEventListener === 'function') {
                query.addEventListener('change', syncEffectsPreference)
                return () => query.removeEventListener('change', syncEffectsPreference)
            }
            query.addListener(syncEffectsPreference)
            return () => query.removeListener(syncEffectsPreference)
        }

        const removePointerListener = addListener(pointerQuery)
        const removeMotionListener = addListener(motionQuery)

        return () => {
            removePointerListener()
            removeMotionListener()
        }
    }, [])

    const host = normalizeHostname(window.location.hostname)
    const appDomain = normalizeHostname(import.meta.env.VITE_APP_DOMAIN)
    const isCustomDomain = host !== 'localhost' &&
        host !== '127.0.0.1' &&
        !host.includes('vercel.app') &&
        appDomain && host !== appDomain

    if (isCustomDomain) {
        return (
            <HelmetProvider>
                <ErrorBoundary>
                    <BrowserRouter>
                        <PublicPortfolioPage />
                    </BrowserRouter>
                </ErrorBoundary>
            </HelmetProvider>
        )
    }

    return (
        <HelmetProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <ErrorBoundary>
                    <BrowserRouter>
                        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
                            <Routes>
                                {/* Public */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/u/:slug" element={<PublicPortfolioPage />} />
                                <Route path="/verify-email" element={<VerifyEmailPage />} />


                                {/* Guest only */}
                                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                                <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                                <Route path="/reset-password" element={<ResetPasswordPage />} />
                                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                                {/* Protected - only for logged in users */}
                                <Route path="/upload" element={<ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>} />
                                <Route path="/editor" element={<ProtectedRoute><AppLayout><EditorPage /></AppLayout></ProtectedRoute>} />

                                {/* Dashboard & Management */}
                                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                                <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
                                <Route path="/admin" element={<AdminRoute><AppLayout><AdminPage /></AppLayout></AdminRoute>} />

                                {/* 404 */}
                                <Route path="/privacy" element={<PrivacyPage />} />
                                <Route path="/terms" element={<TermsPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Suspense>
                        <CookieConsent />
                        {showInteractiveEffects ? (
                            <>
                                <ClickSpark
                                    sparkColor='#6366f1'
                                    sparkSize={6}
                                    sparkCount={12}
                                    duration={0.5}
                                />
                                <SplashCursor />
                            </>
                        ) : null}
                    </BrowserRouter>
                </ErrorBoundary>
            </GoogleOAuthProvider>
        </HelmetProvider>
    )
}
