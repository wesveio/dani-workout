import { useEffect, useRef, useState } from 'react'

type UseDraftAutosaveOptions = {
  enabled?: boolean
  delayMs?: number
}

export const useDraftAutosave = <T>(
  key: string,
  value: T,
  { enabled = true, delayMs = 500 }: UseDraftAutosaveOptions = {},
) => {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const idleRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      const persist = () => {
        localStorage.setItem(key, JSON.stringify(value))
        setLastSavedAt(new Date().toISOString())
      }

      if (typeof window.requestIdleCallback === 'function') {
        idleRef.current = window.requestIdleCallback(() => persist(), { timeout: 700 })
        return
      }

      persist()
    }, delayMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      if (idleRef.current && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleRef.current)
      }
    }
  }, [delayMs, enabled, key, value])

  return { lastSavedAt }
}
