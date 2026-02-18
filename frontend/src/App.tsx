import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import UploadPage from '@/pages/UploadPage'
import EditorPage from '@/pages/EditorPage'
import PublicPortfolioPage from '@/pages/PublicPortfolioPage'
import SettingsPage from '@/pages/SettingsPage'
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

export default function App() {
    const { initTheme } = useAuthStore()

    useEffect(() => {
        initTheme()
    }, [initTheme])

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/u/:slug" element={<PublicPortfolioPage />} />

                {/* Guest only */}
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>} />
                <Route path="/editor" element={<ProtectedRoute><AppLayout><EditorPage /></AppLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
