# Phase 5: Workout Templates - Research

**Researched:** 2026-04-22
**Domain:** React/TypeScript PWA — Dexie IndexedDB, Zustand, shadcn/ui, React Router v6
**Confidence:** HIGH

## Summary

Phase 5 adds workout templates as first-class data: an exercise catalog extracted from hardcoded program files, template CRUD (save-from-workout and create-from-scratch), and a start-from-template flow with a preview/edit step. All infrastructure is already in place — the Dexie `templates` table (v4 schema), the `WorkoutTemplate` type, and the `/templates` route placeholder exist from prior phases.

The primary work is: (1) create a static exercise catalog file by extracting universal fields from `treinoDani.ts` and `treinoWesley.ts`, (2) extend `WorkoutTemplate` and `workoutStore` with template CRUD actions, (3) build the Templates route/page with card list + CRUD actions, (4) add "save as template" to `SessionDetail.tsx` post-workout flow, and (5) add a template-picker step to the "Novo Treino" entry point.

The `WorkoutTemplate` type already has `defaultSets` per exercise (with weight/reps), satisfying the full-clone requirement. The Zustand schema for templates also already exists in `workoutStore.ts` — it just lacks the store actions (`saveTemplate`, `deleteTemplate`, `updateTemplate`, `duplicateTemplate`).

**Primary recommendation:** Implement in task order: catalog file → type extension check → store actions → Templates page → Save-from-workout → Start-from-template flow.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Exercise catalog extraction (TMPL-04)
- D-01: Hardcoded static TypeScript file — exercises defined as a catalog array, no Dexie table. New exercises added in code updates only.
- D-02: Rich metadata but stripped of program-specific fields. Catalog Exercise = universal fields only: id, name, muscleGroup, focus, defaultRest, videoUrl, imageUrl, notes. Program-specific fields (prescriptions, rir, optionalVolumeBump) stay in program definitions.
- D-03: Exercises grouped by muscle group in the catalog (used for browsing in template builder).

#### Template creation flow (TMPL-01)
- D-04: Two creation paths: save from completed workout + create from scratch via builder.
- D-05: Save-from-workout captures full session clone — exercise order, set count, weights, reps, notes, rest times. Template is an exact copy of that workout.
- D-06: Create-from-scratch builder uses grouped-by-muscle exercise picker. User browses catalog by muscle group (Peito, Costas, Pernas...), taps to add, configures set count per exercise.

#### Start-from-template flow (TMPL-02)
- D-07: Both entry points available: "Novo Treino" screen shows template list + "Treino em branco" option, AND templates tab has "Iniciar" action per template.
- D-08: Preview + edit step before starting — user sees template contents, can add/remove/reorder exercises, then confirms to start session.
- D-09: Pre-fill weights/reps from template into session inputs as editable defaults. Values come from the full-clone template data.

#### Template management (TMPL-03)
- D-10: Card-based list showing template name + exercise count + muscle groups targeted. Consistent with Phase 3 card patterns.
- D-11: Swipe left or long-press to reveal Edit/Duplicate/Delete actions. Mobile-native action patterns.
- D-12: Dedicated Templates tab in bottom navigation. Phase 3 nav was designed to accommodate this (already wired in Layout.tsx).

### Claude's Discretion
- Card visual design details (layout, colors, icons for muscle groups)
- Swipe vs long-press implementation choice (or both)
- Template builder UX details (reorder mechanism, set configuration UI)
- "Save as template" prompt placement and timing in post-workout flow
- Template naming suggestions (auto-generate from exercises or manual only)
- Empty state when no templates exist yet
- Sort order of template list (recent, alphabetical, most used)
- Exercise search within muscle group categories
- How existing program exercises (treinoDani, treinoWesley) map to catalog IDs

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TMPL-01 | User can save a completed workout as a reusable template | SessionDetail post-workout hook → store `saveTemplate` action |
| TMPL-02 | User can start a new workout from a saved template with one tap | Template picker before session + preview/edit Sheet → navigate to session with pre-filled state |
| TMPL-03 | User can edit, duplicate, and delete saved templates | Store actions + swipe/long-press card actions on Templates route |
| TMPL-04 | Exercise catalog extracted as standalone queryable data (prerequisite) | New `src/data/exerciseCatalog.ts` file — static TS array grouped by muscleGroup |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Exercise catalog | Static file (TS) | — | D-01: no DB, code updates only |
| Template CRUD storage | Dexie IndexedDB | Zustand store (cache) | Follows established pattern from workouts/profiles |
| Template store actions | Zustand (`workoutStore`) | — | All existing data mutations live here |
| Templates list page | React route (`/templates`) | — | Route placeholder exists, needs implementation |
| Save-from-workout | `SessionDetail.tsx` | workoutStore | Post-workout flow already in this file |
| Start-from-template | New route or Sheet | SessionDetail | Preview step before navigating to `/session/:id` |
| Nav tab | `Layout.tsx` | `App.tsx` | Already wired — `/templates` link already in `navItems` |

