import apiClient from './client'

export const portfolioApi = {
    getMyPortfolio: () => apiClient.get('/portfolio/me'),
    updateMyPortfolio: (data: object) => apiClient.put('/portfolio/me', data),
    publish: () => apiClient.post('/portfolio/me/publish'),
    unpublish: () => apiClient.post('/portfolio/me/unpublish'),
    preview: () => apiClient.get('/portfolio/preview'),
    getPublic: (slug: string) => apiClient.get(`/portfolio/public/${slug}`),
    getByDomain: (domain: string) => apiClient.get(`/portfolio/domain/${domain}`),
    regenerate: (field: string, current_value: string, context?: string) =>
        apiClient.post('/portfolio/me/regenerate', { field, current_value, context: context || '' }),
    checkSlug: (slug: string) => apiClient.get(`/portfolio/check-slug?slug=${slug}`),
    updateSlug: (slug: string) => apiClient.patch('/portfolio/me/slug', { slug }),
}

