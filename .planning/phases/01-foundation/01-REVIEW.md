---
phase: 01-foundation
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/types.ts
  - src/db/client.ts
  - src/db/client.test.ts
  - src/store/workoutStore.ts
  - src/store/workoutStore.test.ts
  - package.json
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the foundation layer: type definitions, IndexedDB client (Dexie), Zustand store, schemas, and tests. The architecture is sound — migration versioning is correct, schemas validate all input on import, and the DB transaction usage is appropriate. No critical security issues were found.

Four warnings relate to correctness risks: a data-loss window in `importData`, a flawed mock pattern in the store test, a `reset` action that silently omits `db.settings` from its transaction scope, and an unchecked type cast on settings reads. Three info items flag minor code-quality concerns.

---

## Warnings

### WR-01: `importData` deletes existing data before confirming `bulkAdd` can succeed

**File:** `src/store/workoutStore.ts:281-284`

**Issue:** Inside the transaction, existing records are deleted first (`where('userId').equals(...).delete()`), then `bulkAdd` is called. If the import bundle contains duplicate IDs (two workouts with the same `id`), `bulkAdd` will throw and the transaction will roll back — but the error surfaces as an unhandled rejection at the call site because `importData` does not catch it. More importantly, if the caller catches the error and retries, there is no second chance because the delete already succeeded in the first attempt **only** if the transaction committed. That part is actually safe due to the transaction wrapping everything.

However, using `bulkAdd` (which rejects on duplicate keys) instead of `bulkPut` means a valid-looking bundle with any repeated `id` silently rolls back without informing the user what went wrong. The error message from `importData` will be a raw Dexie constraint error, not the user-friendly `'Invalid data format'` message.

**Fix:** Either use `bulkPut` instead of `bulkAdd` (which is idempotent) to match the existing upsert semantics used for profiles/templates/bodyMetrics, or catch the Dexie error inside `importData` and rethrow with a descriptive message:

```typescript
// Option A — use bulkPut for consistency with the rest of the block
await db.workouts.bulkPut(workouts)
await db.exerciseLogs.bulkPut(exerciseLogs)

// Option B — if bulkAdd is intentional, wrap and rethrow
} catch (err) {
  if (err instanceof Dexie.BulkError) {
    throw new Error(`Import failed: duplicate IDs in bundle (${err.failures.length} conflicts)`)
  }
  throw err
}
```

---

### WR-02: `reset` does not clear `db.settings` for the user, causing stale settings on re-import

**File:** `src/store/workoutStore.ts:304-311`

**Issue:** `reset` deletes workouts and exerciseLogs for the active user, but leaves `user:{userId}` in `db.settings` untouched. After a reset, if the user imports a new bundle via `importData`, the import correctly overwrites settings — but if they never import and just start logging fresh, `loadUserData` will find and reuse the stale `user:{userId}` settings record (line 156-160 only writes defaults if `!settingsRecord`). This means `programStart` and `recoveryExcellent` from before the reset persist silently.

**Fix:** Include `db.settings` in the transaction and delete or reset the user settings key:

```typescript
reset: async () => {
  const activeUserId = get().activeUserId
  await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, async () => {
    await db.workouts.where('userId').equals(activeUserId).delete()
    await db.exerciseLogs.where('userId').equals(activeUserId).delete()
    await db.settings.delete(`user:${activeUserId}`)
  })
  set({ workouts: [], exerciseLogs: [], settings: defaultSettings })
},
```

---

### WR-03: Unsafe `as SettingsState` cast can silently produce wrong state if the stored record is malformed

**File:** `src/store/workoutStore.ts:158, 257`

**Issue:** Both `loadUserData` and `exportData` cast the raw settings value with `as SettingsState | undefined` without validating the shape. If IndexedDB contains a corrupted or legacy record (e.g., missing `programStart`), the cast succeeds at the type level but the missing fields will be `undefined` at runtime, causing downstream consumers of `settings.programStart` to silently receive `undefined` rather than a date string.

