import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateCard } from '@/components/TemplateCard'
import { TemplateBuilderSheet } from '@/components/TemplateBuilderSheet'
import { useWorkoutStore } from '@/store/workoutStore'
import { toast } from '@/components/ui/use-toast'
import type { WorkoutTemplate } from '@/types'

export default function Templates() {
  const templates = useWorkoutStore((s) => s.templates)
  const deleteTemplate = useWorkoutStore((s) => s.deleteTemplate)
  const duplicateTemplate = useWorkoutStore((s) => s.duplicateTemplate)

  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WorkoutTemplate | null>(null)

  const handleDelete = async (id: string) => {
    await deleteTemplate(id)
    toast({ title: 'Template removido' })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Treinos</div>
          <h1 className="text-2xl font-bold">Templates</h1>
        </div>
        <Button
          variant="ghost"
          className="min-h-[44px] gap-2"
          onClick={() => setBuilderOpen(true)}
        >
          <LayoutTemplate className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Empty state */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-lg font-semibold text-foreground">Nenhum template ainda</div>
          <div className="text-sm text-muted-foreground mt-1">
            Salve um treino como template ou crie um do zero.
          </div>
          <Button
            onClick={() => setBuilderOpen(true)}
            className="mt-4 bg-[#FF3D3D] hover:bg-[#FF3D3D]/90 text-white"
          >
            Criar Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((template, index) => (
            <div
              key={template.id}
              style={{
                animation: 'fade-slide-up 180ms ease-out forwards',
                animationDelay: `${index * 30}ms`,
                opacity: 0,
              }}
            >
              <TemplateCard
                template={template}
                onStart={() => setPreviewTemplate(template)}
                onEdit={() => setEditingTemplate(template)}
                onDuplicate={() => duplicateTemplate(template.id)}
                onDelete={() => handleDelete(template.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Builder sheet */}
      <TemplateBuilderSheet
        open={builderOpen || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setBuilderOpen(false)
            setEditingTemplate(null)
          }
        }}
        initial={editingTemplate ?? undefined}
      />
    </div>
  )
}
