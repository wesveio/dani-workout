import type { SetEntry } from '@/types'
import { cn } from '@/lib/utils'
import { PrBadge } from '@/components/PrBadge'

type SetRowProps = {
  exerciseId: string
  absoluteIndex: number
  set: SetEntry
  previousSet?: SetEntry
  unitLabel: string
  unitLabelDisplay: string
  onSetChange: (field: keyof SetEntry, value: number | boolean) => void
  onAdjust: (field: 'weight' | 'reps' | 'rir', delta: number) => void
  onCopyPrevious?: () => void
  hasPr: boolean
  isActive?: boolean
  isFuture?: boolean
}

const validateNumericInput = (value: string, allowDecimal = false): string => {
  if (value === '') return ''
  const normalized = value.replace(',', '.')
  if (!allowDecimal) {
    return normalized.replace(/[^0-9]/g, '')
  }
  const filtered = normalized.replace(/[^0-9.]/g, '')
  const [first, ...rest] = filtered.split('.')
  if (rest.length === 0) return first
  return `${first}.${rest.join('')}`
}

export function SetRow({
  exerciseId,
  absoluteIndex,
  set,
  previousSet,
  unitLabel,
  onSetChange,
  hasPr,
  isActive = false,
  isFuture = false,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'grid items-center gap-2 border-b border-line px-1 py-2.5',
        isActive && 'bg-lime/5',
        isFuture && 'opacity-50',
      )}
      style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}
    >
      {/* Pill: set number */}
      <div
        className={cn(
          'rounded-[5px] py-1 text-center text-[11px] font-medium',
          isActive ? 'bg-lime text-black' : 'bg-bg-2 text-txt-dim',
        )}
      >
        {absoluteIndex + 1}
      </div>

      {/* Weight */}
      <div>
        <input
          id={`set-input-${exerciseId}-${absoluteIndex}`}
          aria-label={`série ${absoluteIndex + 1} carga`}
          type="text"
          inputMode="decimal"
          value={set.weight}
          onChange={(e) => {
            const validated = validateNumericInput(e.target.value, true)
            onSetChange('weight', validated === '' ? 0 : Number(validated))
          }}
          className="w-full bg-transparent text-[14px] font-medium tabular-nums outline-none placeholder:text-txt-faint"
        />
        {previousSet?.weight !== undefined && (
          <div
            className="mt-0.5 text-[10px] text-txt-faint"
            aria-label={`Valor anterior: ${previousSet.weight} kg`}
          >
            Ant: {previousSet.weight} kg
          </div>
        )}
      </div>

      {/* Reps */}
      <div>
        <input
          aria-label={`série ${absoluteIndex + 1} ${unitLabel}`}
          type="text"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => {
            const validated = validateNumericInput(e.target.value, false)
            onSetChange('reps', validated === '' ? 0 : Number(validated))
          }}
          className="w-full bg-transparent text-[14px] font-medium tabular-nums outline-none placeholder:text-txt-faint"
        />
        {previousSet?.reps !== undefined && (
          <div
            className="mt-0.5 text-[10px] text-txt-faint"
            aria-label={`Valor anterior: ${previousSet.reps}`}
          >
            Ant: {previousSet.reps}
          </div>
        )}
      </div>

      {/* Check circle */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-label={`série ${absoluteIndex + 1} concluída`}
          aria-pressed={Boolean(set.completed)}
          onClick={() => onSetChange('completed', !set.completed)}
          className={cn(
            'flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px]',
            set.completed
              ? 'border-lime bg-lime text-black'
              : 'border-txt-faint text-txt-faint',
          )}
        >
          {set.completed && '✓'}
        </button>
        {hasPr && <PrBadge />}
      </div>
    </div>
  )
}
