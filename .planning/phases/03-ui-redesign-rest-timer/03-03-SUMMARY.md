---
phase: 03-ui-redesign-rest-timer
plan: 03
subsystem: ui
tags: [react, typescript, zustand, svg-animation, web-audio-api, rest-timer]

# Dependency graph
requires:
  - phase: 03-ui-redesign-rest-timer
    plan: 02
    provides: useRestTimer hook, playChime utility
  - phase: 01-foundation
    provides: src/lib/rest.ts (formatRestClock)
provides:
  - RestTimerCard component: floating SVG ring countdown card
  - ExerciseRestSheet component: per-exercise rest duration config sheet
  - workoutStore.setExerciseRestSeconds: persists per-exercise rest to Dexie
  - SessionDetail timer wiring: auto-start on set completion
affects:
  - All users of SettingsState type (requires defaultRestSeconds + exerciseRestConfig)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stable Zustand selectors: never use inline ?? {} in selectors — creates new object reference each render, causing infinite loop"
    - "SVG ring animation: strokeDashoffset + visibilitychange transition reset avoids visual jump on app foreground"
    - "Module-level timer state: useRestTimer hook uses module-level _startEpoch/_duration to survive React remounts"

key-files:
  created:
    - src/components/RestTimerCard.tsx
    - src/components/ExerciseRestSheet.tsx
  modified:
    - src/types.ts
    - src/store/workoutStore.ts
    - src/routes/SessionDetail.tsx
    - src/store/workoutStore.test.ts
    - src/routes/SessionDetail.test.tsx

key-decisions:
  - "Stable Zustand selectors: select exerciseRestConfig and defaultRestSeconds without inline fallback ?? objects to avoid infinite render loop in React"
  - "importData settings merge: spread defaultSettings + existingSettings + bundle.settings to satisfy SettingsState required fields from Zod optional schema"
  - "SessionFooter simplified: removed all manual timer controls (Iniciar descanso, preset buttons, Limpar) — timer is now automatic on set completion"

requirements-completed: [REST-01, REST-02, LOG-05]

# Metrics
duration: 15min
completed: 2026-04-21
---

# Phase 3 Plan 03: Rest Timer UI Wiring Summary

**SVG ring countdown floating card with auto-start on set completion, per-exercise rest config sheet, and workoutStore persistence — wires useRestTimer hook from Plan 02 into the session flow**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-04-21
- **Tasks:** 2 (+ 1 deviation fix)
- **Files modified:** 7

## Accomplishments

- RestTimerCard: floating SVG ring with depleting strokeDashoffset animation, orange (normal) / red (<=10s urgent), "Pronto!" complete state
- ExerciseRestSheet: Dialog with 30s/60s/90s presets + custom numeric input, clamped 10-600s
- workoutStore: `setExerciseRestSeconds` action persists per-exercise rest to Dexie; `defaultRestSeconds: 90` global default; Zod schema extended
- SessionDetail: timer auto-starts when set marked completed (field=completed, value=true); showComplete state auto-dismisses "Pronto!" after 2s; gear icon (Settings2) per exercise opens rest config sheet; old setInterval timer removed
- All 38 tests pass, zero TypeScript errors

## Task Commits

1. **Task 1 — Types, store, components** - `65a56af` (feat)
2. **Task 2 — SessionDetail wiring** - `5805494` (feat)
3. **Deviation fix — Type errors** - `cab6c90` (fix)

## Files Created/Modified

- `src/components/RestTimerCard.tsx` — Floating SVG ring countdown card with urgency color and "Pronto!" state
- `src/components/ExerciseRestSheet.tsx` — Per-exercise rest duration dialog with presets + custom input
- `src/types.ts` — SettingsState extended with `defaultRestSeconds: number` and `exerciseRestConfig: Record<string, number>`
- `src/store/workoutStore.ts` — defaultSettings updated, setExerciseRestSeconds added, settingsSchema extended, importData settings merge fixed
- `src/routes/SessionDetail.tsx` — Old setInterval timer replaced with useRestTimer; auto-start on set completion; floating card; gear icon per exercise
- `src/store/workoutStore.test.ts` — Settings fixture updated for new required fields
- `src/routes/SessionDetail.test.tsx` — beforeEach settings updated for new required fields

## Decisions Made

- Stable Zustand selectors: `(s) => s.settings.exerciseRestConfig` without inline `?? {}` — inline object fallbacks in selectors create new references each render and cause infinite re-render loops
- importData now merges `{ ...defaultSettings, ...existingSettings, ...bundleSettings }` to satisfy `SettingsState` required fields when Zod schema returns optional types

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Infinite render loop from unstable Zustand selectors**
- **Found during:** Task 2 — `npm run test:run` showed "Maximum update depth exceeded"
- **Issue:** `useWorkoutStore((s) => s.settings.exerciseRestConfig ?? {})` creates a new `{}` object on every render when `exerciseRestConfig` is undefined, forcing React to re-render infinitely
- **Fix:** Changed selectors to `(s) => s.settings.exerciseRestConfig` and `(s) => s.settings.defaultRestSeconds` (no inline fallback); fallback applied at usage site with stable primitives
- **Files modified:** `src/routes/SessionDetail.tsx`
- **Commit:** `5805494` (included in Task 2 commit)

**2. [Rule 1 - Bug] Type errors from SettingsState required fields in Zod-parsed settings**
- **Found during:** `npm run build` after Task 2
- **Issue:** `importData` assigned Zod-parsed settings (with optional `defaultRestSeconds?: number`) directly to `SettingsState` (requires `number`); test fixtures missing new required fields
- **Fix:** importData now merges with defaultSettings; two test files updated
- **Files modified:** `src/store/workoutStore.ts`, `src/store/workoutStore.test.ts`, `src/routes/SessionDetail.test.tsx`
- **Commit:** `cab6c90`

## Known Stubs

None — all components are fully wired to real store data.

## Threat Flags

None — T-03-05 mitigation (input stripped to digits, clamped 10-600) implemented in ExerciseRestSheet. T-03-06 mitigation (Zod schema validates exerciseRestConfig values 10-600) implemented in workoutStore. T-03-07 accepted as per threat register.

## Self-Check: PASSED

- `src/components/RestTimerCard.tsx` — FOUND
- `src/components/ExerciseRestSheet.tsx` — FOUND
- Commit `65a56af` — FOUND
- Commit `5805494` — FOUND
- Commit `cab6c90` — FOUND
- All 38 tests passing
- TypeScript: zero errors on modified files
