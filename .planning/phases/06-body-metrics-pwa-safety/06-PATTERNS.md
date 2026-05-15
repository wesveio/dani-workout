# Phase 6: Body Metrics + PWA Safety - Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 12 new/modified files
**Analogs found:** 11 / 12

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/store/bodyMetricsStore.ts` | store | CRUD | `src/store/workoutStore.ts` | exact |
| `src/routes/BodyMetrics.tsx` | route/screen | request-response | `src/routes/Progress.tsx` | role-match |
| `src/components/WeightTrendChart.tsx` | component | transform | `src/components/ExerciseProgressChart.tsx` | exact |
| `src/components/MeasurementsChart.tsx` | component | transform | `src/components/ExerciseProgressChart.tsx` | exact |
| `src/components/BodyMetricSheet.tsx` | component | request-response | `src/routes/Templates.tsx` (Dialog pattern) | role-match |
| `src/components/PhotoGallery.tsx` | component | file-I/O | `src/routes/Progress.tsx` (grid list) | partial |
| `src/components/iOSInstallBanner.tsx` | component | event-driven | none | no analog |
| `src/lib/imageCompression.ts` | utility | transform | `src/lib/rest.ts` | partial |
| `src/lib/iosInstall.ts` | utility | event-driven | `src/lib/rest.ts` | partial |
| `src/db/client.ts` (modify) | config | CRUD | self | exact |
| `src/types.ts` (modify) | model | — | self | exact |
| `src/components/Layout.tsx` (modify) | component | — | self | exact |
| `src/App.tsx` (modify) | config | — | self | exact |

---

## Pattern Assignments

### `src/store/bodyMetricsStore.ts` (store, CRUD)

**Analog:** `src/store/workoutStore.ts`

**Imports pattern** (`workoutStore.ts` lines 1-6):
```typescript
import { create } from 'zustand'
import Dexie from 'dexie'
import { z } from 'zod'
import { db } from '@/db/client'
import type { BodyMetric } from '@/types'
```

**Store type shape** (`workoutStore.ts` lines 118-144):
```typescript
type WorkoutStore = {
  workouts: WorkoutLog[]
  loading: boolean
  error: string | null
  init: () => Promise<void>
  // ... async CRUD actions
}
```
Follow the same shape: `entries: BodyMetric[]`, `photos: ProgressPhoto[]`, `loading: boolean`, `error: string | null`.

**makeId helper** (`workoutStore.ts` lines 146-149):
```typescript
const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}
```
Copy this verbatim — do not use a different ID strategy.

**Dexie compound-index query pattern** (`workoutStore.ts` lines 152-157):
```typescript
const getUserWorkouts = (userId: UserId) =>
  db.workouts
    .where('[userId+date]')
    .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
    .reverse()
    .toArray()
```
Apply identical pattern for bodyMetrics and progressPhotos using their `[userId+date]` index.

**Error handling in store actions** (`workoutStore.ts` lines 200-219):
```typescript
try {
  // ... Dexie operation
  set({ ...data, loading: false, error: null })
} catch (err) {
  console.error(err)
  set({ loading: false, error: 'Falha ao carregar dados locais. Reinicie ou limpe o cache.' })
}
```
All async actions wrap in try/catch and call `set({ error: '...' })` on failure. Use Portuguese error messages.

**Zod schema for body metric** (`workoutStore.ts` lines 95-105):
```typescript
const bodyMetricSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  date: z.string(),
  weight: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  chest: z.number().optional(),
  arms: z.number().optional(),
  notes: z.string().optional(),
})
```
Export `bodyMetricSchema` and a new `progressPhotoSchema` from `bodyMetricsStore.ts` for use in tests.

---

### `src/routes/BodyMetrics.tsx` (route/screen, request-response)

**Analog:** `src/routes/Progress.tsx`

**Imports pattern** (`Progress.tsx` lines 1-10):
```typescript
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useWorkoutStore } from '@/store/workoutStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```
Replace `useWorkoutStore` with `useBodyMetricsStore`. Keep dayjs for date formatting.

**Route default export pattern** (`Progress.tsx` line 11):
```typescript
export default function Progress() {
```
Must be a default export for `React.lazy()` to work. Name: `export default function BodyMetrics()`.

