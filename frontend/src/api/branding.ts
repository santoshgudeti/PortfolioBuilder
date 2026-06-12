import apiClient from './client'

export interface BrandAssetType {
    id: string
    label: string
}

export const brandingApi = {
    listTypes: () =>
        apiClient.get<{ assets: BrandAssetType[] }>('/branding/types'),

    generate: (assetType: string, tone: string = 'professional') =>
        apiClient.post<{ asset_type: string; content: string }>('/branding/generate', {
            asset_type: assetType,
            tone,
        }),

    generateAll: (tone: string = 'professional') =>
        apiClient.post<Record<string, string>>('/branding/generate-all', { tone }),
}
