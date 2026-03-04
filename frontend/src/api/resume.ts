import apiClient from './client'

export const resumeApi = {
    upload: (file: File, tone: string = 'professional', mode: string = 'replace') => {
        const formData = new FormData()

        let filename = file.name || 'document.pdf'
        const lowerName = filename.toLowerCase()
        if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.doc')) {
            if (file.type && (file.type.includes('wordprocessingml') || file.type.includes('msword'))) {
                filename += '.docx'
            } else {
                filename += '.pdf'
            }
        }

        formData.append('file', file, filename)
        formData.append('tone', tone)
        formData.append('mode', mode)
        return apiClient.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}
