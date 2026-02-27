import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
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
import AppLayout from '@/layouts/AppLayout'

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
    const { initTheme } = useAuthStore()
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

    useEffect(() => {
        initTheme()
    }, [initTheme])

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
                        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                        <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
                        <Route path="/upload" element={<ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>} />
                        <Route path="/editor" element={<ProtectedRoute><AppLayout><EditorPage /></AppLayout></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
                        <Route path="/admin" element={<AdminRoute><AppLayout><AdminPage /></AppLayout></AdminRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </GoogleOAuthProvider>
        </HelmetProvider>
    )
}
