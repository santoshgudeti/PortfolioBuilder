import apiClient from './client'

export interface LoginData { email: string; password: string }
export interface RegisterData { name: string; email: string; password: string }

export const authApi = {
    register: (data: RegisterData) => apiClient.post('/auth/register', data),
    login: (data: LoginData) => apiClient.post('/auth/login', data),
    me: () => apiClient.get('/auth/me'),
}
