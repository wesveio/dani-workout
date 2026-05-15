# Phase 01: Foundation - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 4 (3 modified, 1 new test file)
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types.ts` | model | transform | `src/types.ts` (self) | self |
| `src/db/client.ts` | migration | CRUD | `src/db/client.ts` (self — v1→v2→v3 pattern) | self |
| `src/store/workoutStore.ts` | store | CRUD + transform | `src/store/workoutStore.ts` (self) | self |
| `src/db/client.test.ts` (new) | test | CRUD | `src/lib/rest.test.ts` | role-match |
| `src/store/workoutStore.test.ts` (new) | test | transform | `src/lib/rest.test.ts` | role-match |

---

## Pattern Assignments

### `src/types.ts` (model, transform)

**Analog:** `src/types.ts` (self — extend in place)

**Current UserId definition** (line 1):
```typescript
export type UserId = 'dani' | 'wesley'
```
**Change to:**
```typescript
export type UserId = string
```

**Current ExportBundle definition** (lines 38–43):
```typescript
export type ExportBundle = {
  userId: UserId
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
}
```
**Extend to (add formatVersion + optional new table arrays):**
```typescript
export type ExportBundle = {
  formatVersion: number
  userId: UserId
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
  profiles?: Profile[]
  templates?: WorkoutTemplate[]
  bodyMetrics?: BodyMetric[]
}
```

**New types to append** (follow existing style — flat object with explicit field types):
```typescript
export type Profile = {
  id: string
  name: string
  shortName: string
  avatarInitial: string
  avatarColor: string   // hex color string, e.g. '#e11d48'
}

export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: Array<{ exerciseId: string; defaultSets: SetEntry[] }>
  createdAt: string
}