**Screen structure pattern** (`Progress.tsx` lines 28-34):
```typescript
return (
  <div className="space-y-4">
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-muted">Progresso</div>
      <h1 className="text-2xl font-bold">Histórico por exercício</h1>
    </div>
    {/* content */}
  </div>
)
```
Use `space-y-4` top-level wrapper, same `text-xs uppercase tracking-[0.2em] text-muted` sub-label pattern, `text-2xl font-bold` heading.

---

### `src/components/WeightTrendChart.tsx` (component, transform)

**Analog:** `src/components/ExerciseProgressChart.tsx` (full file, 88 lines)

**Imports** (`ExerciseProgressChart.tsx` lines 1-2):
```typescript
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
```
Switch `Area`/`AreaChart` to `Line`/`LineChart`. Keep the `Formatter` import for typed tooltip.

**Tooltip style** (`ExerciseProgressChart.tsx` lines 47-53) — copy exactly:
```typescript
<Tooltip
  contentStyle={{
    borderRadius: 12,
    border: '1px solid #2A2A2A',
    background: '#1A1A1A',
  }}
  formatter={tooltipFormatter}
/>
```

**Axis style** (`ExerciseProgressChart.tsx` lines 45-46) — copy exactly:
```typescript
<XAxis dataKey="date" tickLine={false} axisLine={false} />
<YAxis tickLine={false} axisLine={false} />
```

**ResponsiveContainer wrapper** (`ExerciseProgressChart.tsx` lines 28-30):
```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={chartData}>
```

For `WeightTrendChart`: single `<Line>` with `dataKey="weight"`, `stroke="#FF8C00"` (primary accent), `strokeWidth={3}`, `type="monotone"`, `dot={false}`.

---

### `src/components/MeasurementsChart.tsx` (component, transform)

**Analog:** `src/components/ExerciseProgressChart.tsx`

Same Recharts structure as `WeightTrendChart` above, plus `Legend` import and 4 `<Line>` elements with `hide` prop controlled by local state:

```typescript
import { Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const COLORS = {
  waist: '#FF8C00',
  hips:  '#4EFF74',
  chest: '#4495FF',
  arms:  '#A78BFA',
}
```

Tooltip style, axis style, and `ResponsiveContainer` are identical to `WeightTrendChart` — copy from analog.

Legend click-to-toggle pattern (not in existing code — new, use this):
```typescript
const [hidden, setHidden] = useState<string[]>([])
const toggleLine = (key: string) =>
  setHidden(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
// On each Line:
<Line hide={hidden.includes('waist')} ... />
// On Legend:
<Legend onClick={(e) => toggleLine(e.dataKey as string)} />
```

---

### `src/components/BodyMetricSheet.tsx` (component, request-response)

**Analog:** Form/dialog patterns from `workoutStore.ts` action signatures and shadcn Dialog.

No direct analog component exists, but the Dialog is already used in the project. Structure as a Dialog with `open`/`onOpenChange` props.

**Dialog import pattern** (from shadcn, already installed):
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
```

**Controlled dialog pattern** (match how other components open dialogs):
```typescript
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialEntry?: BodyMetric  // undefined = new entry, defined = edit
}
export function BodyMetricSheet({ open, onOpenChange, initialEntry }: Props) {
```

Form submission calls `useBodyMetricsStore` action, then calls `onOpenChange(false)`.

---

### `src/components/PhotoGallery.tsx` (component, file-I/O)

**Analog:** `src/routes/Progress.tsx` (grid layout pattern)

**Grid layout pattern** (`Progress.tsx` lines 36-37):
```typescript
<div className="grid gap-3 md:grid-cols-2">
```
Use `grid grid-cols-3 gap-2` for 3-column photo grid.

**File input for camera/gallery** (no analog — use D-01 spec):
```typescript
<input
  type="file"
  accept="image/*"
  // No capture attribute — lets iOS show camera/gallery sheet per Pitfall 3
  onChange={handleFileSelect}
  className="hidden"
  ref={fileInputRef}
/>
```

**Empty state pattern** (match Progress.tsx inline empty state style):
```typescript
<div className="col-span-3 py-12 text-center text-sm text-muted">
  Nenhuma foto ainda. Toque em + para adicionar.
</div>
```

---

### `src/lib/imageCompression.ts` (utility, transform)

**Analog:** `src/lib/rest.ts` (single-purpose pure utility, no imports)

**Utility file shape** (`rest.ts` lines 1-36):
```typescript
// No external imports — pure functions only
export const parseRestDuration = (value?: string, fallbackSeconds = 90): number => { ... }
export const formatRestClock = (seconds: number): string => { ... }
```
Follow same shape: pure exported async function, no store imports, no React imports.

**Core implementation** (from RESEARCH.md Pattern 2 — Canvas API standard):
```typescript
export async function compressImage(file: File, targetBytes = 200_000): Promise<string> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size > 1_000_000) { reject(new Error('too-large')); return }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.8
    )
  })
}
```

---

### `src/lib/iosInstall.ts` (utility, event-driven)

**Analog:** `src/lib/rest.ts` (pure utility, no imports)

Same shape as `imageCompression.ts` — pure exported functions, no framework imports.

**Core implementation** (from RESEARCH.md Pattern 3):
```typescript
export function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  return isIOS && isSafari
}

