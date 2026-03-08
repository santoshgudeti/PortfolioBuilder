import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import { authApi } from '@/api/auth'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import UploadPage from '@/pages/UploadPage'
import EditorPage from '@/pages/EditorPage'
import PublicPortfolioPage from '@/pages/PublicPortfolioPage'
import SettingsPage from '@/pages/SettingsPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import AppLayout from '@/layouts/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieConsent from '@/components/CookieConsent'
import ClickSpark from '@/components/reactbits/ClickSpark'
import SplashCursor from '@/components/reactbits/SplashCursor'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuthStore()
    if (!token) return <Navigate to="/login" replace />
    return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuthStore()
    if (token) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuthStore()
    if (!token) return <Navigate to="/login" replace />
    if (!user?.is_admin) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}

export default function App() {
    const { initTheme, token, setAuth } = useAuthStore()
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

    useEffect(() => {
        initTheme()

        // Silently refresh user data on mount if we have a token
        // to catch DB changes like is_admin or verification status
        if (token) {
            authApi.me()
                .then((res: any) => setAuth(token, res.data))
                .catch((err: any) => console.error("Failed to refresh user auth state:", err))
        }
    }, [initTheme, token, setAuth])

    const hostname = window.location.hostname
    const isCustomDomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('vercel.app') && hostname !== (import.meta.env.VITE_APP_DOMAIN || '')

    if (isCustomDomain) {
        return (
            <HelmetProvider>
                <PublicPortfolioPage />
            </HelmetProvider>
        )
    }

    return (
        <HelmetProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <ErrorBoundary>
                    <BrowserRouter>
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

                            {/* Protected */}
                            {/* Public - available to guests for "Try before buy" */}
                            <Route path="/upload" element={<AppLayout><UploadPage /></AppLayout>} />
                            <Route path="/editor" element={<AppLayout><EditorPage /></AppLayout>} />

                            {/* Protected - only for logged in users */}
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
                        <CookieConsent />
                        <ClickSpark
                            sparkColor='#6366f1'
                            sparkSize={6}
                            sparkCount={12}
                            duration={0.5}
                        />
                        <SplashCursor />
                    </BrowserRouter>
                </ErrorBoundary>
            </GoogleOAuthProvider>
        </HelmetProvider>
    )
}
