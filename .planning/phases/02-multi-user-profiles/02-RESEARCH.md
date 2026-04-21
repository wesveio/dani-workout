# Phase 2: Multi-User Profiles - Research

**Researched:** 2026-04-21
**Domain:** React state management, Dexie live queries, shadcn Dialog + DropdownMenu, profile CRUD with data isolation
**Confidence:** HIGH

## Summary

Phase 2 builds on a complete Phase 1 foundation. The `profiles` Dexie table already exists with seed data for dani/wesley. `workoutStore.switchUser` already loads per-user data from Dexie and persists `activeUserId` to the `settings` table. The data isolation layer (`[userId+date]` compound indexes) is fully in place.

The work is entirely UI-driven: replace the `<select>` in `Layout.tsx` with a shadcn `DropdownMenu`, add a create-profile `Dialog`, wire profile CRUD operations to Dexie, and add an edit/delete section in `Settings.tsx`. The hardcoded `data/users.ts` exports must be removed — every consumer currently importing from it (`Layout.tsx`, `lib/user.ts`, `workoutStore.ts`) needs to switch to live Dexie queries.

The critical migration risk is that `useActiveProgram()` in `lib/user.ts` returns a `Program` object sourced from hardcoded `data/treinoDani.ts`/`data/treinoWesley.ts`. Since program↔profile linkage is out of scope for Phase 2, that hook must stay hardcoded per-profile until Phase 5, but must be decoupled from `data/users.ts` so the hardcoded user list no longer gates profile creation.

**Primary recommendation:** Split the phase into four sequential concerns — (1) install DropdownMenu + add Dexie profile hooks, (2) replace header select with live dropdown, (3) create-profile modal + store actions, (4) Settings "Meu Perfil" section with edit/delete.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Profile list (read) | Dexie (IndexedDB) | React live query hook | Source of truth is the DB, not a static array |
| Active profile persistence | Dexie settings table (`app` key) | Zustand store | Already established pattern from Phase 1 |
| Profile CRUD (create/edit/delete) | Zustand store actions | Dexie profiles table | Store is the single write interface for Dexie |
| Profile switcher UI | Layout.tsx header | DropdownMenu component | Header already owns avatar + active user display |
| Create-profile modal | Dialog component | Layout.tsx or standalone | Modal stays near trigger (in dropdown) |
| Edit/delete profile UI | Settings.tsx | Dialog component | D-08: editing lives in Settings screen |
| Data deletion on profile delete | Dexie transaction | workouts + exerciseLogs + settings + bodyMetrics | Must be atomic to avoid orphaned data |
| Active-workout guard | Zustand workoutStore | Layout.tsx | Block switch/delete if active session |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Modal dialog (shadcn Dialog) for creating profiles — stays on current screen
- D-02: Only name required on creation — avatar color auto-assigned from preset palette, editable later
- D-03: Entry point is inside profile switcher dropdown — "+ Novo perfil" option at bottom of profile list
- D-04: Dropdown menu triggered by tapping avatar in header — styled with shadcn DropdownMenu, shows profile list with color dots + checkmark on active, "+ Novo perfil" at bottom
- D-05: Block profile switch during active workout — show warning "Finalize ou descarte o treino antes de trocar de perfil"
- D-06: Persist last active profile across app restarts — store activeUserId in settings table (existing pattern)
- D-07: Color circle + initial system — first letter of name as initial, background color from preset palette of 6-8 colors
- D-08: Profile editing (name, avatar color) lives in Settings screen under "Meu Perfil" section
- D-09: Type-to-confirm deletion — user must type profile name to confirm (GitHub-style)
- D-10: Block deletion of last remaining profile — disable delete button when only 1 profile exists
- D-11: After deleting active profile, auto-switch to first remaining profile in list

