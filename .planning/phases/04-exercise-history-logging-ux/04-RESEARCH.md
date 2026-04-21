# Phase 4: Exercise History + Logging UX - Research

**Researched:** 2026-04-21
**Domain:** React/TypeScript inline set logging, PR detection, exercise history charts
**Confidence:** HIGH

## Summary

Phase 4 adds two complementary UX surfaces to the existing workout app: (1) inline set logging enhancements — previous-session ghost values (LOG-02), auto-advance focus (LOG-03), and PR badge detection (LOG-04); and (2) an upgraded ExerciseHistory screen with metric tab switching and estimated 1RM (HIST-01, HIST-02, HIST-03).

The implementation is almost entirely additive. SessionDetail.tsx already has the set-row rendering loop, `lastLogsByExercise`, and `handleSetChange` with rest-timer integration. ExerciseHistory.tsx already has recharts AreaChart with volume series. Phase 4 extracts the set row into a `SetRow` component, adds ghost-value rendering, wires auto-focus on complete, computes PR against existing `exerciseLogs`, adds a `PrBadge` component, and upgrades ExerciseHistory with a metric tab bar and 1RM series.

All required libraries (recharts, Radix Tabs, lucide-react, Zustand) are already installed. No new dependencies are needed. The UI-SPEC has been pre-approved and specifies exact colors, copy, and component shapes.

**Primary recommendation:** Scope three plans — (1) SetRow extraction + ghost values + auto-advance; (2) PR detection + PrBadge; (3) ExerciseHistory upgrade (metric tabs + 1RM + dark theme chart).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOG-01 | User can log a set with inline entry (weight + reps in one row) | Already implemented in SessionDetail set-row grid; phase extracts to `SetRow` component |
| LOG-02 | User sees previous session's weight/reps next to current input | `lastLogsByExercise` Map already computed in SessionDetail; add ghost `<div>` below each input |
| LOG-03 | User gets auto-advance to next set input after completing a set | Add `useEffect` on `set.completed` transition; target input by `set-input-{exerciseId}-{idx}` ID pattern |
| LOG-04 | User sees PR badge when a personal record is detected on save | Compute `bestWeight` from `exerciseLogs` filtered by `exerciseId`; compare on complete; mount `PrBadge` |
| HIST-01 | User can view full history of past performances for each exercise | ExerciseHistory.tsx already renders log list; add PR summary row and chip styling from UI-SPEC |
| HIST-02 | User can see progression chart (weight/volume over time) per exercise | Recharts AreaChart already present; add MetricTabBar + topWeight series |
| HIST-03 | User can see estimated 1RM (Epley formula) tracked over time | Epley: `weight × (1 + reps/30)`; add e1rm series to chartData and as a third tab |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Previous session ghost values | Frontend (Client) | — | Read from Zustand exerciseLogs already in memory; pure rendering |
| Auto-advance focus | Frontend (Client) | — | DOM focus management via `document.getElementById` |
| PR detection | Frontend (Client) | — | Compare current set.weight against in-memory exerciseLogs |
| SetRow component | Frontend (Client) | — | Extracted UI component from SessionDetail rendering loop |
| PrBadge component | Frontend (Client) | — | Presentational, triggered by PR state |
| ExerciseProgressChart | Frontend (Client) | — | Recharts wrapper with computed chartData |
| Estimated 1RM calculation | Frontend (Client) | — | Pure function — Epley formula, no server needed |
| History log list | Frontend (Client) | Database/Storage | Reads Dexie exerciseLogs via Zustand store |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.6.0 | AreaChart for progression visualization | Already used in ExerciseHistory.tsx |
| @radix-ui/react-tabs | ^1.1.13 | MetricTabBar pill toggle | Already in codebase; shadcn Tabs component present |
| lucide-react | ^0.562.0 | Trophy icon for PrBadge | Already installed |
| zustand | ^5.0.9 | exerciseLogs state source for PR detection | Already the state layer |
| dayjs | ^1.11.19 | Date formatting in chart X-axis | Already used |

