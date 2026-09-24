import { useCallback, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: false, error: null })
  const requestId = useRef(0)

  const run = useCallback(async (promise: Promise<T>) => {
    const id = ++requestId.current
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await promise
      if (id === requestId.current) setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      if (id === requestId.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Something went wrong',
        })
      }
      return null
    }
  }, [])

  const reset = useCallback(() => setState({ data: null, loading: false, error: null }), [])

  return { ...state, run, reset }
}
