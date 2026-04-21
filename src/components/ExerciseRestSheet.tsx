import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ExerciseRestSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSeconds: number
  onSave: (seconds: number) => void
}

const PRESETS = [30, 60, 90] as const

export function ExerciseRestSheet({ open, onOpenChange, currentSeconds, onSave }: ExerciseRestSheetProps) {
  const [selected, setSelected] = useState<number>(currentSeconds)
  const [customMode, setCustomMode] = useState(false)
  const [customValue, setCustomValue] = useState(String(currentSeconds))

  const handlePreset = (seconds: number) => {
    setSelected(seconds)
    setCustomMode(false)
  }

  const handleCustom = () => {
    setCustomMode(true)
    setCustomValue(String(selected))
  }

  const handleSave = () => {
    const value = customMode ? Math.min(Math.max(10, Number(customValue) || 90), 600) : selected
    onSave(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-neutral/50 max-w-sm">
        <DialogHeader>
          <DialogTitle>Tempo de Descanso</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 mt-2">
          {PRESETS.map((p) => (
            <Button
              key={p}
              variant={!customMode && selected === p ? 'default' : 'secondary'}
              size="sm"
              className="min-h-[44px] px-4"
              onClick={() => handlePreset(p)}
            >
              {p}s
            </Button>
          ))}
          <Button
            variant={customMode ? 'default' : 'secondary'}
            size="sm"
            className="min-h-[44px] px-4"
            onClick={handleCustom}
          >
            Personalizado
          </Button>
        </div>
        {customMode && (
          <div className="mt-3">
            <Input
              type="text"
              inputMode="numeric"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ''))}
              className="min-h-[44px]"
              aria-label="Segundos de descanso personalizado"
            />
            <div className="text-xs text-muted mt-1">Maximo: 600 segundos</div>
          </div>
        )}
        <Button onClick={handleSave} className="mt-3 min-h-[44px] w-full">
          Confirmar Tempo
        </Button>
      </DialogContent>
    </Dialog>
  )
}
