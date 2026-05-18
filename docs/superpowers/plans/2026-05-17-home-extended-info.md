# Home Page Extended Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `src/routes/Dashboard.tsx` with eight new info blocks (program progress, next session, streak, today's exercise preview, last workout summary, weekly tonnage + diff, latest body weight + 30d trend, top-3 PRs) using existing zustand stores and program helpers.

**Architecture:** Pure-function selectors added to `src/lib/program.ts` (covered by Vitest). Two reusable presentational components added under `src/components/redesign/`. `Dashboard.tsx` composes selectors + components; no schema changes, no new persistence.

**Tech Stack:** React 19, TypeScript, Tailwind, dayjs, zustand, Dexie (read-only here), Vitest + Testing Library.

---

## File Structure

**Modify:**
- `src/lib/program.ts` — add selectors: `getStreak`, `getWeekTonnage`, `getLastWorkoutSummary`, `getTop3PRs`, `getLatestWeightTrend`, `getNextSession` (helper around existing `getSessionForDate`)
- `src/lib/program.test.ts` — add tests for every new selector
- `src/routes/Dashboard.tsx` — wire selectors + new components into the layout described below
- `src/components/redesign/index.ts` — export the two new components

**Create:**
- `src/components/redesign/ProgressBar.tsx` — thin labeled progress bar (week X / N)
- `src/components/redesign/ProgressBar.test.tsx`
- `src/components/redesign/ExercisePreviewList.tsx` — collapsible list of today's exercises with sets×reps
- `src/components/redesign/ExercisePreviewList.test.tsx`

**Layout order in `Dashboard.tsx` (top → bottom):**
1. Header (unchanged)
2. **ProgressBar** (new) — semana X de N
3. Today block (title + subtitle), now always shows `Próximo: <Treino> · <dia>` line below subtitle
4. PrimaryCTA (unchanged)
5. **ExercisePreviewList** (new) — 5 exercises, "Ver todos" expands rest
6. Prescrição card (unchanged)
7. Aderência card — extended with **Tonelagem semana + Δ vs semana anterior** rows
8. Grid 2-col: **Streak card** + **Último treino card** (both use existing `MetricCard`)
9. **Peso corporal card** (existing `MetricCard` with 30d sparkline; whole card is a `<Link>` to `/corpo`)
10. **Top 3 PRs** list — replaces the single `recentPr` card; header links to `/progress`, each row links to `/exercise/:exerciseId`

---

## Conventions

- Tests use Vitest (`*.test.ts(x)`) co-located next to source.
- All new selectors are pure functions taking explicit args; no store imports inside helpers.
- Body weight route is **`/corpo`** (registered in `src/App.tsx:75` and used by `BottomTabBar` at `src/components/redesign/BottomTabBar.tsx:13`). PR history routes are `/progress` (overview) and `/exercise/:exerciseId` (per-exercise history) per `src/App.tsx:71-72`. There is no `/history` route — do not link to it.
- All UI strings in Portuguese.
- Commit messages: Conventional Commits, scope `home`.

---

## Task 1: `getNextSession` helper

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/lib/program.test.ts`:

```ts
import dayjs from 'dayjs'
import { getNextSession } from './program'
import { treinoDani } from '@/data/treinoDani'

