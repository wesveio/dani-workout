# Phase 3: UI Redesign + Rest Timer - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 8 new/modified files
**Analogs found:** 7 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tailwind.config.js` | config | transform | `tailwind.config.js` (itself) | exact |
| `src/index.css` | config | transform | `src/index.css` (itself) | exact |
| `src/components/Layout.tsx` | component | request-response | `src/components/Layout.tsx` (itself) | exact |
| `src/components/RestTimerCard.tsx` | component | event-driven | `src/components/ui/card.tsx` + `src/routes/SessionDetail.tsx` (SessionFooter) | role-match |
| `src/hooks/useRestTimer.ts` | hook | event-driven | `src/hooks/useDraftAutosave.ts` | role-match |
| `src/lib/audio.ts` | utility | event-driven | `src/lib/rest.ts` | role-match |
| `src/store/workoutStore.ts` | store | CRUD | `src/store/workoutStore.ts` (itself) | exact |
| `src/routes/SessionDetail.tsx` | component | event-driven | `src/routes/SessionDetail.tsx` (itself) | exact |

---

## Pattern Assignments

### `tailwind.config.js` (config, transform)

**Analog:** `tailwind.config.js` (current)

**Current token values** (lines 6-15) — replace values only, keep all key names:
```js
// tailwind.config.js — CURRENT (to be replaced)
colors: {
  background: '#161616',
  foreground: '#F7F7F5',
  surface: '#1F1F1F',
  muted: '#CECECE',
  accent: '#4EFF74',
  accentSecondary: '#4495FF',
  neutral: '#2C2C2C',
  card: '#1F1F1F',
},
fontFamily: {
  sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
borderRadius: {
  xl: '24px',
},
boxShadow: {
  soft: '0 15px 40px rgba(0,0,0,0.3)',
},
```

**Pattern:** Replace only the color hex values. Do not rename tokens — every existing component references `bg-accent`, `text-foreground`, `bg-surface`, etc. by name. Renaming breaks the entire app.

---

### `src/index.css` (config, transform)

**Analog:** `src/index.css` (current)

**Current globals** (lines 1-20) — update radial-gradient references to match new accent colors:
```css
/* src/index.css — body background gradient (lines 16-19) */
body {
  @apply bg-background text-foreground font-sans antialiased;
  background: radial-gradient(circle at 20% 20%, rgba(78, 255, 116, 0.05), transparent 35%),
    radial-gradient(circle at 80% 0%, rgba(68, 149, 255, 0.08), transparent 30%),
    #161616;
}
```

**Existing animation pattern** (lines 44-71) — new `@keyframes` for the rest timer ring pulse or "rest complete" state follow the same structure:
```css
@keyframes celebration-pop {
  0% { transform: scale(0.85) translateY(20px); opacity: 0; }
  50% { transform: scale(1.05) translateY(-8px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes float-spark {
  0% { transform: translateY(10px) scale(0.9); opacity: 0; }
  60% { opacity: 1; }
  100% { transform: translateY(-40px) scale(1); opacity: 0; }
}
```

**Pattern:** Add new `@keyframes` for any timer animation after the existing keyframe blocks. Keep `prefers-reduced-motion` block at end of file — it must cover new animations too.

---

### `src/components/Layout.tsx` (component, request-response)

**Analog:** `src/components/Layout.tsx` (current)

**Imports pattern** (lines 1-14):
```tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, Dumbbell, Settings as SettingsIcon } from 'lucide-react';
import { getCurrentWeekNumber } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useActiveProgram, useActiveUserProfile } from '@/lib/user';
import { useWorkoutStore } from '@/store/workoutStore';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ProfileSwitcher } from './ProfileSwitcher';
```

**Nav items array pattern** (lines 16-21) — add 5th tab by extending this array:
```tsx
const navItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/week', label: 'Semana', icon: CalendarDays },
  { to: '/progress', label: 'Histórico', icon: Dumbbell },
  { to: '/settings', label: 'Config', icon: SettingsIcon },
];
```

**Bottom nav pill pattern** (lines 113-141) — `rounded-full` container, `flex-1 min-h-[56px]` per tab item, `bg-accent text-background` for active:
```tsx
<nav className='fixed bottom-4 left-0 right-0 mx-auto flex max-w-md justify-center px-4 md:hidden'>
  <div className='flex w-full justify-between rounded-full bg-surface shadow-soft border border-neutral/50 px-2 py-2.5'>
    {navItems.map((item) => {
      const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            'flex flex-1 min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition',
            active ? 'bg-accent text-background shadow-soft' : 'text-muted hover:text-foreground'
          )}
        >
          <Icon className='h-5 w-5' />
          {item.label}
        </Link>
      );
    })}
  </div>
