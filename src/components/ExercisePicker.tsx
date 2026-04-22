import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { catalogByMuscleGroup, exerciseCatalog } from '@/data/exerciseCatalog'
import type { CatalogExercise } from '@/data/exerciseCatalog'

type ExercisePickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercise: CatalogExercise) => void
  excludeIds?: string[]
}

export function ExercisePicker({ open, onOpenChange, onSelect, excludeIds = [] }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Todos')

  const muscleGroups = catalogByMuscleGroup.map((g) => g.muscleGroup)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (activeTab === 'Todos') {
      if (!query) return null // show grouped view
      return exerciseCatalog.filter((e) => e.name.toLowerCase().includes(query))
    }
    return exerciseCatalog.filter(
      (e) =>
        e.muscleGroup === activeTab &&
        (!query || e.name.toLowerCase().includes(query)),
    )
  }, [search, activeTab])

  const renderRow = (exercise: CatalogExercise) => {
    const excluded = excludeIds.includes(exercise.id)
    return (
      <div
        key={exercise.id}
        className="flex items-center justify-between px-4 border-b border-[#2A2A2A]/30"
        style={{ height: 52, opacity: excluded ? 0.4 : 1 }}
      >
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-base text-foreground truncate">{exercise.name}</span>
          <span className="text-sm text-muted-foreground">
            {exercise.muscleGroup} · {exercise.focus}
          </span>
        </div>
        {!excluded && (
          <button
            className="flex items-center justify-center w-11 h-11 flex-shrink-0 text-[#FF3D3D]"
            onClick={() => onSelect(exercise)}
            aria-label={`Adicionar ${exercise.name}`}
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Adicionar Exercício</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>
        </div>

        <div className="px-4 pb-2 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex gap-1 bg-transparent whitespace-nowrap w-max h-auto">
              <TabsTrigger value="Todos" className="text-sm px-3 py-1.5 rounded-lg data-[state=active]:bg-[#FF3D3D] data-[state=active]:text-white">
                Todos
              </TabsTrigger>
              {muscleGroups.map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className="text-sm px-3 py-1.5 rounded-lg data-[state=active]:bg-[#FF3D3D] data-[state=active]:text-white"
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-y-auto flex-1">
          {activeTab === 'Todos' && !search.trim() ? (
            // Grouped view
            catalogByMuscleGroup.map((group) => (
              <div key={group.muscleGroup}>
                <div className="sticky top-0 px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground bg-[#0D0D0D]">
                  {group.muscleGroup}
                </div>
                {group.exercises.map(renderRow)}
              </div>
            ))
          ) : (
            // Flat filtered list
            (filtered ?? []).map(renderRow)
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
