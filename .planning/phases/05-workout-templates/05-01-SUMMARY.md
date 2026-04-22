---
phase: 05-workout-templates
plan: 01
subsystem: data-layer
tags: [catalog, templates, store, dexie, zustand, tdd]
dependency_graph:
  requires: []
  provides:
    - src/data/exerciseCatalog.ts (CatalogExercise, CatalogGroup, exerciseCatalog, catalogByMuscleGroup)
    - src/types.ts (WorkoutTemplate.exercises.restSeconds)
    - src/store/workoutStore.ts (templates state, saveTemplate, deleteTemplate, updateTemplate, duplicateTemplate)
  affects:
    - src/store/workoutStore.ts
    - src/types.ts
tech_stack:
  added: []
  patterns:
    - TDD (RED/GREEN) for catalog shape tests and template CRUD behavioral tests
    - Zustand set/get pattern for optimistic state updates alongside Dexie persistence
    - Static TypeScript catalog file (no runtime parsing)
key_files:
  created:
    - src/data/exerciseCatalog.ts
    - src/data/exerciseCatalog.test.ts
    - src/store/workoutStore.template.test.ts
  modified:
    - src/types.ts
    - src/store/workoutStore.ts
decisions:
  - Wesley exercises with unique movement kept under their own IDs (e.g. back-squat, romanian-deadlift) rather than merged with Dani canonical IDs, because they are genuinely distinct variants in different programs
  - defaultRest values hardcoded from program rest strings at catalog construction time, not parsed at runtime
  - getUserTemplates uses where('userId').equals() since templates table is indexed by userId (not compound index like workouts)
metrics:
  duration: ~8 minutes
  completed: 2026-04-22
  tasks_completed: 2
  files_created: 3
  files_modified: 2
requirements: [TMPL-04, TMPL-01, TMPL-03]
---

# Phase 05 Plan 01: Exercise Catalog + Template Data Layer Summary

Static exercise catalog extracted from both training programs, WorkoutTemplate type extended with restSeconds, and full template CRUD implemented in the Zustand/Dexie store.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create exercise catalog with tests | 9ea9b68 | src/data/exerciseCatalog.ts, src/data/exerciseCatalog.test.ts |
| 2 | Extend WorkoutTemplate type + store CRUD actions | 162d6bd | src/types.ts, src/store/workoutStore.ts, src/store/workoutStore.template.test.ts |

## What Was Built

**Exercise catalog** (`src/data/exerciseCatalog.ts`): 56 exercises extracted from treinoDani.ts (Sessions A, B, C) and treinoWesley.ts (Sessions A, B, C). Deduplicated by canonical ID — Wesley variants with genuinely distinct movement (back-squat, romanian-deadlift, seated-calf-raise) kept as separate entries. Every entry has Portuguese muscleGroup label, hardcoded defaultRest in seconds, and optional imageUrl from the programs' slug mappings. Exports `exerciseCatalog` (flat array) and `catalogByMuscleGroup` (grouped by muscle group).

**WorkoutTemplate type extension** (`src/types.ts`): Added `restSeconds?: number` to the exercises array item, enabling full session clone with per-exercise rest times.

**Template CRUD store actions** (`src/store/workoutStore.ts`):
- `saveTemplate`: validates via templateSchema (zod), writes to Dexie, prepends to state
- `deleteTemplate`: removes from Dexie and state with error handling
- `updateTemplate`: patches existing template in Dexie and state
- `duplicateTemplate`: delegates to saveTemplate with "(copia)" name suffix
- `getUserTemplates`: helper that queries Dexie by userId
- `loadUserData`: extended to load templates alongside workouts/exerciseLogs/settings
- `templates: []` added to initial state and WorkoutStore type

## Test Results

- `src/data/exerciseCatalog.test.ts`: 5/5 passing
- `src/store/workoutStore.template.test.ts`: 4/4 passing
- `src/store/workoutStore.test.ts`: 16/16 passing (no regressions)
- Full suite: 73/73 passing across 13 test files

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None beyond what the plan's threat model covers. T-05-01 mitigation applied: `saveTemplate` validates template data via `templateSchema` (zod) before Dexie put. T-05-02 accepted: catalog is static public data with no PII.

## Self-Check: PASSED

- src/data/exerciseCatalog.ts: FOUND
- src/data/exerciseCatalog.test.ts: FOUND
- src/store/workoutStore.template.test.ts: FOUND
- src/types.ts (restSeconds): FOUND
- src/store/workoutStore.ts (templates, CRUD actions): FOUND
- Commit 9ea9b68: FOUND
- Commit 162d6bd: FOUND