**Fix:** Validate with `settingsSchema` before casting:

```typescript
const rawValue = settingsRecord?.value
const parsed = settingsSchema.safeParse(rawValue)
const settings = parsed.success ? parsed.data : defaultSettings
```

---

### WR-04: `exportData` test mock is unreliable — `vi.resetModules()` after `vi.doMock()` does not guarantee the store re-imports the mocked module

**File:** `src/store/workoutStore.test.ts:69-85`

**Issue:** The test calls `vi.doMock('@/db/client', ...)` then `vi.resetModules()` then dynamic `import('./workoutStore')`. The problem is `vi.resetModules()` clears the module registry, but `workoutStore.ts` references `db` as a module-level singleton (line 4 of `workoutStore.ts`: `import { db } from '@/db/client'`). After `resetModules`, the dynamic import of `workoutStore` will re-execute the module, but whether it picks up the `doMock` registration depends on Vitest's internal sequencing, which is not guaranteed when `doMock` is called after the test file's top-level imports have already resolved.

In practice, this test is likely calling `exportData` against the real (non-fake) `db` singleton rather than `fakeDb`. If run in a browser-like environment without IndexedDB, it may pass vacuously (returning empty arrays) or fail non-deterministically.

**Fix:** Move the mock setup to `vi.mock` at module scope, or restructure `exportData` to accept a db parameter for testing, or test `exportData` directly through the DB layer (already tested in `client.test.ts`). The simplest fix:

```typescript
// At the top of workoutStore.test.ts, before imports
vi.mock('@/db/client', async () => {
  const { IDBFactory, IDBKeyRange } = await import('fake-indexeddb')
  const { WorkoutDB } = await import('@/db/client')
  const fakeDb = new WorkoutDB({ indexedDB: new IDBFactory(), IDBKeyRange })
  await fakeDb.open()
  return { WorkoutDB, db: fakeDb }
})
```

---

## Info

### IN-01: `templateSchema` in `workoutStore.ts` is missing the `rir` field present in `SetEntry`

**File:** `src/store/workoutStore.ts:80-87`

**Issue:** `templateSchema`'s `defaultSets` array validates `weight`, `reps`, and `completed` but omits `rir`, which is required in the `SetEntry` type (line 6 of `types.ts`). On import, bundles with `rir` in template sets will pass validation but `rir` will not be validated; bundles missing `rir` will silently succeed and store incomplete set data.

**Fix:**
```typescript
defaultSets: z.array(z.object({
  weight: z.number(),
  reps: z.number(),
  rir: z.number().min(0).max(5),  // add this
  completed: z.boolean(),
})),
```

---

### IN-02: Hardcoded profile seed data is duplicated between `version(4).upgrade` and `on('populate')`

**File:** `src/db/client.ts:67-79`

**Issue:** The two profile seed arrays (lines 67-70 and 75-78) are identical. If a new profile is ever added, both places must be updated or they will diverge.

**Fix:** Extract to a constant:

```typescript
const SEED_PROFILES = [
  { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', avatarColor: '#e11d48' },
  { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', avatarColor: '#2563eb' },
]
// then reference SEED_PROFILES in both places
```

---

### IN-03: `makeId` fallback uses `Math.random()` which is not cryptographically random

**File:** `src/store/workoutStore.ts:133-135`

**Issue:** The `crypto.randomUUID()` branch is preferred, but the fallback `Math.random().toString(36).slice(2)` produces only ~52 bits of entropy and is not collision-resistant under load. In a single-user offline app this is acceptable, but the fallback path is reachable in older environments.

**Fix:** For a local-only app this is low risk. If collision resistance matters, require `crypto.randomUUID()` and throw if unavailable, rather than silently falling back:

```typescript
const makeId = () => crypto.randomUUID()
// crypto.randomUUID is available in all modern browsers and Node 14.17+
```

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
