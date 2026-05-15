# Phase 3: UI Redesign + Rest Timer - Research

**Researched:** 2026-04-21
**Domain:** React + Tailwind CSS theme overhaul, SVG ring animation, Web Audio API, Vibration API, Page Visibility API
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-04:** Always-dark theme (no light mode)
- **D-07:** Two-tap rule: any major screen reachable in max two taps
- **D-09:** Ring animation depletes clockwise (Apple Watch style)
- **D-10:** Global default rest time + per-exercise override stored on the exercise
- **D-11:** Timer auto-starts immediately when a set is saved — no prompt, skip button to dismiss
- **D-12:** Alert: short beep/chime + vibration on timer expiry — subtle, not alarming
- **D-13:** Background survival via Date.now() delta. On foreground return, show correct remaining time instantly. If expired while locked, show "rest complete" state.

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

### Deferred Ideas (OUT OF SCOPE)
- UI-04 (iOS Safari "Add to Home Screen" banner) — Phase 6
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | App uses bold/energetic always-dark theme (shadcn CSS overrides) | Color system redesign via tailwind.config.js + index.css tokens |
| UI-02 | Navigation restructured with clear information architecture | Bottom nav tab reorganization in Layout.tsx; future-proof for Phase 5 (Templates) and Phase 6 (Body Metrics) |
| UI-03 | All screens optimized for mobile-first gym use (touch targets, spacing, typography) | 44px+ touch targets, 16px+ font scale, thumb-zone awareness |
| UI-04 | (Phase 6 scope — excluded) | — |
| REST-01 | User can configure rest duration per exercise (30s, 60s, 90s, custom) | Per-exercise config stored in workoutStore + Dexie; UI settings sheet per exercise |
| REST-02 | User sees visual ring countdown animation during rest | SVG stroke-dashoffset technique; CSS transition on inline style |
| REST-03 | User receives vibration + audio alert when timer expires | Navigator.vibrate() (Android/Chrome) + Web Audio API oscillator (all browsers) |
| REST-04 | Timer survives phone lock/background | Date.now() snapshot on start + Page Visibility API visibilitychange handler |
| LOG-05 | Rest timer starts automatically when a set is completed | Wire into set-complete handler in SessionDetail.tsx; call startRestTimer after set marked complete |
</phase_requirements>

---

## Summary

Phase 3 is split into two distinct domains that share one integration point: the visual redesign (theme, nav, component styles) and the rest timer (state, animation, alerts, background survival). The existing codebase already has partial timer infrastructure — `rest.ts` utilities (`parseRestDuration`, `formatRestClock`), a `restRunning`/`restSeconds` state pair in `SessionDetail.tsx`, and a footer with manual timer controls. This phase upgrades that implementation to auto-start on set completion, adds the ring animation, adds audio/vibration alerts, and fixes the `setInterval`-based approach to use `Date.now()` delta survival.

The theme overhaul is a token-replacement operation: `tailwind.config.js` color values and `index.css` globals change; all components inherit via existing Tailwind semantic tokens (`background`, `surface`, `accent`, etc.) with targeted component-level fixes. No new CSS framework is needed. Navigation gains a 5th tab slot for future phases without redesigning the nav shape.

The ring animation uses a plain SVG `<circle>` with `stroke-dashoffset` driven by inline style from React state. No animation library is required — CSS `transition` on the property handles smooth depletion. The audio alert uses the Web Audio API `OscillatorNode` (synthesized, no audio files). Vibration uses `navigator.vibrate()` with a graceful no-op on iOS (not supported there as of 2026).

**Primary recommendation:** Replace Tailwind tokens and CSS globals for the theme, wire timer auto-start into the set-complete callback, implement a `useRestTimer` hook that replaces `setInterval` with `Date.now()` + Page Visibility API, add a floating timer card with SVG ring, and trigger Web Audio + vibration on expiry.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Color system / theme | Browser/Client (CSS) | — | Tailwind tokens compiled to CSS variables; no server |
| Navigation structure | Browser/Client (Layout.tsx) | — | Client-side routing, bottom nav is a layout concern |
| Touch target / typography | Browser/Client (CSS + Tailwind) | — | Pure presentational concern |
| Rest timer state | Browser/Client (React hook) | — | Local ephemeral state; no persistence needed across sessions |
| Per-exercise rest config | Browser/Client (workoutStore + Dexie) | — | User preference, persisted offline |
| SVG ring animation | Browser/Client (React component) | — | Purely visual, driven by timer state |
| Audio alert | Browser/Client (Web Audio API) | — | Synthesized in-browser; no backend |
| Vibration alert | Browser/Client (Navigator API) | — | Hardware API, browser-only |
| Background timer survival | Browser/Client (Page Visibility API + Date.now) | — | No service worker needed for this use case |

