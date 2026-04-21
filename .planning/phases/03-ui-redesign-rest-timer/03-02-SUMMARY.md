---
phase: 03-ui-redesign-rest-timer
plan: 02
subsystem: ui
tags: [react, vitest, web-audio-api, page-visibility-api, hooks, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: src/lib/rest.ts (parseRestDuration, formatRestClock utilities)
provides:
  - useRestTimer hook: background-safe countdown using Date.now delta
  - playChime utility: two-tone Web Audio API chime
  - parseRestDuration 600s cap: input validation security constraint
affects:
  - 03-03 (UI wiring — imports useRestTimer and playChime)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Date.now delta timer: setInterval reads delta from epoch, not accumulates — survives background/lock"
    - "Module-level timer state (_startEpoch, _duration): survives React remounts"
    - "Page Visibility API: visibilitychange listener recalculates remaining on app foreground"
    - "AudioContext created inside function call (not module-level): avoids auto-play policy blocking"

key-files:
  created:
    - src/hooks/useRestTimer.ts
    - src/hooks/useRestTimer.test.ts
    - src/lib/audio.ts
    - src/lib/audio.test.ts
  modified:
    - src/lib/rest.ts
    - src/lib/rest.test.ts

key-decisions:
  - "Module-level _startEpoch and _duration instead of refs: timer survives component unmount/remount"
  - "AudioContext created inside playChime() not at module scope: avoids browser auto-play policy rejection"
  - "MAX_REST = 600 constant in rest.ts: caps all return paths uniformly (ASVS V5 input validation)"

patterns-established:
  - "Date.now delta pattern: always compute remaining as Math.ceil((duration - elapsed) / 1000), never accumulate"
  - "Fail-silent audio: entire playChime body wrapped in try/catch"

requirements-completed: [REST-03, REST-04]

# Metrics
duration: 2min
completed: 2026-04-21
---

# Phase 3 Plan 02: Background-Safe Rest Timer + Audio Alert Summary

**Date.now delta rest timer hook with Page Visibility API background recovery, two-tone Web Audio chime, and 600s parseRestDuration security cap — all TDD**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-21T20:57:06Z
- **Completed:** 2026-04-21T20:58:30Z
- **Tasks:** 1 TDD feature (RED + GREEN)
- **Files modified:** 6

## Accomplishments

- useRestTimer hook counts down via Date.now delta (not setInterval accumulation) — survives phone lock
- visibilitychange listener recalculates remaining when app returns to foreground
- playChime() creates AudioContext inside the call to satisfy browser auto-play policy
- navigator.vibrate called with [200, 100, 200] on timer expiry
- parseRestDuration caps at 600s max across all 5 return paths (ASVS V5 input validation)
- Full test suite: 38 tests passing, zero TypeScript errors

## Task Commits

1. **RED — Failing tests** - `860aec9` (test)
2. **GREEN — Implementation** - `cf38c1d` (feat)

## Files Created/Modified

- `src/hooks/useRestTimer.ts` — Background-safe timer hook with Date.now delta + visibilitychange
- `src/hooks/useRestTimer.test.ts` — 6 unit tests covering start/skip/countdown/expiry/duration
- `src/lib/audio.ts` — playChime() Web Audio API utility, C5+E5 two-tone chime
- `src/lib/audio.test.ts` — 2 tests: no-throw on missing AudioContext, AudioContext created inside call
- `src/lib/rest.ts` — parseRestDuration updated with MAX_REST=600 cap on all return paths
- `src/lib/rest.test.ts` — 2 cap tests appended to existing suite

## Decisions Made

- Module-level `_startEpoch` and `_duration` (not refs): timer survives React component remounts per RESEARCH Pitfall 3
- AudioContext created inside `playChime()` not at module scope: avoids browser auto-play policy rejection on page load
- Applied `Math.min(result, MAX_REST)` to all 5 return paths in `parseRestDuration`, including the `fallbackSeconds` path

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — hook exports are fully implemented. Plan 03 wires them into UI components.

## Threat Flags

None — T-03-03 mitigation (600s cap on parseRestDuration) was implemented as planned. T-03-04 (AudioContext DoS) accepted as per threat register.

## Next Phase Readiness

- useRestTimer and playChime are fully tested and ready for UI wiring (Plan 03)
- No blockers

---
*Phase: 03-ui-redesign-rest-timer*
*Completed: 2026-04-21*
