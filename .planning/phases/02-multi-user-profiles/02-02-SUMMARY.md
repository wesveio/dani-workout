---
phase: 02-multi-user-profiles
plan: "02"
subsystem: ui-components
tags: [profile-switcher, dropdown, dialog, layout, null-guard]
dependency_graph:
  requires: [02-01]
  provides: [profile-switcher-ui, create-profile-ui, layout-null-safe]
  affects: [src/components/Layout.tsx]
tech_stack:
  added: []
  patterns: [useLiveQuery-reactive-ui, zustand-selector, dropdown-menu, dialog-form]
key_files:
  created:
    - src/components/ProfileSwitcher.tsx
    - src/components/CreateProfileDialog.tsx
  modified:
    - src/components/Layout.tsx
decisions:
  - "Kept useWorkoutStore(settings) in Layout for programStart — needed by getCurrentWeekNumber signature"
  - "ProfileSwitcher renders CreateProfileDialog outside DropdownMenu to avoid portal nesting issues"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-21"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 02: Profile Switcher UI Summary

ProfileSwitcher dropdown and CreateProfileDialog with reactive Dexie live queries wired to Zustand store actions, replacing the hardcoded select in Layout.tsx with null-safe program/profile handling.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Create ProfileSwitcher and CreateProfileDialog | bb87721 | src/components/ProfileSwitcher.tsx, src/components/CreateProfileDialog.tsx |
| 2 | Replace Layout select with ProfileSwitcher + null-guard program | e81d66a | src/components/Layout.tsx |

## What Was Built

**ProfileSwitcher** (`src/components/ProfileSwitcher.tsx`): DropdownMenu with avatar circle trigger showing active profile color/initial. Lists all profiles from Dexie with color dot, shortName, and checkmark on active. Disables switching during active session. Shows session-block error message. Opens CreateProfileDialog via `+ Novo perfil` item.

**CreateProfileDialog** (`src/components/CreateProfileDialog.tsx`): Dialog with name input, live avatar preview using `pickColor(profiles.length)`, validation (non-empty, max 50 chars), calls `createProfile` store action, shows toast on success.

**Layout.tsx** (`src/components/Layout.tsx`): Removed `userList` import and `<select>` element. Added `<ProfileSwitcher />`. Null-guarded all `program` references (ternary for weekNumber, optional chaining for weeks/schedule, conditional render for program name). Guarded `profile?.name`. Removed `switchUser` and `loading` selectors.

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed incorrect getCurrentWeekNumber arguments**
- Found during: Task 2 code review
- Issue: Initial write used `(program.durationWeeks, program.durationWeeks)` instead of `(settings.programStart, program.durationWeeks)`
- Fix: Added `settings` selector back to Layout, corrected call signature
- Files modified: src/components/Layout.tsx
- Commit: e81d66a

## Verification

- TypeScript: `npx tsc --noEmit` — no errors
- Tests: 28/28 passed (4 test files)

## Self-Check: PASSED

- src/components/ProfileSwitcher.tsx: EXISTS
- src/components/CreateProfileDialog.tsx: EXISTS
- src/components/Layout.tsx: modified (no userList, no select, has ProfileSwitcher)
- Commits bb87721 and e81d66a: EXIST
