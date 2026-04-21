# Phase 1: Foundation - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Broaden data types, migrate Dexie schema, and extend export/import format so the data layer supports all v1 features (profiles, templates, body metrics) without structural debt. No UI changes in this phase.

</domain>

<decisions>
## Implementation Decisions

### Profile data model
- **D-01:** Profiles are minimal — name + avatar color/emoji only. No embedded programs.
- **D-02:** Profiles live in their own dedicated Dexie table (`profiles`) with `id` as primary key.
- **D-03:** Migration auto-creates profile records for existing 'dani' and 'wesley' users from current hardcoded data. Seamless transition — users see their profiles immediately.

### Export format versioning
- **D-04:** Auto-upgrade old exports on import — detect format version, fill missing fields with defaults. Old backups remain importable.
- **D-05:** Exports are per-profile (one profile's data per file). Matches current behavior.

### Migration safety
- **D-06:** Zero data loss required. Migration must preserve all existing workouts and exercise logs. New tables added alongside existing ones. If migration fails, old data stays intact. Write tests to verify.
- **D-07:** Skip multi-tab version conflict handling — personal app used by 2 people, not worth the complexity.

### Claude's Discretion
- Table schemas for `profiles`, `templates`, and `bodyMetrics` — Claude designs fields and indexes based on downstream phase requirements (FOUND-02 scope)
- Exact Dexie version bump strategy (v3→v4 or v3→v4→v5 etc.)
- Export format version marker implementation
- How to decouple programs from profiles (currently `UserProfile` embeds `Program`)
- Zod schema updates for broadened UserId

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data layer
- `.planning/REQUIREMENTS.md` §Foundation — FOUND-01, FOUND-02, FOUND-03 requirements
- `.planning/ROADMAP.md` §Phase 1 — Success criteria for foundation work

### Current implementation (must understand before modifying)
- `src/types.ts` — Current type definitions including `UserId` literal union
- `src/db/client.ts` — Dexie schema at version 3, migration history v1→v2→v3
- `src/store/workoutStore.ts` — Zustand store with Zod validation, import/export logic
- `src/data/users.ts` — Hardcoded user profiles with embedded programs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `db/client.ts`: Dexie instance with established migration pattern (v1→v2→v3) — extend with v4+
- `store/workoutStore.ts`: Import/export logic with Zod validation — extend for new format
- `data/users.ts`: `UserProfile` type — basis for profile table schema (strip `program` field)

### Established Patterns
- Dexie compound indexes: `[userId+date]`, `[userId+exerciseId]` — follow same pattern for new tables
- Zod validation on import: `importSchema` validates structure before writing — extend for new data types
- Settings table key-value pattern: `user:{userId}` for per-user settings, `app` for global state

### Integration Points
- `UserId` type in `types.ts` — every file importing this type needs to accept `string`
- `useWorkoutStore` — `activeUserId` state drives all data queries, needs to work with dynamic profiles
- `users.ts` exports (`getUserProfile`, `getProgramForUser`) — called throughout app, must remain functional during transition

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. This is plumbing work.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-21*
