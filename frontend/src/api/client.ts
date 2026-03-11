import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60s - increased for production AI parsing
})

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 globally — but don't redirect if it's during an upload
// (Vercel timeout can cause weird responses that shouldn't log the user out)
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            const isUploadRequest = error.config?.url?.includes('/resume/upload')
            if (!isUploadRequest) {
                // Only force logout on 401 for non-upload requests
                useAuthStore.getState().logout()
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
