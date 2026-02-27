import apiClient from './client'

export interface LoginData { email: string; password: string }
export interface RegisterData { name: string; email: string; password: string }

export const authApi = {
    register: (data: RegisterData) => apiClient.post('/auth/register', data),
    login: (data: LoginData) => apiClient.post('/auth/login', data),
    googleLogin: (credential: string) => apiClient.post('/auth/google', { credential }),
    me: () => apiClient.get('/auth/me'),
    forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, new_password: string) => apiClient.post('/auth/reset-password', { token, new_password }),
    resendVerification: (email: string) => apiClient.post('/auth/resend-verification', { email }),
    verifyEmail: (token: string) => apiClient.get(`/auth/verify-email?token=${token}`),
    deleteAccount: () => apiClient.delete('/auth/me'),
}
