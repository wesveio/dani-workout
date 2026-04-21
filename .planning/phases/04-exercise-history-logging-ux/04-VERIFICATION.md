---
phase: 04-exercise-history-logging-ux
verified: 2026-04-21T19:10:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Inline set logging with ghost values"
    expected: "Each set row shows weight and reps inputs with stepper buttons. 'Ant: {value}' ghost text appears in muted gray below inputs when previous session data exists. Touch targets are comfortable for mobile gym use."
    why_human: "Ghost value visibility and touch target quality require visual inspection on device"
  - test: "Auto-advance focus on set completion"
    expected: "After tapping 'Marcar feito', focus jumps to the next incomplete set's weight input. No focus jump when un-completing a set."
    why_human: "requestAnimationFrame focus behavior cannot be fully verified by automated DOM tests in jsdom; real browser interaction required"
  - test: "PR badge animation on set completion"
    expected: "A 'PR!' badge with Trophy icon appears next to the completed set with a celebration-pop animation when weight exceeds historical best. No badge appears on tie."
    why_human: "CSS animation (celebration-pop) and visual badge rendering require real browser verification"
  - test: "Exercise history metric tabs"
    expected: "Volume tab active by default with orange (#FF8C00) area chart. Carga tab shows red (#FF3D3D) chart. 1RM Est. tab shows red (#FF3D3D) chart. Tooltip has dark background (#1A1A1A) on hover."
    why_human: "Recharts SVG rendering and chart colors require visual confirmation in a real browser"
  - test: "PR summary row values"
    expected: "'Melhor carga:', 'Maior volume:', '1RM Est. max:' all show correct computed values from real exercise log data."
    why_human: "Correctness of computed stats requires end-to-end data flow verification with real workout data"
---

# Phase 4: Exercise History + Logging UX Verification Report

