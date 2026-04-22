# Phase 5: Workout Templates - Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 9 new/modified files
**Analogs found:** 9 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/data/exerciseCatalog.ts` | static-data | transform | `src/data/treinoDani.ts` | role-match |
| `src/store/workoutStore.ts` | store | CRUD | `src/store/workoutStore.ts` (self, existing actions) | exact |
| `src/types.ts` | model | — | `src/types.ts` (self, existing types) | exact |
| `src/routes/Templates.tsx` | route/page | CRUD | `src/routes/Progress.tsx` | role-match |
| `src/components/TemplateCard.tsx` | component | request-response | `src/routes/Progress.tsx` card block | role-match |
| `src/components/TemplateBuilder.tsx` | component | CRUD | `src/components/ExerciseRestSheet.tsx` | role-match |
| `src/components/TemplatePreview.tsx` | component | request-response | `src/components/ExerciseRestSheet.tsx` | role-match |
| `src/routes/SessionDetail.tsx` | route (modify) | request-response | self (existing `finishSession` + `initialExerciseState`) | exact |
| `src/data/exerciseCatalog.test.ts` | test | — | `src/store/workoutStore.test.ts` | role-match |

---

## Pattern Assignments

### `src/data/exerciseCatalog.ts` (static-data, transform)

**Analog:** `src/data/treinoDani.ts` + `src/data/programTypes.ts`

**Source type to strip** (`src/data/programTypes.ts` lines 26–41):
```typescript
// Full Exercise type — program-specific fields to DROP: prescriptions, rir, rest (string), optionalVolumeBump
export type Exercise = {
  id: string
  name: string
  focus: 'compound' | 'isolation' | 'pump'
  rest: string          // DROP — replace with defaultRest: number (seconds)
  rir: string           // DROP
  prescriptions: Prescription[]  // DROP
  videoUrl?: string     // KEEP
  imageUrl?: string     // KEEP
  notes?: string        // KEEP
}
```

**Catalog type to define** (new, based on Research Pattern 1):
```typescript
export type CatalogExercise = {
  id: string
  name: string
  muscleGroup: string   // Portuguese: 'Pernas' | 'Glúteos' | 'Peito' | 'Costas' | 'Ombros' | 'Braços' | 'Core' | 'Panturrilha'
  focus: 'compound' | 'isolation' | 'pump'
  defaultRest: number   // seconds — hardcode from program rest strings (e.g. "2–3 min" → 150, "60–90s" → 75, "90s" → 90)
  videoUrl?: string
  imageUrl?: string
  notes?: string
}

export type CatalogGroup = {
  muscleGroup: string
  exercises: CatalogExercise[]
}

export const exerciseCatalog: CatalogExercise[] = [...]

export const catalogByMuscleGroup: CatalogGroup[] = [...]
```

**File structure pattern** (`src/data/treinoDani.ts` lines 1–48):
```typescript
import type { Program, SessionTemplate, Week } from './programTypes'

// Use imageSlugById record pattern for asset mapping
const imageBase = '/thumbs'
const imageSlugById: Record<string, string> = { ... }

// Helper to attach images
const withImages = (sessions: SessionTemplate[]): SessionTemplate[] =>
  sessions.map((session) => ({
    ...session,
    exercises: session.exercises.map((exercise) => {
      const slug = imageSlugById[exercise.id] ?? defaultImageSlug
      return { ...exercise, imageUrl: `${imageBase}/${slug}.webp` }
    }),
  }))