export function isStandalone(): boolean {
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

const DISMISS_KEY = 'ios-banner-dismissed-until'

export function shouldShowBanner(): boolean {
  if (!isIOSSafari() || isStandalone()) return false
  const until = localStorage.getItem(DISMISS_KEY)
  if (!until) return true
  return Date.now() > Number(until)
}

export function dismissBanner(): void {
  const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem(DISMISS_KEY, String(sevenDays))
}
```

---

### `src/components/iOSInstallBanner.tsx` (component, event-driven)

**No close analog exists.** This is a first-of-kind component. Use these constraints:

- Rendered inside `Layout.tsx` above the `<nav>`, outside `<main>`.
- Fixed position above bottom nav. Use `fixed bottom-[72px] left-0 right-0` to sit above the nav bar.
- Uses `shouldShowBanner()` / `dismissBanner()` from `src/lib/iosInstall.ts`.
- `useState` initialized on mount (not on render) per Pitfall 2.
- Dark theme consistent with `bg-surface border border-neutral/50` pattern from Layout nav.

---

### `src/db/client.ts` (modify — add version 5)

**Analog:** Self. Follow the established version pattern (`client.ts` lines 55-71):

**Version 4 pattern to copy for version 5** (`client.ts` lines 55-64):
```typescript
this.version(4)
  .stores({
    workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
    // ... repeat all prior tables unchanged
    bodyMetrics: '&id, userId, [userId+date], date',
  })
  .upgrade(async (tx) => { ... })
```

**Version 5 addition:**
```typescript
this.version(5).stores({
  workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
  exerciseLogs: 'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
  settings: '&key',
  profiles: '&id, name',
  templates: '&id, userId, [userId+name]',
  bodyMetrics: '&id, userId, [userId+date], date',
  progressPhotos: '&id, userId, [userId+date], date',
})
// No .upgrade() needed — new table, no data migration
```

Add `progressPhotos!: Table<ProgressPhoto>` to the `WorkoutDB` class body (lines 10-17 pattern).

---

### `src/types.ts` (modify — add ProgressPhoto, extend ExportBundle)

**Analog:** Self. Follow the existing type definition style (`types.ts` lines 60-81):

**Existing BodyMetric type** (lines 60-70) — model `ProgressPhoto` on this pattern:
```typescript
export type ProgressPhoto = {
  id: string
  userId: string
  date: string         // YYYY-MM-DD
  dataUrl: string      // base64 compressed JPEG
  fileSizeBytes: number
}
```

**Extend ExportBundle** (lines 72-81) — add one optional field after `bodyMetrics`:
```typescript
export type ExportBundle = {
  // ... existing fields unchanged ...
  bodyMetrics?: BodyMetric[]
  progressPhotos?: ProgressPhoto[]  // new
}
```

---

### `src/components/Layout.tsx` (modify — add nav tab + banner slot)

**Analog:** Self. Lines 13-19 for navItems, lines 66-98 for nav render.

**navItems array addition** (`Layout.tsx` lines 13-19):
```typescript
const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/week', label: 'Treino', icon: CalendarDays },
  { to: '/progress', label: 'Historico', icon: BarChart2 },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/corpo', label: 'Corpo', icon: Scale },     // new — replace Settings or add 6th
  { to: '/settings', label: 'Config', icon: SettingsIcon },
]
```
Note Pitfall 6: 6 items may crowd. Reduce per-tab class from `px-1` to `px-0.5` on the `<Link>` element (line 83).

**Banner slot** — place `<iOSInstallBanner />` immediately above the `<nav>` block (line 67), still inside the outermost `<div>`.

**Lucide import addition** (`Layout.tsx` line 2-8):
```typescript
import { Scale } from 'lucide-react'  // add to existing destructure
```

---

### `src/App.tsx` (modify — add lazy route)

**Analog:** Self. Lines 7-13 for lazy imports, lines 67-74 for Route declarations.

**Lazy import addition** (`App.tsx` lines 7-13):
```typescript
const BodyMetrics = lazy(() => import('./routes/BodyMetrics'))
```

**Route addition** (`App.tsx` lines 67-74):
```typescript
<Route path="/corpo" element={<BodyMetrics />} />
```
Insert before the `path="*"` catch-all.

---

## Shared Patterns

### Zustand Store Pattern
**Source:** `src/store/workoutStore.ts` lines 151-219
**Apply to:** `src/store/bodyMetricsStore.ts`

All store actions:
1. Call `set({ loading: true })` at start if affecting global state.
2. Wrap in `try/catch`.
3. On success: `set({ ...newState, error: null })`.
4. On failure: `console.error(err)` then `set({ error: 'Portuguese message' })`.
5. Never throw — errors surface via `error` state field.

### Dexie Compound Index Query
**Source:** `src/store/workoutStore.ts` lines 152-157
**Apply to:** All Dexie reads in `bodyMetricsStore.ts`

```typescript
db.bodyMetrics
  .where('[userId+date]')
  .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
  .reverse()
  .toArray()
