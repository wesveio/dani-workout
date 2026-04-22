import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useToast } from '@/components/ui/use-toast'
import type { BodyMetric } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialEntry?: BodyMetric
}

export function BodyMetricSheet({ open, onOpenChange, initialEntry }: Props) {
  const { toast } = useToast()
  const [date, setDate] = useState(
    initialEntry?.date ?? dayjs().format('YYYY-MM-DD')
  )
  const [weight, setWeight] = useState(
    initialEntry?.weight != null ? String(initialEntry.weight) : ''
  )
  const [waist, setWaist] = useState(
    initialEntry?.waist != null ? String(initialEntry.waist) : ''
  )
  const [hips, setHips] = useState(
    initialEntry?.hips != null ? String(initialEntry.hips) : ''
  )
  const [chest, setChest] = useState(
    initialEntry?.chest != null ? String(initialEntry.chest) : ''
  )
  const [arms, setArms] = useState(
    initialEntry?.arms != null ? String(initialEntry.arms) : ''
  )
  const [notes, setNotes] = useState(initialEntry?.notes ?? '')
  const [measurementsOpen, setMeasurementsOpen] = useState(false)
  const [weightError, setWeightError] = useState(false)

  const isEditing = initialEntry != null

  const handleSave = async () => {
    const w = weight !== '' ? parseFloat(weight) : undefined
    if (w !== undefined && (isNaN(w) || w <= 0 || w >= 500)) {
      setWeightError(true)
      return
    }
    setWeightError(false)

    const userId = useWorkoutStore.getState().activeUserId
    const payload = {
      userId,
      date,
      weight: w,
      waist: waist !== '' ? parseFloat(waist) : undefined,
      hips: hips !== '' ? parseFloat(hips) : undefined,
      chest: chest !== '' ? parseFloat(chest) : undefined,
      arms: arms !== '' ? parseFloat(arms) : undefined,
      notes: notes || undefined,
    }

    if (isEditing) {
      await useBodyMetricsStore.getState().updateEntry(initialEntry.id, payload)
      toast({ title: 'Registro atualizado!' })
    } else {
      await useBodyMetricsStore.getState().addEntry(payload)
      toast({ title: 'Peso registrado!' })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Registro' : 'Registrar Medidas'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="metric-date">Data</Label>
            <Input
              id="metric-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Weight */}
          <div className="space-y-1">
            <Label htmlFor="metric-weight">Peso (kg)</Label>
            <Input
              id="metric-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              autoFocus
              placeholder="Ex: 65.5"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value)
                setWeightError(false)
              }}
            />
            {weightError && (
              <p className="text-destructive text-xs">Peso invalido</p>
            )}
          </div>

          {/* Optional measurements */}
          <Collapsible open={measurementsOpen} onOpenChange={setMeasurementsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between px-0 text-sm font-medium">
                Medidas (opcional)
                {measurementsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="metric-waist">Cintura (cm)</Label>
                  <Input
                    id="metric-waist"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Ex: 70"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="metric-hips">Quadril (cm)</Label>
                  <Input
                    id="metric-hips"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Ex: 90"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="metric-chest">Peitoral (cm)</Label>
                  <Input
                    id="metric-chest"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Ex: 80"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="metric-arms">Bracos (cm)</Label>
                  <Input
                    id="metric-arms"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Ex: 30"
                    value={arms}
                    onChange={(e) => setArms(e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="metric-notes">Notas</Label>
            <Textarea
              id="metric-notes"
              rows={2}
              placeholder="Observacoes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="bg-accent text-white" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