</nav>
```

**Header sticky pattern** (lines 39-102) — `sticky top-0 z-20 border-b border-neutral/30 bg-background/80 backdrop-blur`. Preserve `isSession` conditional rendering — it collapses the header during active sessions.

---

### `src/components/RestTimerCard.tsx` (component, event-driven)

**Analog:** `src/routes/SessionDetail.tsx` — `SessionFooter` component (lines 56-132) and `src/components/ui/card.tsx`

**Card structure pattern from SessionFooter** (lines 68-70):
```tsx
<div className='sticky bottom-0 z-10'>
  <Card className='border-neutral/60 bg-surface/90 backdrop-blur'>
    <CardContent className='flex flex-wrap items-center gap-3'>
```

**New file placement pattern** (from RESEARCH.md) — fixed position above footer, not sticky:
```tsx
// Fixed floating card above session footer (z-30 clears footer z-10)
<div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-30 w-[90vw] max-w-sm">
  <RestTimerCard remaining={remaining} duration={duration} onSkip={skip} />
</div>
```

**SVG ring pattern** (from RESEARCH.md Pattern 1 — no existing analog, new pattern):
```tsx
// SVG ring: -rotate-90 makes 12-o'clock the start; stroke-dashoffset depletes clockwise
const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function TimerRing({ progress }: { progress: number }) {
  const offset = CIRCUMFERENCE * (1 - progress);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
      <circle
        cx="60" cy="60" r={RADIUS}
        fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        className="text-accent"
      />
    </svg>
  );
}
```

**Button pattern from SessionFooter** (lines 87-117) — use `Button` with `variant='ghost'` for Skip, matching existing session controls.

---

### `src/hooks/useRestTimer.ts` (hook, event-driven)

**Analog:** `src/hooks/useDraftAutosave.ts`

**Hook structure pattern** (lines 1-49) — useRef for mutable timer refs, useEffect with cleanup return, early return if not enabled:
```tsx
import { useEffect, useRef, useState } from 'react'

export const useDraftAutosave = <T>(key: string, value: T, { enabled = true, delayMs = 500 } = {}) => {
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return          // ← early return pattern

    // ... setup

    return () => {                // ← cleanup pattern
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [delayMs, enabled, key, value])

  return { lastSavedAt }          // ← return named object, not array
}
```

**New hook implementation** adds module-level variables for cross-unmount survival (from RESEARCH.md Pitfall 3):
```tsx
// Module-level: survives component unmount/remount
let _startEpoch = 0;
let _duration = 0;

