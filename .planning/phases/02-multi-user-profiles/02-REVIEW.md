---
phase: 02-multi-user-profiles
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - package.json
  - src/components/CreateProfileDialog.tsx
  - src/components/Layout.tsx
  - src/components/ProfileSwitcher.tsx
  - src/components/ui/dropdown-menu.tsx
  - src/lib/profile-constants.ts
  - src/lib/user.ts
  - src/routes/Settings.tsx
  - src/store/workoutStore.test.ts
  - src/store/workoutStore.ts
  - src/types.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This phase implements multi-user profile support: a `Profile` type in IndexedDB, CRUD operations in Zustand/Dexie, a profile switcher dropdown, and a create-profile dialog. The architecture is clean — Zod validation on import, atomic Dexie transactions for delete, and a guard against switching users mid-session. No critical security or data-loss bugs were found.

Four warnings stand out: a TOCTOU race in `deleteProfile` that can switch to the wrong profile, a silent success path in `handleDelete` when the profile is already gone, a `useEffect` dependency array that causes stale state on profile rename, and an unhandled promise in `CreateProfileDialog`. Three info items cover a hardcoded fallback ID, a missing `rir` field in the `templateSchema`, and an unused icon import.

---

## Warnings

### WR-01: TOCTOU race in `deleteProfile` — may switch to wrong remaining profile

**File:** `src/store/workoutStore.ts:264-268`

**Issue:** After the transaction completes (which deletes the profile from `db.profiles`), the code immediately calls `db.profiles.toArray()` again to find who to switch to. Between these two reads any concurrent writes (unlikely but possible in multi-tab scenarios) can return a different ordering. More concretely, the first guard check at line 254 (`if (profiles.length <= 1) return`) reads the profile list, then the transaction deletes the record — but the post-transaction read at line 265 is a separate query with no ordering guarantee. If `db.profiles` has no explicit `orderBy`, the "first" result is insertion-order and can differ between browsers/Dexie versions.

**Fix:** Capture `remaining` before calling `switchUser`, and sort deterministically:

```ts
const remaining = (await db.profiles.toArray()).filter((p) => p.id !== userId)
if (remaining.length > 0) {
  await get().switchUser(remaining[0].id)
}
```

Move this block inside the transaction (or immediately after it using the already-queried `profiles` variable) so there is no extra round-trip.

---

### WR-02: `handleDelete` in Settings shows a "deleted" toast even if profile is already gone

**File:** `src/routes/Settings.tsx:58-64`

**Issue:** `handleDelete` calls `deleteProfile(profile.id)` then always calls `toast({ title: 'Perfil excluído' ... })` regardless of whether the delete actually happened. `deleteProfile` in the store returns `void` and silently returns early if `profiles.length <= 1` (line 255 of workoutStore.ts) — it does not throw. If a second tab already deleted the profile, or the guard fires, the user sees a success toast for a no-op.

**Fix:** Return a boolean from `deleteProfile` indicating whether the delete occurred, or throw on failure. In `handleDelete`:

```ts
const deleted = await deleteProfile(profile.id)
if (deleted) {
  toast({ title: 'Perfil excluído', description: `${profile.name} foi removido.` })
  setOpenDelete(false)
  setConfirmName('')
}
```

---

### WR-03: `useEffect` depends on `profile?.id` but `editName`/`editColor` are not reset when only the profile name changes

**File:** `src/routes/Settings.tsx:35-40`

**Issue:**

```ts
useEffect(() => {
  if (profile) {
    setEditName(profile.name)
    setEditColor(profile.avatarColor)
  }
}, [profile?.id])
```