**Phase Goal:** Users can log sets fast and clearly see how they are progressing on each exercise
**Verified:** 2026-04-21T19:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can log weight and reps for a set in a single inline row without extra taps | ✓ VERIFIED | `SetRow.tsx` renders weight + reps inputs with stepper buttons in a single grid row; wired into `SessionDetail.tsx` at line 833 via `setsForTarget.map` |
| 2 | Previous session's weight and reps appear next to each current input field | ✓ VERIFIED | `SetRow.tsx` lines 65-72 and 99-105 render "Ant: {value} kg" and "Ant: {reps}" conditionally from `previousSet` prop; `SessionDetail.tsx` line 838 passes `lastLogsByExercise.get(exercise.id)?.sets[absoluteIndex]` |
| 3 | Cursor advances automatically to the next set after saving | ✓ VERIFIED | `SessionDetail.tsx` lines 357-370 implement `requestAnimationFrame` auto-advance via `document.getElementById('set-input-${ex.id}-${i}')?.focus()` guarded by `field === 'completed' && value === true` |
| 4 | A PR badge appears on the set when a personal record is detected | ✓ VERIFIED | `bestWeightByExercise` useMemo (line 175), `prBySet` state (line 184), `setPrBySet` on completion (lines 349-353), `hasPr={prBySet[exercise.id]?.[absoluteIndex] ?? false}` passed to SetRow; `PrBadge.tsx` renders Trophy + "PR!" with `celebration-pop` animation |
| 5 | User can view full history and a progression chart (weight, volume, estimated 1RM) for any exercise | ✓ VERIFIED | `ExerciseHistory.tsx` renders metric tabs (Volume/Carga/1RM Est.), `ExerciseProgressChart.tsx` renders dark-theme AreaChart with conditional series, PR summary row shows bestWeight/bestVolume/best1RM computed via `epley()` |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/epley.ts` | Epley 1RM formula | ✓ VERIFIED | Exports `epley(weight, reps)`, guards zero inputs, substantive 4-line formula |
| `src/components/SetRow.tsx` | Set row with ghost values | ✓ VERIFIED | 159 lines, exports `SetRow`, weight/reps inputs, ghost values, stepper buttons, PrBadge conditional |
| `src/components/PrBadge.tsx` | PR detection badge | ✓ VERIFIED | Exports `PrBadge`, Trophy icon, "PR!" text, `aria-live="polite"`, `celebration-pop` animation |
| `src/components/ExerciseProgressChart.tsx` | Recharts chart with metric switching | ✓ VERIFIED | 89 lines, exports `ExerciseProgressChart` + `ChartDatum`, dark theme colors, conditional Area rendering |
| `src/routes/ExerciseHistory.tsx` | Upgraded history screen | ✓ VERIFIED | 190 lines, metric tabs, PR summary row, Epley integration, `ExerciseProgressChart` rendered |
| `src/routes/SessionDetail.tsx` | SetRow integration, PR detection, auto-advance | ✓ VERIFIED | Imports `SetRow`, `bestWeightByExercise` useMemo, `prBySet` state, `requestAnimationFrame` auto-advance |
| `src/lib/epley.test.ts` | Epley formula tests | ✓ VERIFIED | 4+ test cases |
| `src/components/PrBadge.test.tsx` | PrBadge tests | ✓ VERIFIED | Exists, tests pass |
| `src/components/SetRow.test.tsx` | SetRow tests | ✓ VERIFIED | 7 test cases including ghost values, PrBadge conditional, input id |
| `src/components/ExerciseProgressChart.test.tsx` | Chart tests | ✓ VERIFIED | 4 tests covering each metric + empty data |
| `src/routes/ExerciseHistory.test.tsx` | History screen tests | ✓ VERIFIED | 5 tests covering tabs, PR row, empty state |
| `src/routes/SessionDetail.test.tsx` | PR + auto-advance tests | ✓ VERIFIED | Tests for PR badge appearance, tie case, auto-advance focus |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `SessionDetail.tsx` | `SetRow.tsx` | `import { SetRow }` + `setsForTarget.map` | ✓ WIRED | Line 3 import; lines 833-845 render with all required props |
| `SessionDetail.tsx` | `bestWeightByExercise` | `useMemo` on `exerciseLogs` | ✓ WIRED | Line 175 computation; line 347 consumed in PR detection |
| `SetRow.tsx` | `PrBadge.tsx` | `hasPr && <PrBadge />` | ✓ WIRED | Line 6 import; line 155 conditional render |
| `ExerciseHistory.tsx` | `ExerciseProgressChart.tsx` | `import` + render with `metric` prop | ✓ WIRED | Line 13 import; line 146 `<ExerciseProgressChart chartData={chartData} metric={metric} />` |
| `ExerciseHistory.tsx` | `epley.ts` | `import { epley }` for chartData computation | ✓ WIRED | Line 8 import; line 44 `epley(set.weight, set.reps)` in chartData useMemo |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ExerciseHistory.tsx` | `logs` | `useWorkoutStore((s) => s.exerciseLogs).filter(exerciseId)` | Yes — filters Zustand store exerciseLogs by exerciseId from URL param | ✓ FLOWING |
| `ExerciseHistory.tsx` | `chartData` | `useMemo` over `logs` with `epley()` | Yes — derived from real logs, no hardcoded fallback | ✓ FLOWING |
| `SessionDetail.tsx` | `previousSet` | `lastLogsByExercise.get(exercise.id)?.sets[absoluteIndex]` | Yes — reads from exerciseLogs via store | ✓ FLOWING |
| `SessionDetail.tsx` | `prBySet` | Set on completed+PR condition from `bestWeightByExercise` | Yes — computed from exerciseLogs useMemo | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 28 phase-4 tests pass | `npx vitest run [all 6 test files]` | 28 passed, 0 failed | ✓ PASS |
| Epley formula correctness | Unit tests in epley.test.ts | 4 cases green | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| LOG-01 | 04-01, 04-02 | Inline set logging (weight + reps in one row) | ✓ SATISFIED | `SetRow.tsx` renders single grid row with both inputs and steppers |
| LOG-02 | 04-01, 04-02 | Previous session weight/reps next to current input | ✓ SATISFIED | Ghost values "Ant: {value}" rendered conditionally from `previousSet` prop |
| LOG-03 | 04-02 | Auto-advance to next set input after completing a set | ✓ SATISFIED | `requestAnimationFrame` + `getElementById` focus logic in `SessionDetail.tsx` |
| LOG-04 | 04-01, 04-02 | PR badge when personal record detected on save | ✓ SATISFIED | `bestWeightByExercise` + `prBySet` + `PrBadge` component, all wired |
| HIST-01 | 04-03 | Full history of past performances per exercise | ✓ SATISFIED | `ExerciseHistory.tsx` renders log list with all set details per session |
| HIST-02 | 04-03 | Progression chart (weight/volume) per exercise | ✓ SATISFIED | `ExerciseProgressChart.tsx` with Volume and Carga (topWeight) metrics |
| HIST-03 | 04-03 | Estimated 1RM (Epley) tracked over time | ✓ SATISFIED | `e1rm` field in ChartDatum computed via `epley()`, rendered as "1RM Est." tab |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

