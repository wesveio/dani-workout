# Phase 3: UI Redesign + Rest Timer - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Bold dark theme overhaul, restructured navigation, mobile-first gym optimization, and integrated rest timer with ring countdown and alerts. All existing screens get the new visual treatment. Timer integrates into the workout session flow.

**Note:** UI-04 (iOS Safari install banner) is listed in both Phase 3 and Phase 6 requirements in ROADMAP.md. Traceability table maps it to Phase 6. Treating as Phase 6 scope — not included here.

</domain>

<decisions>
## Implementation Decisions

### Theme & visual identity
- **D-01:** Full palette overhaul — new color system, not just polish. Hevy energy + Strong data clarity as combined reference.
- **D-02:** Accent color strategy at Claude's discretion — research Hevy/Strong palettes and pick what works for gym context. Current green (#4EFF74) and blue (#4495FF) are not locked.
- **D-03:** Typography at Claude's discretion — Space Grotesk may stay or change. Refine type scale regardless.
- **D-04:** Always-dark theme (no light mode) — this is locked from PROJECT.md.

### Navigation architecture
- **D-05:** Navigation structure at Claude's discretion — current 4-tab bottom pill nav can be reorganized. Must accommodate future Templates (Phase 5) and Body Metrics (Phase 6) without another nav redesign.
- **D-06:** Header structure at Claude's discretion — current header shows profile name + program info. Can be simplified or restructured as part of the redesign.
- **D-07:** Two-tap rule: user must reach any major screen in two taps maximum (from success criteria).

### Rest timer presentation
- **D-08:** Timer presentation at Claude's discretion — full-screen overlay, floating bar, or inline card. Pick best gym UX.
- **D-09:** Ring animation: circular ring that depletes clockwise as time runs out (Apple Watch style). User-decided.

### Timer behavior
- **D-10:** Global default rest time + per-exercise override. Most exercises use the default. Override stored per exercise.
- **D-11:** Timer auto-starts immediately when a set is saved. No prompt, no confirmation. Skip button available to dismiss.
- **D-12:** Alert: short beep/chime + vibration on timer expiry. Subtle, not disruptive in gym.
- **D-13:** Background survival via Date.now() delta (not setInterval). When app returns to foreground, timer shows correct remaining time instantly. If timer expired while locked, show "rest complete" state.

### Claude's Discretion
- Full color palette values (background, surface, accent, secondary, semantic colors)
- Font choice and type scale (sizes, weights, line heights)
- Navigation tab count, labels, icons, and grouping strategy
- Header layout and information density
- Timer visual placement (overlay vs floating bar vs inline)
- Timer ring size, colors, animation easing
- Component restyling (cards, buttons, inputs, badges)
- Mobile touch target sizes and spacing
- Gradient/glow effects for premium feel
- Loading and empty state treatments in new theme

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` §UI/UX Redesign — UI-01, UI-02, UI-03 requirements
- `.planning/REQUIREMENTS.md` §Rest Timer — REST-01, REST-02, REST-03, REST-04 requirements
- `.planning/REQUIREMENTS.md` §Workout Logging UX — LOG-05 (auto-start rest timer)
- `.planning/ROADMAP.md` §Phase 3 — Success criteria and dependency on Phase 2

### Prior phase context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Data layer decisions, Dexie schema context
- `.planning/phases/02-multi-user-profiles/02-CONTEXT.md` — Profile switcher UX (D-04, D-07), header structure, avatar system

### Current implementation (must understand before modifying)
- `src/components/Layout.tsx` — Current header + bottom nav + page structure
- `src/index.css` — Current theme CSS, gradients, animations, Space Grotesk import
- `tailwind.config.js` — Current color tokens, font config, shadow/radius values
- `src/App.tsx` — Route structure, lazy loading, fallback UI
- `src/lib/rest.ts` — Existing `parseRestDuration` and `formatRestClock` utilities
- `src/components/ui/` — shadcn component library (14 components)
- `src/routes/SessionDetail.tsx` — Workout session screen where timer will integrate

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `rest.ts`: `parseRestDuration` (parses natural language rest times) and `formatRestClock` (MM:SS format) — use for timer logic
- shadcn `Dialog` component — potential base for timer overlay if overlay approach chosen
- shadcn `Badge`, `Button`, `Card` — restyle, don't replace
- `ProfileSwitcher` component — keep in header (from Phase 2), restyle to match new theme
- Tailwind color tokens in `tailwind.config.js` — replace values, keep token names for migration ease
- `celebration-pop` and `float-spark` CSS animations — existing animation patterns to follow

### Established Patterns
- Tailwind semantic tokens: `background`, `foreground`, `surface`, `muted`, `accent`, `neutral`, `card`
- Bottom nav: pill-shaped floating bar with rounded-full, shadow-soft
- Header: sticky top with backdrop-blur
- Lazy route loading with Suspense fallback
- Lucide icons for navigation

### Integration Points
- `Layout.tsx`: Primary target — header, nav, page wrapper all get redesigned
- `tailwind.config.js` + `index.css`: Color system replacement
- `SessionDetail.tsx`: Timer integration point — after set logging
- `workoutStore.ts`: Timer state management (active timer, remaining seconds, per-exercise config)
- All route components: Will inherit new theme through Tailwind tokens, but may need component-level adjustments

</code_context>

<specifics>
## Specific Ideas

- Mix of Hevy (bold, energetic, neon) and Strong (clean, data-focused) — bold but not cluttered
- Ring countdown depletes clockwise like Apple Watch timer
- Short beep/chime for timer alert — gym-appropriate, not alarming
- Timer starts instantly on set save — zero friction during workout flow

</specifics>

<deferred>
## Deferred Ideas

- UI-04 (iOS Safari "Add to Home Screen" banner) — belongs in Phase 6 per traceability table
- UI-04 duplicate listing in Phase 3 ROADMAP.md requirements should be corrected

</deferred>

---

*Phase: 03-ui-redesign-rest-timer*
*Context gathered: 2026-04-21*
