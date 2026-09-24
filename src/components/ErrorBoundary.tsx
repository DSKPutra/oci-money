import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            Something went wrong loading this page.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-md bg-neon px-4 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