---

## Standard Stack

### Core (already installed — verified in codebase) [VERIFIED: codebase grep]

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dexie | (installed) | IndexedDB ORM — `templates` table already exists | Project standard, v4 schema already has templates |
| zustand | (installed) | Client state — `useWorkoutStore` pattern | All data actions live here |
| react-router-dom v6 | (installed) | `/templates` route placeholder exists | Project standard |
| shadcn/ui | (installed) | Dialog, Sheet, Card components | Phase 3 established this as UI standard |
| @dnd-kit/core | (check) | Drag-to-reorder exercises in template builder | [ASSUMED] — common choice; verify if already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (installed) | Icons (LayoutTemplate already used in nav) | All icon needs |
| zod | (installed) | Template schema validation in store | Follow existing `templateSchema` in workoutStore.ts |
| nanoid / crypto.randomUUID | built-in | Template ID generation | `makeId()` helper already exists in store |

### Check before planning DnD reorder

```bash
cat /path/to/package.json | grep dnd
```

If `@dnd-kit/core` is not installed, the planner should include an install task. If not needed (list reorder deferred), skip.

---

## Architecture Patterns

### System Architecture Diagram

```
[Templates Tab / Dashboard "Novo Treino"]
         |
         v
[Templates List Page]  <---> [workoutStore: templates[]]
         |                         |
    [Card Actions]           [Dexie: templates table]
    Edit / Dupe / Del              |
         |                  [CRUD actions in store]
         v                    saveTemplate()
[Template Builder Sheet]     deleteTemplate()
  - Exercise picker           updateTemplate()
    (grouped catalog)         duplicateTemplate()
  - Set count config          loadTemplates()
         |
         v
[Preview + Edit Sheet]
  (before starting session)
         |
         v
[SessionDetail] <-- pre-filled exerciseState from template
```

### Recommended Project Structure

```
src/
├── data/
│   └── exerciseCatalog.ts     # NEW: static catalog array grouped by muscleGroup
├── routes/
│   └── Templates.tsx          # NEW: replaces placeholder in App.tsx
├── components/
│   ├── TemplateCard.tsx        # NEW: card with swipe/long-press actions
│   ├── TemplateBuilder.tsx     # NEW: Sheet for create-from-scratch
│   └── TemplatePreview.tsx     # NEW: Sheet for preview before starting
├── store/
│   └── workoutStore.ts         # EXTEND: add template CRUD actions + templates[]
└── types.ts                    # EXTEND: WorkoutTemplate if notes/restConfig needed
```

### Pattern 1: Exercise Catalog Type (new file)

**What:** Static TS file with `CatalogExercise[]` grouped by `muscleGroup`
**When to use:** Template builder exercise picker, template card display

```typescript
// src/data/exerciseCatalog.ts
export type CatalogExercise = {
  id: string
  name: string
  muscleGroup: string        // Portuguese label: 'Pernas', 'Costas', etc.
  focus: 'compound' | 'isolation' | 'pump'
  defaultRest: number        // seconds (parsed from program rest strings)
  videoUrl?: string
  imageUrl?: string
  notes?: string
}

export type CatalogGroup = {
  muscleGroup: string
  exercises: CatalogExercise[]
}

export const exerciseCatalog: CatalogExercise[] = [...]

export const catalogByMuscleGroup: CatalogGroup[] = [...]
```

**Source mapping:** IDs from `treinoDani.ts` and `treinoWesley.ts` — deduplication needed (no shared IDs found in review). Wesley IDs use `-wes` suffix to avoid collision.

**muscleGroup assignment** (derived from session structure — D-03):
- Dani sessions: Treino A = Pernas/Glúteos; Treino B = Superior (Costas/Ombros); Treino C = Superior (Peito/Braços) + Core
- Wesley sessions: Superior A (Peito/Costas/Ombros); Inferior B (Pernas); Full C

