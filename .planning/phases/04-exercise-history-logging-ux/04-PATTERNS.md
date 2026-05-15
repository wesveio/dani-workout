# Phase 4: Exercise History + Logging UX - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 8 (5 new, 3 modified)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/SetRow.tsx` | component | request-response | `src/routes/SessionDetail.tsx` lines 791–1008 (set-row JSX block) | exact — extracted from |
| `src/components/PrBadge.tsx` | component | event-driven | `src/components/RestTimerCard.tsx` | role-match (presentational, animation) |
| `src/components/ExerciseProgressChart.tsx` | component | transform | `src/routes/ExerciseHistory.tsx` lines 116–141 (AreaChart block) | exact — extracted from |
| `src/routes/SessionDetail.tsx` | route | request-response | itself (modification) | self |
| `src/routes/ExerciseHistory.tsx` | route | CRUD | itself (modification) | self |
| `src/components/SetRow.test.tsx` | test | — | `src/routes/SessionDetail.test.tsx` | role-match |
| `src/components/PrBadge.test.tsx` | test | — | `src/routes/SessionDetail.test.tsx` | role-match |
| `src/components/ExerciseProgressChart.test.tsx` | test | — | `src/routes/SessionDetail.test.tsx` | role-match |

---

## Pattern Assignments

### `src/components/SetRow.tsx` (component, request-response)

**Analog:** `src/routes/SessionDetail.tsx` — set-row map block (lines 791–1008)

**Imports pattern** (from SessionDetail.tsx lines 1–39):
```typescript
import { memo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { SetEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
```

**Props interface** (derived from existing inline usage, lines 791–1008):
```typescript
type SetRowProps = {
  exerciseId: string
  absoluteIndex: number
  set: SetEntry
  previousSet?: SetEntry          // from lastLogsByExercise.get(exerciseId)?.sets[absoluteIndex]
  unitLabel: string               // 'reps' | 'time'
  unitLabelDisplay: string        // 'Reps' | 'Segundos'
  onSetChange: (field: keyof SetEntry, value: number | boolean) => void
  onAdjust: (field: 'weight' | 'reps' | 'rir', delta: number) => void
  onCopyPrevious?: () => void
  onAdvanceFocus?: () => void     // called by SessionDetail after completed → true
  hasPr: boolean
}
```

**Core set-row grid pattern** (SessionDetail.tsx lines 794–797):
```tsx
<div
  key={`${exercise.id}-set-${absoluteIndex}`}
  className='grid grid-cols-2 sm:grid-cols-12 items-center gap-2 rounded-lg border border-neutral/10 bg-card px-3 py-2'
>
```

**Input with stepper pattern** (SessionDetail.tsx lines 801–874, weight field):
```tsx
<div className='col-span-2 sm:col-span-3'>
  <Label className='text-[11px]'>Carga</Label>
  <Input
    id={`set-input-${exerciseId}-${absoluteIndex}`}  // NEW: required for auto-advance
    aria-label={`${exerciseName} série ${absoluteIndex + 1} carga`}
    type='text'
    inputMode='decimal'
    value={set.weight}
    onChange={(e) => {
      const validated = validateNumericInput(e.target.value, true)
      onSetChange('weight', validated === '' ? 0 : Number(validated))
    }}
  />
  {/* Ghost value — NEW for LOG-02 */}
  {previousSet?.weight !== undefined && (
    <div
      className="text-[12px] text-muted leading-none mt-1"
      aria-label={`Valor anterior: ${previousSet.weight} kg`}
    >
      Ant: {previousSet.weight} kg
    </div>
  )}
  <div className='mt-1 flex gap-1 text-[11px]'>
    <Button type='button' variant='ghost' size='sm' className='px-2'
      onClick={() => onAdjust('weight', -2.5)}>-2.5</Button>
    <Button type='button' variant='ghost' size='sm' className='px-2'
      onClick={() => onAdjust('weight', 2.5)}>+2.5</Button>
    <Button type='button' variant='ghost' size='sm' className='px-2'
      onClick={() => onAdjust('weight', 5)}>+5</Button>
  </div>
</div>
```