```
Adapt: apply same imageUrl hydration pattern when building `exerciseCatalog` array entries.

**Dedup rule:** Wesley IDs with `-wes` suffix that are the same movement as a Dani exercise should be merged under the Dani canonical ID. Keep `-wes` IDs only for truly distinct exercises.

---

### `src/store/workoutStore.ts` (store, CRUD — extend)

**Analog:** self — follow existing `logSession` and `deleteProfile` action patterns.

**Type extension** — add to `WorkoutStore` type (lines 117–138):
```typescript
// Add to WorkoutStore type alongside existing fields
templates: WorkoutTemplate[]
loadTemplates: (userId: UserId) => Promise<void>
saveTemplate: (payload: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => Promise<string>
deleteTemplate: (id: string) => Promise<void>
updateTemplate: (id: string, patch: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>) => Promise<void>
duplicateTemplate: (id: string) => Promise<string>
```

**Dexie query pattern** — copy `getUserWorkouts` style (lines 146–151):
```typescript
const getUserTemplates = (userId: UserId) =>
  db.templates
    .where('userId')
    .equals(userId)
    .toArray()
```

**loadUserData extension** — add to existing `Promise.all` (lines 161–175):
```typescript
// Extend the destructure:
const [workouts, exerciseLogs, settingsRecord, templates] = await Promise.all([
  getUserWorkouts(userId),
  getUserExerciseLogs(userId),
  db.settings.get(`user:${userId}`),
  getUserTemplates(userId),      // ADD
])
// Add templates to the return object and to set({...}) in init() and switchUser()
```

**saveTemplate action** — copy `logSession` pattern (lines 280–307):
```typescript
saveTemplate: async ({ userId, name, exercises }) => {
  const id = makeId()
  const template: WorkoutTemplate = { id, userId, name, exercises, createdAt: new Date().toISOString() }
  await db.templates.put(template)
  set((state) => ({ templates: [template, ...state.templates] }))
  return id
},
```

**deleteTemplate action** — copy `deleteProfile` single-table pattern (lines 257–279):
```typescript
deleteTemplate: async (id) => {
  try {
    await db.templates.delete(id)
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
  } catch (err) {
    console.error(err)
    set({ error: 'Não foi possível remover o template.' })
  }
},
```

**duplicateTemplate action** — build on saveTemplate:
```typescript
duplicateTemplate: async (id) => {
  const original = get().templates.find((t) => t.id === id)
  if (!original) return ''
  return get().saveTemplate({
    userId: original.userId,
    name: `${original.name} (cópia)`,
    exercises: original.exercises,
  })
},
```

**templateSchema extension** — add `restSeconds` to exercises array item (lines 79–92):
```typescript
const templateSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    restSeconds: z.number().optional(),   // ADD — captures rest config per exercise
    defaultSets: z.array(z.object({
      weight: z.number(),
      reps: z.number(),
      completed: z.boolean(),
    })),
  })),
  createdAt: z.string(),
})
```

**Error handling pattern** — copy from any existing action (e.g. `updateProfile` lines 240–256):
```typescript
try {
  // Dexie operation
} catch (err) {
  console.error(err)
  set({ error: 'Mensagem de erro em português.' })
}
```

---

### `src/types.ts` (model — extend)

**Analog:** self — extend `WorkoutTemplate` type (lines 48–54).

**Current type:**
```typescript
export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: Array<{ exerciseId: string; defaultSets: SetEntry[] }>
  createdAt: string
}
```

**Extended type** (add `restSeconds` per D-05 full-clone requirement):
```typescript
export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: Array<{
    exerciseId: string
    restSeconds?: number   // ADD — per-exercise rest override from session config
    defaultSets: SetEntry[]
  }>
  createdAt: string
}
```

Note: `SetEntry` already has `weight`, `reps`, `rir`, `completed` — no changes needed to SetEntry itself. The `rir` field will carry through to template defaultSets.

---

### `src/routes/Templates.tsx` (route/page, CRUD)

**Analog:** `src/routes/Progress.tsx` (lines 1–60)

**Imports pattern** (copy from Progress.tsx lines 1–10):
```typescript
import { useMemo, useState } from 'react'
import { useWorkoutStore } from '@/store/workoutStore'
import { LayoutTemplate, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TemplateCard } from '@/components/TemplateCard'
import { TemplateBuilder } from '@/components/TemplateBuilder'
import { TemplatePreview } from '@/components/TemplatePreview'
```

**Store access pattern** (Progress.tsx lines 12–13):
```typescript
const templates = useWorkoutStore((s) => s.templates)
const deleteTemplate = useWorkoutStore((s) => s.deleteTemplate)
const duplicateTemplate = useWorkoutStore((s) => s.duplicateTemplate)
const activeUserId = useWorkoutStore((s) => s.activeUserId)
```

**Page shell pattern** (Progress.tsx lines 28–36):
```typescript
export default function Templates() {
  const [builderOpen, setBuilderOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<WorkoutTemplate | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted">Treinos</div>
        <h1 className="text-2xl font-bold">Meus Templates</h1>
      </div>
      {/* CTA to open builder */}
      <Button onClick={() => setBuilderOpen(true)} className="min-h-[44px] w-full">
        <Plus className="mr-2 h-4 w-4" /> Novo Template
      </Button>
      {/* Card list */}
      <div className="grid gap-3">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onStart={...} onEdit={...} onDuplicate={...} onDelete={...} />
        ))}
      </div>
      <TemplateBuilder open={builderOpen} onOpenChange={setBuilderOpen} />
      {previewTemplate && <TemplatePreview template={previewTemplate} onOpenChange={...} />}
    </div>
  )
}
```

**Empty state** — add when `templates.length === 0` inside the grid, following Progress.tsx pattern of conditional rendering.

---

### `src/components/TemplateCard.tsx` (component, request-response)

**Analog:** Card block in `src/routes/Progress.tsx` (lines 36–62) + `src/components/Layout.tsx` card classes.

**Card pattern** (Progress.tsx lines 43–60):
```typescript
<Card className="transition hover:-translate-y-1 hover:border-accent">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle className="text-lg">{template.name}</CardTitle>
      <CardDescription className="text-foreground/80">
        {template.exercises.length} exercícios · {muscleGroupSummary}
      </CardDescription>
    </div>
    {/* Action badge or button group */}
  </CardHeader>
  <CardContent className="flex items-center justify-between">
    {/* Muscle group tags + action buttons */}
  </CardContent>
