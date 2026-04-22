---
phase: 06-body-metrics-pwa-safety
plan: "01"
subsystem: data-layer
tags: [dexie, zustand, tdd, body-metrics, progress-photos, ios-pwa]
dependency_graph:
  requires: []
  provides: [body-metrics-data-layer, progress-photos-schema, ios-install-detection]
  affects: [06-02, 06-03, 06-04]
tech_stack:
  added: []
  patterns: [zustand-store-with-dexie, fake-indexeddb-testing, canvas-image-compression]
key_files:
  created:
    - src/lib/imageCompression.ts
    - src/lib/imageCompression.test.ts
    - src/lib/iosInstall.ts
    - src/lib/iosInstall.test.ts
    - src/store/bodyMetricsStore.ts
    - src/store/bodyMetricsStore.test.ts
  modified:
    - src/types.ts
    - src/db/client.ts
    - src/db/client.test.ts
decisions:
  - "Dexie v5 adds progressPhotos table with no upgrade() needed — new table, no data migration required"
  - "compressImage hard-rejects blobs >1MB post-compression as security/size cap (T-06-02)"
  - "QuotaExceededError caught in addPhoto with user-facing Portuguese error (T-06-03)"
  - "bodyMetricsStore queries use [userId+date] compound index reversed for newest-first sort without client-side sort"
metrics:
  duration_seconds: 232
  completed_date: "2026-04-22"
  tasks_completed: 2
  files_created: 6
  files_modified: 3
---

# Phase 06 Plan 01: Data Layer — Body Metrics, Progress Photos, iOS Detection Summary

**One-liner:** Dexie v5 schema with progressPhotos table, Zustand store with full CRUD + QuotaExceededError handling, canvas image compression with 1MB cap, and iOS Safari/standalone detection — all TDD with 23 passing tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Types + Dexie v5 schema + utility modules with tests | 1d551b8 | src/types.ts, src/db/client.ts, src/db/client.test.ts, src/lib/imageCompression.ts, src/lib/imageCompression.test.ts, src/lib/iosInstall.ts, src/lib/iosInstall.test.ts |
| 2 | bodyMetricsStore with CRUD actions and tests | 3c40fb2 | src/store/bodyMetricsStore.ts, src/store/bodyMetricsStore.test.ts |

## Test Results

```
Test Files  3 passed (3)
Tests       23 passed (23)
```

- 13 tests: imageCompression + iosInstall utilities
- 10 tests: bodyMetricsStore CRUD, error state, sort order, unique ID generation
- 6 tests: Dexie client migration (updated for v5)

## Decisions Made

- Dexie v5 adds `progressPhotos` table with no `upgrade()` — new table, no data migration
- `compressImage` hard-rejects blobs >1MB post-compression (threat T-06-02 mitigation)
- `QuotaExceededError` caught in `addPhoto` with distinct user-facing message (threat T-06-03 mitigation)
- Store queries use `[userId+date]` compound index with `.reverse()` for newest-first — no client-side sort needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated client.test.ts version assertion from 4 to 5**
- **Found during:** Task 1 verification
- **Issue:** Existing `src/db/client.test.ts` asserted `db.verno === 4`; adding v5 schema broke it
- **Fix:** Updated describe block name and version assertion to 5; added `progressPhotos` to table list
- **Files modified:** src/db/client.test.ts
- **Commit:** 1d551b8

**2. [Rule 1 - Bug] Fixed FileReader mock in imageCompression test**
- **Found during:** Task 1 GREEN phase
- **Issue:** `vi.fn(() => mockObject)` cannot be used as a constructor; `new FileReader()` threw "not a constructor"
- **Fix:** Changed mock to a proper `class MockFileReader` with `readAsDataURL` method
- **Files modified:** src/lib/imageCompression.test.ts
- **Commit:** 1d551b8

**3. [Rule 1 - Bug] Fixed useBodyMetricsStore reference in tests**
- **Found during:** Task 2 GREEN phase
- **Issue:** Tests called top-level `useBodyMetricsStore.getState()` but `vi.resetModules()` invalidated that reference; needed fresh import from `makeStore()`
- **Fix:** `makeStore()` now returns `useBodyMetricsStore` alongside `store` and `fakeDb`; all tests use the returned reference
- **Files modified:** src/store/bodyMetricsStore.test.ts
- **Commit:** 3c40fb2

## Known Stubs

None — all store actions wire directly to Dexie; no placeholder data.

## Threat Flags

No new threat surface beyond what was planned in the threat model. All T-06-01 through T-06-04 mitigations implemented as required.

## TDD Gate Compliance

- RED gate: Tests confirmed failing before implementation (module-not-found errors)
- GREEN gate: All 23 tests passing after implementation
- No REFACTOR gate needed — code was clean from initial write

## Self-Check: PASSED

- src/types.ts contains `export type ProgressPhoto = {` — FOUND
- src/db/client.ts contains `this.version(5).stores({` — FOUND
- src/db/client.ts contains `progressPhotos: '&id, userId, [userId+date], date'` — FOUND
- src/db/client.ts contains `progressPhotos!: Table<ProgressPhoto>` — FOUND
- src/lib/imageCompression.ts contains `export async function compressImage` — FOUND
- src/lib/iosInstall.ts contains `export function isIOSSafari` — FOUND
- src/lib/iosInstall.ts contains `export function shouldShowBanner` — FOUND
- src/lib/iosInstall.ts contains `export function dismissBanner` — FOUND
- src/store/bodyMetricsStore.ts contains `export const useBodyMetricsStore` — FOUND
- src/store/bodyMetricsStore.ts contains `QuotaExceededError` — FOUND
- Commit 1d551b8 — FOUND
- Commit 3c40fb2 — FOUND
