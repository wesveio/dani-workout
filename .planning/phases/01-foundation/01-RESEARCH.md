# Phase 01: Foundation - Research

**Researched:** 2026-04-21
**Domain:** Dexie schema migration, TypeScript type broadening, Zod validation, export/import format versioning
**Confidence:** HIGH

## Summary

Phase 1 is pure data-layer plumbing. The app is a Vite + React + Dexie v4 PWA with Zustand for state and Zod v4 for validation. The existing codebase has a clean migration pattern (v1→v2→v3 in `db/client.ts`) that this phase extends to v4. The main work is: (1) broaden `UserId` from a literal union to `string`, (2) add `profiles`, `templates`, and `bodyMetrics` tables in a new schema version, (3) seed profiles from the two hardcoded users, and (4) extend `ExportBundle` + Zod import schema to carry the new tables.

No UI work occurs in this phase. All changes are confined to `src/types.ts`, `src/db/client.ts`, `src/store/workoutStore.ts`, and the seeding of `src/data/users.ts` data into the new profiles table.

**Primary recommendation:** One schema bump to v4 — add three tables, run one upgrade function that seeds profiles. Update `UserId = string` everywhere, update Zod schemas to `z.string()`, and add a `formatVersion` field to ExportBundle for forward-compatible import detection.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| UserId type broadening | TypeScript types + Zod | — | Compile-time type + runtime validation change only |
| Schema migration (v4) | Dexie / IndexedDB | — | Data-layer only, no UI |
| Profile seeding | Dexie upgrade function | — | One-time migration during DB open |
| Export format versioning | workoutStore exportData | Zod importSchema | Producer adds version; consumer detects and fills defaults |
| bodyMetrics table schema | Dexie client | types.ts | New table + new type, no UI yet |
| templates table schema | Dexie client | types.ts | New table + new type, no UI yet |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Profiles are minimal — name + avatar color/emoji only. No embedded programs.
- D-02: Profiles live in their own dedicated Dexie table (`profiles`) with `id` as primary key.
- D-03: Migration auto-creates profile records for existing 'dani' and 'wesley' users from current hardcoded data. Seamless transition.
- D-04: Auto-upgrade old exports on import — detect format version, fill missing fields with defaults. Old backups remain importable.
- D-05: Exports are per-profile (one profile's data per file). Matches current behavior.
- D-06: Zero data loss required. Migration must preserve all existing workouts and exercise logs. New tables added alongside existing ones. If migration fails, old data stays intact. Write tests to verify.
- D-07: Skip multi-tab version conflict handling.

### Claude's Discretion
- Table schemas for `profiles`, `templates`, and `bodyMetrics` (fields and indexes)
- Exact Dexie version bump strategy (v3→v4 or v3→v4→v5 etc.)
- Export format version marker implementation
- How to decouple programs from profiles (currently `UserProfile` embeds `Program`)
- Zod schema updates for broadened UserId

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | UserId type broadened from literal union to dynamic string | Change `types.ts` union to `string`; update Zod `userIdSchema` from `z.union([z.literal(...)])` to `z.string().min(1)` |
| FOUND-02 | Dexie schema migrated with profiles, templates, bodyMetrics tables | Single v4 upgrade in `db/client.ts`; seed profiles from hardcoded users data |
| FOUND-03 | Export/import format extended to include all new data types | Add `formatVersion`, optional `profiles`/`templates`/`bodyMetrics` arrays to `ExportBundle` and `importSchema` |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| dexie | ^4.2.1 | IndexedDB ORM, schema migrations | [VERIFIED: package.json] |
| zod | ^4.2.1 | Runtime validation on import | [VERIFIED: package.json] |
| zustand | (latest) | State store, exportData/importData | [VERIFIED: package.json] |
| vitest | ^4.1.0 | Test runner (jsdom env configured) | [VERIFIED: package.json + vite.config.ts] |

**Installation:** No new packages required for this phase.

## Architecture Patterns

### Recommended Project Structure (changes only)
```
src/
├── types.ts              # UserId = string; add Profile, Template, BodyMetric types
├── db/
│   └── client.ts         # v4 schema + upgrade() seeding profiles
└── store/
    └── workoutStore.ts   # updated Zod schemas; extended exportData/importData
```

### Pattern 1: Dexie Version Bump (single increment)
**What:** Add one `this.version(4)` block that declares new tables and runs the profile-seeding upgrade.
**When to use:** Single version bump is the simplest path. No intermediate versions needed since v3 is the current live version.
**Example:**
```typescript
// Source: existing db/client.ts migration pattern [VERIFIED: src/db/client.ts]
this.version(4)
  .stores({
    workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
    exerciseLogs: 'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
    settings: '&key',
    profiles: '&id, name',
    templates: '&id, userId, [userId+name]',
    bodyMetrics: '&id, userId, [userId+date], date',
  })
  .upgrade(async (tx) => {
    // Seed profiles from hardcoded users (dani, wesley)
    await tx.table('profiles').bulkPut([
      { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', avatarColor: '#e11d48' },
      { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', avatarColor: '#2563eb' },
    ])
  })
```

### Pattern 2: UserId Broadening
**What:** Change `UserId = string` in types.ts. Dexie compound index queries using `userId` (string values) are unaffected — IndexedDB stores strings, not TS literal types.
**Example:**
```typescript
// src/types.ts — before
export type UserId = 'dani' | 'wesley'
// after
export type UserId = string

// src/store/workoutStore.ts — before
const userIdSchema = z.union([z.literal('dani'), z.literal('wesley')])
// after
const userIdSchema = z.string().min(1)
```

### Pattern 3: Export Format Versioning
**What:** Add `formatVersion: number` to `ExportBundle`. Import path checks the field; if absent (old backup), treat as v1 and fill missing fields with defaults.
**Example:**
```typescript
// types.ts
export type ExportBundle = {
  formatVersion: 2
  userId: UserId
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
  profiles?: Profile[]
  templates?: Template[]
  bodyMetrics?: BodyMetric[]
}

// importSchema — v1 backups have no formatVersion, so optional with default
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

### Proposed Table Schemas (Claude's Discretion)

**profiles** (stripped of `Program` — programs remain in `src/data/` static files for now)
```typescript
export type Profile = {
  id: string          // UserId — primary key
  name: string
  shortName: string
  avatarInitial: string
  avatarColor: string  // hex color string for avatar background
}
```
Indexes: `&id, name`

**templates** (placeholder for Phase 5 — table must exist per FOUND-02)
```typescript
export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: Array<{ exerciseId: string; defaultSets: SetEntry[] }>
  createdAt: string
}
```
Indexes: `&id, userId, [userId+name]`

**bodyMetrics** (placeholder for Phase 6 — table must exist per FOUND-02)
```typescript
export type BodyMetric = {
  id: string
  userId: string
  date: string
  weight?: number          // kg
  waist?: number           // cm
  hips?: number
  chest?: number
  arms?: number
  notes?: string
}
```
Indexes: `&id, userId, [userId+date], date`

### Anti-Patterns to Avoid
- **Splitting into multiple version bumps (v3→v4→v5):** Unnecessary complexity. One v4 bump handles all three new tables cleanly.
- **Embedding programs in profiles table:** D-01 explicitly says no. Programs stay in static `src/data/` files.
- **Blocking migration on profile seed failure:** Use `bulkPut` (upsert semantics) — idempotent, safe to run multiple times.
- **Breaking existing `users.ts` exports before UI phase:** `getUserProfile` and `getProgramForUser` must keep working during this phase since no UI is being changed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema migration | Custom IndexedDB migration | Dexie `.version().upgrade()` | Handles version detection, transaction safety, rollback |
| Runtime validation | Manual type guards | Zod schemas | Edge cases in coercion, already used in codebase |
| UUID generation | Custom random string | `crypto.randomUUID()` (already used in `makeId()`) | Already established pattern in codebase |

## Common Pitfalls

### Pitfall 1: Dexie v4 Schema Declaration Must List ALL Tables
**What goes wrong:** Omitting an existing table from a new version's `.stores()` call drops that table.
**Why it happens:** Dexie interprets omission as "delete this table."
**How to avoid:** Copy all existing index strings from v3 into v4's `.stores()`, then add the three new tables.
**Warning signs:** Data disappears on first load after migration.

### Pitfall 2: `UserId` Narrowing in Zod Leaks Into Export
**What goes wrong:** If the old `userIdSchema` (`z.union([z.literal('dani'), z.literal('wesley')])`) is left in `importSchema`, importing an export made with a new dynamic userId (e.g., 'alice') fails validation.
**How to avoid:** Update `userIdSchema` to `z.string().min(1)` before writing any new export tests.

### Pitfall 3: `users.ts` `UserProfile` Type References `Program`
**What goes wrong:** If `UserProfile` in `users.ts` is modified to remove `program`, all downstream callers of `getProgramForUser` break.
**How to avoid:** Leave `users.ts` and `UserProfile` entirely untouched. The new `Profile` Dexie type is a separate, minimal type in `types.ts`. The decoupling from `Program` is a UI-phase concern (Phase 2), not Phase 1.

### Pitfall 4: Seeding Profiles Must Be Idempotent
**What goes wrong:** If the upgrade runs twice (dev hot-reload edge case), duplicate key errors crash the migration.
**How to avoid:** Use `tx.table('profiles').bulkPut(...)` — upsert semantics, safe on re-run.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (test.environment: jsdom, setupFiles: ./src/test/setup.ts) |
| Quick run command | `npx vitest run src/db` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | `UserId = string` — new profiles with non-literal IDs accepted by Zod import schema | unit | `npx vitest run src/store/workoutStore.test.ts` | ❌ Wave 0 |
| FOUND-02 | DB opens at v4, all 5 tables present (workouts, exerciseLogs, settings, profiles, templates, bodyMetrics); profiles seeded for dani/wesley | unit | `npx vitest run src/db/client.test.ts` | ❌ Wave 0 |
| FOUND-02 | Existing workouts/exerciseLogs survive migration (zero data loss) | unit | `npx vitest run src/db/client.test.ts` | ❌ Wave 0 |
| FOUND-03 | Export bundle includes `formatVersion`; old v1 bundle (no formatVersion) imports successfully with defaults filled | unit | `npx vitest run src/store/workoutStore.test.ts` | ❌ Wave 0 |

**Note on Dexie testing:** Dexie 4 uses the Web Crypto API and IndexedDB. In vitest/jsdom, use `fake-indexeddb` package to mock. Check if it's already installed — if not, Wave 0 must add it.

```bash
npm view fake-indexeddb version
```

[ASSUMED] `fake-indexeddb` is the standard Dexie testing companion; verify it is in devDependencies or add it in Wave 0.

### Sampling Rate
- **Per task commit:** `npx vitest run src/db src/store`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/db/client.test.ts` — covers FOUND-02 (schema version, table presence, migration data safety)
- [ ] `src/store/workoutStore.test.ts` — covers FOUND-01 and FOUND-03 (Zod broadening, format versioning)
- [ ] Verify `fake-indexeddb` in devDependencies; add if missing: `npm install -D fake-indexeddb`

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `UserId = 'dani' \| 'wesley'` literal union | `UserId = string` | Unlocks dynamic profiles without code changes per user |
| Static `users.ts` as source of truth | Dexie `profiles` table as source of truth (Phase 2) | Phase 1 seeds the table; Phase 2 reads from it |
| Hardcoded export format (no version) | `formatVersion` field | Old backups still importable; new features optional |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `fake-indexeddb` is the right Dexie 4 test companion for jsdom | Validation Architecture | Wave 0 must find alternative mock strategy |
| A2 | Avatar color stored as hex string is sufficient for Phase 2 profile UI | Architecture Patterns (profiles schema) | Profile type may need adjustment when Phase 2 plans avatar picker |
| A3 | `templates` and `bodyMetrics` table schemas proposed here are sufficient placeholders | Architecture Patterns | Phase 5/6 may need index changes — a future v5/v6 migration handles that |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node / npm | Package installs | ✓ | (project running) | — |
| fake-indexeddb | Dexie unit tests | [ASSUMED] | unknown | Add in Wave 0 |

## Sources

### Primary (HIGH confidence)
- `src/db/client.ts` [VERIFIED] — existing migration pattern v1→v2→v3
- `src/types.ts` [VERIFIED] — current UserId literal union
- `src/store/workoutStore.ts` [VERIFIED] — Zod schemas and import/export logic
- `src/data/users.ts` [VERIFIED] — hardcoded profile data to seed
- `package.json` [VERIFIED] — dexie 4.2.1, zod 4.2.1, vitest 4.1.0
- `vite.config.ts` [VERIFIED] — test config (jsdom, setupFiles)

### Tertiary (LOW confidence)
- `fake-indexeddb` as Dexie test companion [ASSUMED — standard practice, unverified in this session]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified from project files
- Architecture: HIGH — patterns derived directly from existing code
- Pitfalls: HIGH — derived from reading actual migration code
- Test infra: MEDIUM — framework verified, fake-indexeddb assumed

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable dependencies)