Suggested Portuguese labels: `'Pernas'`, `'Glúteos'`, `'Peito'`, `'Costas'`, `'Ombros'`, `'Braços'`, `'Core'`, `'Panturrilha'`

### Pattern 2: Store Template Actions

**What:** Extend `WorkoutStore` type and implementation with template CRUD
**When to use:** All template data mutations

```typescript
// Additions to WorkoutStore type in workoutStore.ts
templates: WorkoutTemplate[]
saveTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => Promise<string>
deleteTemplate: (id: string) => Promise<void>
updateTemplate: (id: string, patch: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>) => Promise<void>
duplicateTemplate: (id: string) => Promise<string>
loadTemplates: () => Promise<void>   // called in init() for active user
```

**init() extension:** Add `db.templates.where('userId').equals(activeUserId).toArray()` to the `loadUserData` parallel Promise.all.

**switchUser extension:** Reload templates when switching users (follow same pattern as workouts/exerciseLogs).

### Pattern 3: Save-from-Workout

**What:** Post-finish action in `SessionDetail.tsx` that clones current session state into a template
**When to use:** After `logSession` completes, before navigating away

```typescript
// Construct template from current session state
const templateExercises = session.exercises.map((ex) => ({
  exerciseId: ex.id,
  defaultSets: exerciseState[ex.id].sets.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    completed: false,   // reset completed flag
  })),
}))
await saveTemplate({ userId: activeUserId, name: suggestedName, exercises: templateExercises })
```

