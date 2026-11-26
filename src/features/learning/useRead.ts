import { useEffect, useState } from 'react'

type ReadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

// Callers with URL parameters mount this hook in a component keyed by those parameters.
export function useRead<T>(load: (signal: AbortSignal) => Promise<T>): ReadState<T> {
  const [state, setState] = useState<ReadState<T>>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Could not load this page.',
          })
        }
      },
    )
    return () => controller.abort()
  }, [load])

  return state
}
