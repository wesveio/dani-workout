# Research Summary: Dani Workout v1.0 Full Redesign

## Executive Summary

- Existing stack nearly complete — only 2 new deps: `react-timer-hook` + `browser-image-compression`
- Multi-user profiles must be Phase 1 — `profileId` touches every data layer, retrofitting compounds
- Rest timer already exists in code but needs UX overhaul (Date.now delta, not setInterval counter)
- iOS PWA pitfalls are critical: Safari 7-day eviction + background timer throttling need intentional handling
- Reference apps: Hevy/Strong set the bar for logging UX (minimal taps, auto-advance, auto-rest-timer)

## Stack Additions

| Package | Version | Feature |
|---------|---------|---------|
| `react-timer-hook` | ^3.0.7 | Rest timer countdown state |
| `browser-image-compression` | ^2.0.2 | Body metrics photo compression |

No other new deps needed. Recharts, Dexie blobs, TailwindCSS dark mode, Web Notifications API — all covered.

Dark theme: unconditional `<html class="dark">`, override shadcn/ui CSS custom properties. Accent color TBD in design phase.

## Feature Priorities

### Table Stakes (Must Have)
- Inline set entry, one-tap log, auto-advance to next set
- Previous performance shown next to current set
- Auto-start rest timer on set completion (configurable per exercise)
- Vibration + audio alert on timer expiry (iOS AudioContext fallback)
- Per-exercise history list + progression chart (estimated 1RM / best set)
- PR detection and badge on set save
- Save workout as template; start from template
- Bodyweight log + chart over time
- Multi-user local profiles with data isolation

### Differentiators (Should Have)
- Visual ring countdown (CSS animation)
- Volume-over-time chart + Epley 1RM formula
- Template duplication and exercise notes
- Profile PIN/lock for shared devices
- Manual body measurements (waist, hips, etc.)

### Deferred (v1.1+)
- Custom program builder (multi-template sequence) — highest complexity
- Progress photos — storage feasibility needs validation
- Swipe-to-complete gesture

## Architecture Decisions

- `UserId` literal → `string`. Update type + Zod schema together
- Dexie v4: `profiles` table, seed from `users.ts` in `upgrade()`
- Dexie v5: `templates`, `programs`, `bodyMetrics` tables (additive)
- `useActiveProgram()`: check Dexie for custom program first, fall back to built-in static
- `useRestTimer` hook: Date.now() delta, not interval counter; vibration callback
- New components: `RestTimerModal`, `ProfileSwitcher`, `ExerciseProgressChart`, Metrics route, Templates route

## Critical Pitfalls

1. **Never change Dexie primary keys** — Fatal UpgradeError. Keep `++id` as PK; `userId` as indexed field
2. **iOS background timer throttling** — Use Date.now() start + visibilitychange recalculation
3. **Safari 7-day IndexedDB eviction** — Ship "Add to Home Screen" banner for iOS Safari
4. **Zustand cache on profile switch** — Clear all user-data slices before loading new profile
5. **Template mutation corrupting history** — Deep-copy template data into workout instances

## Recommended Build Order

1. **Foundation** — Broaden UserId, Dexie v4+v5 migrations, ExportBundle extension
2. **Multi-User Profiles** — ProfileSwitcher, create/delete profiles, Zustand clear-on-switch
3. **UI Redesign + Rest Timer** — Dark theme, useRestTimer hook, RestTimerModal, alerts
4. **Exercise History + Progression** — History query, progression charts, PR detection, 1RM
5. **Workout Templates** — Exercise catalog extraction, template CRUD, start-from-template
6. **Body Metrics** — Bodyweight + measurements only (no photos until validated)
7. **PWA Install Prompt + Data Safety** — iOS install banner, export reminders, storage usage

## Research Flags

**Needs deeper research during planning:**
- Exercise catalog extraction (static lookup map vs Dexie `exercises` table)
- Progress photo feasibility (iOS Safari storage quota on installed PWA)
- Notification API behavior on iOS 16.4+ for installed PWAs

**Standard patterns (skip research):**
- Dexie additive migration — official documented pattern
- Date.now delta + visibilitychange — established PWA timer practice
- Recharts + existing compound indexes — well-trodden path

## Confidence: HIGH

All critical claims verified against official Dexie docs, WebKit blog, MDN, and direct codebase analysis.