### Claude's Discretion
- Exact preset color palette values (6-8 colors for dark theme)
- Auto-assignment algorithm for avatar colors (round-robin, random, least-used)
- shortName derivation from name
- avatarInitial derivation (first char of name)
- Dropdown menu animation/transition details
- Migration strategy for `useActiveUserProfile`, `useActiveProgram`, `getUserProfile`, `getProgramForUser`
- Settings "Meu Perfil" section layout and interaction details

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | User can create a new local profile with name | New `createProfile` store action + Dialog in header dropdown |
| PROF-02 | User can switch between local profiles on same device | `switchUser` already exists — wrap in DropdownMenu, add active-workout guard |
| PROF-03 | User can edit profile name and avatar | New `updateProfile` store action + Settings "Meu Perfil" section |
| PROF-04 | User can delete a profile and all associated data | New `deleteProfile` store action with cascaded Dexie delete, type-to-confirm Dialog |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie | ^4.x | IndexedDB ORM, live queries | Already in use — `useLiveQuery` for reactive profile list |
| Zustand | ^5.x | Central store, profile actions | Already in use — extend with createProfile/updateProfile/deleteProfile |
| shadcn Dialog | installed | Create-profile modal, delete confirmation | Already in use in Settings.tsx |
| shadcn Input | installed | Name input in dialog, type-to-confirm | Already installed |
| React | ^19 | Component layer | Existing |

### New Dependency Required
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @radix-ui/react-dropdown-menu | 2.1.16 [VERIFIED: npm registry] | Profile switcher dropdown in header | Not yet installed — D-04 requires DropdownMenu, not a native `<select>` |

**Installation:**
```bash
npx shadcn@latest add dropdown-menu
```
This installs `@radix-ui/react-dropdown-menu` and generates `src/components/ui/dropdown-menu.tsx`. [ASSUMED — standard shadcn add pattern; matches existing shadcn component structure in project]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DropdownMenu (shadcn) | Popover + custom list | More control, more code — DropdownMenu already solves keyboard/focus/aria |
| useLiveQuery for profile list | One-time Dexie fetch on switchUser | Live query auto-updates when profile list changes (creation, deletion reflect immediately) |

## Architecture Patterns

### System Architecture Diagram

```
User taps avatar in Layout.tsx header
        │
        ▼
DropdownMenu (shadcn)
  ├─ ProfileListItem (color dot + name + checkmark if active)
  │       └─ on click → switchUser(id) [guarded by active-workout check]
  └─ "+ Novo perfil" item
          └─ on click → opens CreateProfileDialog
                  │
                  ▼
          Dialog: name input + auto-assigned color preview
                  │ submit
                  ▼
          createProfile() [Zustand action]
                  │
                  ▼
          db.profiles.put({ id: uuid, name, shortName, avatarInitial, avatarColor })
          db.settings.put({ key: 'app', value: { activeUserId: newId } })
                  │
                  ▼
          useLiveQuery(profiles) re-fires → dropdown list updates

Settings.tsx "Meu Perfil" section
  ├─ Name input + color picker → updateProfile() → db.profiles.put()
  └─ Delete button (disabled when 1 profile)
          └─ on click → DeleteProfileDialog (type-to-confirm)
                  │ confirmed
                  ▼
          deleteProfile(id) [Zustand action]
                  │
                  ▼
          db.transaction([profiles, workouts, exerciseLogs, settings, bodyMetrics])
            delete all records where userId === id
                  │
                  ▼
          if deleted === activeUserId → switchUser(profiles[0].id)
```

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   └── dropdown-menu.tsx     # new — shadcn add dropdown-menu
│   ├── ProfileSwitcher.tsx       # new — DropdownMenu trigger + list + "+ Novo perfil"
│   ├── CreateProfileDialog.tsx   # new — Dialog with name input
│   └── Layout.tsx                # modified — replace <select> with ProfileSwitcher
├── lib/
│   └── user.ts                   # modified — useActiveUserProfile reads from Dexie live query
├── routes/
│   └── Settings.tsx              # modified — add "Meu Perfil" section (edit + delete)
├── store/
│   └── workoutStore.ts           # modified — add createProfile, updateProfile, deleteProfile actions
└── data/
    └── users.ts                  # to be replaced — exports phased out; consumers migrated
```

### Pattern 1: Live Profile List with useLiveQuery
**What:** Dexie `useLiveQuery` hook returns all profiles as reactive state — updates automatically when profiles table changes.
**When to use:** Anywhere the profile list must stay current without manual refetch.
**Example:**
```typescript
// Source: [ASSUMED — Dexie v4 useLiveQuery pattern, same as existing exerciseLogs usage]
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'

export const useProfiles = () =>
  useLiveQuery(() => db.profiles.toArray(), []) ?? []
