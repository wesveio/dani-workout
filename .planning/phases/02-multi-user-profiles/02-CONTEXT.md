# Phase 2: Multi-User Profiles - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Create, switch, edit, and delete local profiles with fully isolated data. Multiple people can use the app on the same device, each seeing only their own workouts and settings. Profile data model (name + avatar color/initial) and Dexie `profiles` table already exist from Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Profile creation flow
- **D-01:** Modal dialog (shadcn Dialog) for creating profiles — stays on current screen, low friction
- **D-02:** Only name required on creation — avatar color auto-assigned from preset palette, editable later
- **D-03:** Entry point is inside profile switcher dropdown — "+ Novo perfil" option at bottom of profile list

### Profile switching UX
- **D-04:** Dropdown menu triggered by tapping avatar in header — styled with shadcn DropdownMenu, shows profile list with color dots + checkmark on active, "+ Novo perfil" at bottom
- **D-05:** Block profile switch during active workout — show warning "Finalize ou descarte o treino antes de trocar de perfil"
- **D-06:** Persist last active profile across app restarts — store activeUserId in settings table (existing pattern)

### Avatar & identity
- **D-07:** Color circle + initial system — first letter of name as initial, background color from preset palette of 6-8 colors
- **D-08:** Profile editing (name, avatar color) lives in Settings screen under "Meu Perfil" section

### Profile deletion
- **D-09:** Type-to-confirm deletion — user must type profile name to confirm (GitHub-style destructive action)
- **D-10:** Block deletion of last remaining profile — "Você precisa de pelo menos um perfil." Disable delete button when only 1 profile exists
- **D-11:** After deleting active profile, auto-switch to first remaining profile in list

### Claude's Discretion
- Exact preset color palette values (6-8 colors that look good on dark theme)
- Auto-assignment algorithm for avatar colors on creation (round-robin, random, least-used)
- shortName derivation from name (first word, truncation, etc.)
- avatarInitial derivation (first char of name)
- Dropdown menu animation/transition details
- How `data/users.ts` hardcoded data gets replaced with DB-driven profiles (migration strategy for `useActiveUserProfile`, `useActiveProgram`, `getUserProfile`, `getProgramForUser`)
- Settings "Meu Perfil" section layout and interaction details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` §Profiles — PROF-01, PROF-02, PROF-03, PROF-04 requirements
- `.planning/ROADMAP.md` §Phase 2 — Success criteria and phase dependencies

### Prior phase context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Profile data model decisions (D-01 to D-03), export per-profile decision (D-05)

### Current implementation (must understand before modifying)
- `src/types.ts` — `Profile` type with id, name, shortName, avatarInitial, avatarColor
- `src/db/client.ts` — Dexie v4 schema with `profiles` table, seed data for dani/wesley in upgrade + populate
- `src/data/users.ts` — Hardcoded `UserProfile` with embedded `Program` — must be replaced with DB-driven profiles
- `src/lib/user.ts` — `useActiveUserProfile()` and `useActiveProgram()` hooks reading from hardcoded data
- `src/components/Layout.tsx` — Header with `<select>` dropdown from hardcoded `userList`, avatar display, `switchUser` action
- `src/store/workoutStore.ts` — `activeUserId` state, `switchUser` action, settings persistence

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Profile` type in `types.ts`: Already has id, name, shortName, avatarInitial, avatarColor fields
- `profiles` Dexie table: Already created in v4 migration with `&id, name` indexes and seed data
- `workoutStore.switchUser`: Existing action for changing active user — extend, don't replace
- shadcn `Dialog` component: Available for create-profile modal
- shadcn `DropdownMenu` component: Available for profile switcher dropdown

### Established Patterns
- Dexie compound indexes: `[userId+date]`, `[userId+exerciseId]` — data isolation already keyed by userId
- Settings table key-value: `user:{userId}` for per-user settings, `app` for global state (activeUserId)
- Zustand store: Central state management with Dexie persistence

### Integration Points
- `Layout.tsx` header: Replace `<select>` with DropdownMenu, replace hardcoded `userList` with live Dexie query
- `lib/user.ts`: Replace `getUserProfile()` (hardcoded lookup) with Dexie `profiles.get(id)` query
- `data/users.ts`: Phase out hardcoded exports — downstream hooks/components must use DB-driven data
- `Settings.tsx`: Add "Meu Perfil" section for editing name and avatar color
- Programs still live in `data/treinoDani.ts` and `data/treinoWesley.ts` — profile ↔ program linkage is out of scope for this phase (handled in Phase 5: Templates)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-multi-user-profiles*
*Context gathered: 2026-04-21*
