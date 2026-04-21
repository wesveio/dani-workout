import { useEffect, useRef } from 'react'
import { formatRestClock } from '@/lib/rest'
import { Button } from '@/components/ui/button'

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type RestTimerCardProps = {
  remaining: number
  duration: number
  onSkip: () => void
}

function TimerRing({ progress, urgent }: { progress: number; urgent: boolean }) {
  const offset = CIRCUMFERENCE * (1 - progress)
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    // On visibilitychange return, disable transition to avoid visual jump (RESEARCH Pitfall 4)
    const handle = () => {
      if (document.visibilityState === 'visible' && ringRef.current) {
        ringRef.current.style.transition = 'none'
        requestAnimationFrame(() => {
          if (ringRef.current) {
            ringRef.current.style.transition = 'stroke-dashoffset 0.5s linear'
          }
        })
      }
    }
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      <circle
        cx="60" cy="60" r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="6"
      />
      <circle
        ref={ringRef}
        cx="60" cy="60" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        className={urgent ? 'text-accent' : 'text-accentSecondary'}
      />
    </svg>
  )
}

export function RestTimerCard({ remaining, duration, onSkip }: RestTimerCardProps) {
  const progress = duration > 0 ? remaining / duration : 0
  const urgent = remaining <= 10 && remaining > 0
  const complete = remaining <= 0

  if (complete) {
    return (
      <div
        className="rounded-xl bg-surface border border-neutral/50 shadow-soft px-6 py-5 text-center"
        style={{ animation: 'timer-card-enter 200ms ease-out' }}
      >
        <div className="text-[20px] font-semibold text-foreground">Pronto!</div>
        <div className="text-sm text-muted mt-1">Descanso completo</div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl bg-surface border border-neutral/50 shadow-soft px-4 py-4 flex items-center gap-4"
      style={{ animation: 'timer-card-enter 200ms ease-out' }}
    >
      <div className="relative flex-shrink-0">
        <TimerRing progress={progress} urgent={urgent} />
        <div className="absolute inset-0 flex items-center justify-center rotate-0">
          <span className="text-[36px] font-semibold leading-none text-foreground">
            {formatRestClock(remaining)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="text-sm text-muted">Descanso</div>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] text-muted hover:text-foreground"
          onClick={onSkip}
        >
          Pular Descanso
        </Button>
      </div>
    </div>
  )
}