[VERIFIED: package.json in project root]

**No npm install required for Phase 4.**

---

## Architecture Patterns

### System Architecture Diagram

```
SessionDetail
  └── exercise card loop
        └── SetRow (NEW — extracted)
              ├── weight Input + steppers
              ├── reps Input + steppers
              ├── ghost value div (LOG-02) ← lastLogsByExercise[exerciseId].sets[idx]
              ├── complete Button
              │     └── on complete → auto-advance focus (LOG-03)
              │                    → PR check → PrBadge (LOG-04)
              └── PrBadge (NEW) ← exerciseLogs bestWeight comparison

ExerciseHistory (UPGRADED)
  ├── PR summary row (HIST-01)
  ├── MetricTabBar (NEW — internal) ← "Volume" | "Carga" | "1RM Est."
  ├── ExerciseProgressChart (NEW — extracted)
  │     └── AreaChart (recharts) ← chartData[metric]
  └── history log list (HIST-01) ← with dark chip styling + PR Trophy icons
```

### Recommended Project Structure

```
src/
├── components/
│   ├── SetRow.tsx          # extracted from SessionDetail set-row JSX block
│   ├── PrBadge.tsx         # PR detection badge with Trophy + animation
│   └── ExerciseProgressChart.tsx  # recharts wrapper with metric prop
├── routes/
│   ├── SessionDetail.tsx   # simplified — delegates to SetRow
│   └── ExerciseHistory.tsx # upgraded — uses ExerciseProgressChart + tabs
```

### Pattern 1: SetRow Extraction

**What:** Extract the inline set-row grid from SessionDetail's `setsForTarget.map(...)` into `SetRow.tsx`. Pass all state and callbacks as props.

**When to use:** The existing inline JSX block (~80 lines) repeats per set. Extraction enables isolated testing and clean prop-typing.

**Key props:**
```typescript
// Source: existing SessionDetail.tsx set-row JSX (lines 791-1008)
type SetRowProps = {
  exerciseId: string
  absoluteIndex: number
  set: SetEntry
  previousSet?: SetEntry          // from lastLogsByExercise
  unitLabel: string
  onSetChange: (field: keyof SetEntry, value: number | boolean) => void
  onAdjust: (field: 'weight' | 'reps' | 'rir', delta: number) => void
  onCopyPrevious?: () => void
  hasPr: boolean
}
```

### Pattern 2: Ghost Values (LOG-02)

**What:** Render a `<div>` immediately below each Input with the previous session value in muted 12px text.

**Implementation:** `lastLogsByExercise.get(exerciseId)?.sets[absoluteIndex]` — already computed in SessionDetail. Pass as `previousSet` prop to `SetRow`.

```tsx
// Source: UI-SPEC §Inline Set Row Design Contract
{previousSet !== undefined && (
  <div
    className="text-[12px] text-muted leading-none mt-1"
    aria-label={`Valor anterior: ${value}`}
  >
    Ant: {value}
  </div>
)}
```

### Pattern 3: Auto-Advance Focus (LOG-03)

**What:** On set complete, focus advances to the weight input of the next incomplete set.

**Implementation:** `useEffect` in SetRow (or in SessionDetail after state update) watching the `set.completed` transition. Input IDs must follow `set-input-{exerciseId}-{absoluteIndex}`.

```tsx
// Source: UI-SPEC §Auto-Advance After Set Complete
useEffect(() => {
  if (!set.completed) return
  // find next incomplete set input across exercises
  const nextInput = document.getElementById(`set-input-${nextExerciseId}-${nextIdx}`)
  nextInput?.focus()
}, [set.completed])
```

**Pitfall:** The "next incomplete set" search must scan across exercise cards in order, not just within the current exercise's sets. Requires access to the full session exercises array and exerciseState — this logic belongs in SessionDetail, not inside SetRow.

### Pattern 4: PR Detection (LOG-04)

