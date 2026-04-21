---
phase: 03-ui-redesign-rest-timer
reviewed: 2026-04-21T12:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - src/App.tsx
  - src/components/ExerciseRestSheet.tsx
  - src/components/Layout.tsx
  - src/components/RestTimerCard.tsx
  - src/hooks/useRestTimer.ts
  - src/index.css
  - src/lib/audio.ts
  - src/lib/rest.ts
  - src/routes/SessionDetail.tsx
  - src/store/workoutStore.ts
  - src/types.ts
  - tailwind.config.js
  - src/hooks/useRestTimer.test.ts
  - src/lib/audio.test.ts
  - src/lib/rest.test.ts
  - src/routes/SessionDetail.test.tsx
  - src/store/workoutStore.test.ts
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-21
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Reviewed 12 source files and 5 test files for the UI redesign and rest timer feature. The implementation is solid overall -- the rest timer hook uses Date.now-based drift correction, the ring animation handles visibility changes, and the store integration is clean. Found no security vulnerabilities or critical bugs. Three warnings relate to stale state in the rest sheet dialog, a draft-always-wins pattern that could mask program changes, and AudioContext accumulation. Two info items note minor quality concerns.

## Warnings

### WR-01: ExerciseRestSheet initializes state from prop only on mount

**File:** `src/components/ExerciseRestSheet.tsx:16-18`
**Issue:** `useState(currentSeconds)` captures the prop value at mount time. If the Dialog component reuses the same instance across different exercises (i.e., does not unmount on `open` toggle), `selected` and `customValue` will show stale values from the previously opened exercise. Whether this triggers depends on the Dialog implementation -- if Radix Dialog keeps the subtree mounted when `open=false`, the stale state persists.
**Fix:** Reset state when `currentSeconds` changes or when the dialog opens:
```tsx
import { useState, useEffect } from 'react'

// Inside the component, after state declarations:
useEffect(() => {
  if (open) {
    setSelected(currentSeconds)
    setCustomValue(String(currentSeconds))
    setCustomMode(false)
  }
}, [open, currentSeconds])
```

### WR-02: Draft from localStorage always overrides initialExerciseState

**File:** `src/routes/SessionDetail.tsx:248-261`
**Issue:** The useEffect unconditionally sets `initialExerciseState`, then immediately overwrites it with the localStorage draft if one exists. If the program structure changes (e.g., exercise added/removed, set count changed due to recovery toggle), the stale draft silently overrides the new structure. The user sees outdated exercise/set layout with no indication that the program changed.
**Fix:** Validate draft structure against `initialExerciseState` before applying. At minimum, check that the draft has the same exercise keys:
```tsx
useEffect(() => {
  setExerciseState(initialExerciseState);
  const stored = localStorage.getItem(draftKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Record<string, ExerciseState>;
      // Only apply draft if exercise keys match current program
      const draftKeys = Object.keys(parsed).sort().join(',');
      const currentKeys = Object.keys(initialExerciseState).sort().join(',');
      if (draftKeys === currentKeys) {
        setExerciseState(parsed);
        setHasUnsaved(true);
      } else {
        console.warn('Draft structure mismatch, discarding stale draft.');
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      console.warn('Draft invalido, removendo.', err);
      localStorage.removeItem(draftKey);
    }
  }
}, [initialExerciseState, draftKey]);
```

### WR-03: playChime creates a new AudioContext on every call

**File:** `src/lib/audio.ts:3`
**Issue:** Each invocation of `playChime()` creates a new `AudioContext`. Browsers typically limit active AudioContext instances (Chrome allows ~6 before logging warnings, Safari may be stricter). Since `playChime` is called on every timer completion, and a user may complete many sets in a session, this can accumulate contexts. Browsers may also block or delay context creation.
**Fix:** Reuse a single AudioContext, lazily created:
```typescript
let _ctx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  return _ctx
}

export function playChime(): void {
  try {
    const ctx = getAudioContext()
    // ... rest of implementation unchanged
  } catch {
    // AudioContext blocked or unsupported -- fail silently
  }
}
```

## Info

### IN-01: console.error calls left in production store code

**File:** `src/store/workoutStore.ts:195,217,236,255,277`
**Issue:** Multiple `console.error(err)` calls in catch blocks. These will appear in user browser consoles in production. Consider using a structured logger or removing them in favor of the user-facing error state that is already set.
**Fix:** Remove or gate behind a development check: `if (import.meta.env.DEV) console.error(err)`

### IN-02: Timer ring transition visual jump on rapid start/skip cycles

**File:** `src/components/RestTimerCard.tsx:18-32`
**Issue:** The `visibilitychange` handler disables then re-enables the SVG transition to avoid jump on tab return. However, if a user rapidly skips and restarts the timer, the `strokeDashoffset` jumps from its current animated position to the new value. The inline `style={{ transition: 'stroke-dashoffset 0.5s linear' }}` means every restart animates from the old offset. This is a cosmetic issue, not a bug.
**Fix:** No action required. If desired, reset transition to `none` in the `start` callback before the next frame.

---

_Reviewed: 2026-04-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