```

### Pattern 2: Atomic Profile Delete Transaction
**What:** Delete all user data atomically — if any sub-delete fails, Dexie rolls back entire transaction.
**When to use:** Profile deletion (PROF-04).
**Example:**
```typescript
// Source: [ASSUMED — Dexie transaction pattern, consistent with existing importData transaction]
deleteProfile: async (userId: UserId) => {
  const profiles = await db.profiles.toArray()
  if (profiles.length <= 1) return // D-10: block last profile delete

  await db.transaction('rw',
    db.profiles, db.workouts, db.exerciseLogs, db.settings, db.bodyMetrics,
    async () => {
      await db.profiles.delete(userId)
      await db.workouts.where('userId').equals(userId).delete()
      await db.exerciseLogs.where('userId').equals(userId).delete()
      await db.settings.delete(`user:${userId}`)
      await db.bodyMetrics.where('userId').equals(userId).delete()
    }
  )
  // D-11: auto-switch if deleted active profile
  const remaining = await db.profiles.toArray()
  const currentActive = get().activeUserId
  if (currentActive === userId && remaining.length > 0) {
    await get().switchUser(remaining[0].id)
  }
}
```

### Pattern 3: Avatar Color Auto-Assignment
**What:** Round-robin through a fixed palette based on current profile count.
**When to use:** `createProfile` action — assign color before writing to Dexie.
**Example:**
```typescript
// Source: [ASSUMED]
const AVATAR_COLORS = [
  '#e11d48', // rose
  '#2563eb', // blue
  '#16a34a', // green
  '#d97706', // amber
  '#9333ea', // purple
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4f46e5', // indigo
]

const pickColor = (profiles: Profile[]) =>
  AVATAR_COLORS[profiles.length % AVATAR_COLORS.length]
