# Feature Landscape

**Domain:** Offline-first PWA workout tracker (mobile-first, gym use, Brazilian Portuguese)
**Researched:** 2026-04-21
**Reference apps:** Hevy, Strong, FitNotes, JEFIT

---

## Workout Logging UX (Minimal Taps)

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Inline set entry (weight + reps on same row) | Every top app does this. Anything else feels slow. | Low | Strong's core advantage is speed here |
| Auto-advance to next set input after logging | Eliminates tap to select next field | Low | Strong fires this automatically |
| "Log set" with one tap / swipe | Must not require confirmation dialog | Low | Modal confirmation = friction killer |
| Previous performance shown next to current set | Users need reference without navigating away | Low | Hevy shows prior session left of each set |
| Active workout persistent/sticky (survives navigation) | Users check timers, browse music, switch apps | Medium | Draft autosave already exists — extend it |
| Exercise search fast + filtered | Users shouldn't scroll 1,300 exercises | Low | JEFIT's bloated DB is the anti-pattern |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Swipe-to-complete set gesture | Faster than tapping "done" | Medium | Mobile-native feel |
| Quick-add last session as template | One tap to repeat last workout | Low | Depends on: workout history storage |
| Plate calculator overlay | Saves mental math mid-set | Low | Nice-to-have for serious lifters |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Confirmation modals for routine actions | Adds taps, interrupts flow | Undo gesture or swipe |
| Exercise video thumbnails during active workout | Visual noise, slow | Show on exercise detail only |
| Mandatory workout naming before logging | Friction at session start | Default to date/time, rename later |

---

## Rest Timer

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Auto-start timer on set completion | Expected by all top apps (Strong, Hevy, Fitbod) | Low | Trigger: set marked done |
| Countdown visible without opening app | Users lock screen during rest | Medium | Web Notifications API + PWA background required |
| Per-exercise configurable duration | Compound lifts need longer rest than isolation | Low | Store default per exercise |
| +/- adjustment during active rest | On-the-fly extension when needed | Low | 15-second increments standard |
| Vibration/audio alert on completion | Users looking away from screen | Low | Navigator.vibrate() + Audio API |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Global default + per-exercise override | Power user flexibility | Low | Two-level config |
| Visual ring countdown (not just number) | At-a-glance readability | Low | CSS animation, no lib needed |
| Skip timer button | Don't block users ready early | Low | Trivial |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Timer as separate screen/page | Breaks workout flow | Persistent overlay or bottom sheet |
| No notification when app is backgrounded | PWA-specific fatal flaw | Web Notifications API — test thoroughly |

**Dependency:** Requires set completion event in workout logging flow.

---

## Exercise History & Progression Charts

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Per-exercise history list (date + sets/reps/weight) | Core reason users track | Low | Query Dexie by exerciseId |
| Progression chart (1RM or best set over time) | Visual progress = motivation | Medium | Recharts already in stack |
| Personal record (PR) detection + badge | Every app celebrates this | Low | Compare on save |
| Last session shown during active workout | Users need anchor to beat | Low | Dependency: same logging flow |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Volume over time chart (total load per session) | Shows accumulated work, not just peak | Low | Same chart, different metric |
| Estimated 1RM calculation (Epley formula) | Normalizes across rep ranges | Low | Simple math, high perceived value |
| Best set highlight per session | Dense data made readable | Low | Visual callout in history list |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Complex stats dashboard as default view | Overwhelming, JEFIT trap | Show simple chart first, stats on drill-down |
| Requiring users to select metric before viewing | Extra tap | Default to estimated 1RM, let users switch |

**Dependency:** Needs normalized exercise IDs across sessions (exercises must be referenceable by stable ID, not name string).

---

## Workout Templates + Custom Programs

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Save any completed workout as template | Natural, zero-friction creation | Low | "Save as template" at workout end |
| Start workout from template (with pre-filled exercises/sets) | Core utility of templates | Low | Clone template into active session |
| Create template from scratch (exercise picker + set targets) | Not every user has a completed workout first | Medium | Template editor screen |
| Edit/rename/delete templates | Basic CRUD | Low | — |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Program builder (ordered sequence of templates = a "week" or "block") | Dani's 12-week program is the exact use case | High | Multi-template sequence, day scheduling |
| Template duplication | Fast iteration on programs | Low | — |
| Notes per exercise in template | Cues, technique notes | Low | Simple text field |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Locking templates after sharing | This is local-only — no need | Skip entirely |
| AI program generation | Scope creep, backend dependency | Manual builder only |

**Dependency:** Templates depend on stable exercise IDs. Program builder depends on templates existing first.