The dependency is `profile?.id`. If the user saves a name change via `handleUpdate`, `profile.name` in the database updates (via `useLiveQuery` → `useActiveUserProfile`), but because the profile `id` hasn't changed, the effect does NOT re-run. This means `editName` stays at the pre-save value, `hasChanges` becomes `true` again immediately after saving, and the "Salvar perfil" button re-enables with the old value in the field. In practice the field re-renders correctly because `editName` was set by the `Input` onChange, but `hasChanges` is computed against `profile?.name` which is now the updated value — so the button correctly disables. However if a remote update arrives (e.g., from another tab via live query), the local edit field will not reflect the new name.

**Fix:** Add `profile?.name` and `profile?.avatarColor` to the dependency array, or restructure so external changes always win:

```ts
useEffect(() => {
  if (profile) {
    setEditName(profile.name)
    setEditColor(profile.avatarColor)
  }
}, [profile?.id, profile?.name, profile?.avatarColor])
```

---

### WR-04: Unhandled promise rejection in `CreateProfileDialog.handleCreate`

**File:** `src/components/CreateProfileDialog.tsx:30-37`

**Issue:** `handleCreate` is an `async` function assigned to `onClick`. If `createProfile` throws (network/IndexedDB failure), the error propagates as an unhandled promise rejection — the dialog closes and the toast fires before the rejection is observable, leaving the user with no feedback about the failure. The store does call `set({ error: ... })` inside `createProfile` on failure, but the dialog unconditionally closes and shows the success toast at lines 34-36 before the promise settles correctly.

**Fix:** Wrap in try/catch and only close/toast on success:

```ts
const handleCreate = async () => {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 50) return
  try {
    await createProfile(trimmed)
    setName('')
    onOpenChange(false)
    toast({ title: 'Perfil criado', description: `${trimmed} adicionado.` })
  } catch {
    toast({ title: 'Erro', description: 'Não foi possível criar o perfil.' })
  }
}
```

---

## Info

### IN-01: Hardcoded `'dani'` as the fallback `activeUserId` in store init

**File:** `src/store/workoutStore.ts:176,183,195`

**Issue:** `activeUserId` is initialized to `'dani'` as a constant default, and the error-path fallback also resets to `'dani'`. If no profile named `'dani'` exists in the database (e.g., after a full reset or on a new device), the UI will show a broken avatar and `useActiveProgram` will still return the hard-coded `treinoDani` program. `profile-constants.ts` and `user.ts` also contain hard-coded user IDs (`'dani'` / `'wesley'`) in `useActiveProgram`.

**Fix:** After `init` resolves and `profiles` is empty, consider redirecting to an onboarding/create-profile flow rather than falling back to a literal string. If these IDs are intentional seed data, document them as such in a constant, not an inline string.

---

### IN-02: `templateSchema` is missing the `rir` field that exists on `SetEntry`

**File:** `src/store/workoutStore.ts:79-88`

**Issue:** `SetEntry` in `src/types.ts` has four fields: `weight`, `reps`, `rir`, `completed`. The `templateSchema`'s `defaultSets` sub-schema only validates `weight`, `reps`, `completed` — `rir` is absent. Data imported with `rir` on template sets will silently have that field stripped by Zod's default strict parse, potentially losing data.

**Fix:**

```ts
defaultSets: z.array(z.object({
  weight: z.number(),
  reps: z.number(),
  rir: z.number().min(0).max(5),
  completed: z.boolean(),
})),
```

---

### IN-03: Unused import in `src/components/ui/dropdown-menu.tsx`

**File:** `src/components/ui/dropdown-menu.tsx:3`

**Issue:** `Circle` is imported from `lucide-react` and used only in `DropdownMenuRadioItem`. `Check` and `ChevronRight` are also imported and used, so only `Circle` warrants a check — it is actually used on line 128. On review, all three imports are used. However `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, and `DropdownMenuRadioGroup` are exported but never consumed by any component in the reviewed file set (`ProfileSwitcher` does not use sub-menus, radio groups, or portals directly). These are standard shadcn/ui boilerplate exports — not a bug — but flagged for awareness.

**Fix:** No action required if this file is shadcn/ui generated boilerplate intended to be a complete primitive set.

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
