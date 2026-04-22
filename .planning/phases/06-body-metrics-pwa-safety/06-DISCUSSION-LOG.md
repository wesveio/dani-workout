# Phase 6: Body Metrics + PWA Safety - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 06-body-metrics-pwa-safety
**Areas discussed:** Progress photos, Body metrics UX, Trend visualization

---

## Progress Photos

| Option | Description | Selected |
|--------|-------------|----------|
| Camera + gallery | Snap photo or pick from phone gallery | ✓ |
| Gallery only | Pick existing photos, simpler | |
| Camera only | Take in-app, forces consistent framing | |

**User's choice:** Camera + gallery
**Notes:** Most flexible for gym use

---

| Option | Description | Selected |
|--------|-------------|----------|
| Timeline gallery | Sorted by date, newest first, scrollable grid | ✓ |
| By pose category | Tag each photo (front/side/back), compare across dates | |
| Side-by-side compare | Pick two dates, see photos next to each other | |

**User's choice:** Timeline gallery
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Compress + warn | Auto-compress ~200KB, storage bar, warn on limit | ✓ |
| Compress aggressively | ~100KB thumbnails only, max space savings | |
| Full quality + limit count | Original quality, cap ~50 photos | |

**User's choice:** Compress + warn
**Notes:** Balance between quality and storage safety on iOS Safari

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include photos | Full backup with base64 photos, larger file | ✓ |
| No, exclude photos | Metadata only, photos stay device-local | |

**User's choice:** Yes, include photos as base64
**Notes:** Complete backup is priority

---

## Body Metrics UX

| Option | Description | Selected |
|--------|-------------|----------|
| Quick-log weight + optional extras | Primary weight input, expandable measurements | ✓ |
| Full form every time | All fields visible always | |
| Separate screens per metric | Dedicated screen per measurement type | |

**User's choice:** Quick-log weight + optional extras
**Notes:** Optimized for daily weigh-ins, minimal friction

---

| Option | Description | Selected |
|--------|-------------|----------|
| New tab in bottom nav | Dedicated 'Corpo' or 'Medidas' tab | ✓ |
| Inside Progress route | Sub-section of existing Progress page | |
| Inside Settings | Under profile/settings | |

**User's choice:** New tab in bottom nav
**Notes:** Direct access for daily-use feature

---

| Option | Description | Selected |
|--------|-------------|----------|
| Edit + delete with confirmation | Tap to edit, swipe/long-press to delete | ✓ |
| Edit only, no delete | Correct mistakes but can't remove | |
| You decide | Claude picks matching existing UX | |

**User's choice:** Edit + delete with confirmation
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Metric only — kg/cm | Brazilian users use metric | ✓ |
| User-selectable metric/imperial | Settings toggle for kg/lb and cm/in | |

**User's choice:** Metric only — kg/cm
**Notes:** Keep simple for target audience

---

## Trend Visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Line chart + period selector | Tabs for 1M/3M/6M/1Y/All, matches ExerciseProgressChart | ✓ |
| Line chart + rolling average | Raw data + 7-day moving average overlay | |
| You decide | Claude picks best Recharts approach | |

**User's choice:** Line chart + period selector
**Notes:** Matches existing chart patterns

---

| Option | Description | Selected |
|--------|-------------|----------|
| One multi-line chart | All measurements on same chart, toggleable lines | ✓ |
| Separate chart per metric | Dedicated chart for each measurement | |
| Table only, no chart | Data table instead of visualization | |

**User's choice:** One multi-line chart
**Notes:** Compact, easy to compare across metrics

---

| Option | Description | Selected |
|--------|-------------|----------|
| No goal line | Just show actual data, keep simple | ✓ |
| Optional goal line | User sets target weight, dashed line on chart | |
| You decide | Claude decides based on complexity | |

**User's choice:** No goal line
**Notes:** Avoid settings complexity for v1

---

## Claude's Discretion

- iOS install banner (UI-04): full implementation details
- Progress photo grid layout, thumbnail sizing
- ProgressPhoto type definition
- Dexie table strategy for photos
- Image compression approach
- Chart styling and responsive behavior
- Nav tab icon and label
- Empty states

## Deferred Ideas

- Side-by-side photo comparison (transformation view)
- Pose categorization (front/side/back)
- Goal weight line on chart
- Imperial unit support