**What:** On set complete, compare `set.weight` against `bestWeight` derived from all historical `exerciseLogs` for this `exerciseId`.

**Implementation:** Compute `bestWeight` as a `useMemo` in SessionDetail (or ExerciseHistory) from `exerciseLogs.filter(l => l.exerciseId === exerciseId).flatMap(l => l.sets).reduce(max weight)`. Track per-set PR state in a `Record<string, boolean[]>` local state.

```typescript
// Epley formula (HIST-03) — pure function
const epley = (weight: number, reps: number) => weight * (1 + reps / 30)

// PR check
const isPr = set.weight > bestWeightForExercise
```

**Critical:** PR triggers on `completed: true` transition only. Ties (`===`) do not trigger PR. PR state persists for session duration — does not auto-dismiss.

### Pattern 5: ExerciseProgressChart with 1RM (HIST-02, HIST-03)

**What:** Extend existing `ChartDatum` type with `e1rm` field. Add MetricTabBar (shadcn Tabs) to switch visible series. Update chart colors from hardcoded green to dark theme tokens.

**ChartDatum extension:**
```typescript
// Source: existing ExerciseHistory.tsx lines 15-19 + Epley formula
type ChartDatum = {
  date: string
  volume: number
  topWeight: number
  e1rm: number  // NEW: Epley on best set per session
}
```

**Color update required:** ExerciseHistory.tsx line 121 hardcodes `#18D02E` (light-mode green). Replace with `#FF8C00` (volume) and `#FF3D3D` (topWeight, e1rm) per UI-SPEC §Color §Chart color assignment.

**Tooltip fix required:** ExerciseHistory.tsx line 127 hardcodes `background: '#F2F1EF'` (light mode). Replace with `#1A1A1A` border `#2A2A2A`.

### Anti-Patterns to Avoid

- **Focus management in SetRow:** Auto-advance logic requires scanning all exercises in order. If SetRow manages focus internally with only local set data, it cannot advance cross-exercise. Keep the advance logic in SessionDetail and pass a callback.
- **PR state in Zustand store:** PR detection is session-transient state. It resets when the session ends. Keep it in local `useState` — do not persist to Dexie or Zustand.
- **Recomputing bestWeight per render:** `bestWeight` per exercise should be a `useMemo` with `exerciseLogs` as dependency, not computed inline during `handleSetChange`. With many logs, inline computation on every keypress causes lag.
- **New recharts gradient IDs colliding:** The existing chart uses `id="colorVolume"`. New gradients for topWeight and e1rm need unique IDs (`colorTopWeight`, `colorE1rm`) to avoid SVG gradient collision when multiple charts render on the same page (unlikely but safe habit).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Metric tab switching | Custom toggle with useState | Radix Tabs (already installed as shadcn Tabs) | Keyboard navigation, ARIA roles, focus management built in |
| Chart rendering | Canvas/SVG manually | recharts AreaChart (already installed) | Responsive container, tooltip, axis handling included |
| Focus trap / advance | Custom DOM walker | `document.getElementById` with known ID pattern | Simple and sufficient — no library needed for linear advance |
| 1RM formula | Look up tables | Epley inline: `w * (1 + r/30)` | Single-line formula, universally accepted for weight training |

---

## Common Pitfalls

### Pitfall 1: lastLogsByExercise Only Has the Most Recent Log

**What goes wrong:** `lastLogsByExercise` in SessionDetail is built with `if (!map.has(log.exerciseId)) map.set(...)` — it stores only the **first** log encountered (which is the most recent due to sort order). For ghost values (LOG-02) this is correct. For PR detection (LOG-04), you need the all-time best, not just last session.

**Why it happens:** The PR check needs `Math.max` across ALL logs for the exercise, not just the last one.

