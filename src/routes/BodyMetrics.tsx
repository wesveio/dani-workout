import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WeightTrendChart } from '@/components/WeightTrendChart'
import { MeasurementsChart } from '@/components/MeasurementsChart'
import { BodyMetricSheet } from '@/components/BodyMetricSheet'
import { PhotoGallery } from '@/components/PhotoGallery'
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

  const hasMeasurements = entries.some(
    (e) => e.waist != null || e.hips != null || e.chest != null || e.arms != null
  )

  const openEdit = (entry: BodyMetric) => {
    setEditingEntry(entry)
    setSheetOpen(true)
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted">Corpo</div>
          <h1 className="text-2xl font-bold">Corpo</h1>
        </div>
        <Button
          className="bg-accent text-white"
          onClick={() => {
            setEditingEntry(undefined)
            setSheetOpen(true)
          }}
        >
          Registrar
        </Button>
      </div>

      {/* Weight trend chart */}
      <Card className="bg-surface border-neutral/50">
        <CardContent className="p-4">
          <WeightTrendChart entries={entries} />
        </CardContent>
      </Card>

      {/* Measurements chart — only show if any entry has measurement data */}
      {hasMeasurements && (
        <Card className="bg-surface border-neutral/50">
          <CardContent className="p-4">
            <MeasurementsChart entries={entries} />
          </CardContent>
        </Card>
      )}

      {/* Entry history list */}
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted mb-2">Historico</div>
        {entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            <div className="font-semibold">Sem registros ainda</div>
            <div className="mt-1">Registre seu peso hoje para comecar a ver sua evolucao.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className="bg-surface border-neutral/50 cursor-pointer"
                onClick={() => openEdit(entry)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {dayjs(entry.date).format('DD/MM/YYYY')}
                    </div>
                    {entry.weight != null && (
                      <div className="text-lg font-bold">{entry.weight} kg</div>
                    )}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {entry.waist != null && (
                        <span className="text-xs text-muted">Cintura: {entry.waist}cm</span>
                      )}
                      {entry.hips != null && (
                        <span className="text-xs text-muted">Quadril: {entry.hips}cm</span>
                      )}
                      {entry.chest != null && (
                        <span className="text-xs text-muted">Peitoral: {entry.chest}cm</span>
                      )}
                      {entry.arms != null && (
                        <span className="text-xs text-muted">Bracos: {entry.arms}cm</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      confirmDelete(entry.id)
                    }}
                  >
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Photo gallery */}
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted mb-2">Fotos de Progresso</div>
        <PhotoGallery photos={photos} userId={activeUserId} />
      </div>

      {/* Quick-log sheet */}
      <BodyMetricSheet
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