**PR badge placement** (after complete button, NEW for LOG-04):
```tsx
{hasPr && <PrBadge />}
```

---

### `src/components/PrBadge.tsx` (component, event-driven)

**Analog:** `src/components/RestTimerCard.tsx` — presentational component with animation

**Pattern** (RestTimerCard.tsx lines 58–101 — entry animation style):
```tsx
// RestTimerCard uses inline style animation:
style={{ animation: 'timer-card-enter 200ms ease-out' }}
// Use same approach for PrBadge:
style={{ animation: 'celebration-pop 0.6s ease-out' }}
```

**Full component** (from UI-SPEC, verified against lucide-react Trophy already used in ExerciseHistory.tsx line 4):
```tsx
import { Trophy } from 'lucide-react'

export function PrBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase text-foreground"
      style={{ animation: 'celebration-pop 0.6s ease-out' }}
      aria-live="polite"
    >
      <Trophy className="h-3.5 w-3.5" />
      PR!
    </span>
  )
}
```

---

### `src/components/ExerciseProgressChart.tsx` (component, transform)

**Analog:** `src/routes/ExerciseHistory.tsx` lines 116–141

**Imports** (ExerciseHistory.tsx lines 1–13):
```typescript
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
```

**Extended ChartDatum type** (ExerciseHistory.tsx lines 15–19 + e1rm addition):
```typescript
type ChartDatum = {
  date: string
  volume: number
  topWeight: number
  e1rm: number   // NEW: Epley on best set per session
}
```

**chartData computation with e1rm** (ExerciseHistory.tsx lines 41–49 + Epley):
```typescript
const chartData: ChartDatum[] = useMemo(
  () =>
    logs.map((log) => ({
      date: dayjs(log.date).format('MMM D'),
      volume: computeVolume(log),
      topWeight: log.sets.reduce((max, set) => Math.max(max, set.weight), 0),
      e1rm: log.sets.reduce((max, set) => Math.max(max, epley(set.weight, set.reps)), 0),
    })),
  [logs],
)
```

**AreaChart pattern with dark theme** (ExerciseHistory.tsx lines 116–141, colors updated per UI-SPEC):
```tsx
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={chartData}>
    <defs>
      {/* CHANGED from #18D02E to dark-theme tokens */}
      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.7} />
        <stop offset="95%" stopColor="#FF8C00" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorTopWeight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#FF3D3D" stopOpacity={0.7} />
        <stop offset="95%" stopColor="#FF3D3D" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorE1rm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#FF3D3D" stopOpacity={0.7} />
        <stop offset="95%" stopColor="#FF3D3D" stopOpacity={0.1} />
      </linearGradient>
    </defs>
    <XAxis dataKey="date" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} />
    <Tooltip
      contentStyle={{ borderRadius: 12, border: '1px solid #2A2A2A', background: '#1A1A1A' }}
      formatter={tooltipFormatter}
    />
    {/* Render only the active metric series */}
    {metric === 'volume' && (
      <Area type="monotone" dataKey="volume" stroke="#FF8C00" fillOpacity={1}
        fill="url(#colorVolume)" strokeWidth={3} />
    )}
    {metric === 'topWeight' && (
      <Area type="monotone" dataKey="topWeight" stroke="#FF3D3D" fillOpacity={1}
        fill="url(#colorTopWeight)" strokeWidth={3} />
    )}
    {metric === 'e1rm' && (
      <Area type="monotone" dataKey="e1rm" stroke="#FF3D3D" fillOpacity={1}
        fill="url(#colorE1rm)" strokeWidth={3} />
    )}
  </AreaChart>
</ResponsiveContainer>
```

**Props interface:**
```typescript
type ExerciseProgressChartProps = {
  chartData: ChartDatum[]
  metric: 'volume' | 'topWeight' | 'e1rm'
}
```

---

### `src/routes/SessionDetail.tsx` (modification)

