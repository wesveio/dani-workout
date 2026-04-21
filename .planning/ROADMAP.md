# Roadmap: Dani Workout

## Overview

Transform a cluttered POC workout logger into a clean, bold, market-level fitness app. The work flows from data layer foundations through multi-user profiles, a full UI overhaul with integrated rest timers, exercise history/progression, workout templates, and body metrics — delivered as an offline-first PWA.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Broaden data types, migrate Dexie schema, extend export/import format
- [ ] **Phase 2: Multi-User Profiles** - Create, switch, edit, and delete local profiles with isolated data
- [ ] **Phase 3: UI Redesign + Rest Timer** - Bold dark theme, restructured navigation, integrated rest timer with alerts
- [ ] **Phase 4: Exercise History + Logging UX** - Streamlined set entry, PR detection, per-exercise history and progression charts
- [ ] **Phase 5: Workout Templates** - Exercise catalog extraction, template CRUD, start-from-template flow
- [ ] **Phase 6: Body Metrics + PWA Safety** - Bodyweight and measurement tracking, iOS install banner

## Phase Details

### Phase 1: Foundation
**Goal**: The data layer supports all v1 features without structural debt
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):
  1. UserId accepts any string (not just hardcoded literal), existing data is unaffected
  2. Dexie database opens on v4/v5 schema with profiles, templates, and bodyMetrics tables present
  3. Export file includes all new data types and can be re-imported without data loss
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Types broadening + Dexie v4 schema migration with profile seeding (TDD)
- [x] 01-02-PLAN.md — Export/import format versioning + Zod schema broadening (TDD)

### Phase 2: Multi-User Profiles
**Goal**: Multiple people can use the app on the same device with fully isolated data
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. User can create a new profile with a name and begin logging immediately
  2. User can switch profiles and see only that profile's workouts and data
  3. User can edit their profile name and avatar
  4. User can delete a profile and all associated data is removed
**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Store actions (createProfile, updateProfile, deleteProfile) + data layer migration (TDD)
- [x] 02-02-PLAN.md — ProfileSwitcher dropdown + CreateProfileDialog + Layout.tsx migration
- [x] 02-03-PLAN.md — Settings "Meu Perfil" section with edit + delete flows
- [x] 02-04-PLAN.md — data/users.ts cleanup + human verification checkpoint

### Phase 3: UI Redesign + Rest Timer
**Goal**: The app looks and feels like a premium gym tool with an integrated rest timer
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-04, REST-01, REST-02, REST-03, REST-04, LOG-05
**Success Criteria** (what must be TRUE):
  1. App displays bold always-dark theme across all screens with energetic accent colors
  2. Navigation is clearly structured so user can reach any major screen in two taps
  3. All touch targets and typography are sized for one-handed gym use on mobile
  4. Rest timer starts automatically after a set is logged and counts down with a visible ring animation
  5. Vibration and audio alert fire when timer reaches zero, even after phone is locked
**Plans:** 4 plans
**UI hint**: yes

Plans:
- [ ] 03-01-PLAN.md — Theme color system overhaul + 5-tab navigation redesign + header simplification
- [ ] 03-02-PLAN.md — Rest timer hook + audio alert utility (TDD)
- [ ] 03-03-PLAN.md — Timer UI components + SessionDetail integration + per-exercise rest config
- [ ] 03-04-PLAN.md — Full suite verification + human visual/functional checkpoint

### Phase 4: Exercise History + Logging UX
**Goal**: Users can log sets fast and clearly see how they are progressing on each exercise
**Depends on**: Phase 3
**Requirements**: LOG-01, LOG-02, LOG-03, LOG-04, HIST-01, HIST-02, HIST-03
**Success Criteria** (what must be TRUE):
  1. User can log weight and reps for a set in a single inline row without extra taps
  2. Previous session's weight and reps appear next to each current input field
  3. Cursor advances automatically to the next set after saving
  4. A PR badge appears on the set when a personal record is detected
  5. User can view full history and a progression chart (weight, volume, estimated 1RM) for any exercise
**Plans**: TBD

### Phase 5: Workout Templates
**Goal**: Users can save and reuse workouts as templates, eliminating repetitive setup
**Depends on**: Phase 4
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04
**Success Criteria** (what must be TRUE):
  1. Exercise catalog is queryable as standalone data (no hardcoded inline references)
  2. User can save any completed workout as a reusable template
  3. User can start a new workout session from a saved template with one tap
  4. User can edit, duplicate, and delete saved templates
**Plans**: TBD

### Phase 6: Body Metrics + PWA Safety
**Goal**: Users can track body composition over time and the app is safe to use on iOS Safari
**Depends on**: Phase 5
**Requirements**: BODY-01, BODY-02, BODY-03, UI-04
**Success Criteria** (what must be TRUE):
  1. User can log bodyweight and see a trend chart over time
  2. User can log manual body measurements (waist, hips, chest, arms) with date stamps
  3. User can store dated progress photos
  4. iOS Safari users see a persistent banner prompting them to add the app to their home screen
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planning complete | - |
| 2. Multi-User Profiles | 0/4 | Planning complete | - |
| 3. UI Redesign + Rest Timer | 0/4 | Planning complete | - |
| 4. Exercise History + Logging UX | 0/TBD | Not started | - |
| 5. Workout Templates | 0/TBD | Not started | - |
| 6. Body Metrics + PWA Safety | 0/TBD | Not started | - |
