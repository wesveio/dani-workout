import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BodyMetricSheet } from '@/components/BodyMetricSheet'
import { PhotoGallery } from '@/components/PhotoGallery'
import { MetricCard } from '@/components/redesign'
import type { BodyMetric } from '@/types'

export default function BodyMetrics() {
  const { toast } = useToast()
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  const entries = useBodyMetricsStore((s) => s.entries)
  const photos = useBodyMetricsStore((s) => s.photos)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BodyMetric | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    useBodyMetricsStore.getState().loadForUser(activeUserId)
  }, [activeUserId])

  const handleDelete = async () => {
    if (!deletingId) return
    await useBodyMetricsStore.getState().deleteEntry(deletingId)
    setDeleteDialogOpen(false)
    setDeletingId(null)
    toast({ title: 'Registro excluido' })
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) setEditingEntry(undefined)
  }

  // Sort entries newest-first
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = sorted[0]

  // 30-day cutoff for delta
  const cutoff30 = dayjs().subtract(30, 'day')
  const old30 = sorted.find((e) => dayjs(e.date).isBefore(cutoff30))

  function fmt(val: number | undefined): string {
    return val != null ? String(val) : '—'
  }

  function delta(field: keyof Pick<BodyMetric, 'weight' | 'waist' | 'hips' | 'chest' | 'arms'>): string | undefined {
    if (!latest || latest[field] == null || !old30 || old30[field] == null) return undefined
    const diff = (latest[field] as number) - (old30[field] as number)
    if (diff === 0) return undefined
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  }

  function history(field: keyof Pick<BodyMetric, 'weight' | 'waist' | 'hips' | 'chest' | 'arms'>): number[] {
    return sorted
      .slice(0, 7)
      .reverse()
      .map((e) => e[field] as number)
      .filter((v) => v != null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-txt-faint">Métricas corporais</div>
          <h1 className="text-2xl font-light tracking-tight">Corpo</h1>
        </div>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-1 text-txt-primary"
          aria-label="Registrar métrica"
          onClick={() => {
            setEditingEntry(undefined)
            setSheetOpen(true)
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Hoje kicker + 2×2 metric grid */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-txt-faint mb-2">Hoje</div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Peso"
            value={fmt(latest?.weight)}
            unit="kg"
            delta={delta('weight')}
            history={history('weight')}
          />
          <MetricCard
            label="Cintura"
            value={fmt(latest?.waist)}
            unit="cm"
            delta={delta('waist')}
            history={history('waist')}
          />
          <MetricCard
            label="Peito"
            value={fmt(latest?.chest)}
            unit="cm"
            delta={delta('chest')}
            history={history('chest')}
          />
          <MetricCard
            label="Braço"
            value={fmt(latest?.arms)}
            unit="cm"
            delta={delta('arms')}
            history={history('arms')}
          />
        </div>
      </div>

      {/* Photo gallery */}
      <div>
        <h2 className="text-base font-medium mb-3">Fotos de progresso</h2>
        <PhotoGallery photos={photos} userId={activeUserId} />
        <button
          className="mt-3 w-full rounded-card border border-dashed border-txt-faint/40 py-3 text-sm text-txt-faint flex items-center justify-center gap-1.5"
          onClick={() => {
            setEditingEntry(undefined)
            setSheetOpen(true)
          }}
        >
          <Plus size={14} />
          adicionar foto
        </button>
      </div>

      {/* Quick-log sheet */}
      <BodyMetricSheet
        key={editingEntry?.id ?? 'new'}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        initialEntry={editingEntry}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Registro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted">Tem certeza? Esta acao nao pode ser desfeita.</p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-destructive text-white" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