**How to avoid:** Compute `bestWeightByExercise` separately from `lastLogsByExercise`:
```typescript
const bestWeightByExercise = useMemo(() => {
  const map = new Map<string, number>()
  exerciseLogs.forEach((log) => {
    const best = log.sets.reduce((max, s) => Math.max(max, s.weight), 0)
    map.set(log.exerciseId, Math.max(map.get(log.exerciseId) ?? 0, best))
  })
  return map
}, [exerciseLogs])
```

### Pitfall 2: Auto-Advance Fires on Uncomplete Toggle

**What goes wrong:** `handleSetChange('completed', !set.completed)` toggles both on and off. If focus advances on every completed-state change, un-completing a set would also trigger focus movement.

**How to avoid:** Auto-advance only when transitioning to `completed: true`, not away from it:
```typescript
if (field === 'completed' && value === true) { /* advance focus */ }
```

### Pitfall 3: Input IDs Not Present During First Render

**What goes wrong:** `document.getElementById('set-input-{id}-{idx}')` returns null if the next exercise card hasn't mounted yet (e.g., if it uses lazy rendering or Collapsible that isn't open).

**How to avoid:** All exercise cards in SessionDetail are always rendered (no lazy mounting currently). Wrap the focus call in a `requestAnimationFrame` or `setTimeout(fn, 0)` as a defensive measure:
```typescript
requestAnimationFrame(() => {
  document.getElementById(`set-input-${nextExId}-${nextIdx}`)?.focus()
})
```

### Pitfall 4: Chart Gradient IDs Are Global in SVG

**What goes wrong:** `<linearGradient id="colorVolume">` is a global SVG ID. If ExerciseHistory renders inside a page that has another recharts chart, IDs collide and wrong gradients apply.

**How to avoid:** Use unique IDs per metric. Since only one ExerciseProgressChart renders per page, this is low risk but worth using `colorVolume`, `colorTopWeight`, `colorE1rm` as distinct IDs.

---

## Code Examples

### Ghost Value Rendering (LOG-02)

```tsx
// Source: UI-SPEC §Inline Set Row Design Contract §Previous Session Ghost Values
const prevWeight = previousSet?.weight
const prevReps = previousSet?.reps

// Below weight Input:
{prevWeight !== undefined && (
  <div className="text-[12px] text-muted leading-none mt-1" aria-label={`Valor anterior: ${prevWeight} kg`}>
    Ant: {prevWeight} kg
  </div>
)}

// Below reps Input:
{prevReps !== undefined && (
  <div className="text-[12px] text-muted leading-none mt-1" aria-label={`Valor anterior: ${prevReps}`}>
    Ant: {prevReps}
  </div>
)}
```

### Epley 1RM Formula (HIST-03)

```typescript
// Source: Epley (1985) — standard formula used in strength training
// weight × (1 + reps / 30)
const epley = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  return Math.round(weight * (1 + reps / 30))
}

// Best 1RM per session: max across all completed sets
const sessionE1rm = (log: ExerciseLog): number =>
  log.sets.reduce((max, set) => Math.max(max, epley(set.weight, set.reps)), 0)
```

### PrBadge Component

```tsx
// Source: UI-SPEC §PR Detection Badge + §Component Inventory
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single volume series in chart | Multi-metric tabs (volume / top weight / 1RM) | Phase 4 | Users can track progression from multiple angles |
| Green hardcoded chart colors (`#18D02E`) | Dark theme tokens (`#FF8C00`, `#FF3D3D`) | Phase 4 | Chart matches dark UI established in Phase 3 |
| Light tooltip background (`#F2F1EF`) | Dark tooltip (`#1A1A1A`) | Phase 4 | Readable on dark-mode screens |
| Inline set-row JSX (~80 lines) in SessionDetail | `SetRow` extracted component | Phase 4 | Testable, reusable, prop-typed |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `lastLogsByExercise` returns sets in same order as current session sets (index-aligned) | Pattern 2, LOG-02 | Ghost values shown at wrong set index — minor UX confusion |
| A2 | Epley formula is the correct 1RM estimator to use (no user preference specified) | Pattern 5, HIST-03 | Different formula (Brzycki, etc.) would yield slightly different values — no functional impact |

