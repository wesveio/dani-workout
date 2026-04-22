# Phase 6: Body Metrics + PWA Safety - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers body composition tracking (weight, measurements, progress photos) and an iOS Safari "Add to Home Screen" install banner. Users can log metrics, view trends over time, and store dated photos — all offline-first in IndexedDB. The PWA install prompt ensures iOS users discover the home screen option.

</domain>

<decisions>
## Implementation Decisions

### Progress photos (BODY-03)
- **D-01:** Camera + gallery — user can snap a photo or pick from phone gallery via `<input type="file" accept="image/*" capture="environment">`.
- **D-02:** Timeline gallery layout — photos sorted by date (newest first), scrollable grid. Tap to view full-size.
- **D-03:** Auto-compress photos to ~200KB before storing. Show storage usage indicator. Warn user when approaching iOS IndexedDB quota.
- **D-04:** Photos included in export/import bundles as base64. Export file will be larger but backup is complete.

### Body metrics UX (BODY-01, BODY-02)
- **D-05:** Quick-log form — primary input is bodyweight (kg). Expandable "Medidas" section for waist/hips/chest/arms (all optional). Notes field. Optimized for daily weigh-ins with minimal friction.
- **D-06:** New bottom nav tab — dedicated tab (e.g., "Corpo" or "Medidas") for body metrics. Direct access since this is a daily-use feature.
- **D-07:** Edit + delete past entries with confirmation dialog. Tap entry to edit, long-press or swipe to delete.
- **D-08:** Metric units only — kg for weight, cm for measurements. No imperial conversion.

### Trend visualization (BODY-01, BODY-02)
- **D-09:** Bodyweight trend: line chart with period selector tabs (1M/3M/6M/1Y/All). Reuse Recharts + match ExerciseProgressChart patterns.
- **D-10:** Measurements chart: single multi-line chart with toggleable lines for waist/hips/chest/arms. Compact, easy to compare across metrics.
- **D-11:** No goal line — keep charts simple, show actual data only.

### iOS install banner (UI-04)
- **D-12:** Claude's Discretion — banner placement, timing, dismissal behavior, standalone detection, and re-prompt logic.

### Claude's Discretion
- iOS install banner full implementation (D-12)
- Progress photo grid layout (columns, thumbnail size, spacing)
- ProgressPhoto type definition (extend from existing BodyMetric pattern)
- New Dexie table for photos (or extend bodyMetrics — Claude decides)
- Image compression library choice and implementation
- Storage quota estimation approach
- Chart styling, colors, and responsive behavior
- Nav tab icon and label choice
- Entry form component structure and animations
- Empty states for charts and photo gallery

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data layer
- `.planning/phases/01-foundation/01-CONTEXT.md` — Dexie migration pattern, BodyMetric type, bodyMetrics table schema
- `src/types.ts` — Existing `BodyMetric` type (lines 60-70) and `ExportBundle` (lines 72-81)
- `src/db/client.ts` — Dexie schema with bodyMetrics table indexes `&id, userId, [userId+date], date`

### UI patterns
- `.planning/phases/03-ui-redesign-rest-timer/03-CONTEXT.md` — Theme decisions (D-01 to D-04), navigation architecture (D-05), always-dark theme
- `src/components/ExerciseProgressChart.tsx` — Existing Recharts chart pattern to match
- `src/components/Layout.tsx` — Bottom nav structure, add new tab here

### Requirements
- `.planning/REQUIREMENTS.md` — BODY-01, BODY-02, BODY-03, UI-04 definitions
- `.planning/ROADMAP.md` — Phase 6 success criteria

### Prior phase context
- `.planning/phases/02-multi-user-profiles/02-CONTEXT.md` — Profile-scoped data pattern (userId filtering)
- `.planning/phases/05-workout-templates/05-CONTEXT.md` — Recent phase patterns, export bundle extension

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BodyMetric` type in `src/types.ts` — already defined with weight, waist, hips, chest, arms, notes
- `bodyMetrics` Dexie table — already created in Phase 1 migration with userId+date compound index
- `ExportBundle` type — already includes `bodyMetrics?: BodyMetric[]`
- `ExerciseProgressChart` component — Recharts line chart pattern to replicate for body metrics
- Recharts v3.6.0 already in dependencies
- shadcn/ui components — Dialog, Sheet, Tabs available for form and chart UI

### Established Patterns
- Profile-scoped data: all queries filter by `userId` via compound indexes
- Zustand store actions for CRUD operations (see workoutStore)
- Lazy-loaded routes via `React.lazy()` in App.tsx
- Dark theme with Tailwind CSS custom properties

### Integration Points
- `src/components/Layout.tsx` — Add new nav tab for body metrics
- `src/App.tsx` — Add new lazy-loaded route
- `src/store/workoutStore.ts` — Add body metrics CRUD actions (or new dedicated store)
- `src/db/client.ts` — May need new table for progress photos (blobs)
- Export/import logic in workoutStore — extend for photo data

</code_context>

<specifics>
## Specific Ideas

- Quick-log optimized for daily weigh-ins — weight field is primary, measurements are expandable/optional
- Timeline gallery for photos — simple grid, no pose tagging (keep v1 simple)
- Storage-conscious: compress photos, show usage, warn on limits
- Complete export: photos included as base64 so backup is truly complete

</specifics>

<deferred>
## Deferred Ideas

- Side-by-side photo comparison (before/after transformation view) — could be v2 enhancement
- Pose categorization (front/side/back tagging) — adds complexity, skip for v1
- Goal weight line on chart — adds settings complexity, not needed for v1
- Imperial unit support — Brazilian users use metric, not needed now

</deferred>

---

*Phase: 06-body-metrics-pwa-safety*
*Context gathered: 2026-04-22*
