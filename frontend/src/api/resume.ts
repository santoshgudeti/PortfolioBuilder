import apiClient from './client'

export const resumeApi = {
    upload: (file: File, tone: string = 'professional', mode: string = 'replace') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tone', tone)
        formData.append('mode', mode)
        return apiClient.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}