export function useRestTimer() {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const start = (seconds: number) => {
    _startEpoch = Date.now();
    _duration = seconds * 1000;
    setActive(true);
    setRemaining(seconds);
  };

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const elapsed = Date.now() - _startEpoch;
      const rem = Math.max(0, Math.ceil((_duration - elapsed) / 1000));
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

---

### `src/lib/audio.ts` (utility, event-driven)

**Analog:** `src/lib/rest.ts`

**Utility module pattern** (lines 1-31) — pure exported functions, no default export, no class, named exports only:
```ts
// src/lib/rest.ts — pattern: named exports of pure utility functions
export const parseRestDuration = (value?: string, fallbackSeconds = 90): number => { ... }
export const formatRestClock = (seconds: number): string => { ... }
```

**New file** follows same shape — one named export, try/catch wraps browser API:
```ts
// src/lib/audio.ts
export function playChime(): void {
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
    // AudioContext blocked or unsupported — fail silently
  }
}
```

---

### `src/store/workoutStore.ts` (store, CRUD)

**Analog:** `src/store/workoutStore.ts` (itself)

**Zustand store pattern** (lines 140-381) — `create<StoreType>((set, get) => ({ ... }))`, Zod validation on input, `set()` for state updates, async methods with try/catch:
```ts
export const useWorkoutStore = create<WorkoutStore>((set, get) => {
  return {
    // ... state fields
    saveSettings: async (partial) => {
      const next = { ...get().settings, ...partial }
      await db.settings.put({ key: `user:${activeUserId}`, value: next })
      set({ settings: next })
    },
  }
})
```

**Per-exercise rest config addition** — add to `WorkoutStore` type and `SettingsState`:
```ts
// types.ts or workoutStore.ts
type ExerciseRestConfig = Record<string, number>; // exerciseId → seconds

// In WorkoutStore type:
exerciseRestConfig: ExerciseRestConfig;
setExerciseRestSeconds: (exerciseId: string, seconds: number) => void;

// In store implementation:
exerciseRestConfig: {},
setExerciseRestSeconds: (exerciseId, seconds) => {
  set((s) => ({
    exerciseRestConfig: { ...s.exerciseRestConfig, [exerciseId]: seconds }
  }));
},
```

---

### `src/routes/SessionDetail.tsx` (component, event-driven)

**Analog:** `src/routes/SessionDetail.tsx` (itself)

**Existing timer state** (lines 218-228) — current `setInterval`-based approach to replace:
```tsx
const [restSeconds, setRestSeconds] = useState(0);
const [restRunning, setRestRunning] = useState(false);

const startRestTimer = (restText?: string) => {
  setRestSeconds(parseRestDuration(restText));
  setRestRunning(true);
};
const resetRestTimer = () => {
  setRestRunning(false);
  setRestSeconds(0);
};
```

**Auto-start integration point** — wire after set completion. The `handleSetChange` function already mutates `exerciseState`; add auto-start after the state update when `field === 'completed' && value === true`.

**Import pattern** (lines 1-38) — all imports use `@/` path aliases, shadcn components from `@/components/ui/`:
```tsx
import { parseRestDuration, formatRestClock } from '@/lib/rest';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
```

**New imports** follow the same alias pattern:
```tsx
import { useRestTimer } from '@/hooks/useRestTimer';
import { RestTimerCard } from '@/components/RestTimerCard';
```

---

## Shared Patterns

### Tailwind Token Consumption
**Source:** Every component file in `src/`
**Apply to:** All restyled components
```tsx
// All components use semantic Tailwind tokens — never raw hex values in className
className='bg-background text-foreground'   // page background
className='bg-surface border-neutral/50'    // card/panel
className='text-accent'                     // primary accent
className='text-muted'                      // secondary text
className='shadow-soft'                     // drop shadow
```

### Path Aliases
**Source:** `src/routes/SessionDetail.tsx` lines 1-38, `src/hooks/useDraftAutosave.ts` line 1
**Apply to:** All new files
```ts
// Always use @/ prefix for src/ imports — never relative paths like ../../
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
```

### `cn()` for Conditional Classes
**Source:** `src/components/Layout.tsx` lines 9, 39, 104, 126
**Apply to:** All components with conditional Tailwind classes
```tsx
import { cn } from '@/lib/utils';

className={cn(
  'base-classes-always-applied',
  condition && 'conditional-class',
  variant === 'active' ? 'active-class' : 'inactive-class'
)}
```

### useEffect Cleanup
**Source:** `src/hooks/useDraftAutosave.ts` lines 17-48
**Apply to:** `useRestTimer.ts`
```ts
useEffect(() => {
  if (!enabled) return;       // early return — no cleanup needed when inactive

  // setup side effects here

  return () => {              // always return cleanup function
    clearInterval(...)
    document.removeEventListener(...)
  };
}, [dependencies]);
```

### Test File Structure
**Source:** `src/lib/rest.test.ts`, `src/routes/SessionDetail.test.tsx`
**Apply to:** `useRestTimer.test.ts`, `audio.test.ts`, `RestTimerCard.test.tsx`

`rest.test.ts` pattern (unit, pure functions):
```ts
import { describe, expect, it } from 'vitest'
import { functionUnderTest } from './module'

describe('functionUnderTest', () => {
  it('does X when Y', () => {
    expect(functionUnderTest(input)).toBe(expected)
  })
})
```

`SessionDetail.test.tsx` pattern (integration, component with store):
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWorkoutStore } from '@/store/workoutStore'

beforeEach(() => {
  localStorage.clear()
  useWorkoutStore.setState(initialStore, true)  // reset store between tests
})
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/audio.ts` | utility | event-driven | No Web Audio API usage exists in codebase — pattern sourced from RESEARCH.md + MDN |

---

## Metadata

**Analog search scope:** `src/components/`, `src/hooks/`, `src/lib/`, `src/routes/`, `src/store/`, `tailwind.config.js`, `src/index.css`
**Files scanned:** 14 source files read directly
**Pattern extraction date:** 2026-04-21
