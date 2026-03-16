import { readFileSync } from 'node:fs'
import path from 'node:path'
import { env } from 'node:process'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const packageJson = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version?: string }

const buildCommit =
    env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    env.GITHUB_SHA?.slice(0, 7) ||
    'local'

const appBuildInfo = `v${packageJson.version || '0.0.0'}-${buildCommit}`

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_BUILD_INFO__: JSON.stringify(appBuildInfo),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: '../backend/static',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
                    ui: ['lucide-react', 'react-hot-toast', 'framer-motion'],
                },
            },
        },
    },
})
