import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    withCredentials: true,
})

// No need for Authorization header interceptor - handled by browser cookies

// Flag to prevent multiple refresh calls simultaneously
let isRefreshing = false
let refreshSubscribers: ((token: any) => void)[] = []

const subscribeTokenRefresh = (cb: (token: any) => void) => {
    refreshSubscribers.push(cb)
}

const onRefreshed = (token: any) => {
    refreshSubscribers.map((cb) => cb(token))
    refreshSubscribers = []
}

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            const isUploadRequest = originalRequest.url?.includes('/resume/upload')
            const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')
            const isLoginRequest = originalRequest.url?.includes('/auth/login')

            if (isRefreshRequest || isLoginRequest) {
                // If the refresh token itself is expired, logout
                useAuthStore.getState().logout()
                return Promise.reject(error)
            }

            if (!isUploadRequest) {
                if (isRefreshing) {
                    return new Promise((resolve) => {
                        subscribeTokenRefresh(() => {
                            resolve(apiClient(originalRequest))
                        })
                    })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    await apiClient.post('/auth/refresh')
                    isRefreshing = false
                    onRefreshed(true)
                    return apiClient(originalRequest)
                } catch (refreshError) {
                    isRefreshing = false
                    useAuthStore.getState().logout()
                    return Promise.reject(refreshError)
                }
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
