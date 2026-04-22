---
phase: 05-workout-templates
plan: "02"
subsystem: templates-ui
tags: [templates, ui, components, react]
dependency_graph:
  requires: [05-01]
  provides: [templates-tab-ui, template-card, exercise-picker, template-builder]
  affects: [src/App.tsx, src/routes/Templates.tsx]
tech_stack:
  added: []
  patterns: [shadcn-dialog-as-bottom-sheet, swipe-gesture-css, staggered-animation]
key_files:
  created:
    - src/components/TemplateCard.tsx
    - src/components/ExercisePicker.tsx
    - src/components/TemplateBuilderSheet.tsx
    - src/routes/Templates.tsx
  modified:
    - src/App.tsx
    - src/index.css
decisions:
  - "Used up/down arrow buttons for reorder instead of drag library — simpler, no new dependency"
  - "Swipe-to-delete uses CSS transform with touchstart/touchmove/touchend — no library needed"
  - "ExercisePicker closes after selecting an exercise to reduce friction in builder flow"
  - "fade-slide-up keyframe added to index.css alongside existing animation keyframes"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-22T18:04:21Z"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
---

# Phase 05 Plan 02: Templates UI Summary

Templates tab UI built with TemplateCard list, ExercisePicker grouped catalog browser, and TemplateBuilderSheet for full create/edit flows wired to Zustand store actions.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TemplateCard + ExercisePicker + TemplateBuilderSheet | 7744b95 | src/components/TemplateCard.tsx, src/components/ExercisePicker.tsx, src/components/TemplateBuilderSheet.tsx |
| 2 | Templates route + App.tsx wiring | c3accb8 | src/routes/Templates.tsx, src/App.tsx, src/index.css |

## What Was Built

**TemplateCard** (`src/components/TemplateCard.tsx`): Template list card with muscle group badges derived from exerciseCatalog lookup, CSS swipe-to-delete gesture (translateX on touch events, 80px reveal zone), inline confirmation state ("Tem certeza?"), long-press DropdownMenu (500ms timer), and three overflow actions (Editar, Duplicar, Excluir).

**ExercisePicker** (`src/components/ExercisePicker.tsx`): Bottom sheet Dialog (max-h 85vh) with search Input (case-insensitive substring filter), horizontal-scroll muscle group Tabs, grouped section headers when "Todos" tab active with no search, 52px exercise rows with Plus button, and excluded exercise dimming.

**TemplateBuilderSheet** (`src/components/TemplateBuilderSheet.tsx`): Bottom sheet Dialog for create/edit with name Input (save disabled when empty — T-05-03 mitigation), exercise list with set count steppers (Minus/count/Plus), up/down reorder arrows, X remove buttons, "Adicionar Exercício" ghost button opening ExercisePicker, and footer save button calling `saveTemplate` or `updateTemplate` based on `initial` prop.

**Templates route** (`src/routes/Templates.tsx`): Full-page route with header ("Templates"/"Treinos" sub-label), "Novo Template" ghost button, staggered card grid, empty state with LayoutTemplate icon and "Nenhum template ainda" copy, and TemplateBuilderSheet rendered at bottom. `onStart` sets previewTemplate for Plan 03 integration.

**App.tsx**: Replaced inline placeholder with `const Templates = lazy(() => import('./routes/Templates'))` and `<Route path="/templates" element={<Templates />} />`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added fade-slide-up keyframe to index.css**
- **Found during:** Task 2 implementation
- **Issue:** Templates.tsx uses `animation: 'fade-slide-up 180ms ease-out forwards'` inline style but the keyframe did not exist in index.css
- **Fix:** Added `@keyframes fade-slide-up` to index.css alongside existing animation keyframes
- **Files modified:** src/index.css
- **Commit:** c3accb8

## Threat Mitigations Applied

| Threat ID | Mitigation | Location |
|-----------|------------|----------|
| T-05-03 | Save button disabled when `name.trim()` is empty | TemplateBuilderSheet.tsx line ~96 (`canSave` guard) |

## Known Stubs

- `previewTemplate` state in Templates.tsx is set on `onStart` but no TemplatePreviewSheet is rendered yet — intentional, wired in Plan 03 per UI-SPEC "Start-from-Template Flow"

## Self-Check

- [x] src/components/TemplateCard.tsx exists
- [x] src/components/ExercisePicker.tsx exists
- [x] src/components/TemplateBuilderSheet.tsx exists
- [x] src/routes/Templates.tsx exists
- [x] Commit 7744b95 exists
- [x] Commit c3accb8 exists
- [x] TypeScript compiles without errors (npx tsc --noEmit: no output)

## Self-Check: PASSED
