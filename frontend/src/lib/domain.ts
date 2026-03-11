export function normalizeHostname(value: string | undefined | null) {
    return (value || '')
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
}
