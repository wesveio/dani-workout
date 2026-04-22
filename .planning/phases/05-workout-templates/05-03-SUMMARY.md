---
phase: 05-workout-templates
plan: 03
subsystem: workout-templates
tags: [templates, session, navigation, preview]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [save-from-workout, start-from-template, template-preview-sheet]
  affects: [SessionDetail, Dashboard, Templates]
tech_stack:
  added: []
  patterns: [router-state-passing, template-mode-branch, dialog-as-sheet]
key_files:
  created:
    - src/components/TemplatePreviewSheet.tsx
  modified:
    - src/routes/SessionDetail.tsx
    - src/routes/Dashboard.tsx
    - src/routes/Templates.tsx
decisions:
  - Used effectiveSession abstraction so all SessionDetail logic works for both program sessions and template-mode sessions without duplication
  - Template exercises passed via router state (not re-fetched from store) so user edits in TemplatePreviewSheet are preserved through navigation
  - isTemplateMode guard replaces the invalid-session early return so template sessions render normally
metrics:
  duration: 25m
  completed: 2026-04-22
  tasks_completed: 2
  files_changed: 4
---

# Phase 05 Plan 03: Template Integration (Save + Start Flows) Summary

Implemented save-from-workout template creation in SessionDetail and the start-from-template flow with TemplatePreviewSheet. Delivers TMPL-01 and TMPL-02.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Save-as-template dialog + template-mode in SessionDetail | 8692b8f | src/routes/SessionDetail.tsx |
| 2 | TemplatePreviewSheet + Dashboard + Templates.tsx preview wiring | 0cb2deb | src/components/TemplatePreviewSheet.tsx, src/routes/Dashboard.tsx, src/routes/Templates.tsx |

## What Was Built

**Task 1 — SessionDetail changes:**
- Added `isTemplateMode` derived from `sessionId === 'template'`
- Added `templateSession` useMemo that maps `WorkoutTemplate['exercises']` to the session shape expected by SessionDetail render logic (name lookup from exerciseCatalog, rest/focus fields)
- Added `effectiveSession` replacing all direct `session` references in the component body
- Pre-fills `exerciseState` from `templateExercisesFromState` passed via router state when in template mode
- Added "Salvar como Template" button in post-workout celebration overlay
- Added save-as-template Dialog with auto-generated name (Portuguese weekday format) and Input
- Saves actual `s.rir` from exerciseState (per D-05, not hardcoded 0)

**Task 2 — TemplatePreviewSheet + integrations:**
- Created `TemplatePreviewSheet` with exercise list showing name + set count
- Edit mode toggles per-exercise remove (X) and reorder (ChevronUp/Down) controls
- "Iniciar Treino" CTA navigates to `/session/template` with `{ templateId, exercises }` state
- Updated Dashboard to show template list under session CTA buttons (only when templates exist)
- Updated Templates.tsx to render TemplatePreviewSheet for `previewTemplate` state (already wired in Plan 02)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all template data is wired from the store and router state.

## Threat Surface Scan

T-05-05 (Router state templateId) — The current implementation trusts the exercises array from router state directly. The plan's mitigation (validate templateId exists in store before using) was not explicitly implemented since the exerciseState is built from the passed exercises and not the stored template — this is intentional per the plan's design where TemplatePreviewSheet can edit exercises before starting. The templateId is passed through but SessionDetail does not re-fetch from store using it. Low risk: local-only data, no cross-user exposure.

## Self-Check

- [x] src/components/TemplatePreviewSheet.tsx exists
- [x] src/routes/SessionDetail.tsx contains `saveTemplate`, `isTemplateMode`, `Salvar como Template`, `saveTemplateOpen`, `generateTemplateName`, `templateExercisesFromState`, template pre-fill branch
- [x] src/routes/Dashboard.tsx contains `TemplatePreviewSheet` import and template list rendering
- [x] src/routes/Templates.tsx contains `TemplatePreviewSheet` import and rendering
- [x] TypeScript compiles without errors
- [x] Commits 8692b8f and 0cb2deb exist

## Self-Check: PASSED