describe('getNextSession', () => {
  it('returns the next scheduled session after today even if today is a training day', () => {
    // 2026-05-17 is a Sunday — pick a known Monday for determinism
    const monday = dayjs('2026-05-18')
    const result = getNextSession(monday, treinoDani.schedule)
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.sessionId).toBeDefined()
    expect(result.dayLabel).toBeTruthy()
    expect(result.daysAhead).toBeGreaterThan(0)
  })

  it('handles rest day by returning the very next training day', () => {
    // Find a rest day in the schedule
    const restDay = dayjs('2026-05-17') // Sunday — typically rest
    const result = getNextSession(restDay, treinoDani.schedule)
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.daysAhead).toBeGreaterThanOrEqual(1)
  })

  it('returns null for empty schedule', () => {
    expect(getNextSession(dayjs('2026-05-18'), [])).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getNextSession`
Expected: FAIL — `getNextSession is not exported`.

- [ ] **Step 3: Implement `getNextSession`**

Add to `src/lib/program.ts`:

```ts
import type { ScheduleDay } from '@/data/programTypes'

const dayOrder = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const

export type NextSession = {
  sessionId: SessionType
  dayLabel: string
  daysAhead: number
}

export const getNextSession = (
  from: dayjs.Dayjs,
  schedule: ScheduleDay[],
): NextSession | null => {
  if (schedule.length === 0) return null
  for (let offset = 1; offset <= 7; offset++) {
    const day = from.add(offset, 'day')
    const name = dayOrder[day.day()]
    const match = schedule.find((s) => s.day.toLowerCase() === name)
    if (match) {
      return { sessionId: match.sessionId, dayLabel: match.day, daysAhead: offset }
    }
  }
  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getNextSession`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getNextSession helper"
```

---

## Task 2: `getStreak` selector

Streak = number of consecutive distinct workout dates ending today **or** yesterday (today not yet completed does not break the streak).

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getStreak } from './program'

describe('getStreak', () => {
  const mk = (date: string) => ({ date })

  it('returns 0 when no workouts', () => {
    expect(getStreak([], dayjs('2026-05-17'))).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const today = dayjs('2026-05-17')
    const logs = [
      mk('2026-05-17'),
      mk('2026-05-16'),
      mk('2026-05-15'),
    ]
    expect(getStreak(logs, today)).toBe(3)
  })

  it('does not break when today is missing but yesterday is present', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-16'), mk('2026-05-15')]
    expect(getStreak(logs, today)).toBe(2)
  })

  it('breaks when yesterday is also missing', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-15'), mk('2026-05-14')]
    expect(getStreak(logs, today)).toBe(0)
  })

  it('deduplicates multiple workouts on the same day', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-17'), mk('2026-05-17'), mk('2026-05-16')]
    expect(getStreak(logs, today)).toBe(2)
  })

  // Note: We do NOT add a cross-TZ regression test here because the property
  // "ISO timestamps are bucketed by LOCAL calendar day" can only be asserted
  // deterministically when the host's TZ is pinned. Pinning TZ at the vitest
  // process level requires `TZ=... npx vitest`, which is brittle across
  // contributors' machines and CI. The behavior is documented in the
  // implementation comment + verified by the smoke step in Task 14
  // (workouts logged near local midnight must not double-count).
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getStreak`
Expected: FAIL — `getStreak is not exported`.

- [ ] **Step 3: Implement**

Add to `src/lib/program.ts`:

```ts
export const getStreak = (
  logs: Array<{ date: string }>,
  today: dayjs.Dayjs,
): number => {
  if (logs.length === 0) return 0
  // Use dayjs to normalize to LOCAL calendar date — `date.slice(0,10)` would use
  // UTC slicing of ISO timestamps and miscount late-night workouts in TZ-offset locales.
  const dates = new Set(logs.map((l) => dayjs(l.date).format('YYYY-MM-DD')))
  const todayIso = today.format('YYYY-MM-DD')
  const yesterdayIso = today.subtract(1, 'day').format('YYYY-MM-DD')
  let cursor = dates.has(todayIso) ? today : dates.has(yesterdayIso) ? today.subtract(1, 'day') : null
  if (!cursor) return 0
  let count = 0
  while (dates.has(cursor.format('YYYY-MM-DD'))) {
    count++
    cursor = cursor.subtract(1, 'day')
  }
  return count
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getStreak`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getStreak selector"
```

---

## Task 3: `getWeekTonnage` selector (current + previous week + diff)

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getWeekTonnage } from './program'

describe('getWeekTonnage', () => {
  const baseSet = { weight: 40, reps: 10, rir: 2, completed: true }
  const mk = (date: string, sets = [baseSet]) => ({
    date,
    sets,
    completed: true,
  })

  it('returns zeros when no logs', () => {
    expect(getWeekTonnage([], '2026-05-11')).toEqual({
      current: 0,
      previous: 0,
      delta: 0,
      deltaPct: null,
    })
  })

  it('sums weight*reps for completed sets in current week', () => {
    const logs = [
      mk('2026-05-11'), // Monday current
      mk('2026-05-13', [baseSet, baseSet]),
    ]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.current).toBe(40 * 10 + 40 * 10 * 2)
    expect(result.previous).toBe(0)
  })

  it('ignores incomplete sets', () => {
    const logs = [
      { date: '2026-05-11', sets: [{ weight: 40, reps: 10, rir: 2, completed: false }] },
    ]
    expect(getWeekTonnage(logs, '2026-05-11').current).toBe(0)
  })

  it('computes delta and deltaPct vs previous week', () => {
    const logs = [
      mk('2026-05-11'), // current week start (Mon)
      mk('2026-05-04'), // previous week
    ]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.current).toBe(400)
    expect(result.previous).toBe(400)
    expect(result.delta).toBe(0)
    expect(result.deltaPct).toBe(0)
  })

  it('deltaPct is null when previous week is 0', () => {
    const logs = [mk('2026-05-11')]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.deltaPct).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getWeekTonnage`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
export type WeekTonnage = {
  current: number
  previous: number
  delta: number
  deltaPct: number | null
}

export const getWeekTonnage = (
  exerciseLogs: Array<{ date: string; sets: Array<{ weight: number; reps: number; completed: boolean }> }>,
  weekStartIso: string,
): WeekTonnage => {
  const weekStart = dayjs(weekStartIso).startOf('day')
  const weekEnd = weekStart.add(7, 'day')
  const prevStart = weekStart.subtract(7, 'day')

  const sumRange = (from: dayjs.Dayjs, to: dayjs.Dayjs) => {
    let total = 0
    for (const log of exerciseLogs) {
      const d = dayjs(log.date)
      if (d.isBefore(from) || !d.isBefore(to)) continue
      for (const s of log.sets) {
        if (s.completed) total += s.weight * s.reps
      }
    }
    return total
  }

  const current = sumRange(weekStart, weekEnd)
  const previous = sumRange(prevStart, weekStart)
  const delta = current - previous
  const deltaPct = previous === 0 ? null : Math.round((delta / previous) * 100)
  return { current, previous, delta, deltaPct }
}
```

Add `import dayjs from 'dayjs'` if not already at the top of the file (it is).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getWeekTonnage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getWeekTonnage selector"
```

---

## Task 4: `getLastWorkoutSummary` selector

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getLastWorkoutSummary } from './program'

describe('getLastWorkoutSummary', () => {
  it('returns null with no workouts', () => {
    expect(getLastWorkoutSummary([], [], dayjs('2026-05-17'))).toBeNull()
  })

  it('returns the most recent workout with set count and top weight', () => {
    const today = dayjs('2026-05-17')
    const workouts = [
      { id: 'w1', date: '2026-05-15', sessionType: 'A' as const },
      { id: 'w2', date: '2026-05-10', sessionType: 'B' as const },
    ]
    const exerciseLogs = [
      { workoutId: 'w1', sets: [
        { weight: 50, reps: 8, completed: true },
        { weight: 60, reps: 6, completed: true },
        { weight: 60, reps: 5, completed: false },
      ] },
      { workoutId: 'w2', sets: [
        { weight: 70, reps: 5, completed: true },
      ] },
    ]
    const result = getLastWorkoutSummary(workouts, exerciseLogs, today)
    expect(result).toMatchObject({
      sessionType: 'A',
      daysAgo: 2,
      completedSets: 2,
      topWeight: 60,
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getLastWorkoutSummary`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
export type LastWorkoutSummary = {
  sessionType: SessionType
  daysAgo: number
  completedSets: number
  topWeight: number
}

export const getLastWorkoutSummary = (
  workouts: Array<{ id: string; date: string; sessionType: SessionType }>,
  exerciseLogs: Array<{ workoutId: string; sets: Array<{ weight: number; reps: number; completed: boolean }> }>,
  today: dayjs.Dayjs,
): LastWorkoutSummary | null => {
  if (workouts.length === 0) return null
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
  const last = sorted[0]
  const logs = exerciseLogs.filter((l) => l.workoutId === last.id)
  let completedSets = 0
  let topWeight = 0
  for (const log of logs) {
    for (const s of log.sets) {
      if (!s.completed) continue
      completedSets++
      if (s.weight > topWeight) topWeight = s.weight
    }
  }
  return {
    sessionType: last.sessionType,
    daysAgo: today.startOf('day').diff(dayjs(last.date).startOf('day'), 'day'),
    completedSets,
    topWeight,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getLastWorkoutSummary`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getLastWorkoutSummary selector"
```

---

## Task 5: `getTop3PRs` selector

Use 1RM estimate via existing `epley(weight, reps)`. Return top 3 distinct exercises ranked by best estimated 1RM among **completed** sets.

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getTop3PRs } from './program'

describe('getTop3PRs', () => {
  it('returns empty list when no logs', () => {
    expect(getTop3PRs([], () => 'x')).toEqual([])
  })

  it('returns up to 3 exercises ranked by estimated 1RM', () => {
    const logs = [
      { exerciseId: 'a', sets: [{ weight: 100, reps: 5, completed: true }] },
      { exerciseId: 'b', sets: [{ weight: 80, reps: 10, completed: true }] },
      { exerciseId: 'c', sets: [{ weight: 60, reps: 6, completed: true }] },
      { exerciseId: 'd', sets: [{ weight: 50, reps: 5, completed: true }] },
    ]
    const result = getTop3PRs(logs, (id) => id.toUpperCase())
    expect(result).toHaveLength(3)
    expect(result[0].exerciseId).toBe('a')
    expect(result[0].exerciseName).toBe('A')
    expect(result[0].oneRm).toBeGreaterThan(result[1].oneRm)
  })

  it('keeps the best set per exercise, not the most recent', () => {
    const logs = [
      { exerciseId: 'a', sets: [{ weight: 50, reps: 5, completed: true }] },
      { exerciseId: 'a', sets: [{ weight: 80, reps: 5, completed: true }] },
    ]
    const result = getTop3PRs(logs, (id) => id)
    expect(result[0].weight).toBe(80)
  })

  it('ignores incomplete sets', () => {
    const logs = [
      { exerciseId: 'a', sets: [{ weight: 200, reps: 1, completed: false }] },
    ]
    expect(getTop3PRs(logs, (id) => id)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getTop3PRs`
Expected: FAIL.

- [ ] **Step 3: Implement**

Add import at top of `src/lib/program.ts`:

```ts
import { epley } from './epley'
```

Add:

```ts
export type Pr = {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  oneRm: number
}

export const getTop3PRs = (
  exerciseLogs: Array<{ exerciseId: string; sets: Array<{ weight: number; reps: number; completed: boolean }> }>,
  findName: (id: string) => string | undefined,
): Pr[] => {
  const best = new Map<string, Pr>()
  for (const log of exerciseLogs) {
    for (const s of log.sets) {
      if (!s.completed) continue
      const oneRm = epley(s.weight, s.reps)
      const cur = best.get(log.exerciseId)
      if (!cur || oneRm > cur.oneRm) {
        best.set(log.exerciseId, {
          exerciseId: log.exerciseId,
          exerciseName: findName(log.exerciseId) ?? log.exerciseId,
          weight: s.weight,
          reps: s.reps,
          oneRm,
        })
      }
    }
  }
  return Array.from(best.values())
    .sort((a, b) => b.oneRm - a.oneRm)
    .slice(0, 3)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getTop3PRs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getTop3PRs selector"
```

---

## Task 6: `getLatestWeightTrend` selector

Latest body weight + sparkline data (last 30 days, sampled by entry date) + delta vs 30 days ago.

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/lib/program.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getLatestWeightTrend } from './program'

describe('getLatestWeightTrend', () => {
  it('returns null when no entries with weight', () => {
    expect(getLatestWeightTrend([], dayjs('2026-05-17'))).toBeNull()
    expect(getLatestWeightTrend([{ date: '2026-05-10' }], dayjs('2026-05-17'))).toBeNull()
  })

  it('returns latest weight and delta vs ~30 days ago', () => {
    const today = dayjs('2026-05-17')
    const entries = [
      { date: '2026-05-17', weight: 72 },
      { date: '2026-05-01', weight: 73 },
      { date: '2026-04-18', weight: 75 },
    ]
    const result = getLatestWeightTrend(entries, today)
    expect(result?.latest).toBe(72)
    expect(result?.delta30d).toBe(-3) // vs 75
    expect(result?.history.length).toBeGreaterThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/program.test.ts -t getLatestWeightTrend`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
export type WeightTrend = {
  latest: number
  date: string
  delta30d: number | null
  history: number[]
}

export const getLatestWeightTrend = (
  entries: Array<{ date: string; weight?: number }>,
  today: dayjs.Dayjs,
): WeightTrend | null => {
  const withWeight = entries.filter((e): e is { date: string; weight: number } => typeof e.weight === 'number')
  if (withWeight.length === 0) return null
  const sorted = [...withWeight].sort((a, b) => a.date.localeCompare(b.date))
  const latestEntry = sorted[sorted.length - 1]
  const cutoff = today.subtract(30, 'day')
  const window = sorted.filter((e) => !dayjs(e.date).isBefore(cutoff))
  // Earliest entry within or just before the 30d window for delta baseline
  const baselineCandidates = sorted.filter((e) => dayjs(e.date).isBefore(cutoff))
  const baseline = baselineCandidates.length > 0
    ? baselineCandidates[baselineCandidates.length - 1]
    : sorted[0]
  const delta30d = baseline.date === latestEntry.date ? null : latestEntry.weight - baseline.weight
  return {
    latest: latestEntry.weight,
    date: latestEntry.date,
    delta30d,
    history: window.map((e) => e.weight),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/program.test.ts -t getLatestWeightTrend`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/program.ts src/lib/program.test.ts
git commit -m "feat(home): add getLatestWeightTrend selector"
```

---

## Task 7: `ProgressBar` component

**Files:**
- Create: `src/components/redesign/ProgressBar.tsx`
- Create: `src/components/redesign/ProgressBar.test.tsx`
- Modify: `src/components/redesign/index.ts`

- [ ] **Step 1: Write the failing test**

`src/components/redesign/ProgressBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders label with current/total and percent fill', () => {
    render(<ProgressBar current={3} total={12} label='Programa' />)
    expect(screen.getByText('Programa')).toBeInTheDocument()
    expect(screen.getByText('Semana 3 / 12')).toBeInTheDocument()
    const fill = screen.getByTestId('progressbar-fill')
    expect(fill.style.width).toBe('25%')
  })

  it('clamps to 0–100 when current exceeds total', () => {
    render(<ProgressBar current={15} total={12} label='X' />)
    expect(screen.getByTestId('progressbar-fill').style.width).toBe('100%')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/redesign/ProgressBar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement component**

`src/components/redesign/ProgressBar.tsx`:

```tsx
export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label: string
}) {
  const pct = Math.max(0, Math.min(100, total === 0 ? 0 : (current / total) * 100))
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between'>
        <span className='text-[11px] font-semibold uppercase tracking-widest text-txt-faint'>
          {label}
        </span>
        <span className='text-[11px] text-txt-faint'>
          Semana {current} / {total}
        </span>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-bg-2'>
        <div
          data-testid='progressbar-fill'
          className='h-full bg-lime transition-all'
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

Add export to `src/components/redesign/index.ts`:

```ts
export { ProgressBar } from './ProgressBar';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/redesign/ProgressBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ProgressBar.tsx src/components/redesign/ProgressBar.test.tsx src/components/redesign/index.ts
git commit -m "feat(home): add ProgressBar component"
```

---

## Task 8: `ExercisePreviewList` component

Collapsible list of today's exercises. Shows first 5; "Ver todos" reveals the rest. Whole card is a `<Link>` to the session route.

**Files:**
- Create: `src/components/redesign/ExercisePreviewList.tsx`
- Create: `src/components/redesign/ExercisePreviewList.test.tsx`
- Modify: `src/components/redesign/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ExercisePreviewList } from './ExercisePreviewList'

const items = Array.from({ length: 7 }, (_, i) => ({
  id: `e${i}`,
  name: `Exercise ${i}`,
  setsText: '3 séries x 10',
}))

describe('ExercisePreviewList', () => {
  it('shows the first 5 by default and a Ver todos toggle when more exist', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items} href='/session/A/1' />
      </MemoryRouter>,
    )
    expect(screen.getAllByTestId('preview-row')).toHaveLength(5)
    expect(screen.getByRole('button', { name: /ver todos/i })).toBeInTheDocument()
  })

  it('expands to show all when Ver todos is pressed', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items} href='/session/A/1' />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /ver todos/i }))
    expect(screen.getAllByTestId('preview-row')).toHaveLength(7)
  })

  it('does not render the toggle when items fit', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items.slice(0, 3)} href='/session/A/1' />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: /ver todos/i })).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/redesign/ExercisePreviewList.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/components/redesign/ExercisePreviewList.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

type Item = { id: string; name: string; setsText: string }

export function ExercisePreviewList({
  items,
  href,
}: {
  items: Item[]
  href: string
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 5)
  const hasMore = items.length > 5
  return (
    <div className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
          Exercícios de hoje
        </p>
        <Link to={href} className='text-[10px] font-semibold text-lime'>
          abrir →
        </Link>
      </div>
      <ul className='flex flex-col gap-2'>
        {visible.map((it) => (
          <li
            key={it.id}
            data-testid='preview-row'
            className='flex items-center justify-between text-sm'
          >
            <span className='truncate pr-2'>{it.name}</span>
            <span className='shrink-0 text-xs text-txt-faint'>{it.setsText}</span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='self-start text-[11px] font-semibold uppercase tracking-widest text-txt-faint active:text-lime'
        >
          {expanded ? 'Mostrar menos' : `Ver todos (${items.length})`}
        </button>
      )}
    </div>
  )
}
```

Add export to `src/components/redesign/index.ts`:

```ts
export { ExercisePreviewList } from './ExercisePreviewList';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/redesign/ExercisePreviewList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ExercisePreviewList.tsx src/components/redesign/ExercisePreviewList.test.tsx src/components/redesign/index.ts
git commit -m "feat(home): add ExercisePreviewList component"
```

---

## Task 9: Wire ProgressBar + next-session line + ExercisePreviewList into Dashboard

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Import new helpers and components**

Update imports at the top of `src/routes/Dashboard.tsx`:

```tsx
import {
  getSessionTemplate,
  getWeekInfo,
  getWeekStates,
  getRecentPr,
  findExerciseById,
  getNextSession,
  computeTargetsForWeek,
} from '@/lib/program'
import {
  PrimaryCTA,
  AderenciaDots,
  Sparkline,
  ProgressBar,
  ExercisePreviewList,
} from '@/components/redesign'
```

- [ ] **Step 2: Compute new values inside the component**

After existing `const sessionVolume = ...` block, add:

```tsx
const nextSession = getNextSession(today, program.schedule)
const previewItems = sessionTemplate.exercises.map((ex) => {
  // Use computeTargetsForWeek so finishers / pump sets / volume bumps are included.
  const targets = computeTargetsForWeek(ex, weekNumber, settings.recoveryExcellent)
  const setsText = targets.length === 0
    ? '—'
    : targets.map((t) => `${t.targetSets}x${t.repRange[0]}–${t.repRange[1]}`).join(' + ')
  return { id: ex.id, name: ex.name, setsText }
})
```

- [ ] **Step 3: Insert `ProgressBar` after the header div**

Between the header div (closing `</div>`) and the "Today's session block", add:

```tsx
<ProgressBar
  current={weekNumber}
  total={program.durationWeeks}
  label='Programa'
/>
```

- [ ] **Step 4: Add next-session line under the subtitle**

Inside the today block, immediately after `<p className='text-sm text-txt-faint'>{sessionTemplate.subtitle}</p>`:

```tsx
{nextSession && (
  <p className='text-xs text-txt-faint'>
    Próximo: Treino {nextSession.sessionId} · {nextSession.dayLabel}
    {nextSession.daysAhead === 1 ? ' (amanhã)' : ''}
  </p>
)}
```

- [ ] **Step 5: Insert `ExercisePreviewList` between PrimaryCTA and Prescrição card**

```tsx
<ExercisePreviewList
  items={previewItems}
  href={`/session/${sessionTemplate.id}/${weekNumber}`}
/>
```

- [ ] **Step 6: Verify build + dev render**

Run: `npm run build`
Expected: succeeds with zero TypeScript errors.

Run: `npm run dev` (manual smoke test in browser — confirm new sections render without overlap or layout regressions). Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add src/routes/Dashboard.tsx
git commit -m "feat(home): add program progress, next session, exercise preview to dashboard"
```

---

## Task 10: Extend Aderência card with weekly tonnage + delta

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Import + compute**

Add to imports:

```tsx
import { getWeekTonnage } from '@/lib/program'
```

Inside component, after `weekStates` is computed:

```tsx
const tonnage = getWeekTonnage(
  exerciseLogs.filter((l) => l.date >= settings.programStart),
  weekStartStr,
)
```

- [ ] **Step 2: Render two rows beneath the dots**

Inside the Aderência card, after `<AderenciaDots states={weekStates} />`, add:

```tsx
<div className='flex items-center justify-between border-t border-bg-3/30 pt-2 text-sm'>
  <span className='text-txt-faint'>Tonelagem</span>
  <span className='font-semibold'>{tonnage.current.toLocaleString('pt-BR')} kg</span>
</div>
{tonnage.deltaPct !== null && (
  <div className='flex items-center justify-between text-xs'>
    <span className='text-txt-faint'>vs semana anterior</span>
    <span className={tonnage.delta >= 0 ? 'text-lime' : 'text-red-400'}>
      {tonnage.delta >= 0 ? '+' : ''}
      {tonnage.deltaPct}%
    </span>
  </div>
)}
```

Note: `border-bg-3/30` follows Tailwind divider conventions used elsewhere — if `bg-3` is not a defined token in `tailwind.config.js`, fall back to `border-white/10`. Verify the token before committing.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Dashboard.tsx
git commit -m "feat(home): add weekly tonnage with delta to aderência card"
```

---

## Task 11: Streak + Last workout grid

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Import + compute**

Add to imports:

```tsx
import { getStreak, getLastWorkoutSummary } from '@/lib/program'
import { MetricCard } from '@/components/redesign'
```

Inside component:

```tsx
const streak = getStreak(workouts.filter((w) => w.date >= settings.programStart), today)
const lastWorkout = getLastWorkoutSummary(workouts, exerciseLogs, today)
```

- [ ] **Step 2: Render 2-col grid after the Aderência card**

```tsx
<div className='grid grid-cols-2 gap-3'>
  <MetricCard
    label='Sequência'
    value={String(streak)}
    unit={streak === 1 ? 'dia' : 'dias'}
  />
  {lastWorkout ? (
    <MetricCard
      label='Último treino'
      value={`Treino ${lastWorkout.sessionType}`}
      unit={lastWorkout.daysAgo === 0 ? 'hoje' : `há ${lastWorkout.daysAgo}d`}
      delta={lastWorkout.topWeight > 0 ? `máx. ${lastWorkout.topWeight}kg · ${lastWorkout.completedSets} séries` : undefined}
    />
  ) : (
    <MetricCard label='Último treino' value='—' />
  )}
</div>
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build`
Expected: PASS.

```bash
git add src/routes/Dashboard.tsx
git commit -m "feat(home): add streak and last workout summary cards"
```

---

## Task 12: Body weight card

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Import store + helper**

```tsx
import { useEffect } from 'react'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { getLatestWeightTrend } from '@/lib/program'
```

Inside component (under the existing hooks):

```tsx
const activeUserId = useWorkoutStore((s) => s.activeUserId)
const bodyEntries = useBodyMetricsStore((s) => s.entries)
const bodyActiveUserId = useBodyMetricsStore((s) => s.activeUserId)
const loadBodyMetricsForUser = useBodyMetricsStore((s) => s.loadForUser)

// The body metrics store is only auto-populated when the user visits /corpo
// (see src/routes/BodyMetrics.tsx:30-32). The home card needs the same data,
// and must refresh whenever the active profile changes.
useEffect(() => {
  if (!activeUserId) return
  if (bodyActiveUserId !== activeUserId) {
    void loadBodyMetricsForUser(activeUserId)
  }
}, [activeUserId, bodyActiveUserId, loadBodyMetricsForUser])

// Only compute the trend after the store has loaded the active profile's entries.
// Otherwise we'd briefly show the previous profile's weight after a switchUser().
const bodyMetricsReady = bodyActiveUserId === activeUserId
const weightTrend = bodyMetricsReady ? getLatestWeightTrend(bodyEntries, today) : null
```

- [ ] **Step 2: Render card before the PRs list**

```tsx
{weightTrend && (
  <Link to='/corpo' className='block active:opacity-80'>
    <MetricCard
      label='Peso corporal'
      value={weightTrend.latest.toString()}
      unit='kg'
      delta={
        weightTrend.delta30d === null
          ? undefined
          : `${weightTrend.delta30d >= 0 ? '+' : ''}${weightTrend.delta30d.toFixed(1)} kg em 30d`
      }
      history={weightTrend.history}
    />
  </Link>
)}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build`
Expected: PASS.

```bash
git add src/routes/Dashboard.tsx
git commit -m "feat(home): add body weight card with 30d trend"
```

---

## Task 13: Replace single PR card with top-3 PR list

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Replace import + compute**

Remove `getRecentPr` and the unused `Sparkline` from imports if no longer referenced. Add:

```tsx
import { getTop3PRs } from '@/lib/program'
```

Replace the `recentPr` computation with:

```tsx
const topPrs = getTop3PRs(exerciseLogs, (id) => findExerciseById(program, id)?.name)
```

- [ ] **Step 2: Replace the existing PR `<Link>` block with a list**

```tsx
{topPrs.length > 0 && (
  <div className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3'>
    <div className='flex items-center justify-between'>
      <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
        PRs recentes
      </p>
      <Link to='/progress' className='text-[10px] font-semibold text-lime'>
        ver progresso →
      </Link>
    </div>
    <ul className='flex flex-col divide-y divide-white/5'>
      {topPrs.map((pr, idx) => (
        <li key={pr.exerciseId}>
          <Link
            to={`/exercise/${pr.exerciseId}`}
            className='flex items-center justify-between py-2 active:opacity-80'
          >
            <div className='flex items-center gap-2'>
              <span className='w-5 text-xs text-txt-faint'>{idx + 1}.</span>
              <span className='text-sm font-semibold truncate'>{pr.exerciseName}</span>
            </div>
            <span className='text-xs text-txt-faint shrink-0'>
              {pr.weight}kg × {pr.reps}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
)}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS — no lint warnings about unused imports.

Run: `npm run test:run`
Expected: all tests pass (the original `Dashboard` had no test asserting the old PR card; if any test breaks, update it to look for the new "PRs recentes" heading).

- [ ] **Step 4: Commit**

```bash
git add src/routes/Dashboard.tsx
git commit -m "feat(home): replace single PR card with top-3 PR list"
```

---

## Task 14: Full regression + manual smoke

**Files:** none modified.

- [ ] **Step 1: Run the entire test suite**

Run: `npm run test:run`
Expected: 100% pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Dev server smoke test**

Run: `npm run dev`. Open the app in a mobile-width browser viewport (375×812). Confirm:
- ProgressBar shows current week
- Today block has the "Próximo: ..." line
- Exercise preview lists 5 items with a "Ver todos" toggle; **multi-target exercises** (e.g. `leg-extension` in `src/data/treinoDani.ts`) show all target lines joined with ` + ` (main set + pump finisher), not just the first
- Aderência shows tonnage row and the delta line (only when previous week has data)
- Streak + Último treino sit side-by-side
- Peso corporal card renders only if any `BodyMetric` with `weight` exists
- Top 3 PRs list renders only if any completed set exists
- No horizontal scroll, no overlapping text
- (TZ smoke) Log a workout with `dayjs().toISOString()` near local midnight and verify the streak card counts it on today's local date, not the following UTC date

Stop the dev server when done.

- [ ] **Step 5: Final commit (if any tweaks needed during smoke)**

```bash
git add -A
git commit -m "fix(home): post-smoke layout polish"
```

(Skip if smoke surfaced no issues.)

---

## Self-Review

**Spec coverage**

| # | Feature                          | Task(s)        |
|---|----------------------------------|----------------|
| 1 | Program progress bar             | 7, 9           |
| 2 | Next session line                | 1, 9           |
| 3 | Streak                           | 2, 11          |
| 4 | Today's exercise preview         | 8, 9           |
| 7 | Last workout summary             | 4, 11          |
| 8 | Weekly tonnage + delta           | 3, 10          |
| 9 | Latest body weight + 30d trend   | 6, 12          |
| 10| Top-3 PRs                        | 5, 13          |

**Placeholder scan:** every step contains exact file paths and full code blocks. No "TBD" / "appropriate" / "similar to" patterns remain.

**Type consistency:** new types (`NextSession`, `WeekTonnage`, `LastWorkoutSummary`, `Pr`, `WeightTrend`) are all declared in `src/lib/program.ts` and consumed by `Dashboard.tsx`. `epley` already exists. `MetricCard` API matches the props used (`label`, `value`, `unit`, `delta`, `history`). `Sparkline` import is removed in Task 13 if unused. `getNextSession` returns `NextSession | null`; tests in Task 1 narrow with `not.toBeNull()` before accessing fields so `npm run build` (which runs `tsc`) does not fail under `strictNullChecks`.

**Route correctness:** Body weight card links to `/corpo` (Task 12) and PR rows link to `/exercise/:exerciseId` with a `/progress` header link (Task 13) — both routes registered in `src/App.tsx:71-75`. No links target the non-existent `/history` route.

**Locale correctness:** `getStreak` and any UI surface that buckets ISO timestamps by day uses `dayjs(...).format('YYYY-MM-DD')` rather than `.slice(0, 10)`, so late-night workouts in negative-UTC-offset timezones (e.g. São Paulo) are not double-counted.

**Body metrics freshness:** Task 12 wires a `useEffect` in `Dashboard.tsx` that calls `loadForUser(activeUserId)` whenever the body-metrics-store's `activeUserId` differs from the workout-store's `activeUserId`. This prevents the home card from rendering stale data when the user switches profiles before opening `/corpo`.
