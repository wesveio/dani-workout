# Requirements: Dani Workout

**Defined:** 2026-04-21
**Core Value:** Users can log workouts fast with minimal friction and see their progression clearly over time.

## v1 Requirements

Requirements for v1.0 Full Redesign. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: UserId type broadened from literal union to dynamic string
- [ ] **FOUND-02**: Dexie schema migrated with profiles, templates, bodyMetrics tables
- [ ] **FOUND-03**: Export/import format extended to include all new data types

### Profiles

- [ ] **PROF-01**: User can create a new local profile with name
- [ ] **PROF-02**: User can switch between local profiles on same device
- [ ] **PROF-03**: User can edit profile name and avatar
- [ ] **PROF-04**: User can delete a profile and all associated data

### Workout Logging UX

- [ ] **LOG-01**: User can log a set with inline entry (weight + reps in one row)
- [ ] **LOG-02**: User sees previous session's weight/reps next to current input
- [ ] **LOG-03**: User gets auto-advance to next set input after completing a set
- [ ] **LOG-04**: User sees PR badge when a personal record is detected on save
- [ ] **LOG-05**: Rest timer starts automatically when a set is completed

### Rest Timer

- [ ] **REST-01**: User can configure rest duration per exercise (30s, 60s, 90s, custom)
- [ ] **REST-02**: User sees visual ring countdown animation during rest
- [ ] **REST-03**: User receives vibration + audio alert when timer expires
- [ ] **REST-04**: Timer survives phone lock/background (Date.now delta, not setInterval)

### Exercise History

- [ ] **HIST-01**: User can view full history of past performances for each exercise
- [ ] **HIST-02**: User can see progression chart (weight/volume over time) per exercise
- [ ] **HIST-03**: User can see estimated 1RM (Epley formula) tracked over time

### Templates

- [ ] **TMPL-01**: User can save a completed workout as a reusable template
- [ ] **TMPL-02**: User can start a new workout from a saved template with one tap
- [ ] **TMPL-03**: User can edit, duplicate, and delete saved templates
- [ ] **TMPL-04**: Exercise catalog extracted as standalone queryable data (prerequisite)

### Body Metrics

- [ ] **BODY-01**: User can log bodyweight and see trend chart over time
- [ ] **BODY-02**: User can log manual body measurements (waist, hips, chest, arms)
- [ ] **BODY-03**: User can take and store progress photos with date stamps

### UI/UX Redesign

- [ ] **UI-01**: App uses bold/energetic always-dark theme (shadcn CSS overrides)
- [ ] **UI-02**: Navigation restructured with clear information architecture
- [ ] **UI-03**: All screens optimized for mobile-first gym use (touch targets, spacing, typography)
- [ ] **UI-04**: iOS Safari users see persistent "Add to Home Screen" banner

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Programs

- **PROG-01**: User can build custom multi-week programs from templates
- **PROG-02**: User can schedule program phases with auto-progression

### Social

- **SOCL-01**: User can share workout summaries
- **SOCL-02**: User can compare progress with training partner

### Advanced

- **ADV-01**: Swipe-to-complete gesture for sets
- **ADV-02**: Profile PIN lock for shared devices

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/cloud sync | Stays offline-first PWA, no infrastructure cost |
| OAuth/social login | Local profiles only, no auth server needed |
| Video exercise guides | Complexity not justified for v1 |
| Real-time chat | Not a social app |
| Custom program builder | Highest complexity, deferred to v2 per research |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| LOG-01 | Phase 4 | Pending |
| LOG-02 | Phase 4 | Pending |
| LOG-03 | Phase 4 | Pending |
| LOG-04 | Phase 4 | Pending |
| LOG-05 | Phase 3 | Pending |
| REST-01 | Phase 3 | Pending |
| REST-02 | Phase 3 | Pending |
| REST-03 | Phase 3 | Pending |
| REST-04 | Phase 3 | Pending |
| HIST-01 | Phase 4 | Pending |
| HIST-02 | Phase 4 | Pending |
| HIST-03 | Phase 4 | Pending |
| TMPL-01 | Phase 5 | Pending |
| TMPL-02 | Phase 5 | Pending |
| TMPL-03 | Phase 5 | Pending |
| TMPL-04 | Phase 5 | Pending |
| BODY-01 | Phase 6 | Pending |
| BODY-02 | Phase 6 | Pending |
| BODY-03 | Phase 6 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-04-21 after roadmap creation*