---

## Standard Stack

### Core (already installed — no new installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^3.4.16 [VERIFIED: npm registry] | Color tokens, spacing, responsive utilities | Already in use; token swap is the entire UI migration |
| React | ^19.2.0 [VERIFIED: package.json] | Component rendering, state, hooks | Project foundation |
| Zustand | ^5.0.9 [VERIFIED: package.json] | Global timer state (if promoted from local) | Already used for workoutStore |
| Lucide React | ^0.562.0 [VERIFIED: package.json] | Nav icons | Already in use |
| Radix UI Dialog | ^1.1.15 [VERIFIED: package.json] | Optional base for timer overlay | Already installed |

### Browser APIs (no install)
| API | Purpose | Support |
|-----|---------|---------|
| Web Audio API (`AudioContext`, `OscillatorNode`) | Synthesize beep/chime on timer expiry | Chrome, Safari, Firefox — all [CITED: MDN] |
| `Navigator.vibrate()` | Haptic pulse on timer expiry | Android Chrome only; iOS Safari: not supported as of 2026 [VERIFIED: WebSearch + MDN] |
| Page Visibility API (`document.visibilityState`, `visibilitychange`) | Detect foreground return to recalculate elapsed time | All modern browsers [CITED: MDN] |
| `Date.now()` | Snapshot timer start time for background-safe delta | Universal |

### No New Packages Required
The full scope of Phase 3 is achievable with the existing dependency set. No additional npm installs are needed.

---

## Architecture Patterns

### System Architecture Diagram

```
Set Complete (user taps checkmark)
        │
        ▼
handleSetChange() → setExerciseState()
        │
        ▼ (set.completed = true trigger)
startRestTimer(exerciseRestSeconds)
        │
        ├──► Store timerStartEpoch = Date.now()
        │    Store timerDuration = exerciseRestSeconds
        │    Set timerActive = true
        │
        ▼
useRestTimer hook (requestAnimationFrame or 500ms setInterval)
        │
        ├── Read elapsed = Date.now() - timerStartEpoch
        ├── Compute remaining = timerDuration - elapsed
        │
        ├── remaining > 0 → update displaySeconds → ring depletes
        │
        └── remaining ≤ 0 → timer expired
                │
                ├──► playChime() (Web Audio API OscillatorNode)
                ├──► navigator.vibrate([200, 100, 200]) (Android only)
                └──► set timerActive = false, show "rest complete"

Page Visibility: visibilitychange (visible)
        │
        └──► recalculate remaining = timerDuration - (Date.now() - timerStartEpoch)
             If remaining ≤ 0 → jump to "rest complete" state
             Else → resume countdown display from correct value

User taps Skip
        │
        └──► set timerActive = false, clear state
```

### Recommended Project Structure (additions)

```
src/
├── components/
│   ├── Layout.tsx           # Header + nav redesign (existing, modified)
│   ├── RestTimerCard.tsx    # New: floating timer card with SVG ring
│   └── ui/                  # Restyle existing shadcn components
├── hooks/
│   └── useRestTimer.ts      # New: Date.now delta hook + visibility handler
├── lib/
│   ├── rest.ts              # Existing: parseRestDuration, formatRestClock (keep as-is)
│   └── audio.ts             # New: playChime() Web Audio API utility
├── store/
│   └── workoutStore.ts      # Add per-exercise restSeconds field
└── index.css                # Color token globals + new animations
```

### Pattern 1: SVG Ring Countdown (stroke-dashoffset)

**What:** A plain `<circle>` SVG element with `stroke-dasharray` set to circumference. `stroke-dashoffset` interpolates from 0 (full ring) to circumference (empty ring) as time decreases.

**When to use:** Any circular progress or countdown — no external library needed.

```tsx
// Source: MDN stroke-dashoffset technique (standard SVG pattern)
const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 276.46

function TimerRing({ progress }: { progress: number }) {
  // progress: 0 = empty, 1 = full
  const offset = CIRCUMFERENCE * (1 - progress);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      {/* Track */}
      <circle
        cx="60" cy="60" r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="6"
      />
      {/* Progress arc — clockwise depletion */}
      <circle
        cx="60" cy="60" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        className="text-accent"
      />
    </svg>
  );
}
```

The `-rotate-90` transform makes 12 o'clock the start (clockwise depletion matching D-09).

