---
phase: 02-multi-user-profiles
plan: "01"
subsystem: store
tags: [profiles, crud, dexie, tdd, zustand, shadcn]
dependency_graph:
  requires: []
  provides: [createProfile, updateProfile, deleteProfile, useActiveUserProfile, useActiveProgram, DropdownMenu, profile-constants]
  affects: [src/store/workoutStore.ts, src/lib/user.ts, src/components/ui/dropdown-menu.tsx, src/lib/profile-constants.ts]
tech_stack:
  added: [dexie-react-hooks, "@radix-ui/react-dropdown-menu"]
  patterns: [TDD red-green, Zustand store actions, Dexie live query, atomic transactions]
key_files:
  created:
    - src/components/ui/dropdown-menu.tsx
    - src/lib/profile-constants.ts
  modified:
    - src/store/workoutStore.ts
    - src/store/workoutStore.test.ts
    - src/lib/user.ts
decisions:
  - "Used db.profiles.clear() + bulkPut in tests rather than relying on populate-seeded data to ensure exact profile counts for guard tests"
  - "createProfile auto-switches to new profile via get().switchUser() to reuse existing load logic"
  - "deleteProfile uses Dexie atomic transaction across all 6 tables to ensure data consistency"
  - "useActiveProgram returns null for non-dani/non-wesley profiles — dynamic program linkage deferred to Phase 5"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-21"
  tasks_completed: 2
  files_modified: 5
---

# Phase 02 Plan 01: Profile CRUD Data Layer Summary

One-liner: Profile CRUD store actions (createProfile/updateProfile/deleteProfile) with TDD, DB-driven user hooks via dexie-react-hooks useLiveQuery, and DropdownMenu component installed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 0 | Install DropdownMenu + create profile constants | 4c37bdf | src/components/ui/dropdown-menu.tsx, src/lib/profile-constants.ts |
| RED | Failing tests for profile CRUD | 46338a0 | src/store/workoutStore.test.ts |
| GREEN | Implement store actions + migrate user.ts | e056790 | src/store/workoutStore.ts, src/lib/user.ts, package.json |

## What Was Built

### DropdownMenu Component
- Installed `@radix-ui/react-dropdown-menu` package
- Created `src/components/ui/dropdown-menu.tsx` with full shadcn-style wrapper exporting DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, and supporting components

### Profile Constants
- `src/lib/profile-constants.ts` exports `AVATAR_COLORS` (6 dark-theme-safe hex values per UI-SPEC) and `pickColor(existingCount)` round-robin utility

### Store Actions (src/store/workoutStore.ts)
- **createProfile(name)**: trims + validates name (non-empty, max 50 chars), derives shortName/avatarInitial/avatarColor, writes to db.profiles, auto-switches to new profile
- **updateProfile(id, patch)**: merges patch, recomputes shortName/avatarInitial when name changes
- **deleteProfile(userId)**: guards last-profile deletion (D-10), atomic transaction deleting profile + all workouts/exerciseLogs/bodyMetrics/templates/settings records, auto-switches activeUserId to first remaining profile if active profile was deleted (D-11)
- **switchUser guard**: blocks user switch when `window.location.pathname.startsWith('/session')`
- **init() fallback**: replaced `defaultUserId` import with `db.profiles.toArray()[0]?.id ?? 'dani'`
- Removed `import { defaultUserId } from '@/data/users'`

### DB-Driven User Hooks (src/lib/user.ts)
- `useActiveUserProfile()`: reads from `useLiveQuery(() => db.profiles.get(activeUserId))` — live, reactive
- `useActiveProgram()`: returns treinoDani/treinoWesley for hardcoded IDs, null for all others

## Test Results

28 tests passing, 0 failing. All Phase 1 tests pass (no regressions).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] dexie-react-hooks not installed**
- **Found during:** GREEN phase (SessionDetail.test.tsx import resolution failure)
- **Issue:** `dexie-react-hooks` was not in package.json but required by new user.ts
- **Fix:** `npm install dexie-react-hooks`
- **Files modified:** package.json, package-lock.json
- **Commit:** e056790

**2. [Rule 3 - Blocking] shadcn components.json missing — DropdownMenu created manually**
- **Found during:** Task 0 (npx shadcn@latest add dropdown-menu prompted for components.json)
- **Issue:** No components.json in project, shadcn CLI would require interactive setup
- **Fix:** Installed `@radix-ui/react-dropdown-menu` directly, created dropdown-menu.tsx manually following dialog.tsx structure
- **Commit:** 4c37bdf

**3. [Rule 1 - Bug] Test for "only 1 profile" needed explicit profile clear**
- **Found during:** GREEN phase test run
- **Issue:** WorkoutDB populate event seeds dani+wesley profiles, so "only-one" test had 3 profiles not 1
- **Fix:** Added `fakeDb.profiles.clear()` + re-put in test before calling deleteProfile
- **Commit:** e056790

**4. [Rule 1 - Bug] "auto-switches" test used cross-module import after vi.resetModules()**
- **Found during:** GREEN phase test run
- **Issue:** `afterStore` import after `vi.resetModules()` created a fresh Zustand store with reset state, so activeUserId was never 'user-y'
- **Fix:** Used same store reference (`useWorkoutStore`) from within same module scope, without re-resetting modules
- **Commit:** e056790

## Threat Model Coverage

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-02-01 | createProfile: trim + reject empty + max 50 chars before db.profiles.put |
| T-02-02 | updateProfile: same trim validation when patch.name is provided |
| T-02-03 | deleteProfile: db.profiles.toArray().length <= 1 guard in store action |
| T-02-04 | Accepted — local-only IndexedDB, no network transmission |

## Known Stubs

None — all actions write to and read from real Dexie tables.

## Self-Check: PASSED

- src/components/ui/dropdown-menu.tsx: FOUND
- src/lib/profile-constants.ts: FOUND
- src/store/workoutStore.ts (createProfile): FOUND
- src/store/workoutStore.ts (no defaultUserId import): VERIFIED
- src/lib/user.ts (useLiveQuery): FOUND
- Commits 4c37bdf, 46338a0, e056790: FOUND in git log
