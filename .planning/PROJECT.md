# Dani Workout

## What This Is

Offline-first PWA workout tracker for logging exercises, tracking progression, and managing training programs. Multi-user support via local profiles on shared devices. Built with React/Vite/TypeScript/Tailwind, deployed on Netlify.

## Core Value

Users can log workouts fast with minimal friction and see their progression clearly over time.

## Current Milestone: v1.0 Full Redesign

**Goal:** Complete UX overhaul — transform cluttered workout logger into a clean, bold, market-level fitness app with multi-user support.

**Target features:**
- Full information architecture redesign (all screens)
- Bold/energetic dark theme visual redesign (Hevy/Strong vibes)
- Local multi-user profiles (switch users, separate data in IndexedDB)
- Rest timers with countdown between sets
- Exercise history & progression tracking (past weights/reps per exercise)
- Workout templates + custom program builder
- Body metrics tracking (weight, measurements, photos)
- Streamlined workout logging (fewer taps, smarter flow)

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- Workout logging (basic — exists but needs UX overhaul)
- Offline-first PWA with service worker
- Export/import data backup — Validated in Phase 1: Foundation (format versioning, auto-upgrade old exports)
- Progress visualization with charts
- Broadened data layer: UserId→string, Dexie v4, profiles/templates/bodyMetrics tables — Validated in Phase 1: Foundation

### Active

<!-- Current scope. Building toward these. -->

- [ ] Full UX/UI redesign with bold/energetic dark theme
- [ ] Multi-user local profiles
- [ ] Rest timer between sets
- [ ] Exercise history & progression tracking
- [ ] Workout templates + custom programs
- [ ] Body metrics tracking
- [ ] Streamlined workout logging flow

### Out of Scope

- Backend/cloud sync — stays offline-first PWA
- OAuth/social login — local profiles only
- Social features — not a social fitness app
- Video exercise guides — complexity not justified for v1

## Context

- Existing app is a POC built for Dani's 12-week training program (3x/week)
- Portuguese language UI (Brazilian Portuguese)
- Mobile-first design, used primarily on phone during gym sessions
- Current pain: too much information with poor organization across all screens
- Design inspiration: Hevy, Strong — bold dark themes with energetic accents
- Stack: React 19, Vite, TypeScript, TailwindCSS, shadcn/ui, Zustand, Dexie (IndexedDB)
- Deployed on Netlify as SPA

## Constraints

- **Platform**: PWA only, no native app — must work great in mobile browsers
- **Storage**: IndexedDB via Dexie — no server-side storage
- **Stack**: Keep React/Vite/TS/Tailwind/shadcn — no framework migration
- **Language**: Brazilian Portuguese UI
- **Offline**: Must work fully offline after first load

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local profiles over backend auth | Keep offline-first simplicity, no infrastructure cost | — Pending |
| Bold/energetic dark theme | User preference, matches gym context, Hevy/Strong inspiration | — Pending |
| Templates + custom programs | Flexibility: pre-built starting points + full customization | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-21 after Phase 1: Foundation complete*
