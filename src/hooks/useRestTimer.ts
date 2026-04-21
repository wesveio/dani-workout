import { useEffect, useRef, useState, useCallback } from 'react'
import { playChime } from '@/lib/audio'

// Module-level: survives component unmount/remount (per RESEARCH Pitfall 3)
let _startEpoch = 0
let _duration = 0

export function useRestTimer() {
  const [active, setActive] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [duration, setDuration] = useState(0)
  const alertedRef = useRef(false)

  const start = useCallback((seconds: number) => {
    _startEpoch = Date.now()
    _duration = seconds * 1000
    alertedRef.current = false
    setActive(true)
    setRemaining(seconds)
    setDuration(seconds)
  }, [])

  const skip = useCallback(() => {
    setActive(false)
    setRemaining(0)
  }, [])

  useEffect(() => {
    if (!active) return

    const tick = () => {
      const elapsed = Date.now() - _startEpoch
      const rem = Math.max(0, Math.ceil((_duration - elapsed) / 1000))
      setRemaining(rem)
      if (rem <= 0 && !alertedRef.current) {
        alertedRef.current = true
        setActive(false)
        playChime()
        navigator.vibrate?.([200, 100, 200])
      }
    }

    const interval = setInterval(tick, 500)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active])

  return { active, remaining, duration, start, skip }
}