---

## Body Metrics Tracking

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bodyweight log (date + value) | Most common metric users track | Low | Simple Dexie table |
| Bodyweight chart over time | Visual trend = motivation | Low | Recharts, same pattern as exercise charts |
| Manual measurement entry (waist, hips, etc.) | Secondary but expected | Low | Flexible key-value store per entry |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Progress photo capture + storage | Visual evidence scales can't show | High | IndexedDB stores binary blobs — test storage limits |
| Photo comparison side-by-side | Before/after motivation | High | Depends on: photo storage |
| Measurement chart per body part | Granular tracking | Medium | Recharts, same pattern |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| BMI calculation as primary metric | Widely discredited, misleads users | Show weight trend only |
| Progress photos synced to cloud | Violates offline-first constraint | Local blob storage only |
| 15+ measurement fields on one screen | Overwhelming (Bodly trap) | Start with weight + 3-4 key measurements |

**Dependency:** Body metrics is independent of workout logging — can be built as a separate section.

**Warning:** Progress photos stored in IndexedDB will consume significant storage. PWA storage quotas vary by browser. This feature needs feasibility validation before implementation.

---

## Multi-User Local Profiles

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create named profile (name + avatar color/emoji) | Identity without auth | Low | —  |
| Switch between profiles on one device | Shared device use case (family, couple) | Medium | All data reads/writes scoped by profileId |
| Profile-scoped data isolation | Users can't see each other's data | Medium | Dexie queries must always filter by profileId |
| Delete profile + all associated data | Privacy/data hygiene | Low | Cascade delete in Dexie |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Profile PIN/lock (optional) | Privacy on shared device | Medium | Simple 4-digit local PIN, no auth system needed |
| Per-profile settings (rest timer defaults, units) | Profiles feel truly separate | Low | Settings table keyed by profileId |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Cloud sync / account creation | Violates offline-first constraint | Local only |
| OAuth / social login | Unnecessary complexity | Named profile + optional PIN |
| "Guest mode" | Adds ambiguity | Every user is a named local profile |

**Dependency:** This is the highest-risk architectural feature. All other features depend on profileId being part of the data model. Must be implemented FIRST or retrofitting is painful.

---

## Feature Dependencies Map

```
Multi-User Profiles (profileId)
  └── ALL other features (everything scoped by profileId)

Stable Exercise IDs
  └── Exercise History & Progression Charts
  └── Per-exercise rest timer defaults
  └── Workout Templates

Workout Templates
  └── Program Builder (custom programs)

Set Completion Event (in logging flow)
  └── Rest Timer auto-start
  └── PR detection

Recharts (already exists)
  └── Progression charts
  └── Body metrics charts
```

---

## MVP Recommendation

Build in this order to unblock dependencies:

1. **Multi-user profiles** — unblocks everything. All data model changes happen here first.
2. **Workout logging UX overhaul** — redesign existing flow, add previous-performance display, set completion event
3. **Rest timer** — requires set completion event; high user value, low complexity
4. **Exercise history + progression charts** — requires stable exercise IDs; existing Recharts makes this low effort
5. **Workout templates** — save/load pattern, depends on stable exercise IDs
6. **Body metrics tracking** — independent module, can slot in anywhere after core loop
7. **Custom programs / program builder** — depends on templates; highest complexity, can be deferred to v1.1

Defer: Progress photos (storage feasibility unknown), Program builder (complex, non-blocking for initial release).

---

## Sources

- [Hevy vs Strong: UX Comparison 2026](https://gymgod.app/blog/strong-vs-hevy)
- [Hevy Exercise History & Progress Features](https://www.hevyapp.com/features/gym-progress/)
- [Hevy Rest Timer Feature](https://www.hevyapp.com/features/workout-rest-timer/)
- [Hevy Body Measurements Tracking](https://www.hevyapp.com/features/track-body-measurements/)
- [Strong App UI/UX Case Study](https://medium.com/@hwaijunyap/ui-ux-case-study-strong-workout-app-redesign-fc22afbada65)
- [FitNotes Routines](http://www.fitnotesapp.com/routines/)
- [JEFIT Critical Review](https://dr-muscle.com/jefit-review-alternative/)
- [5 UI/UX Mistakes in Fitness Apps](https://www.sportfitnessapps.com/blog/5-uiux-mistakes-in-fitness-apps-to-avoid)
- [Best UX/UI Design Practices for Fitness Apps 2025](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/)
- [MacroFactor Progress Photos + Body Metrics](https://macrofactorapp.com/progress-photos-and-body-measurement-tracker)
