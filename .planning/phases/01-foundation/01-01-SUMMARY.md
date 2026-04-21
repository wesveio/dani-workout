---
phase: 01-foundation
plan: "01"
subsystem: data-layer
tags: [dexie, indexeddb, types, migration, tdd, profiles]
dependency_graph:
  requires: []
  provides: [profiles-table, templates-table, body-metrics-table, broadened-user-id, v4-schema]
  affects: [all-subsequent-plans]
tech_stack:
  added: [fake-indexeddb]
  patterns: [dexie-on-populate-seeding, per-test-fdb-factory-isolation]
key_files:
  created: [src/db/client.test.ts]
  modified: [src/types.ts, src/db/client.ts]
decisions:
  - "Use on('populate') alongside upgrade() for profile seeding — upgrade() does not fire on fresh DB creation"
  - "Export WorkoutDB class to enable test instantiation with injected FDBFactory for isolation"
  - "Per-test FDBFactory instances instead of global fake-indexeddb/auto to prevent shared state"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-21"
  tasks_completed: 2
  files_changed: 4
---

# Phase 1 Plan 01: DB Foundation (v4 Schema + Types) Summary

**One-liner:** Dexie v4 schema with profiles/templates/bodyMetrics tables, seeded via on('populate') + upgrade(), backed by broadened UserId=string type.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Types + DB migration tests | e53db41 | src/types.ts, src/db/client.test.ts, package.json |
| 2 (GREEN) | Implement v4 schema migration | f16b01a | src/db/client.ts, src/db/client.test.ts |

## What Was Built

- `src/types.ts`: `UserId` broadened from `'dani' | 'wesley'` to `string`. Added `Profile`, `WorkoutTemplate`, `BodyMetric` types. Extended `ExportBundle` with `formatVersion: number` and optional `profiles`, `templates`, `bodyMetrics` arrays.
- `src/db/client.ts`: v4 migration block with all 6 tables (workouts, exerciseLogs, settings, profiles, templates, bodyMetrics). Profile seeding via both `upgrade()` (for existing users) and `on('populate')` (for fresh installs). `WorkoutDB` exported and accepts optional constructor options for test injection.
- `src/db/client.test.ts`: 6 tests covering verno=4, all tables present, dani/wesley profile seeding, workouts/exerciseLogs data survival across migration.
- `fake-indexeddb` added as dev dependency for test isolation.

## TDD Gate Compliance

- RED gate: commit `e53db41` — `test(01-01): add failing tests for v4 schema migration`
- GREEN gate: commit `f16b01a` — `feat(01-01): implement v4 schema with profiles, templates, bodyMetrics tables`
- REFACTOR: not needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Dexie upgrade() does not fire on brand new database**
- **Found during:** Task 2 (GREEN phase debugging)
- **Issue:** The plan specified profile seeding exclusively in `upgrade()`, but Dexie only runs `upgrade()` handlers when upgrading FROM a prior version. On a fresh install (no existing DB), Dexie skips all `upgrade()` calls and goes directly to the latest schema. Profiles were undefined for all new users.
- **Fix:** Added `this.on('populate', ...)` hook which fires on initial DB creation, seeding both profiles. Kept `upgrade()` intact for existing users migrating from v3.
- **Files modified:** src/db/client.ts
- **Commit:** f16b01a

**2. [Rule 1 - Bug] Test isolation failure with module-level singleton**
- **Found during:** Task 1/2 test iteration
- **Issue:** `export const db = new WorkoutDB()` is a module-level singleton. `fake-indexeddb/auto` patches `globalThis.indexedDB` after the module initializes, so Dexie captured the wrong (undefined) IDB reference. Multiple approaches (vi.resetModules, beforeEach delete) failed due to shared factory state.
- **Fix:** Exported `WorkoutDB` class and added optional constructor parameter `options?: ConstructorParameters<typeof Dexie>[1]`. Tests pass a fresh `new FDBFactory()` per test case, giving full isolation without affecting the production singleton.
- **Files modified:** src/db/client.ts, src/db/client.test.ts
- **Commit:** f16b01a

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes. All data is local IndexedDB only.

## Self-Check

- [x] `src/types.ts` exists and contains `export type UserId = string`
- [x] `src/db/client.ts` exists and contains `this.version(4)`
- [x] `src/db/client.test.ts` exists and contains `describe('WorkoutDB v4 migration'`
- [x] Commit e53db41 exists (RED gate)
- [x] Commit f16b01a exists (GREEN gate)
- [x] All 6 tests pass: `npx vitest run src/db/client.test.ts` exits 0
