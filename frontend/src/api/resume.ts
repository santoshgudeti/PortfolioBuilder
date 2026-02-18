import apiClient from './client'

export const resumeApi = {
    upload: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return apiClient.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}
