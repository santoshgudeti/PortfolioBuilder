import apiClient from './client'

export const resumeApi = {
    upload: (file: File, tone: string = 'professional', mode: string = 'replace') => {
        if (/\.doc$/i.test(file.name)) {
            return Promise.reject(
                new Error('Legacy .doc files are not supported. Please convert the file to PDF or DOCX.'),
            )
        }

        const formData = new FormData()

        let filename = file.name || 'document.pdf'
        const lowerName = filename.toLowerCase()
        if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx')) {
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
            // Let the browser attach the multipart boundary automatically.
            timeout: 120000, // 120s — allows for slow cold starts and AI processing
        })
    },
}