**PR state pattern** — add after existing `lastLogsByExercise` useMemo (line 174):
```typescript
// bestWeightByExercise — for PR detection (LOG-04)
// NOTE: separate from lastLogsByExercise which only stores most recent log
const bestWeightByExercise = useMemo(() => {
  const map = new Map<string, number>()
  exerciseLogs.forEach((log) => {
    const best = log.sets.reduce((max, s) => Math.max(max, s.weight), 0)
    map.set(log.exerciseId, Math.max(map.get(log.exerciseId) ?? 0, best))
  })
  return map
}, [exerciseLogs])

// Local state: prBySet[exerciseId][setIndex] = true if PR detected this session
const [prBySet, setPrBySet] = useState<Record<string, boolean[]>>({})
```

**handleSetChange augmentation** — inside the existing completed guard (SessionDetail.tsx lines 330–333):
```typescript
if (field === 'completed' && value === true) {
  const restSecs = (exerciseRestConfig && exerciseRestConfig[exerciseId]) ?? defaultRestSeconds ?? 90
  startTimer(restSecs)
  // NEW: PR detection (LOG-04)
  const currentSet = exerciseState[exerciseId]?.sets[setIndex]
  const best = bestWeightByExercise.get(exerciseId) ?? 0
  if (currentSet && currentSet.weight > best) {
    setPrBySet((prev) => {
      const exercisePrs = [...(prev[exerciseId] ?? [])]
      exercisePrs[setIndex] = true
      return { ...prev, [exerciseId]: exercisePrs }
    })
  }
  // NEW: auto-advance focus (LOG-03) — scans session exercises in order
  requestAnimationFrame(() => {
    if (!session) return
    let found = false
    for (const ex of session.exercises) {
      const state = exerciseState[ex.id]
      if (!state) continue
      for (let i = 0; i < state.sets.length; i++) {
        if (!state.sets[i].completed) {
          if (found || (ex.id === exerciseId && i > setIndex)) {
            document.getElementById(`set-input-${ex.id}-${i}`)?.focus()
            return
          }
        }
      }
    }
  })
}
```

**SetRow replacement in setsForTarget.map** (replaces lines 791–1008 inline JSX):
```tsx
{setsForTarget.map((set, idx) => {
  const absoluteIndex = startIndex + idx
  return (
    <SetRow
      key={`${exercise.id}-set-${absoluteIndex}`}
      exerciseId={exercise.id}
      absoluteIndex={absoluteIndex}
      set={set}
      previousSet={lastLogsByExercise.get(exercise.id)?.sets[absoluteIndex]}
      unitLabel={unitLabel}
      unitLabelDisplay={unitLabelDisplay}
      hasPr={prBySet[exercise.id]?.[absoluteIndex] ?? false}
      onSetChange={(field, value) => handleSetChange(exercise.id, absoluteIndex, field, value)}
      onAdjust={(field, delta) => adjustSetValue(exercise.id, absoluteIndex, field, delta)}
      onCopyPrevious={() => copyPreviousSet(exercise.id, absoluteIndex)}
    />
  )
})}
```

---

### `src/routes/ExerciseHistory.tsx` (modification)

**Tabs import** (add to existing imports — Tabs already in shadcn):
```typescript
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExerciseProgressChart } from '@/components/ExerciseProgressChart'
```

**Metric state** (add after existing useMemo hooks):
```typescript
const [metric, setMetric] = useState<'volume' | 'topWeight' | 'e1rm'>('volume')
```

**MetricTabBar + chart replacement** (replaces CardContent lines 112–141):
```tsx
<CardContent>
  <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
    <TabsList className="mb-4">
      <TabsTrigger value="volume">Volume</TabsTrigger>
      <TabsTrigger value="topWeight">Carga</TabsTrigger>
      <TabsTrigger value="e1rm">1RM Est.</TabsTrigger>
    </TabsList>
  </Tabs>
  <div className="h-64">
    {chartData.length === 0
      ? <div className="grid h-full place-items-center text-foreground/80 text-sm">Ainda sem registros.</div>
      : <ExerciseProgressChart chartData={chartData} metric={metric} />
    }
  </div>
</CardContent>
```

