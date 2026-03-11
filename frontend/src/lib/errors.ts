export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'string') return error

  if (error instanceof Error) {
    return error.message || fallback
  }

  if (Array.isArray(error)) {
    const parts = error
      .map((item) => getErrorMessage(item, ''))
      .filter(Boolean)

    return parts.join('; ') || fallback
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>

    if (typeof record.detail === 'string') return record.detail
    if (record.detail !== undefined) {
      return getErrorMessage(record.detail, fallback)
    }

    if (typeof record.msg === 'string') {
      const location = Array.isArray(record.loc) ? record.loc.join(' -> ') : ''
      return location ? `${location}: ${record.msg}` : record.msg
    }
  }

  return fallback
}
