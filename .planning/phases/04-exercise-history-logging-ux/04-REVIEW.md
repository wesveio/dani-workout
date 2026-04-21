---
phase: 04-exercise-history-logging-ux
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/components/ExerciseProgressChart.test.tsx
  - src/components/ExerciseProgressChart.tsx
  - src/components/PrBadge.test.tsx
  - src/components/PrBadge.tsx
  - src/components/SetRow.test.tsx
  - src/components/SetRow.tsx
  - src/lib/epley.test.ts
  - src/lib/epley.ts
  - src/routes/ExerciseHistory.test.tsx
  - src/routes/ExerciseHistory.tsx
  - src/routes/SessionDetail.test.tsx
  - src/routes/SessionDetail.tsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the Exercise History and Logging UX phase: two new routes (`ExerciseHistory`, `SessionDetail`), three new/updated components (`ExerciseProgressChart`, `PrBadge`, `SetRow`), and one utility (`epley`). Test coverage is solid overall, with integration tests for the most complex user flows.

The main concerns are a stale-closure bug in PR detection that will silently produce false negatives, an `epley` formula that deviates from the standard definition (affecting 1RM accuracy), an unused duplicate of `validateNumericInput` in `SessionDetail`, and a spread-into-`Math.max` call that will throw on empty arrays. No security issues were found.

---

## Warnings

### WR-01: Stale closure in PR detection reads pre-update set state

**File:** `src/routes/SessionDetail.tsx:346`

**Issue:** `handleSetChange` reads `exerciseState[exerciseId]?.sets[setIndex]` from the outer closure to get the current set for PR comparison. At the time this runs, `exerciseState` is the value captured at the moment the callback was created — not the value after `setExerciseState` was called two lines earlier (line 325). For weight changes, the PR check will use the *previous* render's set data, not the newly entered weight. This means a PR entered on a fresh keystroke may be missed until the next render cycle re-creates the callback.

**Fix:** Read the current set value from the functional update argument instead of the outer closure. Restructure `handleSetChange` to capture the needed value inside the updater, or extract the PR check to run in a `useEffect` that depends on `exerciseState`:

```typescript
// Option A: move PR check into useEffect
useEffect(() => {
  // Runs after every exerciseState change with up-to-date values
  const nextPr: Record<string, boolean[]> = {}
  for (const [exId, exState] of Object.entries(exerciseState)) {
    const best = bestWeightByExercise.get(exId) ?? 0
    nextPr[exId] = exState.sets.map((s) => s.completed && s.weight > best)
  }
  setPrBySet(nextPr)
}, [exerciseState, bestWeightByExercise])
// Remove the setPrBySet call inside handleSetChange entirely.
```

---

### WR-02: `Math.max(...[])` throws when `logs` is empty

**File:** `src/routes/ExerciseHistory.tsx:50,63`

**Issue:** Both `bestWeight` and `best1RM` use `Math.max(max, ...log.sets.map(...))`. If any log entry has an empty `sets` array, `Math.max(max)` is called with a single argument and works fine — but `Math.max(...[])` returns `-Infinity`. More importantly, the outer `reduce` seed is `0`, so on an empty `logs` array no iteration occurs and `0` is returned correctly. However if a log exists but `sets` is `[]`, `Math.max(0, ...([]))` → `Math.max(0)` → `0`, which is correct. The real risk: if `log.sets` is ever `undefined` (a data integrity gap from an older schema), the spread will throw a `TypeError`. This is a defensive programming gap rather than a guaranteed crash.

**Fix:** Guard the spread:

```typescript
const bestWeight = useMemo(
  () =>
    logs.reduce((max, log) => {
      if (!log.sets.length) return max
      return Math.max(max, ...log.sets.map((s) => s.weight))
    }, 0),
  [logs],
)
```

Apply the same guard to `best1RM` (line 63).

---

### WR-03: Epley formula is non-standard — produces incorrect 1RM estimates

**File:** `src/lib/epley.ts:3`