---

### Test files (SetRow.test.tsx, PrBadge.test.tsx, ExerciseProgressChart.test.tsx)

**Analog:** `src/routes/SessionDetail.test.tsx`

**Test structure pattern** (SessionDetail.test.tsx lines 1–39):
```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWorkoutStore } from '@/store/workoutStore'

const initialStore = useWorkoutStore.getState()

describe('ComponentName', () => {
  beforeEach(() => {
    useWorkoutStore.setState(initialStore, true)
    useWorkoutStore.setState({
      loading: false, error: null, activeUserId: 'dani',
      exerciseLogs: [], /* ... */
    })
  })

  it('behavior description', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest {...props} />)
    // assertions
  })
})
```

**SetRow.test.tsx — key test cases:**
- Renders weight + reps inputs (LOG-01)
- Shows ghost value div when `previousSet` provided (LOG-02)
- Does not show ghost value when `previousSet` is undefined (LOG-02)
- Renders `PrBadge` when `hasPr={true}`, not when `hasPr={false}` (LOG-04)

**PrBadge.test.tsx — key test cases:**
- Renders Trophy icon and "PR!" text (LOG-04)
- Has `aria-live="polite"` (accessibility)

**ExerciseProgressChart.test.tsx — key test cases:**
- Renders volume series by default (HIST-02)
- Switching tabs changes visible series label in tooltip (HIST-02)

---

## Shared Patterns

### Zustand store read pattern
**Source:** `src/routes/ExerciseHistory.tsx` lines 27–28, `src/routes/SessionDetail.tsx` lines 176–178
**Apply to:** SessionDetail.tsx (bestWeightByExercise reads exerciseLogs)
```typescript
const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
```

### useMemo for derived data
**Source:** `src/routes/ExerciseHistory.tsx` lines 31–49, SessionDetail.tsx lines 166–174
**Apply to:** `bestWeightByExercise` in SessionDetail, `chartData` with e1rm in ExerciseHistory
```typescript
const derivedData = useMemo(() => {
  // compute from store state
}, [dependency])
```

### Component animation via inline style
**Source:** `src/components/RestTimerCard.tsx` lines 66, 76
**Apply to:** `PrBadge.tsx`
```tsx
style={{ animation: 'animation-name 200ms ease-out' }}
```

### requestAnimationFrame for deferred DOM access
**Source:** RESEARCH.md Pitfall 3 + existing ScrollIntoView pattern (SessionDetail.tsx lines 182–196)
**Apply to:** auto-advance focus in `handleSetChange` (LOG-03)
```typescript
requestAnimationFrame(() => {
  document.getElementById(`set-input-${exId}-${idx}`)?.focus()
})
```

### Epley formula (pure function)
**Source:** No existing analog — new utility
**Apply to:** `ExerciseProgressChart.tsx` chartData computation and `ExerciseHistory.tsx`
```typescript
const epley = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  return Math.round(weight * (1 + reps / 30))
}
```
Note: Consider placing in `src/lib/epley.ts` per RESEARCH.md test map (`src/lib/epley.test.ts`).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/epley.ts` | utility | transform | No math utility files exist yet — pure function, straightforward to write |

---

## Metadata

**Analog search scope:** `src/routes/`, `src/components/`, `src/types.ts`
**Files scanned:** 8 source files read directly
**Key source files:**
- `src/routes/SessionDetail.tsx` — set-row JSX (lines 791–1008), handleSetChange (lines 308–334), lastLogsByExercise (lines 166–174)
- `src/routes/ExerciseHistory.tsx` — full file (191 lines) — AreaChart, chartData, log list
- `src/components/RestTimerCard.tsx` — animation pattern for PrBadge
- `src/routes/SessionDetail.test.tsx` — test structure for new test files
- `src/types.ts` — SetEntry, ExerciseLog shapes
**Pattern extraction date:** 2026-04-21
