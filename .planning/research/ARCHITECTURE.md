# Architecture: Feature Integration with Existing Dexie/Zustand/React Router Stack

**Project:** Dani Workout — v1.0 Full Redesign
**Researched:** 2026-04-21
**Confidence:** HIGH — based on direct codebase analysis

---

## Current Architecture (Baseline)

### What Exists and Works

| Layer | Technology | Current State |
|-------|-----------|---------------|
| Routing | React Router v7, lazy-loaded routes | 6 routes: `/`, `/week`, `/session/:id/:week?`, `/exercise/:id`, `/progress`, `/settings` |
| State | Zustand `workoutStore` | Single store: workouts, exerciseLogs, settings, activeUserId, loading, error |
| DB | Dexie v3 IndexedDB | `dani-training-db` at version 3 — tables: `workouts`, `exerciseLogs`, `settings` |
| User identity | Hard-coded `UserId = 'dani' | 'wesley'` union type | `users.ts` has static user profiles with hardcoded programs |
| Program data | Static TS objects in `/src/data/` | Program is a compile-time constant per user — not stored in IndexedDB |
| Draft autosave | `useDraftAutosave` hook | Writes to `localStorage` keyed by `session-draft-{userId}-{sessionType}-{week}` |
| Rest timer | `setInterval` in `SessionDetail` component state | Working, uses `lib/rest.ts` parser |
| Exercise history | `lastLogsByExercise` map in `SessionDetail` | Pulls from Zustand `exerciseLogs` array; used only for pre-filling sets |

### Existing Indexes (Dexie v3)

```
workouts:      id, userId, [userId+date], date, weekNumber, sessionType
exerciseLogs:  id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber
settings:      &key  (string key/value bag)
```

The compound indexes `[userId+exerciseId]` and `[userId+exerciseId+date]` are already in place — exercise history queries are well-supported without schema changes.

---

## Feature Integration Analysis

### 1. Multi-User Local Profiles

**Current state:** Users are hardcoded as `'dani' | 'wesley'` in `types.ts`. `users.ts` maps them to static profile objects. `switchUser()` in the store works but user creation/deletion is not possible.

**What needs to change:**

- `UserId` must become `string` (not a union literal). The Zod schema in `workoutStore.ts` validates `'dani' | 'woody'` — both the type and the schema need loosening.
- A new `profiles` Dexie table stores user profile records (name, avatar, creation date). The existing `users.ts` static data becomes seed data for migration.
- The settings key-value bag approach (`user:{userId}`) already works for per-user settings — keep it.
- The `app` settings key stores `activeUserId` — keep the pattern, just remove the type constraint.
- User creation/deletion UI lives in a new `/profiles` route, shown as a profile switcher overlay (not a full page). A `ProfileSwitcher` component replaces the current hardcoded user dropdown.

**Dexie migration (version 4):**

```
// New table
profiles: '&id, name, createdAt'

// Existing tables unchanged — userId is already indexed as a string
// Migration: seed profiles table from the static users.ts data
```

**Store changes:** Add `createProfile(name, avatar)` and `deleteProfile(userId)` actions. `switchUser` signature stays the same.

**No route changes needed** — user switching is handled via a global overlay/modal, not a route.

---

### 2. Rest Timer

**Current state:** Fully implemented inside `SessionDetail` component state (`restSeconds`, `restRunning`, `setInterval`). `lib/rest.ts` handles duration parsing and clock formatting. The `SessionFooter` component exposes 1m/2m/3m presets and a manual start.

**What needs to change for redesign:**

- The logic is sound. The UX needs a visual overhaul: a fullscreen/overlay countdown modal with vibration on completion (`navigator.vibrate([200, 100, 200])`).
- Extract the timer state into a `useRestTimer` hook so it can be shared between `SessionDetail` and future workout views.
- `useRestTimer` interface: `{ seconds, running, start(duration: number), reset(), toggle() }`.
- Optional: persist last-used rest duration to `localStorage` so it survives navigation.

**No Dexie changes needed.** Timer is ephemeral UI state — the interval approach is correct for a PWA.

**New component:** `RestTimerModal` — fullscreen overlay shown during active rest countdown, dismissed on completion or tap.

---

### 3. Exercise History & Progression

**Current state:** `ExerciseHistory.tsx` route exists at `/exercise/:exerciseId`. The Dexie compound index `[userId+exerciseId+date]` is already in place. `SessionDetail` uses a `lastLogsByExercise` map for pre-filling sets but only reads the single most recent log per exercise.

**What needs to change:**

- `ExerciseHistory` route needs to query the full `[userId+exerciseId+date]` range to show progression over time (not just the last entry).
- Add a progression chart component (weight/reps over time per exercise). This is display-only — no new tables needed.
- Surface a "best set" (max e1RM or max weight) per exercise for the exercise detail screen.
- Add an `exerciseId` → display name lookup. Currently exercise IDs are keys in the program data — a utility `getExerciseName(exerciseId, program)` should live in `lib/program.ts`.

**No Dexie schema changes needed.** All required indexes exist.

