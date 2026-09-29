import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEY } from '../store/useStore'

interface State {
  error: Error | null
}

/** Last line of defence: a readable screen (and a way out) instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Subscribulator crashed', error, info.componentStack)
  }

  private reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center px-6 font-sans text-zinc-100">
        <div className="glass max-w-md rounded-[28px] p-8 text-center">
          <p className="text-4xl">🫠</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Try reloading first. If it keeps happening, your saved stack may be damaged; resetting clears it from this
            browser so you can start fresh.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => location.reload()}
              className="h-10 cursor-pointer rounded-full bg-white px-5 text-sm font-medium text-zinc-950"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="h-10 cursor-pointer rounded-full px-5 text-sm font-medium text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/10"
            >
              Reset saved data
            </button>
          </div>
          <p className="mt-5 font-mono text-[11px] break-words text-zinc-600">{this.state.error.message}</p>
        </div>
      </div>
    )
  }
}
