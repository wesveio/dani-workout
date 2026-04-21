---
phase: 04-exercise-history-logging-ux
plan: "03"
subsystem: exercise-history
tags: [recharts, exercise-history, metric-tabs, epley, dark-theme]
dependency_graph:
  requires: [04-01]
  provides: [ExerciseProgressChart, upgraded-ExerciseHistory]
  affects: [src/routes/ExerciseHistory.tsx, src/components/ExerciseProgressChart.tsx]
tech_stack:
  added: []
  patterns: [recharts-component-extraction, metric-tab-switching, epley-1rm-display]
key_files:
  created:
    - src/components/ExerciseProgressChart.tsx
    - src/components/ExerciseProgressChart.test.tsx
    - src/routes/ExerciseHistory.test.tsx
  modified:
    - src/routes/ExerciseHistory.tsx
decisions:
  - ExerciseProgressChart renders single active Area conditionally (not three hidden Areas) for clarity
  - PR summary row placed above chart card for visual prominence
  - Tests use container.firstChild check for recharts since jsdom doesn't render SVG
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-21T21:59:25Z"
  tasks_completed: 2
  files_changed: 4
---

# Phase 04 Plan 03: Exercise History Chart Upgrade Summary

**One-liner:** Extracted recharts AreaChart into ExerciseProgressChart with Volume/Carga/1RM Est. tab switching using dark theme colors and Epley formula.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ExerciseProgressChart component with metric switching | 8b5f1c8 | ExerciseProgressChart.tsx, ExerciseProgressChart.test.tsx |
| 2 | Upgrade ExerciseHistory with tabs, 1RM, and PR summary row | 48a4330 | ExerciseHistory.tsx, ExerciseHistory.test.tsx |

## What Was Built

**ExerciseProgressChart (new component):**
- Accepts `chartData: ChartDatum[]` and `metric: 'volume' | 'topWeight' | 'e1rm'` props
- Conditionally renders one active Area series based on metric prop
- Volume: stroke `#FF8C00`, gradient fill; TopWeight/E1rm: stroke `#FF3D3D`, gradient fill
- Dark theme tooltip: background `#1A1A1A`, border `#2A2A2A`
- Exports `ChartDatum` type with `date`, `volume`, `topWeight`, `e1rm` fields

**ExerciseHistory (upgraded):**
- Metric tab bar with shadcn Tabs: Volume / Carga / 1RM Est.
- ChartData extended with `topWeight` and `e1rm` (Epley formula per set, max across sets)
- PR summary row above chart: bestWeight, bestVolume, best1RM with Trophy/TrendingUp icons
- Old light-mode colors removed: `#18D02E` (green stroke), `#F2F1EF` (light tooltip background)
- Empty state: "Ainda sem registros." when no logs

## Deviations from Plan

None — plan executed exactly as written.

## Tests

13 tests pass across 3 files:
- `ExerciseProgressChart.test.tsx`: 4 tests (render without crash for each metric + empty data)
- `ExerciseHistory.test.tsx`: 5 tests (PR row, tabs, volume label, empty state, exercise name)
- `epley.test.ts`: 4 pre-existing tests (still passing)

## Known Stubs

None. All data is wired from exerciseLogs via Zustand store.

## Threat Flags

None. No new network endpoints or auth paths introduced. All data is local IndexedDB via Zustand, scoped by activeUserId (T-04-06 accepted per plan threat model).

## Self-Check: PASSED

- src/components/ExerciseProgressChart.tsx: FOUND
- src/components/ExerciseProgressChart.test.tsx: FOUND
- src/routes/ExerciseHistory.tsx: FOUND (modified)
- src/routes/ExerciseHistory.test.tsx: FOUND
- commit 8b5f1c8: FOUND
- commit 48a4330: FOUND
