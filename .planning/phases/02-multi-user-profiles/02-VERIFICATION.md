---
phase: 02-multi-user-profiles
verified: 2026-04-21T20:30:00Z
status: human_needed
score: 15/15 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Full end-to-end profile flow"
    expected: "Profile switcher shows profiles with color dots and checkmark, switching reloads data, create profile works, Settings edit and delete work, active workout guard fires, persistence survives refresh"
    why_human: "UI interaction, live Dexie reactivity, and data isolation per profile cannot be verified without running the app in a browser"
---

# Phase 2: Multi-User Profiles Verification Report

**Phase Goal:** Multiple people can use the app on the same device with fully isolated data
**Verified:** 2026-04-21T20:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | createProfile writes a Profile record to Dexie with derived shortName, avatarInitial, avatarColor | VERIFIED | workoutStore.ts:216-234 implements full derivation; test at test.ts:62 covers it |
| 2 | updateProfile mutates name and/or avatarColor in Dexie and recomputes shortName/avatarInitial | VERIFIED | workoutStore.ts:235-251; tests at test.ts:111-147 |
| 3 | deleteProfile removes all records across profiles, workouts, exerciseLogs, settings, bodyMetrics, templates atomically | VERIFIED | workoutStore.ts:256-263 uses db.transaction('rw', all 6 tables) |
| 4 | deleteProfile is blocked when only 1 profile remains | VERIFIED | workoutStore.ts:255: `if (profiles.length <= 1) return`; test at test.ts:149 |
| 5 | deleteProfile auto-switches to first remaining profile when active profile is deleted | VERIFIED | workoutStore.ts:264-267: switches to remaining[0].id after delete |
| 6 | switchUser is blocked when on a /session route (active workout guard) | VERIFIED | workoutStore.ts:202-205: pathname guard; test at test.ts:220-245 |
| 7 | useActiveUserProfile reads from Dexie live query, not hardcoded data/users.ts | VERIFIED | user.ts:11: `useLiveQuery(() => db.profiles.get(activeUserId), [activeUserId])` |
| 8 | useActiveProgram returns null for profiles other than dani/wesley | VERIFIED | user.ts:18: `return null` for all other IDs |
| 9 | init() falls back to first Dexie profile instead of hardcoded defaultUserId | VERIFIED | workoutStore.ts:182-185: `fallbackId = profiles[0]?.id ?? 'dani'`; test at test.ts:246-261 |
| 10 | User sees avatar circle trigger in header that opens a dropdown with all profiles | VERIFIED | ProfileSwitcher.tsx: DropdownMenuTrigger with avatar button; useLiveQuery for profile list |
| 11 | User sees '+ Novo perfil' at bottom of dropdown separated by divider | VERIFIED | ProfileSwitcher.tsx:63-69: DropdownMenuSeparator + "+ Novo perfil" item |
| 12 | Tapping '+ Novo perfil' opens a Dialog to create a new profile with name input | VERIFIED | ProfileSwitcher.tsx:72: CreateProfileDialog mounted; CreateProfileDialog.tsx has Dialog with name input |
| 13 | Layout.tsx gracefully handles program === null for new profiles | VERIFIED | Layout.tsx:32,34: optional chaining on program; line 69: `{program && ...}` conditional |
| 14 | User can edit profile name and avatar color in Settings (Meu Perfil card) | VERIFIED | Settings.tsx:109-151: Card with name input, 6 AVATAR_COLORS buttons, "Salvar perfil" button wired to updateProfile |
| 15 | User can delete profile via type-to-confirm dialog, disabled when only 1 profile | VERIFIED | Settings.tsx:160-191: disabled={profileCount <= 1}, confirmName validation, deleteProfile call |