</Card>
```

**Swipe/long-press pattern (Claude's discretion):** CSS-only approach — translate-x on touch with click-outside reset. No new dependency required. Revealed action buttons: Edit / Duplicate / Delete (follow D-11).

**muscleGroupSummary helper:** derive from `template.exercises` by looking up each `exerciseId` in `exerciseCatalog`, collecting unique `muscleGroup` values.

---

### `src/components/TemplateBuilder.tsx` (component, CRUD)

**Analog:** `src/components/ExerciseRestSheet.tsx` (lines 1–82) — Dialog with local state + save handler.

**Dialog shell pattern** (ExerciseRestSheet.tsx lines 36–82):
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type TemplateBuilderProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: WorkoutTemplate   // for edit mode
}

export function TemplateBuilder({ open, onOpenChange, initial }: TemplateBuilderProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [selectedExercises, setSelectedExercises] = useState(initial?.exercises ?? [])

  const handleSave = async () => {
    // call saveTemplate or updateTemplate from store
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-neutral/50 max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Template</DialogTitle>
        </DialogHeader>
        {/* Name input */}
        {/* Exercise picker grouped by muscleGroup (catalogByMuscleGroup) */}
        {/* Selected exercises list with set count config */}
        <Button onClick={handleSave} className="mt-3 min-h-[44px] w-full">
          Salvar Template
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

**Exercise picker pattern:** iterate `catalogByMuscleGroup`, render a collapsible section per group (follow `Collapsible` usage from SessionDetail.tsx imports line 32–35). Tap exercise to toggle into `selectedExercises`.

**Store call pattern** (copy saveTemplate from store actions above):
```typescript
const saveTemplate = useWorkoutStore((s) => s.saveTemplate)
const updateTemplate = useWorkoutStore((s) => s.updateTemplate)
const activeUserId = useWorkoutStore((s) => s.activeUserId)
```

---

### `src/components/TemplatePreview.tsx` (component, request-response)

**Analog:** `src/components/ExerciseRestSheet.tsx` — Dialog with confirm action that triggers navigation.

**Dialog + navigate pattern** (combine ExerciseRestSheet shell + Dashboard navigate pattern):
```typescript
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type TemplatePreviewProps = {
  template: WorkoutTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplatePreview({ template, open, onOpenChange }: TemplatePreviewProps) {
  const navigate = useNavigate()
  // local editable copy of exercises for preview+edit step (D-08)
  const [exercises, setExercises] = useState(template.exercises)

  const handleStart = () => {
    onOpenChange(false)
    navigate('/session/template', { state: { templateId: template.id, exercises } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-neutral/50 max-w-sm">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        {/* Exercise list — editable (add/remove/reorder) */}
        <Button onClick={handleStart} className="mt-3 min-h-[44px] w-full">
          Iniciar Treino
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

**Router state handoff** (navigate with state per Research Pattern 4):
```typescript
navigate('/session/template', { state: { templateId: template.id, exercises } })
```

---

### `src/routes/SessionDetail.tsx` (route, modify — save-from-workout + template-mode)

**Analog:** self.

**Save-from-workout** — hook into `finishSession` after `logSession` resolves (lines 505–537):
```typescript
// After logSession resolves (line 526), before setCelebrating(true):
const templateExercises = Object.entries(exerciseState).map(([exerciseId, state]) => ({
  exerciseId,
  restSeconds: exerciseRestConfig?.[exerciseId] ?? defaultRestSeconds,
  defaultSets: state.sets.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    rir: s.rir,
    completed: false,  // reset completion flag
  })),
}))
// Prompt user with Dialog to name + save (or auto-dismiss after 5s)
setSaveTemplatePayload(templateExercises)  // triggers Dialog open
```

**Template-mode initialization** — read `location.state` to override `initialExerciseState` (parallel to lines 236–257):
```typescript
import { useLocation } from 'react-router-dom'
const { state } = useLocation()
const templateId: string | undefined = state?.templateId

// In initialExerciseState useMemo, add branch:
if (templateId) {
  const template = templates.find((t) => t.id === templateId)
  if (template) {
    template.exercises.forEach((te) => {
      nextState[te.exerciseId] = {
        sets: te.defaultSets.map((s) => ({ ...s, completed: false })),
        notes: '',
      }
    })
    return nextState
  }
}
// else fall through to existing program-driven initialization
```

**Free-session routing decision** (from Pitfall 2 in RESEARCH.md): planner must choose between (a) template-mode branch inside SessionDetail reading `location.state.templateId` — reuses all existing UI — vs (b) new `TemplateSessionDetail.tsx` route. Pattern (a) is recommended to avoid duplication; the branch point is in the `session` derivation from `useActiveProgram()`.

---

### `src/data/exerciseCatalog.test.ts` (test — new)

**Analog:** `src/store/workoutStore.test.ts` (lines 1–60)

**Test file structure:**
```typescript
import { describe, it, expect } from 'vitest'
import { exerciseCatalog, catalogByMuscleGroup } from './exerciseCatalog'

describe('exerciseCatalog', () => {
  it('exports a non-empty array', () => {
    expect(exerciseCatalog.length).toBeGreaterThan(0)
  })

  it('every entry has required fields', () => {
    for (const ex of exerciseCatalog) {
      expect(ex.id).toBeTruthy()
      expect(ex.name).toBeTruthy()
      expect(ex.muscleGroup).toBeTruthy()
      expect(typeof ex.defaultRest).toBe('number')
      expect(ex.defaultRest).toBeGreaterThan(0)
    }
  })

  it('has no duplicate IDs', () => {
    const ids = exerciseCatalog.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('catalogByMuscleGroup', () => {
  it('groups cover all catalog exercises', () => {
    const groupedCount = catalogByMuscleGroup.reduce((sum, g) => sum + g.exercises.length, 0)
    expect(groupedCount).toBe(exerciseCatalog.length)
  })
})
```

---

## Shared Patterns

### Store selector pattern
**Source:** `src/routes/Progress.tsx` lines 12–13, `src/routes/SessionDetail.tsx` lines 141
**Apply to:** Templates.tsx, TemplateBuilder.tsx, TemplatePreview.tsx
```typescript
const templates = useWorkoutStore((s) => s.templates)
const activeUserId = useWorkoutStore((s) => s.activeUserId)
```

### makeId() for new records
**Source:** `src/store/workoutStore.ts` lines 140–143
**Apply to:** saveTemplate, duplicateTemplate actions
```typescript
const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}
```

### Error handling (try/catch + set error)
**Source:** `src/store/workoutStore.ts` lines 240–256 (updateProfile)
**Apply to:** all new store actions (saveTemplate, deleteTemplate, updateTemplate, duplicateTemplate)
```typescript
try {
  // Dexie operation
} catch (err) {
  console.error(err)
  set({ error: 'Mensagem de erro em português.' })
}
```

### Toast notification pattern
**Source:** `src/routes/SessionDetail.tsx` lines 527–537
**Apply to:** After saveTemplate resolves in save-from-workout flow
```typescript
toast({
  title: 'Template salvo',
  description: 'Treino salvo como template.',
})
```

### shadcn Dialog shell
**Source:** `src/components/ExerciseRestSheet.tsx` lines 36–82
**Apply to:** TemplateBuilder.tsx, TemplatePreview.tsx
```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="bg-surface border-neutral/50 max-w-sm">
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    {/* content */}
    <Button className="mt-3 min-h-[44px] w-full">...</Button>
  </DialogContent>
</Dialog>
```

### Collapsible group sections
**Source:** `src/routes/SessionDetail.tsx` imports (line 32–35) — `Collapsible, CollapsibleContent, CollapsibleTrigger` from `@/components/ui/collapsible`
**Apply to:** TemplateBuilder.tsx exercise picker (grouped by muscleGroup)

### Zod schema extension pattern
**Source:** `src/store/workoutStore.ts` lines 79–92 (`templateSchema`)
**Apply to:** Extend `templateSchema` with `restSeconds?: z.number().optional()` in exercises array; extend `importSchema` if `WorkoutTemplate` shape changes.

---

## No Analog Found

All files have analogs. No greenfield patterns required.

---

## Metadata

**Analog search scope:** `src/store/`, `src/routes/`, `src/components/`, `src/data/`, `src/types.ts`
**Files scanned:** 11 source files read directly
**Pattern extraction date:** 2026-04-22
