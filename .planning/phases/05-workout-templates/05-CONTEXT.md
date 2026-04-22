# Phase 5: Workout Templates - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Exercise catalog extraction from hardcoded program files into standalone queryable data, template CRUD (save from workout + create from scratch), and start-from-template flow with preview/edit step. Templates become first-class citizens with dedicated nav tab.

</domain>

<decisions>
## Implementation Decisions

### Exercise catalog extraction (TMPL-04)
- **D-01:** Hardcoded static TypeScript file — exercises defined as a catalog array, no Dexie table. New exercises added in code updates only.
- **D-02:** Rich metadata but stripped of program-specific fields. Catalog Exercise = universal fields only: id, name, muscleGroup, focus, defaultRest, videoUrl, imageUrl, notes. Program-specific fields (prescriptions, rir, optionalVolumeBump) stay in program definitions.
- **D-03:** Exercises grouped by muscle group in the catalog (used for browsing in template builder).

### Template creation flow (TMPL-01)
- **D-04:** Two creation paths: save from completed workout + create from scratch via builder.
- **D-05:** Save-from-workout captures full session clone — exercise order, set count, weights, reps, notes, rest times. Template is an exact copy of that workout.
- **D-06:** Create-from-scratch builder uses grouped-by-muscle exercise picker. User browses catalog by muscle group (Peito, Costas, Pernas...), taps to add, configures set count per exercise.

### Start-from-template flow (TMPL-02)
- **D-07:** Both entry points available: "Novo Treino" screen shows template list + "Treino em branco" option, AND templates tab has "Iniciar" action per template.
- **D-08:** Preview + edit step before starting — user sees template contents, can add/remove/reorder exercises, then confirms to start session.
- **D-09:** Pre-fill weights/reps from template into session inputs as editable defaults. Values come from the full-clone template data.

### Template management (TMPL-03)
- **D-10:** Card-based list showing template name + exercise count + muscle groups targeted. Consistent with Phase 3 card patterns.
- **D-11:** Swipe left or long-press to reveal Edit/Duplicate/Delete actions. Mobile-native action patterns.
- **D-12:** Dedicated Templates tab in bottom navigation. Phase 3 nav was designed to accommodate this.

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` §Templates — TMPL-01, TMPL-02, TMPL-03, TMPL-04 requirements
- `.planning/ROADMAP.md` §Phase 5 — Success criteria, dependency on Phase 4

### Prior phase context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Dexie templates table schema, WorkoutTemplate type
- `.planning/phases/03-ui-redesign-rest-timer/03-CONTEXT.md` — Nav structure (D-05: designed to accommodate Templates), theme/card patterns

### Current implementation (must understand before modifying)
- `src/types.ts` — `WorkoutTemplate` type (id, userId, name, exercises, createdAt)
- `src/db/client.ts` — Dexie templates table with `&id, userId, [userId+name]` indexes
- `src/data/programTypes.ts` — Current `Exercise` type with program-specific fields (source for catalog extraction)
- `src/data/treinoDani.ts` — Dani's program exercises (source data for catalog)
- `src/data/treinoWesley.ts` — Wesley's program exercises (source data for catalog)
- `src/components/Layout.tsx` — Bottom nav where Templates tab will be added
- `src/routes/SessionDetail.tsx` — Session screen where "save as template" action lives post-workout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WorkoutTemplate` type in `types.ts` — already defined, may need extension for full-clone data (weights, rest times)
- Dexie `templates` table — already created in Phase 1 migration, ready for use
- `programTypes.ts` Exercise type — source for catalog exercise fields (strip program-specific ones)
- Phase 3 card components and dark theme — reuse for template cards
- `useRestTimer` hook — rest time data available for template capture

### Established Patterns
- Zustand store pattern (`workoutStore.ts`) — extend for template CRUD actions
- Dexie table access pattern from `db/client.ts` — follow for template reads/writes
- shadcn Dialog/Sheet components — use for template builder and save-as-template modals
- Profile-scoped data pattern (`userId` field) — templates already use this

### Integration Points
- Bottom nav in `Layout.tsx` — add Templates tab
- `SessionDetail.tsx` post-workout flow — add "Salvar como template" action
- "Novo Treino" flow — template picker before session starts
- Exercise catalog — new file, referenced by template builder and template display

</code_context>

<specifics>
## Specific Ideas

- Exercise picker grouped by muscle group (Peito, Costas, Pernas...) — Portuguese muscle group labels
- Full session clone means template captures everything: exercises, sets, weights, reps, notes, rest config
- Pre-fill behavior: template weights/reps appear in inputs as editable defaults when starting from template
- Preview+edit step: user can modify template contents before starting session (not immediate start)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-workout-templates*
*Context gathered: 2026-04-22*
