---
phase: 03-ui-redesign-rest-timer
plan: 01
subsystem: ui-theme-navigation
tags: [tailwind, css, layout, navigation, theming]
dependency_graph:
  requires: []
  provides: [color-tokens, css-globals, layout-header, 5-tab-nav, templates-route]
  affects: [all-components]
tech_stack:
  added: []
  patterns: [radial-gradient-bg, accent-dot-nav-indicator, sticky-header, fixed-bottom-nav]
key_files:
  created: []
  modified:
    - tailwind.config.js
    - src/index.css
    - src/components/Layout.tsx
    - src/App.tsx
decisions:
  - "Active nav indicator changed from filled bg-accent pill to accent dot below icon — preserves foreground icon readability with 5 tabs in narrow pill"
  - "Templates route rendered inline in App.tsx (not a lazy component) — trivial placeholder, no lazy overhead needed"
metrics:
  duration: 100s
  completed_date: "2026-04-21"
  tasks_completed: 2
  files_modified: 4
---

# Phase 3 Plan 01: Theme + Navigation Foundation Summary

Bold dark theme with red/orange palette, 5-tab navigation, and templates placeholder — visual foundation for all Phase 3 UI work.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace color tokens and update CSS globals | 5da9238 | tailwind.config.js, src/index.css |
| 2 | Redesign Layout header and 5-tab navigation + templates placeholder | 89180fc | src/components/Layout.tsx, src/App.tsx |

## What Was Built

**Task 1 — Color tokens + CSS globals:**
- Tailwind palette replaced: `#0D0D0D` background, `#FF3D3D` accent, `#FF8C00` accentSecondary, `#888888` muted, `#1A1A1A` surface/card, `#2A2A2A` neutral, `#EF4444` destructive (new token)
- Body radial gradient updated from green/blue to red/orange accents
- Timer animation keyframes added: `timer-card-enter`, `timer-card-exit` (ready for Plan 03 rest timer)

**Task 2 — Layout + Navigation:**
- Header simplified: shows "Dani" h1 (28px semibold) with ProfileSwitcher on right; no program/week info
- 5-tab nav: Inicio, Treino (was Semana), Historico, Templates, Config
- Active state: accent dot below icon instead of filled pill — fits 5 tabs in narrow pill
- 44px min-height touch targets on all nav items
- Removed unused imports: `useWorkoutStore`, `useActiveProgram`, `getCurrentWeekNumber`, `Badge`, `Button`, `useNavigate`
- `/templates` route added to App.tsx with "Em breve" placeholder

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| src/App.tsx (line ~71) | `/templates` route renders "Em breve" placeholder | Intentional per plan; Phase 5 will implement full templates feature |

## Verification

- `tsc --noEmit`: passes with zero errors for plan files
- 88 tests pass; 1 test file failed (`useRestTimer.test.ts`) in a parallel worktree agent's work — pre-existing, out of scope
- Build errors in `WeekView.tsx` and `workoutStore.ts` are pre-existing from other parallel agents, not caused by this plan

## Self-Check: PASSED

Files created/modified:
- tailwind.config.js: FOUND
- src/index.css: FOUND
- src/components/Layout.tsx: FOUND
- src/App.tsx: FOUND

Commits:
- 5da9238: FOUND
- 89180fc: FOUND