**Placement (Claude's discretion):** A Dialog/Sheet prompt after `logSession` resolves, before the celebration animation navigates away. OR: a persistent button on the post-workout summary if a summary screen exists.

### Pattern 4: Start-from-Template Pre-fill

**What:** Navigate to `/session/:id` with template data pre-loaded into `exerciseState`
**When to use:** User confirms start from template preview

```typescript
// Pre-fill pattern — template exercises override createDefaultSets()
// Pass template data via router state or a transient store slice
navigate(`/session/${sessionType}`, { state: { templateId: template.id } })
```

`SessionDetail` reads `location.state?.templateId`, looks up the template from store, and initializes `exerciseState` from `template.exercises[n].defaultSets` instead of `createDefaultSets()`.

**Note:** SessionDetail currently reads exercises from `program.sessions` (hardcoded program). Starting from a template with exercises not in the active program means the session exercises must come from the template + catalog lookup, not from program session. This is a significant integration point — the planner must decide: (a) only allow "start from template" for sessions that match a program session type, or (b) create a new "free session" mode that uses template exercises directly. [ASSUMED] Option (b) is likely required per D-07/D-08 but SessionDetail's current architecture assumes program-driven sessions. Flag for implementation decision.

### Anti-Patterns to Avoid

- **Storing catalog in Dexie:** D-01 locks this as a static TS file. Do not create a migrations or Dexie table for exercises.
- **Mutating `WorkoutTemplate` without zod validation:** The existing `templateSchema` in `workoutStore.ts` must cover any new fields added to the type.
- **Using `rest` string from programTypes.ts directly as `defaultRest`:** The program uses string ranges ("2–3 min", "60–90s"). Catalog must store `defaultRest` as a number (seconds). Parse or hardcode during catalog creation.
- **Coupling start-from-template to `SessionType` ('A'|'B'|'C'):** Templates are user-defined and may not map to a session type. The session routing or state must accommodate a "free" mode.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-to-reorder exercises | Custom touch drag | `@dnd-kit/sortable` | Touch events, accessibility, keyboard nav edge cases |
| Swipe-to-reveal actions | Custom pointer events | `@use-gesture/react` or CSS-only approach | Velocity, cancel gesture, iOS rubber-band |
| Modal/sheet for builder | Custom overlay | shadcn `Sheet` | Already used in project (ExerciseRestSheet) |
| Template ID generation | Custom UUID | `makeId()` (existing helper) | Already uses `crypto.randomUUID` |
| Input validation | Manual checks | Extend existing `templateSchema` (zod) | Schema already defined in workoutStore.ts |

**Key insight:** Swipe actions (D-11) are the highest-risk custom component. CSS-only swipe with `translate-x` and a click-outside reset is feasible for mobile-only and avoids a dependency.

---

## Common Pitfalls

### Pitfall 1: WorkoutTemplate type gap for rest config

**What goes wrong:** D-05 says template captures rest times, but the current `WorkoutTemplate` type only has `{ exerciseId, defaultSets }` — no `restSeconds` per exercise.
**Why it happens:** Type was stubbed in Phase 1 before full template spec was defined.
**How to avoid:** Check whether `WorkoutTemplate.exercises` needs a `restSeconds?: number` field. If yes, add it, extend the zod schema, and handle in store actions. Also check if `ExportBundle` import/export needs updating.
**Warning signs:** Template builder has no way to capture configured rest times.

### Pitfall 2: SessionDetail program-coupling blocks template-driven sessions

**What goes wrong:** `SessionDetail` derives ALL exercises from `useActiveProgram()`. A template may contain exercises from both users' programs or custom exercises not in any program session.
**Why it happens:** The entire session screen was built assuming a `SessionType` ('A'|'B'|'C') that maps to `program.sessions`.
**How to avoid:** Either (a) add a parallel code path in `SessionDetail` that accepts template exercises via router state, OR (b) create `TemplateSession.tsx` as a sibling route at `/session/template/:templateId`. Option (b) is cleaner but more work.
**Warning signs:** Starting from a template that contains exercises not in the program session throws — exercises won't be found in `program.sessions.find(...)`.

### Pitfall 3: Dexie `templates` table not loaded in `init()`

**What goes wrong:** `workoutStore.ts` has `templates: WorkoutTemplate[]` in the schema validation but the store's `init()` and `loadUserData()` do NOT load templates from Dexie — only workouts and exerciseLogs are loaded.
**Why it happens:** Store was scaffolded with template support but the load path was not implemented.
**How to avoid:** Extend `loadUserData()` to include `db.templates.where('userId').equals(userId).toArray()` and add `templates` to the `set({...})` call.
**Warning signs:** Templates page renders empty even after creating templates.

### Pitfall 4: Exercise ID collision between treinoDani and treinoWesley

**What goes wrong:** Some exercise IDs appear to be intentionally namespaced (`-wes` suffix in Wesley's program) but shared conceptual exercises (e.g., `standing-calf-raise` vs `standing-calf-raise-wes`) will appear as separate catalog entries.
**Why it happens:** Programs were built independently.
**How to avoid:** During catalog creation, decide: keep both as separate entries (more catalog entries, cross-user) or merge duplicates under canonical IDs. D-02 says catalog is universal — merging where exercise is truly the same is correct.
**Warning signs:** Catalog picker shows duplicate exercises.

### Pitfall 5: `defaultRest` units

**What goes wrong:** Program files store rest as strings ("2–3 min", "60–90s", "90s"). Catalog needs `defaultRest: number` (seconds) for use in rest timer.
**Why it happens:** No parsing utility exists for these strings.
**How to avoid:** During catalog file creation, manually convert each exercise's rest range to a single representative seconds value (e.g., "2–3 min" → 150, "60–90s" → 75, "90s" → 90).
**Warning signs:** Rest timer receives NaN or starts with 0 seconds when launched from a template session.

---

## Code Examples

### Existing Dexie query pattern [VERIFIED: codebase]

```typescript
// src/store/workoutStore.ts — follow this pattern for template queries
const getUserTemplates = (userId: UserId) =>
  db.templates
    .where('userId')
    .equals(userId)
    .toArray()
```

### Existing store action pattern [VERIFIED: codebase]

```typescript
// Follow logSession() pattern for saveTemplate()
saveTemplate: async ({ name, exercises }) => {
  const id = makeId()
  const userId = get().activeUserId
  const template: WorkoutTemplate = { id, userId, name, exercises, createdAt: new Date().toISOString() }
  await db.templates.put(template)
  set((state) => ({ templates: [template, ...state.templates] }))
  return id
},
```

### Existing shadcn Sheet usage [VERIFIED: codebase]

`ExerciseRestSheet` at `src/components/ExerciseRestSheet.tsx` — use as reference for the template builder Sheet component pattern.

### Router state pre-fill pattern [ASSUMED]

```typescript
// In template preview — navigate with state
navigate('/session/free', { state: { templateId: template.id } })

// In session component — read state
const { state } = useLocation()
const templateId = state?.templateId
```

---

## Runtime State Inventory

> Not applicable — this is a greenfield feature phase, not a rename/refactor/migration.

None — no existing runtime state carries template data (the templates table is empty in all user databases since this feature doesn't exist yet).

---

## Environment Availability

> Phase is code-only. No new external tools required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vitest + jsdom | Tests | ✓ | (installed) | — |
| @testing-library/react | Tests | ✓ | (installed) | — |
| @dnd-kit/core | Drag reorder (discretionary) | check package.json | unknown | CSS-only reorder with up/down buttons |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + jsdom |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TMPL-04 | Exercise catalog exports non-empty array grouped by muscle group | unit | `npx vitest run src/data/exerciseCatalog.test.ts` | Wave 0 |
| TMPL-01 | `saveTemplate` stores template in Dexie and Zustand state | unit | `npx vitest run src/store/workoutStore.test.ts` | ✅ (extend) |
| TMPL-01 | "Save as template" action appears in SessionDetail post-finish | integration | `npx vitest run src/routes/SessionDetail.test.tsx` | ✅ (extend) |
| TMPL-02 | Starting from template pre-fills session inputs with template weights | integration | `npx vitest run src/routes/Templates.test.tsx` | Wave 0 |
| TMPL-03 | `deleteTemplate` removes from Dexie and state | unit | `npx vitest run src/store/workoutStore.test.ts` | ✅ (extend) |
| TMPL-03 | `duplicateTemplate` creates new template with same exercises | unit | `npx vitest run src/store/workoutStore.test.ts` | ✅ (extend) |

### Wave 0 Gaps

- [ ] `src/data/exerciseCatalog.test.ts` — covers TMPL-04 catalog shape validation
- [ ] `src/routes/Templates.test.tsx` — covers TMPL-02 start-from-template pre-fill

---

## Security Domain

No new threat surface introduced. Templates are user-scoped by `userId` (same pattern as workouts/exerciseLogs). No network requests, no auth changes. ASVS V5 (input validation) covered by extending existing `templateSchema` in `workoutStore.ts`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@dnd-kit/core` is not installed — CSS/button reorder is the fallback | Standard Stack | Low: if installed, planner can use it; if not, button reorder works |
| A2 | Session pre-fill via `navigate(path, { state })` is the cleanest pattern for template → session handoff | Architecture Patterns | Medium: may need transient store slice if state is complex or survives refresh |
| A3 | "Free session" (template-driven, no program session type) requires a new code path in SessionDetail or a sibling route | Pitfall 2 | High: existing SessionDetail is fully program-coupled; misassigning this causes runtime crashes |
| A4 | `defaultRest` conversion from string ranges to seconds should be manual/hardcoded in catalog file | Pitfall 5 | Low: only affects rest timer defaults, easily corrected per-exercise |

---

## Open Questions

1. **Free session routing for template-driven workouts**
   - What we know: `SessionDetail` uses `useActiveProgram()` + `session.exercises` from the program. Templates may not map to A/B/C.
   - What's unclear: Should `SessionDetail` grow a "template mode" branch, or does a new `TemplateSessionDetail.tsx` route get created?
   - Recommendation: Planner should decide based on code duplication tolerance. New route is cleaner; branching in `SessionDetail` is faster.

2. **WorkoutTemplate type extension for rest config**
   - What we know: D-05 says full session clone includes rest times. Current type has no `restSeconds` per exercise.
   - What's unclear: Is capturing per-exercise rest in the template in scope for this phase?
   - Recommendation: Add `restSeconds?: number` to the exercises array item in `WorkoutTemplate`. Cost is low; omitting it leaves the rest timer at defaults when starting from a template.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `src/types.ts` — `WorkoutTemplate` type verified
- Codebase: `src/db/client.ts` — Dexie schema v4 with `templates` table verified
- Codebase: `src/store/workoutStore.ts` — template schema, empty state array, CRUD placeholders absent verified
- Codebase: `src/components/Layout.tsx` — Templates nav tab already wired verified
- Codebase: `src/App.tsx` — `/templates` route placeholder verified
- Codebase: `src/data/treinoDani.ts`, `treinoWesley.ts` — exercise IDs and fields verified
- Codebase: `vite.config.ts` — Vitest jsdom config verified

### Tertiary (LOW confidence — training knowledge)
- `@dnd-kit/core` as drag reorder standard — not verified against package.json

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in codebase
- Architecture: HIGH — patterns derived directly from existing codebase
- Pitfalls: HIGH — derived from direct code inspection of type gaps and coupling
- Test map: HIGH — existing test infra confirmed, gaps identified

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (stable codebase, 30-day window)
