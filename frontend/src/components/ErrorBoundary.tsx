import { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Catches rendering errors in child components and shows a recovery UI
 * instead of a white screen. Especially important for portfolio templates
 * that receive dynamic data and may crash on unexpected shapes.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <div className="card max-w-md text-center">
                        <div className="mb-4 text-4xl">⚠️</div>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            Something went wrong
                        </h2>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
