import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { exerciseCatalog } from '@/data/exerciseCatalog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { WorkoutTemplate } from '@/types'

type TemplatePreviewSheetProps = {
  template: WorkoutTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplatePreviewSheet({ template, open, onOpenChange }: TemplatePreviewSheetProps) {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState(template?.exercises ?? [])
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (template) {
      setExercises(template.exercises)
      setEditing(false)
    }
  }, [template])

  const handleStart = () => {
    if (!template) return
    onOpenChange(false)
    navigate('/session/template', {
      state: {
        templateId: template.id,
        exercises,
      },
    })
  }

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    setExercises((prev) => {
      const next = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= next.length) return prev
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      return next
    })
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-surface border-neutral/50 max-w-sm flex flex-col gap-0 p-0'>
        <DialogHeader className='px-5 pt-5 pb-3 flex flex-row items-center justify-between'>
          <DialogTitle className='text-lg font-bold'>{template.name}</DialogTitle>
          <Button
            variant='ghost'
            size='sm'
            className='min-h-[36px] px-3 text-muted'
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Concluir' : 'Editar'}
          </Button>
        </DialogHeader>

        <div className='px-5 pb-3 space-y-2 flex-1 overflow-y-auto max-h-[50vh]'>
          {exercises.map((ex, index) => {
            const catalogEntry = exerciseCatalog.find((e) => e.id === ex.exerciseId)
            const name = catalogEntry?.name ?? ex.exerciseId
            const setCount = ex.defaultSets.length
            return (
              <div
                key={`${ex.exerciseId}-${index}`}
                className='flex items-center justify-between rounded-xl border border-neutral/40 bg-neutral/50 px-3 py-2'
              >
                <div>
                  <div className='text-sm font-medium text-foreground'>{name}</div>
                  <div className='text-xs text-muted'>{setCount} {setCount === 1 ? 'série' : 'séries'}</div>
                </div>
                {editing && (
                  <div className='flex items-center gap-1 ml-2'>
                    <button
                      type='button'
                      className='p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-muted hover:text-foreground transition disabled:opacity-30'
                      onClick={() => moveExercise(index, 'up')}
                      disabled={index === 0}
                      aria-label='Mover para cima'
                    >
                      <ChevronUp className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      className='p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-muted hover:text-foreground transition disabled:opacity-30'
                      onClick={() => moveExercise(index, 'down')}
                      disabled={index === exercises.length - 1}
                      aria-label='Mover para baixo'
                    >
                      <ChevronDown className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      className='p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-muted hover:text-foreground transition'
                      onClick={() => removeExercise(index)}
                      aria-label='Remover exercício'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {exercises.length === 0 && (
            <div className='text-sm text-muted text-center py-4'>Nenhum exercício.</div>
          )}
        </div>

        <div className='px-5 pb-5 pt-2 space-y-2'>
          <Button
            className='w-full min-h-[56px] text-lg font-semibold'
            onClick={handleStart}
            disabled={exercises.length === 0}
          >
            Iniciar Treino
          </Button>
          <div className='text-center'>
            <button
              type='button'
              className='text-sm text-muted hover:text-foreground transition'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
