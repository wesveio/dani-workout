# Phase 3: UI Redesign + Rest Timer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 03-ui-redesign-rest-timer
**Areas discussed:** Theme & visual identity, Navigation architecture, Rest timer presentation, Timer behavior & alerts

---

## Theme & visual identity

| Option | Description | Selected |
|--------|-------------|----------|
| Polish current theme | Keep existing colors/font. Add depth: gradients, glow, elevation. | |
| Full palette overhaul | New color system inspired by Hevy/Strong. New accents, typography, components. | ✓ |
| Keep palette, restyle components | Same colors/font, redesign all component styles for premium feel. | |

**User's choice:** Full palette overhaul
**Notes:** User wants full redesign, not just polish.

| Option | Description | Selected |
|--------|-------------|----------|
| Green primary, blue secondary | Keep current scheme. | |
| Green for progress/success only | Reserve green for progress. Different accent for CTAs. | |
| You decide | Claude picks accent strategy. | ✓ |

**User's choice:** You decide (Claude's discretion)

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Space Grotesk | Already loaded, refine type scale. | |
| Switch font | Different font for gym feel. | |
| You decide | Claude picks based on research. | ✓ |

**User's choice:** You decide (Claude's discretion)

| Option | Description | Selected |
|--------|-------------|----------|
| Hevy (dark, bold, neon) | Primary inspiration. | |
| Strong (clean, minimal dark) | More minimal, data-focused. | |
| Mix of both | Hevy energy + Strong data clarity. | ✓ |
| Something else | Different reference. | |

**User's choice:** Mix of both — Hevy's energy with Strong's data clarity

---

## Navigation architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 4 tabs, nest new stuff | Templates and body metrics under existing sections. | |
| 5 tabs max | Expand to 5 tabs for key features. | |
| 3 tabs + hamburger/more | Reduce to 3 primary tabs + more button. | |
| You decide | Claude designs nav based on fitness app best practices. | ✓ |

**User's choice:** You decide (Claude's discretion)

| Option | Description | Selected |
|--------|-------------|----------|
| Simplify header | Minimal — avatar + screen title. Program info to dashboard. | |
| Keep current structure | Profile + program info in header. | |
| You decide | Claude decides based on overall nav design. | ✓ |

**User's choice:** You decide (Claude's discretion)

---

## Rest timer presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen overlay | Timer takes over screen. Big ring. Can't interact until dismissed. | |
| Floating bottom bar | Compact bar at bottom. Workout content stays visible. | |
| Inline card in session | Timer card between sets. Scrolls with content. | |
| You decide | Claude picks best gym UX. | ✓ |

**User's choice:** You decide (Claude's discretion)

| Option | Description | Selected |
|--------|-------------|----------|
| Circular ring (depleting) | Full circle depletes clockwise. Apple Watch style. | ✓ |
| Circular ring (filling) | Empty circle fills up. | |
| You decide | Claude picks. | |

**User's choice:** Circular ring (depleting)

---

## Timer behavior & alerts

| Option | Description | Selected |
|--------|-------------|----------|
| Global default + per-exercise override | Default rest time in settings. Override per exercise. | ✓ |
| Per-exercise only | Each exercise has own rest time. No global. | |
| Quick-pick during session | Quick-pick buttons when timer starts. Remembers per exercise. | |

**User's choice:** Global default + per-exercise override

| Option | Description | Selected |
|--------|-------------|----------|
| Immediately auto-start | Timer begins on set save. No prompt. | ✓ |
| Auto-start with skip option | Auto-start but skip button prominent. | |
| Prompt first | Ask user before starting timer. | |

**User's choice:** Immediately auto-start

| Option | Description | Selected |
|--------|-------------|----------|
| Short beep/chime | Quick, subtle. Gym-appropriate. | ✓ |
| Bold alarm tone | Clear, cuts through noise. | |
| Vibration only | No sound. Relies on phone contact. | |
| You decide | Claude picks. | |

**User's choice:** Short beep/chime

| Option | Description | Selected |
|--------|-------------|----------|
| Resume with correct time | Shows correct remaining time. If expired, shows "rest complete." | ✓ |
| You decide | Claude handles recovery UX. | |

**User's choice:** Resume with correct time

---

## Claude's Discretion

- Full color palette (all token values)
- Font choice and type scale
- Navigation structure (tabs, labels, icons, grouping)
- Header layout and info density
- Timer visual placement (overlay/bar/inline)
- Timer ring size, colors, animation
- Component restyling
- Touch targets and spacing
- Accent color strategy

## Deferred Ideas

- UI-04 (iOS Safari install banner) — Phase 6 scope, not Phase 3