**Score:** 15/15 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/store/workoutStore.ts` | createProfile, updateProfile, deleteProfile actions | VERIFIED | All three actions present, pickColor imported, no defaultUserId import |
| `src/store/workoutStore.test.ts` | Tests for all profile CRUD actions + guards | VERIFIED | 6 describe blocks covering all behaviors |
| `src/lib/user.ts` | DB-driven useActiveUserProfile and decoupled useActiveProgram | VERIFIED | useLiveQuery wired to db.profiles.get; return null for unknown IDs |
| `src/lib/profile-constants.ts` | AVATAR_COLORS palette and pickColor utility | VERIFIED | 6 hex values, round-robin pickColor |
| `src/components/ui/dropdown-menu.tsx` | shadcn DropdownMenu component | VERIFIED | 7.3KB file exists, installed at 2026-04-21 |
| `src/components/ProfileSwitcher.tsx` | Dropdown with profile list, avatar trigger, create entry | VERIFIED | useLiveQuery, DropdownMenu, CreateProfileDialog, session guard |
| `src/components/CreateProfileDialog.tsx` | Dialog for new profile creation | VERIFIED | pickColor, createProfile, name input maxLength=50, toast |
| `src/components/Layout.tsx` | Header uses ProfileSwitcher, null-guarded program | VERIFIED | No userList, no select, ProfileSwitcher imported, program?. guards |
| `src/routes/Settings.tsx` | Meu Perfil section with edit and delete | VERIFIED | AVATAR_COLORS, updateProfile, deleteProfile, profileCount guard |
| `src/data/users.ts` | File deleted (no remaining consumers) | VERIFIED | File does not exist; zero imports of @/data/users found in src/ |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| workoutStore.ts | db/client.ts | db.profiles.put/delete, db.transaction | WIRED | Lines 254-263 use db.profiles and db.transaction |
| user.ts | db/client.ts | useLiveQuery(() => db.profiles.get(...)) | WIRED | user.ts:11 |
| ProfileSwitcher.tsx | workoutStore.ts | useWorkoutStore selectors | WIRED | Lines 18-20: activeUserId, switchUser, error |
| ProfileSwitcher.tsx | db/client.ts | useLiveQuery(() => db.profiles.toArray()) | WIRED | ProfileSwitcher.tsx:17 |
| Layout.tsx | ProfileSwitcher.tsx | import ProfileSwitcher | WIRED | Layout.tsx:14 and :52 |
| Settings.tsx | workoutStore.ts | useWorkoutStore updateProfile, deleteProfile | WIRED | Settings.tsx:25-26 |
| Settings.tsx | db/client.ts | useLiveQuery(() => db.profiles.count()) | WIRED | Settings.tsx:29 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ProfileSwitcher.tsx | profiles | useLiveQuery → db.profiles.toArray() | Yes — Dexie live query | FLOWING |
| CreateProfileDialog.tsx | profiles (for pickColor) | useLiveQuery → db.profiles.toArray() | Yes — Dexie live query | FLOWING |
| Settings.tsx | profileCount | useLiveQuery → db.profiles.count() | Yes — Dexie live query | FLOWING |
| Settings.tsx | profile (editName/editColor) | useActiveUserProfile → useLiveQuery → db.profiles.get() | Yes — Dexie live query | FLOWING |
| Layout.tsx | profile | useActiveUserProfile → useLiveQuery | Yes — Dexie live query | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED for runtime UI behavior — requires browser. TypeScript compilation and test suite are the checkable proxies.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PROF-01 | 02-01, 02-02, 02-04 | User can create a new local profile with name | SATISFIED | createProfile action + CreateProfileDialog + test coverage |
| PROF-02 | 02-01, 02-02, 02-04 | User can switch between local profiles on same device | SATISFIED | switchUser action (with session guard) + ProfileSwitcher dropdown |
| PROF-03 | 02-03, 02-04 | User can edit profile name and avatar | SATISFIED | updateProfile action + Settings "Meu Perfil" section |
| PROF-04 | 02-01, 02-03, 02-04 | User can delete a profile and all associated data | SATISFIED | deleteProfile atomic transaction + type-to-confirm dialog in Settings |

All 4 requirements declared in plan frontmatter accounted for. No orphaned requirements found in REQUIREMENTS.md for Phase 2.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| user.ts | 18 | `return null` | Info | Intentional — useActiveProgram returns null for non-dani/wesley profiles by design; Phase 5 will wire dynamic programs |
| CreateProfileDialog.tsx | 56 | `placeholder="Nome do perfil"` | Info | HTML input placeholder attribute, not a stub pattern |
| Settings.tsx | 119, 179 | `placeholder=` | Info | HTML input placeholder attributes, not stubs |

No blockers. No warnings. Anti-patterns are all benign.

### Human Verification Required

#### 1. End-to-End Profile System Flow

**Test:** Run `npm run dev` and open the app in a browser. Execute the following checks:
1. Tap avatar circle in header — dropdown shows dani and wesley with color dots, checkmark on active
2. Tap the other profile — header avatar updates, workouts reload for that user
3. Tap "+ Novo perfil" — dialog opens, type "Carlos", verify avatar preview updates, click "Criar perfil" — dropdown shows 3 profiles, new profile is active
4. Verify app does NOT crash with Carlos active (no program = graceful null handling in header)
5. Go to Settings — "Meu Perfil" card appears first with name field pre-filled and 6 color dots
6. Change name and color, click "Salvar perfil" — avatar in header updates reactively
7. Create a second test profile, go to Settings, click "Excluir perfil" — dialog requires typing profile name; wrong name keeps button disabled; correct name enables delete; confirm deletion switches to remaining profile
8. With Carlos active, start a workout session (navigate to /session), try switching profiles — dropdown shows "Finalize ou descarte o treino antes de trocar de perfil" warning and does not switch
9. Refresh the page — last active profile is remembered

**Expected:** All flows complete without crashes. Data isolation holds (each profile sees only its own workouts).

**Why human:** Reactive Dexie live queries, IndexedDB persistence across page refresh, UI dropdown interactions, and data isolation per profile cannot be verified without a running browser.

### Gaps Summary

No gaps. All 15 must-haves verified against the actual codebase. All 4 requirements satisfied. Legacy `data/users.ts` deleted with zero remaining consumers. The only open item is human end-to-end verification, which is a mandatory gate for visual/reactive/persistence behavior.

---

_Verified: 2026-04-21T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