### Pattern 2: Background-Safe Timer Hook

**What:** Uses `Date.now()` snapshot at timer start. `setInterval` at 500ms only updates display. On `visibilitychange`, recalculates from epoch.

```tsx
// Source: Page Visibility API pattern (MDN) + Date.now() delta
function useRestTimer() {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const startEpochRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const start = (seconds: number) => {
    startEpochRef.current = Date.now();
    durationRef.current = seconds * 1000;
    setActive(true);
    setRemaining(seconds);
  };

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const elapsed = Date.now() - startEpochRef.current;
      const rem = Math.max(0, Math.ceil((durationRef.current - elapsed) / 1000));
      setRemaining(rem);
      if (rem <= 0) {
        setActive(false);
        playChime();
        navigator.vibrate?.([200, 100, 200]);
      }
    };

    const interval = setInterval(tick, 500);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [active]);

  return { active, remaining, start, skip: () => setActive(false) };
}
```

### Pattern 3: Web Audio Chime

**What:** Synthesized two-tone chime using `OscillatorNode` — no audio file required, works immediately, tiny code footprint.

```tsx
// Source: Web Audio API OscillatorNode (MDN)
export function playChime() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25]; // C5 → E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.35);
    });
  } catch {
    // AudioContext blocked (e.g., no prior user interaction) — fail silently
  }
}
```

**iOS note:** AudioContext requires at least one prior user gesture. The set-save tap is a valid user gesture and satisfies this requirement, so the chime will fire correctly.

### Pattern 4: Color System Recommendation

**What:** Replace Tailwind token values in `tailwind.config.js`. Keep all token names — all existing components inherit automatically.

Recommended palette (Hevy energy + Strong data clarity):

```js
// tailwind.config.js — replace only the values, not the keys
colors: {
  background: '#0D0D0D',        // Deeper black — more premium than #161616
  foreground: '#F5F5F3',        // Near-white, slightly warm
  surface: '#1A1A1A',           // Card backgrounds
  muted: '#888888',             // Secondary text
  accent: '#FF3D3D',            // Energetic red-orange — gym intensity (replaces green)
  accentSecondary: '#FF8C00',   // Warm amber — complements red-orange
  neutral: '#2A2A2A',           // Borders, dividers
  card: '#1A1A1A',              // Card BG (same as surface)
}
```

**Alternative accent if red feels alarming:** `#C8FF00` (electric lime) or `#00E5FF` (electric cyan). At Claude's discretion per D-02.

### Pattern 5: Navigation — Future-Proof 5-Tab Layout

Current nav: Início, Semana, Histórico, Config (4 tabs). Phase 5 adds Templates, Phase 6 adds Body Metrics. A 5-tab layout works without nav redesign later.

Recommended structure:

| Tab | Icon | Route | Notes |
|-----|------|-------|-------|
| Início | Home | `/` | Dashboard |
| Treino | CalendarDays | `/week` | Rename "Semana" → "Treino" for clarity |
| Histórico | BarChart2 | `/progress` | Merge Progress + ExerciseHistory |
| Templates | LayoutTemplate | `/templates` | Phase 5 — add tab now, route as placeholder |
| Config | Settings | `/settings` | Always last |

5 tabs fit the `rounded-full` pill without cramping at 375px viewport.

### Anti-Patterns to Avoid

- **setInterval for timer display:** Drifts when tab is backgrounded. Replaced by `Date.now()` delta.
- **Loading audio files for the chime:** Requires HTTP request, adds latency. Use `OscillatorNode` synthesis.
- **Storing timerDuration in Zustand global store:** Rest timer is session-local ephemeral state — React local state or a hook is appropriate. Per-exercise *configuration* (rest duration preference) belongs in workoutStore.
- **Animating ring via JavaScript `requestAnimationFrame` ticking every frame:** Wasteful for a countdown. CSS `transition` on `stroke-dashoffset` with 500ms tick update is sufficient.
- **Full-screen overlay for timer (unless decided):** Blocks set logging. A floating card at screen bottom (above the session footer) is better gym UX — allows viewing the exercise list while timer runs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Synthesized audio alert | Custom audio pipeline | Web Audio API `OscillatorNode` | 10 lines vs. complex; no external dep |
| Circular progress ring | CSS-only approach with conic-gradient | SVG stroke-dashoffset | Better browser support, easier animation easing, standard technique |
| Timer drift correction | Accumulating setInterval corrections | `Date.now()` epoch delta | Correct by definition, handles background sleep |
| Theme token management | Separate CSS variable files | Tailwind config `colors` object | All existing components already consume these |