export type BodyMetric = {
  id: string
  userId: string
  date: string
  weight?: number    // kg
  waist?: number     // cm
  hips?: number
  chest?: number
  arms?: number
  notes?: string
}
```

---

### `src/db/client.ts` (migration, CRUD)

**Analog:** `src/db/client.ts` self — copy v2→v3 structure for v4 block.

**Import pattern** (lines 1–2):
```typescript
import Dexie, { type Table } from 'dexie'
import type { ExerciseLog, SettingsState, UserId, WorkoutLog } from '@/types'
```
**Extend import** to also bring in `Profile`, `WorkoutTemplate`, `BodyMetric` from `@/types`.

**Table declaration pattern** — add three new `Table` fields after existing ones (lines 11–13):
```typescript
class WorkoutDB extends Dexie {
  workouts!: Table<WorkoutLog>
  exerciseLogs!: Table<ExerciseLog>
  settings!: Table<SettingsRecord>
  // add:
  profiles!: Table<Profile>
  templates!: Table<WorkoutTemplate>
  bodyMetrics!: Table<BodyMetric>
```

**v3 migration block pattern** (lines 46–51) — copy and increment for v4:
```typescript
this.version(3).stores({
  workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
  exerciseLogs:
    'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
  settings: '&key',
})
```
**v4 block MUST copy all v3 index strings then add new tables + upgrade:**
```typescript
this.version(4)
  .stores({
    workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
    exerciseLogs:
      'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
    settings: '&key',
    profiles: '&id, name',
    templates: '&id, userId, [userId+name]',
    bodyMetrics: '&id, userId, [userId+date], date',
  })
  .upgrade(async (tx) => {
    await tx.table('profiles').bulkPut([
      { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', avatarColor: '#e11d48' },
      { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', avatarColor: '#2563eb' },
    ])
  })
```

**Idempotency pattern** — `bulkPut` (upsert) is already used in v2 upgrade (line 43): `await settingsTable.put(...)`. Use `bulkPut` (not `bulkAdd`) for profile seeding so re-runs don't throw.

---

### `src/store/workoutStore.ts` (store, CRUD + transform)

**Analog:** `src/store/workoutStore.ts` self — targeted changes to Zod schemas and export/import functions.

**Current userIdSchema** (line 32):
```typescript
const userIdSchema = z.union([z.literal('dani'), z.literal('wesley')])
```
**Change to:**
```typescript
const userIdSchema = z.string().min(1)
```

**importSchema pattern** (lines 67–72) — extend with formatVersion + optional new arrays:
```typescript
const importSchema = z.object({
  userId: userIdSchema.optional(),
  workouts: z.array(workoutSchema),
  exerciseLogs: z.array(exerciseLogSchema),
  settings: settingsSchema.optional(),
})
```
**Extend to:**
```typescript
const importSchema = z.object({
  formatVersion: z.number().optional().default(1),
  userId: userIdSchema.optional(),
  workouts: z.array(workoutSchema),
  exerciseLogs: z.array(exerciseLogSchema),
  settings: settingsSchema.optional(),
  profiles: z.array(profileSchema).optional(),
  templates: z.array(templateSchema).optional(),
  bodyMetrics: z.array(bodyMetricSchema).optional(),
})
```

**exportData function pattern** (lines 203–216) — add `formatVersion: 2` to returned object:
```typescript
exportData: async () => {
  const activeUserId = get().activeUserId
  const [workouts, exerciseLogs, settingsRecord] = await Promise.all([
    getUserWorkouts(activeUserId),
    getUserExerciseLogs(activeUserId),
    db.settings.get(`user:${activeUserId}`),
  ])
  return {
    userId: activeUserId,
    workouts,
    exerciseLogs,
    settings: (settingsRecord?.value as SettingsState | undefined) ?? get().settings,
  }
},
```
**Add `formatVersion: 2` to the returned object.**

**Error handling pattern** (lines 145–155) — all async store actions use `try/catch`, set `error` string on catch, `loading: false` on both paths:
```typescript
try {
  // ... async work
  set({ ...data, loading: false, error: null })
} catch (err) {
  console.error(err)
  set({ loading: false, error: 'Falha ao ...' })
}
```

---

### `src/db/client.test.ts` (new test, CRUD)

**Analog:** `src/lib/rest.test.ts` — only existing test file; copy `describe/it/expect` structure.

**Test file structure pattern** (lines 1–28 of `src/lib/rest.test.ts`):
```typescript
import { describe, expect, it } from 'vitest'
import { functionUnderTest } from './module'

describe('groupName', () => {
  it('describes behavior in plain language', () => {
    expect(result).toBe(expected)
  })
})
```

**Dexie test setup** — no existing pattern. Use `fake-indexeddb` (verify in devDependencies first):
```typescript
import { describe, expect, it, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'  // must import before Dexie instantiation
import { db } from './client'

describe('WorkoutDB v4 migration', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('opens at version 4', async () => {
    expect(db.verno).toBe(4)
  })

  it('has all expected tables', () => {
    const tables = db.tables.map(t => t.name)
    expect(tables).toContain('profiles')
    expect(tables).toContain('templates')
    expect(tables).toContain('bodyMetrics')
    expect(tables).toContain('workouts')
    expect(tables).toContain('exerciseLogs')
    expect(tables).toContain('settings')
  })
})
```

---

## Shared Patterns

### Compound Index Pattern
**Source:** `src/db/client.ts` lines 47–51
**Apply to:** All new Dexie tables with `userId`
```typescript
'[userId+date]'        // for date-range queries per user
'[userId+name]'        // for name lookups per user
```

### settings key-value pattern
**Source:** `src/store/workoutStore.ts` lines 117–121
**Apply to:** Any per-user settings reads/writes
```typescript
db.settings.get(`user:${userId}`)      // per-user settings key
db.settings.put({ key: 'app', value: { activeUserId } })  // global app state key
```

### makeId utility
**Source:** `src/store/workoutStore.ts` lines 93–96
**Apply to:** Any new record creation
```typescript
const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}
```

### Dexie transaction pattern
**Source:** `src/store/workoutStore.ts` lines 184–188
**Apply to:** Any multi-table write in importData extension
```typescript
await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, async () => {
  // all writes inside transaction
})
```

---

## No Analog Found

None — all files being modified have direct self-analogs (existing files) or a test structure analog (`rest.test.ts`).

---

## Metadata

**Analog search scope:** `src/db/`, `src/store/`, `src/types.ts`, `src/data/users.ts`, `src/lib/`
**Files scanned:** 5 source files, 1 test file
**Pattern extraction date:** 2026-04-21