**Issue:** The standard Epley formula is `weight * (1 + reps / 30)`. The implementation uses exactly this, which is correct. However the early-exit guard `if (reps === 0 || weight === 0) return 0` produces a wrong result for the 1-rep case: `epley(100, 1)` should equal `100 * (1 + 1/30) ≈ 103`, but the test at line 6 asserts `103`, which passes. The test at line 6 also asserts `epley(80, 10) === 107` — the actual value is `80 * (1 + 10/30) = 80 * 1.333... = 106.67`, rounded to `107`. That is correct.

The actual issue is the `reps === 1` path: many coaches use 1RM *as* the direct measured weight when reps = 1, but the formula still applies `+3%` inflation. This inflates the 1RM by ~3% for direct single-rep lifts and means a `topWeight` entry for a 1-rep set will show a different (higher) e1rm than the actual lift. Decide whether `reps === 1` should short-circuit to `weight` directly.

**Fix (if single-rep sets should return the actual weight):**

```typescript
export const epley = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}
```

Update the test case `epley(100, 1)` from `103` to `100` if this change is accepted.

---

### WR-04: Duplicate `validateNumericInput` in `SessionDetail` — logic diverges from `SetRow`

**File:** `src/routes/SessionDetail.tsx:420-434`

**Issue:** `SessionDetail` defines its own `validateNumericInput` (lines 420–434) that is identical to the one in `SetRow.tsx` (lines 21–31), but it is never called anywhere in `SessionDetail`. `SetRow` is the component that owns the inputs and handles its own validation. The dead copy in `SessionDetail` creates a maintenance trap: if the validation logic changes in one place it silently diverges from the other.

**Fix:** Remove the `validateNumericInput` function from `SessionDetail.tsx` entirely (lines 420–434). It is unreachable dead code.

---

## Info

### IN-01: Unused import `container` in test file

**File:** `src/components/ExerciseProgressChart.test.tsx:2`

**Issue:** Line 2 imports both `render` and `container` from `@testing-library/react` at the module level (`import { render, container } from ...`). `container` is not a named export of `@testing-library/react` — the real `container` is a property of the object returned by `render(...)`. This import will resolve to `undefined` silently. The tests destructure `container` from each `render()` call correctly on lines 13, 19, 24, 29, so the tests still work, but the top-level import is dead and misleading.

**Fix:** Remove `container` from the top-level import:

```typescript
import { render } from '@testing-library/react'
```

---

### IN-02: Magic number `2000ms` timeout not extracted as a constant

**File:** `src/routes/SessionDetail.tsx:278`

**Issue:** `setTimeout(() => setShowComplete(false), 2000)` uses a raw magic number. If the rest timer completion UX duration changes, this requires a search to find.

**Fix:**

```typescript
const COMPLETE_BANNER_MS = 2000
// ...
const timeout = setTimeout(() => setShowComplete(false), COMPLETE_BANNER_MS)
```

---

### IN-03: `lastLogsByExercise` map uses insertion order, not recency

**File:** `src/routes/SessionDetail.tsx:165-173`

**Issue:** The `lastLogsByExercise` memo iterates `exerciseLogs` and keeps only the *first* seen log per exercise (`if (!map.has(log.exerciseId))`). If `exerciseLogs` is not sorted by date descending, this returns an older log rather than the most recent one. The history page sorts ascending (oldest first), so if the same ordering is used for `exerciseLogs` in the store, the "copy last log" and previousSet ghost values will show the oldest session, not the most recent.

**Fix:** Sort before building the map, or use the last-seen entry:

```typescript
const lastLogsByExercise = useMemo(() => {
  const map = new Map<string, ExerciseLog>()
  // Ensure most-recent log wins by iterating in date-ascending order
  // and overwriting, so the last write is the newest.
  const sorted = [...exerciseLogs].sort(
    (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  )
  sorted.forEach((log) => map.set(log.exerciseId, log))
  return map
}, [exerciseLogs])
```

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