---

## Common Pitfalls

### Pitfall 1: AudioContext Suspended State
**What goes wrong:** `playChime()` silently fails because `AudioContext` is in `suspended` state on iOS if the context is created without a user gesture.
**Why it happens:** iOS requires a user interaction to unlock audio. Creating `AudioContext` on module load (not in event handler) is suspended.
**How to avoid:** Create a fresh `new AudioContext()` inside `playChime()` itself. The set-save tap IS a user gesture — the chime will fire. Don't create the context at module initialization.
**Warning signs:** No error thrown but no sound on iOS.

### Pitfall 2: Vibration No-Op on iOS
**What goes wrong:** `navigator.vibrate()` does nothing on iOS Safari; no error is thrown.
**Why it happens:** Vibration API is not supported on iOS as of 2026 [VERIFIED: WebSearch].
**How to avoid:** Use optional chaining `navigator.vibrate?.([200, 100, 200])` — fails silently. Supplement with audio so iOS users still get an alert.
**Warning signs:** No vibration on iPhone — expected behavior, not a bug.

### Pitfall 3: Timer Epoch Not Stored Across Component Unmount
**What goes wrong:** If `SessionDetail` unmounts (e.g., user navigates away and back), `startEpochRef` resets and timer loses its reference time.
**Why it happens:** `useRef` is local to the component instance.
**How to avoid:** Store `timerStartEpoch` and `timerDuration` in a module-level variable or in a Zustand slice, not just in a ref. The hook reads from module scope so it survives re-renders.

### Pitfall 4: Ring Appears to Jump on Tab Return
**What goes wrong:** When user returns from background, ring visually jumps to the correct position (bypassing smooth transition) because `stroke-dashoffset` changes by a large amount instantly.
**Why it happens:** CSS `transition` still animates from previous value to new value even when change is large.
**How to avoid:** On `visibilitychange`, temporarily disable the transition class, apply the correct value, then re-enable in the next animation frame.

### Pitfall 5: Nav Becomes Unusable with 5 Tabs at Small Width
**What goes wrong:** 5 equal-width tabs on 320px viewport can get text-clipped or targets too small.
**How to avoid:** At 5 tabs, use icon-only labels (no text) for the bottom nav tabs, or reduce label font size. Test at 320px minimum.

### Pitfall 6: Color Contrast in Always-Dark Theme
**What goes wrong:** Low-contrast text/icon combinations fail WCAG AA in dark-on-dark surfaces.
**How to avoid:** Verify accent color against `surface` background meets 4.5:1 for normal text. Use `background: #0D0D0D` as the deepest layer — surface cards sit at `#1A1A1A`.

---

## Code Examples

### Per-Exercise Rest Config Schema Addition
```typescript
// workoutStore.ts — add to settings or exercise data
// Per-exercise rest duration stored as seconds integer
// Key: exerciseId, Value: rest seconds (default: 90)
type ExerciseRestConfig = Record<string, number>;
// Store in Dexie settings table or as a separate workoutStore slice
```

### Auto-Start Timer on Set Complete
```tsx
// In SessionDetail.tsx handleSetChange — wire after set.completed flip
const handleSetChange = (exerciseId, setIndex, field, value) => {
  setExerciseState((prev) => {
    // ... existing logic
    if (field === 'completed' && value === true) {
      const restSecs = exerciseRestConfig[exerciseId] ?? defaultRestSeconds;
      startRestTimer(restSecs); // D-11: no prompt
    }
    return nextState;
  });
};
```

### Timer Card Placement
```tsx
// RestTimerCard: fixed bottom above SessionFooter
// In SessionDetail.tsx render:
{timerActive && (
  <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-30 w-[90vw] max-w-sm">
    <RestTimerCard remaining={remaining} duration={duration} onSkip={skip} />
  </div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setInterval` countdown (loses time in background) | `Date.now()` epoch delta + Page Visibility API | Standard practice 2020+ | Timer accurate after phone lock |
| Audio files (.mp3) for alerts | Web Audio API `OscillatorNode` synthesis | Web Audio API standard | Zero network dependency, instant |
| `window.webkitAudioContext` prefix | `AudioContext` (unprefixed) | Safari 14.1 (2021) | No more vendor prefix needed |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Red/orange-family accent suits the gym brand better than existing green/blue | Color System Recommendation | Wrong vibe — but D-02 grants Claude discretion, easy to change |
| A2 | 5-tab nav fits the current pill shape without redesign | Nav Pattern | If icons are too small at 5 tabs, need icon-only mode or layout tweak |
| A3 | Per-exercise rest config is best stored in workoutStore (not a separate Dexie table) | REST-01 | If config becomes complex, might need dedicated storage |

