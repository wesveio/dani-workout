export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label: string
}) {
  const pct = Math.max(0, Math.min(100, total === 0 ? 0 : (current / total) * 100))
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between'>
        <span className='text-[11px] font-semibold uppercase tracking-widest text-txt-faint'>
          {label}
        </span>
        <span className='text-[11px] text-txt-faint'>
          Semana {current} / {total}
        </span>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-bg-2'>
        <div
          data-testid='progressbar-fill'
          className='h-full bg-lime transition-all'
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
