import { Trophy } from 'lucide-react'

export function PrBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase text-foreground"
      style={{ animation: 'celebration-pop 0.6s ease-out' }}
      aria-live="polite"
    >
      <Trophy className="h-3.5 w-3.5" />
      PR!
    </span>
  )
}