```

### Recharts Dark-Theme Tooltip
**Source:** `src/components/ExerciseProgressChart.tsx` lines 47-53
**Apply to:** `WeightTrendChart.tsx`, `MeasurementsChart.tsx`

```typescript
contentStyle={{
  borderRadius: 12,
  border: '1px solid #2A2A2A',
  background: '#1A1A1A',
}}
```

### ID Generation
**Source:** `src/store/workoutStore.ts` lines 146-149
**Apply to:** `bodyMetricsStore.ts` (copy makeId verbatim)

### Route Default Export + Lazy Loading
**Source:** `src/App.tsx` lines 7-13, 67-74
**Apply to:** `src/routes/BodyMetrics.tsx` must use `export default function BodyMetrics()`

### Tailwind Class Conventions
**Source:** `src/components/Layout.tsx`, `src/routes/Progress.tsx`

| Usage | Class |
|---|---|
| Section sub-label | `text-xs uppercase tracking-[0.2em] text-muted` |
| Screen heading | `text-2xl font-bold` |
| Card grid | `grid gap-3 md:grid-cols-2` |
| Photo grid | `grid grid-cols-3 gap-2` |
| Surface card bg | `bg-surface border border-neutral/50` |
| Spacing wrapper | `space-y-4` |

---

## Test Patterns

### Unit test file shape
**Source:** `src/store/workoutStore.test.ts` lines 1-6

```typescript
import { describe, it, expect, vi } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
```

For `bodyMetricsStore.test.ts`: use `fake-indexeddb` to create an in-memory Dexie instance. Pass it via `new WorkoutDB({ indexedDB: new IDBFactory(), IDBKeyRange })`.

For `imageCompression.test.ts`: mock `document.createElement` and `canvas.toBlob` via `vi.spyOn` — jsdom does not implement Canvas.

For `iosInstall.test.ts`: mock `window.navigator.userAgent` via `Object.defineProperty` and `localStorage` via `vi.stubGlobal`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/components/iOSInstallBanner.tsx` | component | event-driven | No banner/notification components exist in codebase. First fixed-overlay component. |

---

## Metadata

**Analog search scope:** `src/store/`, `src/components/`, `src/routes/`, `src/lib/`, `src/db/`, `src/types.ts`, `src/App.tsx`
**Files scanned:** 14
**Pattern extraction date:** 2026-04-22
