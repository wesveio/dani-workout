# Phase 5: Workout Templates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 05-workout-templates
**Areas discussed:** Exercise catalog extraction, Template creation flow, Start-from-template UX, Template management

---

## Exercise Catalog Extraction

### Where should the exercise catalog live?

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded catalog file (Recommended) | Static TS file with all known exercises. Simple, no DB migration. | ✓ |
| Dexie exercises table | Exercises stored in IndexedDB. Users can add custom exercises. | |
| Hybrid: static defaults + custom in DB | Ship built-in + let users add custom ones in Dexie. | |

**User's choice:** Hardcoded catalog file

### What exercise metadata matters for templates?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: name + muscle group | Just enough to identify and categorize. | |
| Medium: name + muscle group + type + default rest | Include classification and suggested rest time. | |
| Rich: carry over current Exercise fields | Keep focus, rest, videoUrl, notes from current type. | ✓ |

**User's choice:** Rich metadata

### Strip program-specific fields?

| Option | Description | Selected |
|--------|-------------|----------|
| Strip program-specific fields (Recommended) | Catalog Exercise = universal fields only. | ✓ |
| Keep everything as-is | Same Exercise type for catalog and programs. | |

**User's choice:** Strip program-specific fields (prescriptions, rir, optionalVolumeBump)

---

## Template Creation Flow

### How should users create templates?

| Option | Description | Selected |
|--------|-------------|----------|
| Save from completed workout (Recommended) | After finishing session, "Salvar como template". | |
| Both: save from workout + create from scratch | Save-from-workout PLUS template builder. | ✓ |
| Create from scratch only | Template builder screen, no save shortcut. | |

**User's choice:** Both creation paths

### What gets captured when saving from workout?

| Option | Description | Selected |
|--------|-------------|----------|
| Exercise order + set count only (Recommended) | Template = exercises + set count. No weights. | |
| Exercise order + sets + last weights | Also captures weights/reps as defaults. | |
| Full session clone | Everything including notes, rest times, weights. | ✓ |

**User's choice:** Full session clone

### Exercise selection in from-scratch builder?

| Option | Description | Selected |
|--------|-------------|----------|
| Search + add from catalog (Recommended) | Search bar over catalog list, tap to add. | |
| Grouped by muscle | Browse by muscle group, tap to add. | ✓ |
| You decide | Claude picks best UX. | |

**User's choice:** Grouped by muscle group

---

## Start-from-Template UX

### Where does user pick a template to start?

| Option | Description | Selected |
|--------|-------------|----------|
| New workout screen (Recommended) | "Novo Treino" shows template list first. | |
| Templates tab, then "Iniciar" | Go to Templates screen, find template, tap start. | |
| Both entry points | Start from either new-workout flow or templates tab. | ✓ |

**User's choice:** Both entry points

### Modify exercises before session starts?

| Option | Description | Selected |
|--------|-------------|----------|
| No, start immediately (Recommended) | One tap → session starts with template loaded. | |
| Yes, preview + edit first | Show contents, let user modify, then confirm start. | ✓ |

**User's choice:** Preview + edit before starting

### Pre-fill weights/reps from template?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, pre-fill as defaults (Recommended) | Template values appear in inputs, user can change. | ✓ |
| Show as reference only | Ghost text/labels, inputs start empty. | |
| You decide | Claude picks best approach. | |

**User's choice:** Pre-fill as editable defaults

---

## Template Management

### Template list display?

| Option | Description | Selected |
|--------|-------------|----------|
| Cards with exercise summary (Recommended) | Card per template: name + exercise count + muscle groups. | ✓ |
| Simple list rows | Compact list with name and exercise count. | |
| You decide | Claude picks best layout. | |

**User's choice:** Cards with exercise summary

### Edit/duplicate/delete actions?

| Option | Description | Selected |
|--------|-------------|----------|
| Swipe or long-press menu (Recommended) | Swipe left reveals actions. Or long-press opens sheet. | ✓ |
| Tap to open, actions inside | Detail view with action buttons at bottom. | |
| Three-dot menu per card | ⋮ menu button per card with dropdown. | |

**User's choice:** Swipe or long-press

### Where in navigation?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Templates tab (Recommended) | Own tab in bottom nav alongside Treinos, Histórico. | ✓ |
| Inside existing Treinos section | Sub-section within workouts area. | |
| You decide | Claude picks based on Phase 3 nav structure. | |

**User's choice:** Dedicated Templates tab

---

## Claude's Discretion

- Card visual design, muscle group icons, sort order
- Swipe vs long-press implementation
- Template builder reorder mechanism and set config UI
- "Save as template" prompt placement in post-workout flow
- Template naming (auto-suggest or manual)
- Empty state design
- Exercise search within muscle groups
- Mapping existing program exercises to catalog IDs

## Deferred Ideas

None — discussion stayed within phase scope