---

## Open Questions

1. **Timer card placement: floating vs. within session footer**
   - What we know: D-08 left this to Claude's discretion
   - Recommendation: Floating card positioned above the footer. Keeps timer visible while user reads exercise list. Dismisses via Skip button.

2. **Per-exercise rest config UI: where does the user set it?**
   - What we know: REST-01 requires 30s, 60s, 90s, and custom options per exercise
   - Recommendation: Small gear/settings icon on each exercise card in SessionDetail, opens a simple bottom sheet (shadcn Dialog). Settings persist to workoutStore.

3. **Font: keep Space Grotesk or change?**
   - What we know: D-03 gives Claude discretion; Space Grotesk is currently loaded
   - Recommendation: Keep Space Grotesk. It reads strong on dark backgrounds and the project already has the Google Fonts import. Avoid adding a new font import mid-project.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling | ✓ | v24.0.0 | — |
| Vitest | Test framework | ✓ | ^4.1.0 | — |
| Web Audio API | REST-03 audio alert | ✓ (all target browsers) | Native | None needed |
| Navigator.vibrate | REST-03 haptic | Android Chrome: ✓ / iOS Safari: ✗ | Native | Audio-only fallback |
| Page Visibility API | REST-04 background survival | ✓ (all target browsers) | Native | — |

**Missing dependencies with no fallback:** None — iOS vibration is an enhancement, not a blocker.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 + @testing-library/react ^16.3.2 |
| Config file | vite.config.ts (inferred from package.json scripts) |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test:run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REST-04 | `useRestTimer` returns correct remaining after Date.now() delta | unit | `vitest run src/hooks/useRestTimer.test.ts` | ❌ Wave 0 |
| REST-01 | `parseRestDuration` accepts 30, 60, 90, custom strings | unit | `vitest run src/lib/rest.test.ts` (if exists) | ❌ Wave 0 |
| LOG-05 | Set complete triggers timer start | integration | `vitest run src/routes/SessionDetail.test.tsx` | ✅ (partial) |
| UI-01/02/03 | Theme token presence, nav structure | manual smoke | Visual inspection on mobile viewport | N/A |
| REST-02 | SVG ring renders correct `stroke-dashoffset` for given progress | unit | `vitest run src/components/RestTimerCard.test.tsx` | ❌ Wave 0 |
| REST-03 | `playChime` does not throw, vibrate called with pattern | unit (mock) | `vitest run src/lib/audio.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** All Vitest tests green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/useRestTimer.test.ts` — covers REST-04 (Date.now delta, visibility change)
- [ ] `src/components/RestTimerCard.test.ts` — covers REST-02 (SVG dashoffset calculation)
- [ ] `src/lib/audio.test.ts` — covers REST-03 (chime fires, vibrate called)
- [ ] `src/lib/rest.test.ts` — covers REST-01 (parseRestDuration with 30s, 60s, 90s, custom)

---

## Security Domain

> `security_enforcement` not explicitly disabled in config.json — including section.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A (local-only PWA) |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes (REST-01 custom duration) | `parseRestDuration` already validates + clamps; add max cap (e.g., 600s) |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Excessively large custom rest duration (e.g., 999999s) | Tampering | Cap input in `parseRestDuration` at 600s max |
| AudioContext autoplay policy violation | N/A (UX) | Create AudioContext inside user-gesture handler |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: package.json] — All dependency versions confirmed from project source
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — AudioContext, OscillatorNode
- [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) — visibilitychange event
- [MDN Navigator.vibrate](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) — Browser support table
- SVG stroke-dashoffset technique — [CSS-Tricks](https://css-tricks.com/almanac/properties/s/stroke-dashoffset/) — standard SVG property

### Secondary (MEDIUM confidence)
- [VERIFIED via WebSearch] Navigator.vibrate not supported on iOS Safari as of 2026
- [VERIFIED via WebSearch] AudioContext requires prior user gesture on iOS — set-save tap qualifies

### Tertiary (LOW confidence)
- Color palette recommendation (red/orange accent) — [ASSUMED] based on Hevy/Strong visual reference described in CONTEXT.md; not scraped from live apps

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages from verified package.json
- Architecture (ring animation, timer hook): HIGH — established SVG + Web API patterns
- iOS vibration limitation: HIGH — MDN + WebSearch cross-verified
- Color palette values: LOW — Claude's discretion, not derived from a verifiable source

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable APIs, 30-day window)