**New/modified components:**
- `ExerciseHistory` route: add full history list + progression chart
- `ExerciseProgressChart` (new): recharts or a lightweight canvas chart showing weight × reps trend

**Existing `ExerciseLogs` data shape** supports this without modification — `sets: SetEntry[]` has weight, reps, rir, completed per set.

---

### 4. Workout Templates + Custom Programs

**Current state:** Programs are TypeScript objects in `/src/data/`. They are compile-time constants, not stored in IndexedDB. Users cannot create custom programs — they get whichever program is hardcoded in `users.ts`.

**What needs to change — this is the biggest architectural shift:**

Programs must move from static TS objects to IndexedDB, or be treated as a hybrid: built-in programs stay as static data, user-created templates/programs are stored in Dexie.

**Recommended hybrid approach:**

- Keep `treinoDani.ts` and `treinoWesley.ts` as built-in, identified by a `source: 'builtin'` flag.
- New Dexie tables for user-created content:

```
templates: '&id, userId, name, createdAt'          // WorkoutTemplate records
programs:  '&id, userId, name, isActive, createdAt' // CustomProgram records
```

- A `WorkoutTemplate` is a saved session layout: list of exercises with set/rep targets, not tied to a week schedule. Think of it as a reusable session definition.
- A `CustomProgram` is a collection of templates with a schedule — the full `Program` shape but stored in IndexedDB.

**Data model additions to `types.ts`:**

```typescript
export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: TemplateExercise[]  // exerciseId, sets, repRange, rest
  createdAt: string
  updatedAt: string
}

export type CustomProgram = {
  id: string
  userId: string
  name: string
  schedule: ScheduleDay[]
  templateIds: string[]   // ordered list of session templates
  durationWeeks: number
  isActive: boolean
  createdAt: string
}
```

**How `useActiveProgram()` changes:**

Currently `lib/user.ts` returns the hardcoded program for the active user. After this change it must check if the user has an active `CustomProgram` in IndexedDB; if so, assemble and return that; otherwise fall back to the built-in program. This is the critical data-flow change — every component that calls `useActiveProgram()` gets the right program transparently.

**New routes needed:**
- `/templates` — browse/create workout templates
- `/templates/new` and `/templates/:id/edit`
- `/programs` — browse/create custom programs
- `/programs/:id` — program detail

**Zustand store additions:**
- `templates: WorkoutTemplate[]`
- `createTemplate(...)`, `updateTemplate(...)`, `deleteTemplate(...)`
- `activeProgram: Program | CustomProgram` (resolved by `useActiveProgram`)

---

### 5. Body Metrics Tracking

**Current state:** No metrics tracking exists at all.

**Data model (new):**

```typescript
export type BodyMetric = {
  id: string
  userId: string
  date: string          // ISO timestamp
  weight?: number       // kg
  bodyFat?: number      // percentage
  measurements?: {
    waist?: number
    hip?: number
    chest?: number
    [key: string]: number | undefined
  }
  notes?: string
}
```

**Dexie table (version 5 migration):**

```
bodyMetrics: '&id, userId, [userId+date], date'
```

**Zustand store additions:**
- `bodyMetrics: BodyMetric[]` — loaded alongside workouts/exerciseLogs on `init()` and `switchUser()`
- `logMetric(...)`, `deleteMetric(...)`

**New route:** `/metrics` — weight and measurement chart + log entry form.

**Export/import bundle (`ExportBundle`)** must be extended to include `bodyMetrics: BodyMetric[]`. Backward-compatible: import treats missing `bodyMetrics` field as empty array.

---

## Component Map: New vs Modified

| Component/File | Status | What Changes |
|----------------|--------|-------------|
| `src/types.ts` | Modified | Add `WorkoutTemplate`, `CustomProgram`, `BodyMetric`; broaden `UserId` to `string` |
| `src/db/client.ts` | Modified | Add `profiles`, `templates`, `programs`, `bodyMetrics` tables in v4/v5 migrations |
| `src/store/workoutStore.ts` | Modified | Add template/program/metrics actions; update `activeUserId` type; `init()` loads metrics |
| `src/data/users.ts` | Modified | `getUserProfile` falls back to DB profiles; `UserId` type loosened |
| `src/lib/user.ts` | Modified | `useActiveProgram()` checks for active custom program before returning built-in |
| `src/lib/rest.ts` | Unchanged | Logic is correct |
| `src/hooks/useRestTimer.ts` | New | Extracted from `SessionDetail`, adds vibration callback |
| `src/routes/SessionDetail.tsx` | Modified | Use `useRestTimer` hook; replace timer UI with `RestTimerModal` |
| `src/routes/ExerciseHistory.tsx` | Modified | Full history query + `ExerciseProgressChart` |
| `src/routes/Dashboard.tsx` | Modified | UX redesign; user switcher widget |
| `src/routes/Settings.tsx` | Modified | Add body metrics section, user profile management |
| `src/routes/Metrics.tsx` | New | Body metrics log + chart |
| `src/routes/Templates.tsx` | New | Workout template list/creation |
| `src/routes/Programs.tsx` | New | Custom program builder |
| `src/components/ProfileSwitcher.tsx` | New | User profile switcher overlay |
| `src/components/RestTimerModal.tsx` | New | Fullscreen rest countdown |
| `src/components/ExerciseProgressChart.tsx` | New | Weight/reps trend chart per exercise |

