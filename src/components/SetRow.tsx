import type { SetEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  unitLabelDisplay,
  onSetChange,
  onAdjust,
  onCopyPrevious,
  hasPr,
}: SetRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 items-center gap-2 rounded-lg border border-neutral/10 bg-card px-3 py-2">
      <div className="col-span-2 sm:col-span-3 text-xs font-semibold">
        Série {absoluteIndex + 1}
      </div>

      {/* Weight */}
      <div className="col-span-2 sm:col-span-3">
        <Label className="text-[11px]">Carga</Label>
        <Input
          id={`set-input-${exerciseId}-${absoluteIndex}`}
          aria-label={`série ${absoluteIndex + 1} carga`}
          type="text"
          inputMode="decimal"
          value={set.weight}
          onChange={(e) => {
            const validated = validateNumericInput(e.target.value, true)
            onSetChange('weight', validated === '' ? 0 : Number(validated))
          }}
        />
        {previousSet?.weight !== undefined && (
          <div
            className="text-[12px] text-muted leading-none mt-1"
            aria-label={`Valor anterior: ${previousSet.weight} kg`}
          >
            Ant: {previousSet.weight} kg
          </div>
        )}
        <div className="mt-1 flex gap-1 text-[11px]">
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('weight', -2.5)}>
            -2.5
          </Button>
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('weight', 2.5)}>
            +2.5
          </Button>
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('weight', 5)}>
            +5
          </Button>
        </div>
      </div>

      {/* Reps */}
      <div className="col-span-2 sm:col-span-2">
        <Label className="text-[11px]">{unitLabelDisplay}</Label>
        <Input
          aria-label={`série ${absoluteIndex + 1} ${unitLabel}`}
          type="text"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => {
            const validated = validateNumericInput(e.target.value, false)
            onSetChange('reps', validated === '' ? 0 : Number(validated))
          }}
        />
        {previousSet?.reps !== undefined && (
          <div
            className="text-[12px] text-muted leading-none mt-1"
            aria-label={`Valor anterior: ${previousSet.reps}`}
          >
            Ant: {previousSet.reps}
          </div>
        )}
        <div className="mt-1 flex gap-1 text-[11px]">
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('reps', -1)}>
            -1
          </Button>
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('reps', 1)}>
            +1
          </Button>
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => onAdjust('reps', 2)}>
            +2
          </Button>
        </div>
      </div>

      {/* RIR */}
      <div className="col-span-2 sm:col-span-2">
        <Label className="text-[11px]">RIR</Label>
        <div className="flex items-center gap-2">
          <input
            aria-label={`série ${absoluteIndex + 1} RIR`}
            type="range"
            min={0}
            max={5}
            step={1}
            value={set.rir}
            onChange={(e) => onSetChange('rir', Number(e.target.value))}
          />
          <span className="text-xs font-semibold w-6 text-center">{set.rir}</span>
        </div>
      </div>

      {/* Complete + Copy + PR */}
      <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn('h-9 px-3 text-xs font-semibold', set.completed ? '' : 'opacity-80 hover:opacity-100')}
          aria-label={`série ${absoluteIndex + 1} concluída`}
          aria-pressed={Boolean(set.completed)}
          onClick={() => onSetChange('completed', !set.completed)}
        >
          {set.completed ? 'Feito' : 'Marcar feito'}
        </Button>
        {absoluteIndex > 0 && onCopyPrevious && (
          <Button type="button" variant="ghost" size="sm" className="px-2 text-xs" onClick={onCopyPrevious}>
            Copiar anterior
          </Button>
        )}
        {hasPr && <PrBadge />}
      </div>
    </div>
  )
}
