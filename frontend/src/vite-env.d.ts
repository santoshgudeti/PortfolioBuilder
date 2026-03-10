/// <reference types="vite/client" />

declare const __APP_BUILD_INFO__: string

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_DOMAIN?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