---

## Open Questions

1. **Ghost values when set counts differ between sessions**
   - What we know: `lastLog.sets[absoluteIndex]` is undefined if current session has more sets than last session
   - What's unclear: Should ghost show nothing, or show the last set's values for all extra sets?
   - Recommendation: Show nothing (already handled by `previousSet?.weight` optional chaining)

2. **PR detection scope: current user only or all-time across users**
   - What we know: `exerciseLogs` in Zustand is scoped to `activeUserId` (loaded via `getUserExerciseLogs`)
   - What's unclear: Not specified in requirements
   - Recommendation: PR is per-user — current implementation already provides per-user logs

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is purely frontend code changes. No external CLI tools, databases, or services beyond the existing Vite/Vitest/Node stack are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | vite.config.ts (vitest config inline) |
| Quick run command | `npx vitest run src/routes/SessionDetail.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOG-01 | Set row renders weight + reps inputs | unit | `npx vitest run src/routes/SessionDetail.test.tsx` | ✅ (extend existing) |
| LOG-02 | Ghost values appear below inputs when previous log exists | unit | `npx vitest run src/components/SetRow.test.tsx` | ❌ Wave 0 |
| LOG-02 | Ghost values hidden when no previous log | unit | `npx vitest run src/components/SetRow.test.tsx` | ❌ Wave 0 |
| LOG-03 | Focus advances to next set input on complete | unit | `npx vitest run src/routes/SessionDetail.test.tsx` | ❌ Wave 0 (add test) |
| LOG-04 | PrBadge renders when weight exceeds best | unit | `npx vitest run src/components/PrBadge.test.tsx` | ❌ Wave 0 |
| LOG-04 | PrBadge does not render on tie | unit | `npx vitest run src/components/PrBadge.test.tsx` | ❌ Wave 0 |
| HIST-01 | History log list renders session entries with set chips | unit | `npx vitest run src/routes/ExerciseHistory.test.tsx` | ❌ Wave 0 |
| HIST-02 | MetricTabBar switches visible chart series | unit | `npx vitest run src/components/ExerciseProgressChart.test.tsx` | ❌ Wave 0 |
| HIST-03 | Epley formula computes correct 1RM | unit | `npx vitest run src/lib/epley.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/routes/SessionDetail.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/components/SetRow.test.tsx` — covers LOG-02 ghost values (renders with/without previousSet)
- [ ] `src/components/PrBadge.test.tsx` — covers LOG-04 PR badge render condition
- [ ] `src/components/ExerciseProgressChart.test.tsx` — covers HIST-02 tab switching
- [ ] `src/routes/ExerciseHistory.test.tsx` — covers HIST-01 log list rendering
- [ ] `src/lib/epley.test.ts` — covers HIST-03 Epley formula correctness

---

## Sources

### Primary (HIGH confidence)

- Codebase: `src/routes/SessionDetail.tsx` — existing set-row implementation, lastLogsByExercise, handleSetChange
- Codebase: `src/routes/ExerciseHistory.tsx` — existing recharts AreaChart, chartData computation
- Codebase: `src/store/workoutStore.ts` — exerciseLogs scoping, Zustand state shape
- Codebase: `src/db/client.ts` — Dexie schema v4, exerciseLogs indexes
- Codebase: `src/types.ts` — ExerciseLog, SetEntry, WorkoutLog types
- `.planning/phases/04-exercise-history-logging-ux/04-UI-SPEC.md` — approved design contract

### Secondary (MEDIUM confidence)

- Epley (1985) formula `w × (1 + r/30)` — standard in strength training literature [ASSUMED — no primary source checked, but universally cited]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json
- Architecture: HIGH — verified against actual SessionDetail.tsx and ExerciseHistory.tsx source
- Pitfalls: HIGH — derived from direct code reading of existing implementation

**Research date:** 2026-04-21
**Valid until:** 2026-06-01 (stable stack)