```

### Anti-Patterns to Avoid
- **Importing from `data/users.ts` in new code:** The hardcoded `users` record limits profiles to 'dani'/'wesley'. New code must query `db.profiles` directly.
- **Deleting profile without transaction:** Orphaned workout/exerciseLog records are invisible bugs — always use `db.transaction('rw', ...)`.
- **Reading `activeUserId` from store for delete guard:** Store state may lag Dexie. For the "is this the last profile?" guard, query `db.profiles.count()` directly.
- **Blocking deletion check in UI only:** The `deleteProfile` store action must also enforce the 1-profile minimum, not rely solely on UI disabling the button.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dropdown with keyboard nav | Custom div + onClick | shadcn DropdownMenu (Radix) | Focus trapping, arrow keys, escape, ARIA roles all handled |
| Modal focus management | Custom dialog | shadcn Dialog (already used) | Already established — Settings.tsx uses it for reset confirm |
| UUID generation | Custom ID scheme | `crypto.randomUUID()` | Already in use in `makeId()` in workoutStore.ts |
| Reactive profile list | useEffect + manual refetch | `useLiveQuery` from dexie-react-hooks | Auto-updates on any profiles table write |

**Key insight:** All primitive UI and data-layer infrastructure is already present. This phase is wiring, not building new infrastructure.

## Common Pitfalls

### Pitfall 1: Hardcoded program dependency in useActiveProgram
**What goes wrong:** `useActiveProgram()` currently returns `profile.program` from the hardcoded `UserProfile` type in `data/users.ts`. When profile creation allows arbitrary IDs, `getUserProfile(id)` falls back to `users[defaultUserId]` (dani), silently returning the wrong program.
**Why it happens:** `lib/user.ts` reads from the hardcoded `users` object, not Dexie.
**How to avoid:** In `useActiveUserProfile`, switch to a `useLiveQuery(() => db.profiles.get(activeUserId))` call. For `useActiveProgram`, hardcode the program lookup by known IDs (`'dani'` → `treinoDani`, `'wesley'` → `treinoWesley`, others → `null`) until Phase 5. New profiles created in Phase 2 have no program — that is expected and must not crash.
**Warning signs:** Crash or wrong program shown after creating a third profile.

### Pitfall 2: Active workout guard not enforced on delete
**What goes wrong:** A user deletes the active profile mid-workout. D-05 blocks *switching* during a workout but the delete flow is separate.
**Why it happens:** Delete lives in Settings.tsx, which is navigable during a session (the nav bar is hidden but Settings is still routable).
**How to avoid:** The `deleteProfile` store action must check whether the `activeUserId` being deleted is the current user AND whether a workout is in progress. If so, reject with an error or the store's `error` field.
**Warning signs:** Profile deleted while session active causes `activeUserId` to point to a non-existent profile.

### Pitfall 3: DropdownMenu not in project yet
**What goes wrong:** Planning tasks that reference `DropdownMenu` without installing it first.
**Why it happens:** `@radix-ui/react-dropdown-menu` is not in `package.json` — confirmed by grep.
**How to avoid:** Wave 0 must include `npx shadcn@latest add dropdown-menu` before any component uses it.
**Warning signs:** Import error on `src/components/ui/dropdown-menu.tsx`.

### Pitfall 4: Profile list in Layout.tsx won't update reactively
**What goes wrong:** If Layout.tsx reads profiles from Zustand store state (not useLiveQuery), creating a profile in the Dialog won't update the dropdown until a full reload.
**Why it happens:** The Zustand store doesn't currently hold a `profiles` array — it holds only the active user's data.
**How to avoid:** Use `useLiveQuery(() => db.profiles.toArray())` directly in `ProfileSwitcher.tsx`. Do not add a `profiles` array to the Zustand store.

### Pitfall 5: Type-to-confirm dialog UX edge case
**What goes wrong:** Name comparison is case-sensitive or ignores leading/trailing whitespace, creating UX confusion.
**Why it happens:** Direct string equality `input === profile.name` fails if user types with different casing.
**How to avoid:** Trim input before comparing. Decide up front: case-sensitive (GitHub's approach) or case-insensitive. Document the choice in code.

## Code Examples

### ProfileSwitcher component skeleton
```typescript
// Source: [ASSUMED — pattern consistent with existing component style in project]
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProfileSwitcher() {
  const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  const switchUser = useWorkoutStore((s) => s.switchUser)
  const activeProfile = profiles.find((p) => p.id === activeUserId)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-11 w-11 rounded-2xl grid place-items-center font-bold text-white"
            style={{ backgroundColor: activeProfile?.avatarColor ?? '#666' }}
            aria-label="Trocar perfil"
          >
            {activeProfile?.avatarInitial ?? '?'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {profiles.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => switchUser(p.id)}>
              <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: p.avatarColor }} />
              {p.shortName}
              {p.id === activeUserId && <CheckIcon className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            + Novo perfil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProfileDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
```

### createProfile store action
```typescript
// Source: [ASSUMED]
createProfile: async (name: string) => {
  const profiles = await db.profiles.toArray()
  const trimmed = name.trim()
  const id = makeId()
  const avatarColor = AVATAR_COLORS[profiles.length % AVATAR_COLORS.length]
  const profile: Profile = {
    id,
    name: trimmed,
    shortName: trimmed.split(' ')[0],
    avatarInitial: trimmed.charAt(0).toUpperCase(),
    avatarColor,
  }
  await db.profiles.put(profile)
  await get().switchUser(id)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Native `<select>` for user switching | shadcn DropdownMenu | This phase | Better UX, supports color dots + checkmark, "+ Novo perfil" item |
| Hardcoded `users` record in data/users.ts | Live Dexie query | This phase | Unlimited profiles, no code change needed for new users |
| getUserProfile returns UserProfile with embedded Program | DB Profile + separate program lookup | This phase | Decouples identity from training program |

**Deprecated/outdated after this phase:**
- `data/users.ts` `users`, `userList`, `defaultUserId`, `getUserProfile`, `getProgramForUser` exports — all consumers must be migrated in this phase. File can be deleted or left as a thin stub if `useActiveProgram` still needs it.
- `Layout.tsx` `<select>` element — replaced by `ProfileSwitcher` component.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `npx shadcn@latest add dropdown-menu` generates `src/components/ui/dropdown-menu.tsx` | Standard Stack | Wrong path breaks Wave 0 install step — verify after running |
| A2 | Round-robin color assignment using `profiles.length % AVATAR_COLORS.length` | Code Examples | Cosmetic only — low risk |
| A3 | New profiles (not 'dani'/'wesley') will have no program and `useActiveProgram` must return `null` or a placeholder | Pitfall 1 | If not handled, app crashes when switching to new profile on program-dependent screens |
| A4 | `db.templates` delete is not needed in deleteProfile because templates are out of scope for Phase 2 — but the table exists | Pattern 2 | If templates records exist for the profile, they become orphaned. Safe to include the delete anyway. |

## Open Questions

1. **useActiveProgram for new profiles**
   - What we know: `useActiveProgram()` is called in `Layout.tsx` to compute `scheduleLabel`, `weekNumber`, `weekInfo`
   - What's unclear: Should Layout.tsx gracefully handle `program === null` for new profiles with no linked program?
   - Recommendation: Return a `null` sentinel and guard all program-dependent renders in Layout.tsx with `program ?` checks. This unblocks Phase 2 without requiring Phase 5 work.

2. **data/users.ts teardown timing**
   - What we know: `workoutStore.ts` imports `defaultUserId` from `data/users.ts` as the fallback when no `app` settings record exists
   - What's unclear: Can `defaultUserId` be inlined or derived from the first profile in Dexie instead?
   - Recommendation: In `workoutStore.init()`, if no `activeUserId` in settings, query `db.profiles.toArray()` and use `profiles[0].id` as the default. Remove `defaultUserId` import.

## Environment Availability

Step 2.6: All dependencies are local npm packages. No external services or CLIs beyond npm.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| @radix-ui/react-dropdown-menu | ProfileSwitcher (D-04) | ✗ | — | None — must install |
| dexie-react-hooks (useLiveQuery) | useProfiles hook | ✓ (assumed via dexie) | — | Manual useEffect + refetch |
| crypto.randomUUID | makeId() in store | ✓ (browser standard) | — | Existing fallback in makeId() |

**Missing dependencies with no fallback:**
- `@radix-ui/react-dropdown-menu` — must be installed via `npx shadcn@latest add dropdown-menu` in Wave 0.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | package.json `"test": "vitest"` |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test:run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | createProfile writes to Dexie profiles table with correct derived fields | unit | `npm run test:run -- src/store/workoutStore.test.ts` | ❌ Wave 0 |
| PROF-01 | Duplicate name does not error (Dexie allows) | unit | included above | ❌ Wave 0 |
| PROF-02 | switchUser loads correct userId's workouts | unit | included above | ❌ Wave 0 (covered by existing store tests if they exist) |
| PROF-02 | switchUser blocked if active workout in progress | unit | included above | ❌ Wave 0 |
| PROF-03 | updateProfile mutates name + avatarColor in Dexie | unit | included above | ❌ Wave 0 |
| PROF-04 | deleteProfile removes all records across all tables for userId | unit | included above | ❌ Wave 0 |
| PROF-04 | deleteProfile blocked when only 1 profile remains | unit | included above | ❌ Wave 0 |
| PROF-04 | deleteProfile auto-switches to first remaining profile | unit | included above | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/store/workoutStore.test.ts` — covers all PROF-01 through PROF-04 store action behavior
- [ ] `src/components/ui/dropdown-menu.tsx` — generated by `npx shadcn@latest add dropdown-menu`

## Security Domain

No authentication, no user data transmission, no passwords. App is offline-first PWA with no network calls for profile data. Standard ASVS categories are not applicable.

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V2 Authentication | no | No auth — local profiles only |
| V3 Session Management | no | No sessions — persistence via IndexedDB |
| V4 Access Control | no | Single-device, no role separation |
| V5 Input Validation | yes | Profile name must be trimmed and non-empty before DB write — use existing Zod schema pattern |
| V6 Cryptography | no | No secrets stored |

**Input validation:** Profile `name` field must be validated (non-empty, reasonable max length ~50 chars) before writing to Dexie. Use inline guard in `createProfile`/`updateProfile` actions — consistent with existing Zod validation in importData.

## Sources

### Primary (HIGH confidence)
- Codebase: `src/db/client.ts` — confirmed profiles table schema, version 4 indexes, seed data
- Codebase: `src/store/workoutStore.ts` — confirmed switchUser, loadUserData, settings persistence pattern
- Codebase: `src/components/Layout.tsx` — confirmed current `<select>` implementation and hardcoded `userList`
- Codebase: `package.json` — confirmed @radix-ui/react-dropdown-menu is NOT installed; all other Radix packages present
- npm registry: `@radix-ui/react-dropdown-menu@2.1.16` — current version [VERIFIED: npm view]

### Secondary (MEDIUM confidence)
- Dexie useLiveQuery pattern — consistent with dexie-react-hooks API used in existing codebase

### Tertiary (LOW confidence)
- shadcn add command output path assumption [A1] — verify by running the command

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed from package.json and npm registry
- Architecture: HIGH — direct codebase reading, no speculation needed
- Pitfalls: HIGH — sourced from actual code gaps found during reading
- Test gaps: HIGH — confirmed no workoutStore.test.ts exists

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable stack, no moving parts)
