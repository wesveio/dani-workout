import { useRef, useState } from 'react'
import { LayoutTemplate, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exerciseCatalog } from '@/data/exerciseCatalog'
import type { WorkoutTemplate } from '@/types'

type TemplateCardProps = {
  template: WorkoutTemplate
  onStart: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function TemplateCard({ template, onStart, onEdit, onDuplicate, onDelete }: TemplateCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Derive unique muscle groups from template exercises
  const muscleGroups = Array.from(
    new Set(
      template.exercises
        .map((e) => exerciseCatalog.find((c) => c.id === e.exerciseId)?.muscleGroup)
        .filter((g): g is string => !!g),
    ),
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    longPressTimer.current = setTimeout(() => {
      setDropdownOpen(true)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    const delta = e.touches[0].clientX - touchStartX.current
    if (delta < 0) {
      setTranslateX(Math.max(delta, -80))
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (translateX < -40) {
      setTranslateX(-80)
    } else {
      setTranslateX(0)
    }
    touchStartX.current = null
  }

  const handleDeleteZoneTap = () => {
    if (confirming) {
      onDelete()
      setTranslateX(0)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  const handleCancelConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(false)
    setTranslateX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe reveal zone */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive"
        style={{ width: 80 }}
        onClick={handleDeleteZoneTap}
      >
        {confirming ? (
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-[11px] text-white font-semibold">Tem certeza?</span>
            <button className="text-[11px] text-white font-bold underline" onClick={handleDeleteZoneTap}>
              Excluir
            </button>
            <button className="text-[11px] text-white/70" onClick={handleCancelConfirm}>
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Trash2 className="h-5 w-5 text-white" />
            <span className="text-[11px] text-white font-semibold">Excluir</span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div
        className="relative bg-[#1A1A1A] rounded-xl px-4 py-4"
        style={{ transform: `translateX(${translateX}px)`, transition: 'transform 150ms ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Row 1: icon + name */}
        <div className="flex items-center gap-2 mb-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-lg font-bold text-foreground leading-tight">{template.name}</span>
        </div>

        {/* Row 2: exercise count + muscle group badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">{template.exercises.length} exercicios</span>
          {muscleGroups.map((group) => (
            <span
              key={group}
              className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full"
              style={{ background: 'rgba(255,140,0,0.2)', color: '#FF8C00' }}
            >
              {group}
            </span>
          ))}
        </div>

        {/* Row 3: Iniciar + overflow menu */}
        <div className="flex items-center justify-between">
          <Button size="sm" className="min-h-[44px] bg-[#FF3D3D] hover:bg-[#FF3D3D]/90 text-white text-sm rounded-lg h-9" onClick={onStart}>
            Iniciar
          </Button>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-11 h-11 text-muted-foreground"
                aria-label="Opções do template"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
              <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>Duplicar</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