Scanned all 6 source files for TODO/FIXME, placeholder text, empty returns, and hardcoded empty arrays. None found. All state variables are populated by real data-fetching (Zustand store + useMemo derivations).

### Human Verification Required

#### 1. Inline Set Logging With Ghost Values

**Test:** Open an active workout session. Inspect each set row.
**Expected:** Weight and reps inputs appear side-by-side with stepper buttons (-2.5/+2.5/+5 for weight; -1/+1/+2 for reps). For exercises previously logged, "Ant: {value} kg" and "Ant: {reps}" appear below the inputs in muted gray (12px). No ghost values for exercises with no history.
**Why human:** Visual layout, typography, and color cannot be verified programmatically.

#### 2. Auto-Advance Focus on Set Completion

**Test:** Complete set 1 of an exercise by tapping "Marcar feito". Then un-complete it.
**Expected:** After completing, keyboard focus jumps immediately to set 2's weight input. After un-completing, focus does NOT move.
**Why human:** requestAnimationFrame focus behavior in a real browser differs from jsdom; the interaction must be felt on device to confirm it is fast and non-disruptive.

#### 3. PR Badge Animation

**Test:** Log a weight higher than your previous best for any exercise, then tap "Marcar feito".
**Expected:** A red "PR!" badge with a Trophy icon appears next to the completed set with a pop animation. Logging the same weight as the previous best shows no badge.
**Why human:** CSS `celebration-pop` animation requires real browser rendering. Badge visual appearance (color, size, icon) requires inspection.

#### 4. Exercise History Metric Tabs and Chart Colors

**Test:** Navigate to Historico > any exercise with logged data. Switch between Volume, Carga, and 1RM Est. tabs. Hover over the chart.
**Expected:** Volume tab — orange area chart (#FF8C00). Carga tab — red chart (#FF3D3D). 1RM Est. tab — red chart (#FF3D3D). Tooltip background is dark (#1A1A1A). No green (#18D02E) remnants.
**Why human:** Recharts SVG rendering and exact color accuracy require visual inspection in a real browser.

#### 5. PR Summary Row Accuracy

**Test:** Open exercise history for an exercise with multiple logged sessions showing varied weights and volumes.
**Expected:** "Melhor carga:" shows the highest single-set weight ever logged. "Maior volume:" shows the highest total volume in a single session. "1RM Est. max:" shows the highest Epley 1RM across all sets.
**Why human:** Correctness of computed aggregates requires cross-referencing with known historical data.

### Gaps Summary

No automated gaps found. All 5 observable truths are verified, all 7 requirements are satisfied, all artifacts exist and are substantive and wired, all 28 tests pass.

Status is `human_needed` because visual/interactive behavior (animation, chart colors, touch UX, focus behavior in real browser) cannot be confirmed without device testing.

---

_Verified: 2026-04-21T19:10:00Z_
_Verifier: Claude (gsd-verifier)_