---

## Data Flow Changes

### Init Flow (current)
```
App mounts → workoutStore.init() → read activeUserId from settings →
loadUserData(userId) → set workouts + exerciseLogs + settings
```

### Init Flow (after redesign)
```
App mounts → workoutStore.init() → read activeUserId from settings →
loadUserData(userId) → set workouts + exerciseLogs + settings + bodyMetrics + templates + programs →
useActiveProgram() resolves: customProgram || builtinProgram
```

### User Switch Flow
Same pattern — `switchUser()` reloads all per-user data including metrics, templates, programs.

### Program Resolution (critical change)
```typescript
// lib/user.ts — useActiveProgram() after change:
const customPrograms = useWorkoutStore(s => s.programs)
const activeUserId = useWorkoutStore(s => s.activeUserId)
const active = customPrograms.find(p => p.userId === activeUserId && p.isActive)
if (active) return assembleProgram(active, templates)
return getBuiltinProgram(activeUserId)  // fallback to static TS data
```

All existing routes that call `useActiveProgram()` continue to work because the return type is still `Program`.

---

## Dexie Migration Roadmap

| Version | Tables Added | Migration Logic |
|---------|-------------|-----------------|
| v1 | workouts, exerciseLogs, settings | (existing) |
| v2 | Added userId indexes | (existing — migrated data to userId: 'dani') |
| v3 | Added compound indexes | (existing) |
| v4 | `profiles` table | Seed from static `users.ts` data |
| v5 | `templates`, `programs`, `bodyMetrics` | No data migration needed (empty tables) |

Dexie's versioning is additive — each new version only defines what's new. Existing data is untouched. The v4 migration seeds the `profiles` table from `users.ts` so the two existing users appear as proper profile records.

**Migration code pattern (v4):**

```typescript
this.version(4).stores({
  profiles: '&id, name, createdAt',
}).upgrade(async (tx) => {
  await tx.table('profiles').bulkAdd([
    { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', createdAt: new Date().toISOString() },
    { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', createdAt: new Date().toISOString() },
  ])
})
```

---

## Build Order (Dependency-Ordered)

The features have hard dependencies. Build in this order to avoid rework:

**Phase 1 — Foundation (no new features, unlocks everything)**
1. Broaden `UserId` from union literal to `string` in types + Zod schema
2. Add Dexie v4 (`profiles` table) + v5 (`templates`, `programs`, `bodyMetrics`)
3. Extract `useRestTimer` hook from `SessionDetail`
4. Extend `ExportBundle` to include `bodyMetrics`

**Phase 2 — Multi-User Profiles**
- Depends on: Phase 1 (broadened UserId, profiles table)
- `ProfileSwitcher` component + `/profiles` management route
- `createProfile` / `deleteProfile` store actions

**Phase 3 — UX Redesign (can run in parallel with Phase 2)**
- Redesign theme, navigation, existing route layouts
- Replace timer UI in `SessionDetail` with `RestTimerModal`
- Upgrade `ExerciseHistory` to full progression view

**Phase 4 — Body Metrics**
- Depends on: Phase 1 (bodyMetrics table, ExportBundle)
- `/metrics` route, `logMetric` store action, `BodyMetricsChart`

**Phase 5 — Templates + Custom Programs**
- Depends on: Phase 1 (templates/programs tables), Phase 2 (userId is a string)
- Update `useActiveProgram()` to resolve custom programs
- Template builder UI, program builder UI
- This is highest complexity — isolate it last

---

## Key Risks

1. **`useActiveProgram()` is called in many places.** Any change to its return value or timing (async vs sync) ripples through `SessionDetail`, `Dashboard`, `WeekView`. Keep it synchronous and keep the return type as `Program`. The custom program assembly should happen in the store's `init()`, not in the hook.

2. **`UserId` type broadening breaks Zod import validation.** The `importSchema` in `workoutStore.ts` uses `z.union([z.literal('dani'), z.literal('woody')])`. After broadening to `string`, import validation becomes permissive. Add a separate check: if `userId` doesn't match any known profile, reject or prompt user to map it.

3. **Draft autosave uses `localStorage`, keyed by userId.** If userId changes to a UUID, key format changes. Update `draftKey` in `SessionDetail` after broadening userId — the current format `session-draft-${userId}-${sessionType}-${week}` already accommodates any string userId.

4. **Templates phase is a full CRUD UI.** Do not underestimate. A minimal MVP template builder needs: exercise picker (search existing exercises from both programs), set/rep config per exercise, save/load/delete. The exercise catalog is currently embedded in program TS objects — a queryable exercise catalog (either extracted to a static map or a new `exercises` Dexie table) is a prerequisite.

5. **Body metrics photos are out of scope.** IndexedDB can store blobs but photo management adds significant complexity. Store text/number metrics only; defer photo support explicitly.
