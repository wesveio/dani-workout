---
phase: 01-foundation
plan: "02"
subsystem: data-layer
tags: [zod, export-import, format-versioning, tdd, backward-compat]
dependency_graph:
  requires: [01-01]
  provides: [broadened-zod-user-id, export-format-v2, backward-compat-v1-import]
  affects: [all-subsequent-plans]
tech_stack:
  added: []
  patterns: [zod-schema-export-for-testing, tdd-red-green]
key_files:
  created: [src/store/workoutStore.test.ts]
  modified: [src/store/workoutStore.ts]
decisions:
  - "Export userIdSchema and importSchema from workoutStore.ts to enable direct Zod schema testing (Option A)"
  - "Use vi.doMock + vi.resetModules in exportData test to inject fake-indexeddb without ESM singleton issues"
  - "formatVersion defaults to 1 via z.number().optional().default(1) for backward-compat v1 bundles"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-21"
  tasks_completed: 2
  files_changed: 2
---

# Phase 1 Plan 02: Export/Import Format Versioning Summary

**One-liner:** Zod userId broadened to any non-empty string, export bundles now carry formatVersion=2 with profiles/templates/bodyMetrics, and v1 backups auto-upgrade on import.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Export/import tests | 144f403 | src/store/workoutStore.test.ts |
| 2 (GREEN) | Implement Zod broadening + format versioning | d4283e1 | src/store/workoutStore.ts |

## What Was Built

- `src/store/workoutStore.ts`: `userIdSchema` changed from `z.union([z.literal('dani'), z.literal('wesley')])` to `z.string().min(1)`. Added `profileSchema`, `templateSchema`, `bodyMetricSchema` Zod schemas. `importSchema` extended with `formatVersion` (default 1), `profiles`, `templates`, `bodyMetrics` optional arrays. `exportData` now returns `formatVersion: 2` plus per-user profiles/templates/bodyMetrics data. `importData` transaction extended to include `db.profiles`, `db.templates`, `db.bodyMetrics` and conditionally writes arrays when present. `userIdSchema` and `importSchema` exported for direct test access.
- `src/store/workoutStore.test.ts`: 6 tests covering userIdSchema acceptance of arbitrary strings, empty string rejection, v1 bundle import with formatVersion default, v2 bundle import with new arrays, dynamic userId acceptance, and exportData returning formatVersion=2.

## TDD Gate Compliance

- RED gate: commit `144f403` — `test(01-02): add failing tests for export format versioning and Zod broadening`
- GREEN gate: commit `d4283e1` — `feat(01-02): extend export/import with format versioning and Zod broadening`
- REFACTOR: not needed

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes. Zod validation (T-01-04) is in place: all imported JSON is validated before any IndexedDB writes.

## Self-Check

- [x] `src/store/workoutStore.ts` exists and contains `export const userIdSchema = z.string().min(1)`
- [x] `src/store/workoutStore.ts` contains `formatVersion: z.number().optional().default(1)` in importSchema
- [x] `src/store/workoutStore.ts` contains `profiles: z.array(profileSchema).optional()` in importSchema
- [x] `src/store/workoutStore.ts` exportData returns `formatVersion: 2`
- [x] `src/store/workoutStore.test.ts` exists with 6 tests
- [x] Commit 144f403 exists (RED gate)
- [x] Commit d4283e1 exists (GREEN gate)
- [x] All 18 tests pass: `npx vitest run` exits 0
