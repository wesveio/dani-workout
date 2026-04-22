import { useState } from 'react'
import { ChevronDown, ChevronUp, Minus, Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exerciseCatalog } from '@/data/exerciseCatalog'
import type { CatalogExercise } from '@/data/exerciseCatalog'
import { useWorkoutStore } from '@/store/workoutStore'
import type { WorkoutTemplate } from '@/types'
import { ExercisePicker } from './ExercisePicker'

type BuilderExercise = {
  exerciseId: string
  restSeconds?: number
  setCount: number
}

type TemplateBuilderSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: WorkoutTemplate
}

export function TemplateBuilderSheet({ open, onOpenChange, initial }: TemplateBuilderSheetProps) {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  const saveTemplate = useWorkoutStore((s) => s.saveTemplate)
  const updateTemplate = useWorkoutStore((s) => s.updateTemplate)

  const [name, setName] = useState(initial?.name ?? '')
  const [exercises, setExercises] = useState<BuilderExercise[]>(
    initial?.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      restSeconds: e.restSeconds,
      setCount: e.defaultSets.length || 3,
    })) ?? [],
  )
  const [pickerOpen, setPickerOpen] = useState(false)

  // Reset state when initial changes (e.g., switching edit targets)
  const isEditMode = !!initial

  const handleAddExercise = (exercise: CatalogExercise) => {
    setExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, setCount: 3 },
    ])
    setPickerOpen(false)
  }

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSetCountChange = (index: number, delta: number) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, setCount: Math.max(1, e.setCount + delta) } : e,
      ),
    )
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setExercises((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return
    setExercises((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const mappedExercises = exercises.map((e) => ({
      exerciseId: e.exerciseId,
      restSeconds: e.restSeconds,
      defaultSets: Array.from({ length: e.setCount }, () => ({
        weight: 0,
        reps: 0,
        rir: 0,
        completed: false,
      })),
    }))

    if (isEditMode && initial) {
      await updateTemplate(initial.id, { name: trimmedName, exercises: mappedExercises })
    } else {
      await saveTemplate({ userId: activeUserId, name: trimmedName, exercises: mappedExercises })
    }

    onOpenChange(false)
  }

  const canSave = name.trim().length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-[#2A2A2A]">
            <DialogTitle className="text-xl font-semibold">
              {isEditMode ? 'Editar Template' : 'Criar Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Name input */}
            <Input
              placeholder="Nome do treino..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] mb-4"
            />

            {/* Exercise list */}
            <div className="space-y-2">
              {exercises.map((ex, index) => {
                const catalog = exerciseCatalog.find((c) => c.id === ex.exerciseId)
                return (
                  <div
                    key={`${ex.exerciseId}-${index}`}
                    className="flex items-center gap-2 bg-[#0D0D0D] rounded-lg px-3 py-2"
                  >
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleMoveUp(index)}
                        className="flex items-center justify-center w-6 h-6 text-muted-foreground disabled:opacity-30"
                        disabled={index === 0}
                        aria-label="Mover para cima"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        className="flex items-center justify-center w-6 h-6 text-muted-foreground disabled:opacity-30"
                        disabled={index === exercises.length - 1}
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Exercise name */}
                    <span className="flex-1 text-sm text-foreground truncate min-w-0">
                      {catalog?.name ?? ex.exerciseId}
                    </span>

                    {/* Set count stepper */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleSetCountChange(index, -1)}
                        className="flex items-center justify-center w-9 h-9 text-muted-foreground"
                        aria-label="Diminuir séries"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">
                        {ex.setCount}
                      </span>
                      <button
                        onClick={() => handleSetCountChange(index, 1)}
                        className="flex items-center justify-center w-9 h-9 text-muted-foreground"
                        aria-label="Aumentar séries"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="flex items-center justify-center w-11 h-11 text-muted-foreground flex-shrink-0"
                      aria-label="Remover exercício"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add exercise button */}
            <Button
              variant="ghost"
              className="w-full min-h-[44px] border border-dashed border-[#2A2A2A] gap-2"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar Exercício
            </Button>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-[#2A2A2A]">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full min-h-[44px] bg-[#FF3D3D] hover:bg-[#FF3D3D]/90 text-white font-semibold"
            >
              {isEditMode ? 'Salvar' : 'Criar Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddExercise}
        excludeIds={exercises.map((e) => e.exerciseId)}
      />
    </>
  )
}
