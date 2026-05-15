# Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved "Minimal Athletic" dark redesign (lime accent, mobile-only) across all six surfaces of the workout PWA without removing existing features.

**Architecture:** Restyle in place. Existing React Router routes (`/`, `/week`, `/session/...`, `/progress`, `/corpo`, `/settings`, `/templates`) keep their URLs. The shared `Layout.tsx` is rewritten around a 5-item bottom tab bar; the session route renders fullscreen on top. A small set of new presentational components (`BottomTabBar`, `PrimaryCTA`, `ExerciseHero`, `ExerciseThumb`, `AderenciaDots`, `PhaseStrip`, `MetricCard`, `Sparkline`, `MiniBars`, `ProfileRow`) is introduced. Existing components (`SetRow`, `ExerciseProgressChart`, `RestTimerCard`, `ProfileSwitcher`, `BodyMetricSheet`, `PhotoGallery`) are restyled or wrapped, not replaced wholesale.

**Tech Stack:** React 19 · TypeScript · Vite 7 · TailwindCSS 3 · shadcn/ui (Radix) · lucide-react · Zustand · Dexie · Vitest + @testing-library/react · Playwright (smoke).

**Spec:** `docs/superpowers/specs/2026-05-15-redesign-design.md`
**Research:** `.planning/redesign/RESEARCH.md`
**Mockup:** `.superpowers/brainstorm/<session>/content/mockup-v2.html` (gitignored)

---

## File Map

**Created (new files):**
- `src/components/redesign/BottomTabBar.tsx` — 5-item fixed bottom nav.
- `src/components/redesign/PrimaryCTA.tsx` — lime CTA with arrow chip.
- `src/components/redesign/ExerciseHero.tsx` — 16:10 / 16:9 media hero w/ play.
- `src/components/redesign/ExerciseThumb.tsx` — 44/54px thumb w/ silhouette fallback.
- `src/components/redesign/ExerciseSilhouette.tsx` — monochrome SVG fallback.
- `src/components/redesign/AderenciaDots.tsx` — 7-day completion row.
- `src/components/redesign/PhaseStrip.tsx` — 12-segment program strip.
- `src/components/redesign/MetricCard.tsx` — big-number + sparkline.
- `src/components/redesign/Sparkline.tsx` — 7-bar lime sparkline.
- `src/components/redesign/MiniBars.tsx` — 12-bar weekly volume chart.
- `src/components/redesign/ProfileRow.tsx` — profile switcher row.
- `src/components/redesign/index.ts` — barrel export.
- `src/styles/tokens.css` — CSS variables for tokens.
- Per-component test files alongside each new `.tsx`.

**Modified:**
- `src/index.css` — import tokens, Inter Variable, base layer.
- `tailwind.config.js` — colors via CSS variables, font-family, custom radii.
- `src/components/Layout.tsx` — rewritten around `BottomTabBar`; max-w-[480px] mobile shell.
- `src/components/SetRow.tsx` — restyle to grid `[pill | kg+prev | reps+prev | check]`.
- `src/components/RestTimerCard.tsx` — repurposed into `RestTimerOverlay` (sticky, lime).
- `src/components/ProfileSwitcher.tsx` — internals reused; new UI uses `ProfileRow` list inside `Mais`.
- `src/routes/Dashboard.tsx` — Hoje layout.
- `src/routes/WeekView.tsx` — Semana layout.
- `src/routes/SessionDetail.tsx` — Sessão modal layout + ExerciseHero + upnext.
- `src/routes/Progress.tsx` — Histórico list.
- `src/routes/ExerciseHistory.tsx` — Histórico detail.
- `src/routes/BodyMetrics.tsx` — Corpo grid.
- `src/routes/Settings.tsx` — Mais layout (profiles + program + data).
- `src/App.tsx` — keep routes; only adjust if Templates moves under Settings as sub-route.

**Untouched:**
- `src/data/treinoDani.ts`, `src/lib/*`, `src/store/*`, `src/db/*`, `src/types.ts`, `src/hooks/*`, `src/routes/Templates.tsx` (kept; reachable from Mais).

---

## Conventions

- Tests live next to components: `Foo.tsx` → `Foo.test.tsx`.
- Test runner: `npm run test:run -- <path>` for a single file; `npm run test:run` for all.
- Run dev server with `npm run dev` and verify by URL when a step involves visual layout.
- After each task, commit with conventional commit style (`feat:`, `refactor:`, `style:`).
- Keep imports relative to `@/` aliases (already configured).

---

# Phase 1 — Foundation

## Task 1: Tokens + Inter font + base layer

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Write tokens.css**

```css
/* src/styles/tokens.css */
:root {
  --bg: #0a0a0a;
  --bg-1: #111111;
  --bg-2: #171717;
  --line: #1f1f1f;
  --txt: #e5e5e5;
  --txt-dim: #9ca3af;
  --txt-faint: #525252;
  --lime: #a3e635;
  --amber: #fbbf24;
  --red: #f87171;

  --r-card: 10px;
  --r-hero: 14px;
  --r-thumb: 8px;
  --r-pill: 9999px;
}

html, body {
  background: var(--bg);
  color: var(--txt);
}
body {
  font-family: 'Inter Variable', 'Inter', -apple-system, system-ui, sans-serif;
  font-feature-settings: 'cv11', 'ss01', 'tnum';
  -webkit-font-smoothing: antialiased;
}

.num { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum'; }
.tracking-tight-display { letter-spacing: -1.5px; }
```

- [ ] **Step 2: Update src/index.css**

Replace the file contents with:

```css
@import url('https://rsms.me/inter/inter.css');
@import './styles/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  input, textarea, select, button { font: inherit; color: inherit; }
}
```

- [ ] **Step 3: Update tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // New redesign tokens
        bg: 'var(--bg)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        line: 'var(--line)',
        txt: 'var(--txt)',
        'txt-dim': 'var(--txt-dim)',
        'txt-faint': 'var(--txt-faint)',
        lime: 'var(--lime)',
        amber: 'var(--amber)',
        red: 'var(--red)',

        // Legacy aliases — keep until shadcn primitives in src/components/ui/*
        // and any remaining consumers stop referencing them. Final cleanup
        // happens in Task 26.
        background: 'var(--bg)',
        foreground: 'var(--txt)',
        surface: 'var(--bg-1)',
        card: 'var(--bg-1)',
        accent: 'var(--lime)',
        muted: 'var(--txt-faint)',
        neutral: 'var(--line)',
      },
      borderRadius: {
        card: 'var(--r-card)',
        hero: 'var(--r-hero)',
        thumb: 'var(--r-thumb)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Run dev server, verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: background is `#0a0a0a`, text light gray, Inter rendering. Existing pages may look broken — that's fine, we restyle them in later tasks. The token shell is what matters.

- [ ] **Step 5: Run lint to catch any syntax issues**

```bash
npm run lint
```

Expected: passes (or only pre-existing warnings).

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/index.css tailwind.config.js
git commit -m "feat(redesign): foundation tokens + Inter Variable + tailwind palette"
```

---

## Task 2: Mobile shell + Layout.tsx skeleton

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Replace Layout.tsx with mobile-first shell**

```tsx
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from './redesign/BottomTabBar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isSession = pathname.startsWith('/session');

  return (
    <div className='min-h-screen bg-bg text-txt'>
      <div className='mx-auto flex min-h-screen max-w-[480px] flex-col'>
        <main
          className={isSession ? 'flex-1 px-4 pb-40 pt-4' : 'flex-1 px-4 pb-24 pt-4'}
          role='main'
        >
          {children}
        </main>
        {!isSession && <BottomTabBar />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Stub out BottomTabBar to unblock compile**

Create `src/components/redesign/BottomTabBar.tsx`:

```tsx
export function BottomTabBar() {
  return null;
}
```

- [ ] **Step 3: Run dev server, confirm app renders**

```bash
npm run dev
```

Expected: app loads at `http://localhost:5173` without console errors. Content is centered in a 480px column. Tab bar is absent (intentional — implemented next task).

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/components/redesign/BottomTabBar.tsx
git commit -m "refactor(redesign): mobile-only shell in Layout"
```

---

# Phase 2 — Bottom Tab Bar

## Task 3: BottomTabBar with TDD

**Files:**
- Create: `src/components/redesign/BottomTabBar.test.tsx`
- Modify: `src/components/redesign/BottomTabBar.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/redesign/BottomTabBar.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BottomTabBar } from './BottomTabBar';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomTabBar />
    </MemoryRouter>
  );
}

describe('BottomTabBar', () => {
  it('renders five tabs in order', () => {
    renderAt('/');
    const labels = screen.getAllByRole('link').map((a) => a.textContent);
    expect(labels).toEqual([
      expect.stringContaining('Hoje'),
      expect.stringContaining('Semana'),
      expect.stringContaining('Histórico'),
      expect.stringContaining('Corpo'),
      expect.stringContaining('Mais'),
    ]);
  });

  it('marks the active tab via aria-current=page', () => {
    renderAt('/week');
    const active = screen.getByRole('link', { current: 'page' });
    expect(active).toHaveTextContent(/Semana/);
  });

  it('treats /progress and /exercise as Histórico tab', () => {
    renderAt('/progress');
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(/Histórico/);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- src/components/redesign/BottomTabBar.test.tsx
```

Expected: FAIL (no links rendered yet).

- [ ] **Step 3: Implement BottomTabBar**

Replace `src/components/redesign/BottomTabBar.tsx`:

```tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, BarChart2, Scale, MoreHorizontal } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Hoje', icon: Home, match: (p: string) => p === '/' },
  { to: '/week', label: 'Semana', icon: CalendarDays, match: (p: string) => p.startsWith('/week') },
  {
    to: '/progress',
    label: 'Histórico',
    icon: BarChart2,
    match: (p: string) => p.startsWith('/progress') || p.startsWith('/exercise'),
  },
  { to: '/corpo', label: 'Corpo', icon: Scale, match: (p: string) => p.startsWith('/corpo') },
  {
    to: '/settings',
    label: 'Mais',
    icon: MoreHorizontal,
    match: (p: string) => p.startsWith('/settings') || p.startsWith('/templates'),
  },
];

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label='Navegação principal'
      className='fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[480px] border-t border-line bg-bg/90 backdrop-blur-md'
    >
      <ul className='flex px-2 pb-5 pt-2'>
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={to} className='flex-1'>
              <NavLink
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-1.5 text-[9px] uppercase tracking-[0.15em] ${
                  active ? 'text-lime' : 'text-txt-faint'
                }`}
              >
                <Icon className='h-5 w-5' aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- src/components/redesign/BottomTabBar.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Smoke check in browser**

```bash
npm run dev
```

Visit `/`, `/week`, `/progress`, `/corpo`, `/settings`. Expected: bottom tab bar visible on all except `/session/...`; correct tab highlighted lime.

- [ ] **Step 6: Commit**

```bash
git add src/components/redesign/BottomTabBar.tsx src/components/redesign/BottomTabBar.test.tsx
git commit -m "feat(redesign): BottomTabBar with 5 tabs and active-state highlighting"
```

---

# Phase 3 — Core display primitives

Each task: write the test → implement → run → commit.

## Task 4: ExerciseSilhouette (fallback SVG)

**Files:**
- Create: `src/components/redesign/ExerciseSilhouette.tsx`
- Create: `src/components/redesign/ExerciseSilhouette.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseSilhouette } from './ExerciseSilhouette';

describe('ExerciseSilhouette', () => {
  it('renders an svg with aria-hidden', () => {
    const { container } = render(<ExerciseSilhouette />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm run test:run -- src/components/redesign/ExerciseSilhouette.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/ExerciseSilhouette.tsx
export function ExerciseSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 64 64'
      className={`opacity-[0.08] ${className}`}
      fill='currentColor'
    >
      <circle cx='32' cy='14' r='6' />
      <rect x='12' y='24' width='40' height='6' rx='3' />
      <rect x='20' y='34' width='8' height='20' rx='3' />
      <rect x='36' y='34' width='8' height='20' rx='3' />
    </svg>
  );
}
```

- [ ] **Step 4: Run test, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ExerciseSilhouette.*
git commit -m "feat(redesign): ExerciseSilhouette fallback SVG"
```

---

## Task 5: ExerciseThumb

**Files:**
- Create: `src/components/redesign/ExerciseThumb.tsx`
- Create: `src/components/redesign/ExerciseThumb.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseThumb } from './ExerciseThumb';

describe('ExerciseThumb', () => {
  it('renders an img with provided src and alt', () => {
    render(<ExerciseThumb src='/thumbs/sup.webp' alt='Supino' />);
    const img = screen.getByAltText('Supino') as HTMLImageElement;
    expect(img.src).toContain('/thumbs/sup.webp');
  });

  it('renders silhouette fallback when src missing', () => {
    const { container } = render(<ExerciseThumb alt='Sem imagem' />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies tall sizing when size=tall', () => {
    const { container } = render(<ExerciseThumb alt='x' size='tall' />);
    expect(container.firstChild).toHaveClass('h-[54px]');
  });
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/ExerciseThumb.tsx
import { useState } from 'react';
import { ExerciseSilhouette } from './ExerciseSilhouette';

type Size = 'sm' | 'md' | 'tall';
const sizes: Record<Size, string> = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-11 w-11 rounded-thumb',
  tall: 'h-[54px] w-[54px] rounded-[10px]',
};

export function ExerciseThumb({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src?: string;
  alt: string;
  size?: Size;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] text-txt-faint ${sizes[size]} ${className}`}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          className='h-full w-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        <ExerciseSilhouette className='h-[60%] w-[60%]' />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ExerciseThumb.*
git commit -m "feat(redesign): ExerciseThumb with silhouette fallback and size variants"
```

---

## Task 6: ExerciseHero

**Files:**
- Create: `src/components/redesign/ExerciseHero.tsx`
- Create: `src/components/redesign/ExerciseHero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseHero } from './ExerciseHero';

describe('ExerciseHero', () => {
  it('renders name and prescription', () => {
    render(<ExerciseHero name='Remada' prescription='4 × 8 · RIR 2' />);
    expect(screen.getByText('Remada')).toBeInTheDocument();
    expect(screen.getByText(/4 × 8/)).toBeInTheDocument();
  });

  it('renders play link when videoUrl is present', () => {
    render(<ExerciseHero name='Remada' videoUrl='https://x.com/v' />);
    const link = screen.getByRole('link', { name: /vídeo/i });
    expect(link).toHaveAttribute('href', 'https://x.com/v');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('omits play link without videoUrl', () => {
    render(<ExerciseHero name='Remada' />);
    expect(screen.queryByRole('link', { name: /vídeo/i })).toBeNull();
  });

  it('uses 16:9 ratio when ratio="16-9"', () => {
    const { container } = render(<ExerciseHero name='x' ratio='16-9' />);
    expect(container.firstChild).toHaveClass('aspect-[16/9]');
  });
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/ExerciseHero.tsx
import { Play } from 'lucide-react';
import { useState } from 'react';
import { ExerciseSilhouette } from './ExerciseSilhouette';

export function ExerciseHero({
  name,
  prescription,
  imageUrl,
  videoUrl,
  ratio = '16-10',
}: {
  name: string;
  prescription?: string;
  imageUrl?: string;
  videoUrl?: string;
  ratio?: '16-9' | '16-10';
}) {
  const [failed, setFailed] = useState(false);
  const showImg = imageUrl && !failed;
  const aspect = ratio === '16-9' ? 'aspect-[16/9]' : 'aspect-[16/10]';

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-hero bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]`}
    >
      {showImg ? (
        <img
          src={imageUrl}
          alt={name}
          className='absolute inset-0 h-full w-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center text-txt-faint'>
          <ExerciseSilhouette className='h-1/2 w-1/2' />
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent' />
      <div className='absolute inset-x-0 bottom-0 flex items-end justify-between p-4'>
        <div className='min-w-0'>
          <div className='truncate text-lg font-medium leading-tight'>{name}</div>
          {prescription && (
            <div className='mt-1 text-[10px] uppercase tracking-[0.15em] text-txt-faint'>
              {prescription}
            </div>
          )}
        </div>
        {videoUrl && (
          <a
            href={videoUrl}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Assistir vídeo de ${name}`}
            className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-lime text-black shadow-[0_4px_20px_rgba(163,230,53,0.3)]'
          >
            <Play className='h-4 w-4 fill-current' aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ExerciseHero.*
git commit -m "feat(redesign): ExerciseHero with media + play link"
```

---

## Task 7: PrimaryCTA

**Files:**
- Create: `src/components/redesign/PrimaryCTA.tsx`
- Create: `src/components/redesign/PrimaryCTA.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PrimaryCTA } from './PrimaryCTA';

describe('PrimaryCTA', () => {
  it('renders label and triggers onClick', () => {
    const onClick = vi.fn();
    render(<PrimaryCTA label='Iniciar treino' onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /iniciar treino/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as Link when "to" is provided', () => {
    render(
      <PrimaryCTA label='Go' to='/session/1' /> as any
    );
    // anchor with role=link
    const link = screen.getByRole('link', { name: /go/i });
    expect(link.getAttribute('href')).toBe('/session/1');
  });
});
```

(Note: wrap in MemoryRouter when using `to`.)

Adjust test:

```tsx
import { MemoryRouter } from 'react-router-dom';
// ...
it('renders as Link when "to" is provided', () => {
  render(
    <MemoryRouter>
      <PrimaryCTA label='Go' to='/session/1' />
    </MemoryRouter>
  );
  const link = screen.getByRole('link', { name: /go/i });
  expect(link.getAttribute('href')).toBe('/session/1');
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/PrimaryCTA.tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Common = { label: string; className?: string };
type AsButton = Common & { to?: undefined; onClick: () => void };
type AsLink = Common & { to: string; onClick?: undefined };

export function PrimaryCTA(props: AsButton | AsLink) {
  const body = (
    <>
      <span className='text-[15px] font-semibold tracking-tight'>{props.label}</span>
      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-black text-lime'>
        <ArrowRight className='h-4 w-4' aria-hidden />
      </span>
    </>
  );
  const cls =
    'flex items-center justify-between rounded-[14px] bg-lime px-5 py-[18px] text-black active:opacity-90 ' +
    (props.className ?? '');
  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type='button' onClick={props.onClick} className={cls}>
      {body}
    </button>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/PrimaryCTA.*
git commit -m "feat(redesign): PrimaryCTA component"
```

---

## Task 8: AderenciaDots

**Files:**
- Create: `src/components/redesign/AderenciaDots.tsx`
- Create: `src/components/redesign/AderenciaDots.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AderenciaDots } from './AderenciaDots';

describe('AderenciaDots', () => {
  it('renders 7 day cells with letters S T Q Q S S D', () => {
    render(<AderenciaDots states={['done','done','none','done','none','done','none']} />);
    const cells = screen.getAllByTestId('aderencia-dot');
    expect(cells).toHaveLength(7);
    expect(cells.map((c) => c.textContent)).toEqual(['S','T','Q','Q','S','S','D']);
  });

  it('applies done style when state is done', () => {
    render(<AderenciaDots states={['done','none','none','none','none','none','none']} />);
    expect(screen.getAllByTestId('aderencia-dot')[0]).toHaveClass('bg-lime');
  });
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/AderenciaDots.tsx
export type DayState = 'done' | 'miss' | 'none';
const labels = ['S','T','Q','Q','S','S','D'];

export function AderenciaDots({ states }: { states: DayState[] }) {
  return (
    <div className='flex gap-1'>
      {labels.map((l, i) => {
        const s = states[i] ?? 'none';
        const cls =
          s === 'done'
            ? 'bg-lime text-black font-semibold'
            : s === 'miss'
            ? 'bg-bg-2 text-red'
            : 'bg-bg-2 text-txt-faint';
        return (
          <div
            key={i}
            data-testid='aderencia-dot'
            className={`flex h-[22px] w-[22px] items-center justify-center rounded-[5px] text-[9px] ${cls}`}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/AderenciaDots.*
git commit -m "feat(redesign): AderenciaDots 7-day adherence row"
```

---

## Task 9: PhaseStrip

**Files:**
- Create: `src/components/redesign/PhaseStrip.tsx`
- Create: `src/components/redesign/PhaseStrip.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhaseStrip } from './PhaseStrip';

describe('PhaseStrip', () => {
  it('renders given number of segments with proper classes', () => {
    render(<PhaseStrip total={12} current={4} />);
    const segs = screen.getAllByTestId('phase-seg');
    expect(segs).toHaveLength(12);
    // 1..3 done, 4 current, 5..12 future
    expect(segs[0]).toHaveClass('bg-lime', 'opacity-40');
    expect(segs[3]).toHaveClass('bg-lime');
    expect(segs[3]).not.toHaveClass('opacity-40');
    expect(segs[11]).toHaveClass('bg-bg-1');
  });
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/PhaseStrip.tsx
export function PhaseStrip({ total, current }: { total: number; current: number }) {
  return (
    <div className='flex gap-[3px]'>
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const cls =
          idx < current
            ? 'bg-lime opacity-40'
            : idx === current
            ? 'bg-lime'
            : 'bg-bg-1';
        return <div key={i} data-testid='phase-seg' className={`h-1.5 flex-1 rounded-[2px] ${cls}`} />;
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/PhaseStrip.*
git commit -m "feat(redesign): PhaseStrip 12-segment program progress"
```

---

## Task 10: Sparkline + MiniBars

**Files:**
- Create: `src/components/redesign/Sparkline.tsx`
- Create: `src/components/redesign/Sparkline.test.tsx`
- Create: `src/components/redesign/MiniBars.tsx`
- Create: `src/components/redesign/MiniBars.test.tsx`

- [ ] **Step 1: Sparkline test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('renders a bar per value', () => {
    render(<Sparkline values={[1,2,3,4]} />);
    expect(screen.getAllByTestId('spark-bar')).toHaveLength(4);
  });
  it('handles all-zero gracefully (no NaN)', () => {
    const { container } = render(<Sparkline values={[0,0,0]} />);
    expect(container.textContent).not.toContain('NaN');
  });
});
```

- [ ] **Step 2: Run, fail**

- [ ] **Step 3: Sparkline implementation**

```tsx
// src/components/redesign/Sparkline.tsx
export function Sparkline({ values, className = '' }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className={`flex h-6 items-end gap-[2px] ${className}`}>
      {values.map((v, i) => {
        const h = max > 0 ? Math.max(8, (v / max) * 100) : 8;
        const last = i === values.length - 1;
        return (
          <div
            key={i}
            data-testid='spark-bar'
            className={`flex-1 rounded-[1px] bg-lime ${last ? 'opacity-100' : 'opacity-60'}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, pass**

- [ ] **Step 5: MiniBars test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MiniBars } from './MiniBars';

describe('MiniBars', () => {
  it('renders one bar per value', () => {
    render(<MiniBars values={[1,2,3]} current={1} />);
    expect(screen.getAllByTestId('minibar')).toHaveLength(3);
  });
  it('highlights current index', () => {
    render(<MiniBars values={[10,20]} current={1} />);
    const bars = screen.getAllByTestId('minibar');
    expect(bars[1]).toHaveClass('bg-lime');
    expect(bars[1].className).toContain('shadow');
  });
});
```

- [ ] **Step 6: Run, fail**

- [ ] **Step 7: MiniBars implementation**

```tsx
// src/components/redesign/MiniBars.tsx
export function MiniBars({
  values,
  current,
  height = 100,
}: {
  values: number[];
  current?: number;
  height?: number;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className='flex items-end gap-1.5' style={{ height }}>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const isCurrent = i === current;
        const cls = isCurrent
          ? 'bg-lime shadow-[inset_0_0_0_2px_theme(colors.lime),0_0_0_2px_rgba(163,230,53,.2)]'
          : v > 0
          ? 'bg-bg-1'
          : 'bg-bg-1';
        return (
          <div
            key={i}
            data-testid='minibar'
            className={`flex-1 min-h-[6px] rounded-t-[3px] ${cls}`}
            style={{ height: `${Math.max(6, h)}%` }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8: Run, pass**

- [ ] **Step 9: Commit**

```bash
git add src/components/redesign/Sparkline.* src/components/redesign/MiniBars.*
git commit -m "feat(redesign): Sparkline + MiniBars data viz primitives"
```

---

## Task 11: MetricCard

**Files:**
- Create: `src/components/redesign/MetricCard.tsx`
- Create: `src/components/redesign/MetricCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('shows label, value, unit, delta and sparkline', () => {
    render(<MetricCard label='Peso' value='72.4' unit='kg' delta='-0.6 / 7d' history={[1,2,3]} />);
    expect(screen.getByText('Peso')).toBeInTheDocument();
    expect(screen.getByText('72.4')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('-0.6 / 7d')).toBeInTheDocument();
    expect(screen.getAllByTestId('spark-bar')).toHaveLength(3);
  });
  it('hides sparkline when history is empty', () => {
    render(<MetricCard label='X' value='1' />);
    expect(screen.queryAllByTestId('spark-bar')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run, fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/MetricCard.tsx
import { Sparkline } from './Sparkline';

export function MetricCard({
  label,
  value,
  unit,
  delta,
  history,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  history?: number[];
}) {
  return (
    <div className='rounded-card bg-bg-1 p-3'>
      <div className='text-[9px] uppercase tracking-[0.15em] text-txt-faint'>{label}</div>
      <div className='mt-1 text-[22px] font-light leading-none tracking-tight num'>
        {value}
        {unit && <span className='ml-0.5 text-[11px] text-txt-faint'>{unit}</span>}
      </div>
      {delta && <div className='mt-0.5 text-[10px] text-lime'>{delta}</div>}
      {history && history.length > 0 && <Sparkline values={history} className='mt-1.5' />}
    </div>
  );
}
```

- [ ] **Step 4: Run, pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/MetricCard.*
git commit -m "feat(redesign): MetricCard with sparkline"
```

---

## Task 12: ProfileRow

**Files:**
- Create: `src/components/redesign/ProfileRow.tsx`
- Create: `src/components/redesign/ProfileRow.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileRow } from './ProfileRow';

describe('ProfileRow', () => {
  it('renders name, status, and avatar initial', () => {
    render(<ProfileRow name='Dani' status='Ativo · semana 4' active />);
    expect(screen.getByText('Dani')).toBeInTheDocument();
    expect(screen.getByText(/semana 4/i)).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('fires onSelect on click', () => {
    const onSelect = vi.fn();
    render(<ProfileRow name='Wesley' onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run, fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/ProfileRow.tsx
import { Check } from 'lucide-react';

export function ProfileRow({
  name,
  status,
  active,
  onSelect,
}: {
  name: string;
  status?: string;
  active?: boolean;
  onSelect?: () => void;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`mb-1.5 flex w-full items-center gap-3 rounded-card bg-bg-1 p-3 text-left ${
        active ? 'border border-lime' : ''
      }`}
    >
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lime to-[#65a30d] text-[12px] font-semibold text-black'>
        {initial}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm font-medium'>{name}</div>
        {status && (
          <div className='mt-0.5 text-[10px] uppercase tracking-[0.1em] text-txt-faint'>
            {status}
          </div>
        )}
      </div>
      {active && <Check className='h-4 w-4 text-lime' aria-hidden />}
    </button>
  );
}
```

- [ ] **Step 4: Run, pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/ProfileRow.*
git commit -m "feat(redesign): ProfileRow component"
```

---

## Task 13: Barrel export

**Files:**
- Create: `src/components/redesign/index.ts`

- [ ] **Step 1: Write the file**

```ts
// src/components/redesign/index.ts
export { BottomTabBar } from './BottomTabBar';
export { PrimaryCTA } from './PrimaryCTA';
export { ExerciseHero } from './ExerciseHero';
export { ExerciseThumb } from './ExerciseThumb';
export { ExerciseSilhouette } from './ExerciseSilhouette';
export { AderenciaDots } from './AderenciaDots';
export type { DayState } from './AderenciaDots';
export { PhaseStrip } from './PhaseStrip';
export { Sparkline } from './Sparkline';
export { MiniBars } from './MiniBars';
export { MetricCard } from './MetricCard';
export { ProfileRow } from './ProfileRow';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/redesign/index.ts
git commit -m "chore(redesign): barrel export for redesign components"
```

---

# Phase 4 — Hoje (Dashboard)

## Task 14: Restyle Dashboard route

**Files:**
- Modify: `src/routes/Dashboard.tsx`

- [ ] **Step 1: Read the current Dashboard.tsx in full**

```bash
sed -n '1,200p' src/routes/Dashboard.tsx
```

Make sure you know which props it consumes from the store and what existing JSX it returns. The behavior (data lookups) stays — only the visual structure changes.

- [ ] **Step 2: Replace the route's `return` with the new layout**

Keep all hooks/selectors at the top. Replace the JSX with:

```tsx
import { Link } from 'react-router-dom';
import { useActiveUserProfile } from '@/lib/user';
import { PrimaryCTA, AderenciaDots, Sparkline } from '@/components/redesign';
import type { DayState } from '@/components/redesign';

// ... existing imports + hooks unchanged ...

return (
  <div className='space-y-5'>
    {/* Header */}
    <header className='flex items-center justify-between'>
      <div className='flex items-center gap-2.5'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lime to-[#65a30d] text-[13px] font-semibold text-black'>
          {profile?.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <div className='text-[10px] uppercase tracking-[0.15em] text-txt-faint'>Olá</div>
          <div className='text-sm font-medium'>{profile?.name ?? '—'}</div>
        </div>
      </div>
    </header>

    {/* Today's session */}
    <div>
      <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint num'>
        {todayLabel /* e.g. "Quarta · Semana 4 / 12" */}
      </div>
      <h1 className='mt-2 text-[36px] font-extralight leading-none tracking-[-1.5px]'>
        {sessionTitle /* e.g. "Treino B" */}
      </h1>
      <p className='mt-1 text-[22px] font-light tracking-tight text-txt-faint'>
        {sessionSubtitle /* "Pull · Costas, ombro post., bíceps" */}
      </p>
    </div>

    <PrimaryCTA label='Iniciar treino' to={`/session/${todaySessionId}`} />

    {/* Prescription card */}
    <div className='rounded-card bg-bg-1 p-3.5'>
      {prescriptionRows.map((r) => (
        <div
          key={r.label}
          className='flex items-center justify-between border-b border-line py-2 text-[13px] last:border-0'
        >
          <span className='text-txt-faint'>{r.label}</span>
          <span className='num'>{r.value}</span>
        </div>
      ))}
    </div>

    {/* Week glance */}
    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Semana
      </h2>
      <div className='rounded-card bg-bg-1 p-3.5'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-xs text-txt-faint'>Aderência</span>
          <span className='num text-lime'>
            {doneCount}
            <span className='text-txt-faint'>/{plannedCount}</span>
          </span>
        </div>
        <AderenciaDots states={weekStates as DayState[]} />
      </div>
    </section>

    {/* Recent PR */}
    {recentPr && (
      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          PR recente
        </h2>
        <Link
          to={`/exercise/${recentPr.exerciseId}`}
          className='block rounded-card bg-bg-1 p-3.5'
        >
          <div className='flex items-end justify-between'>
            <div>
              <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
                {recentPr.name}
              </div>
              <div className='mt-1 text-[20px] font-light num'>
                {recentPr.weight}
                <span className='text-[11px] text-txt-faint'>
                  kg × {recentPr.reps}
                </span>
              </div>
            </div>
            <Sparkline values={recentPr.history} className='w-20' />
          </div>
        </Link>
      </section>
    )}
  </div>
);
```

If `todayLabel`, `sessionTitle`, `sessionSubtitle`, `todaySessionId`, `prescriptionRows`, `weekStates`, `doneCount`, `plannedCount`, `recentPr` are not already derived in Dashboard, derive them from existing store selectors using helpers already in `src/lib/program.ts` and `src/lib/date.ts`. Do not invent fields; if a piece (e.g., `recentPr.history`) requires a new helper, write the helper as part of this task with a colocated test.

- [ ] **Step 3: Smoke check in dev server**

```bash
npm run dev
```

Visit `/`. Expected: layout matches the mockup — greeting, big title, lime CTA, prescription rows, aderência dots, optional PR card.

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: nothing in existing tests regresses.

- [ ] **Step 5: Commit**

```bash
git add src/routes/Dashboard.tsx src/lib
git commit -m "feat(redesign): Hoje (Dashboard) layout with new components"
```

---

# Phase 5 — Semana

## Task 15: Add program-aware phase helper

**Files:**
- Modify: `src/lib/program.ts`
- Create: `src/lib/program.phase.test.ts`

**Context:** The app supports multiple `Program`s (Dani 12 weeks, Wesley 8 weeks) defined in `src/data/programTypes.ts`. Each `Program` carries `durationWeeks` and `phases: Phase[]` (each `Phase` has `name` and a week range). Do **not** hardcode 12 weeks or two phases anywhere.

- [ ] **Step 1: Inspect existing helpers**

```bash
grep -n 'phase\|getWeekInfo' src/lib/program.ts
sed -n '1,80p' src/data/programTypes.ts
```

Note the exact `Phase` shape (start/end week, name). The plan assumes:

```ts
type Phase = { name: string; startWeek: number; endWeek: number };
type Program = { ...; durationWeeks: number; phases: Phase[] };
```

If field names differ, adapt the implementation below to match.

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/program.phase.test.ts
import { describe, expect, it } from 'vitest';
import { getPhaseForWeek } from './program';
import type { Program } from '@/data/programTypes';

const program: Program = {
  id: 'demo',
  name: 'Demo',
  durationWeeks: 12,
  phases: [
    { name: 'Fase 1 · Volume', startWeek: 1, endWeek: 6 },
    { name: 'Fase 2 · Força', startWeek: 7, endWeek: 12 },
  ],
  weeks: [],
} as unknown as Program;

describe('getPhaseForWeek', () => {
  it('returns the matching phase for an in-range week', () => {
    expect(getPhaseForWeek(program, 3)?.name).toBe('Fase 1 · Volume');
    expect(getPhaseForWeek(program, 9)?.name).toBe('Fase 2 · Força');
  });
  it('returns undefined when the program has no phases', () => {
    const p = { ...program, phases: [] } as Program;
    expect(getPhaseForWeek(p, 1)).toBeUndefined();
  });
  it('returns undefined for out-of-range weeks', () => {
    expect(getPhaseForWeek(program, 0)).toBeUndefined();
    expect(getPhaseForWeek(program, 13)).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test, confirm fail**

```bash
npm run test:run -- src/lib/program.phase.test.ts
```

- [ ] **Step 4: Implement**

```ts
// append to src/lib/program.ts
import type { Phase, Program } from '@/data/programTypes';

export function getPhaseForWeek(program: Program, week: number): Phase | undefined {
  return program.phases.find((p) => week >= p.startWeek && week <= p.endWeek);
}
```

If `Phase` uses different field names (`startWeek`/`weeks: number[]`/etc.), use what the actual type defines. Match by membership — never hardcode week ranges.

- [ ] **Step 5: Run test, confirm pass**

```bash
npm run test:run -- src/lib/program.phase.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/program.ts src/lib/program.phase.test.ts
git commit -m "feat(redesign): getPhaseForWeek program-aware helper"
```

---

## Task 16: Restyle WeekView

**Files:**
- Modify: `src/routes/WeekView.tsx`

- [ ] **Step 1: Read current WeekView.tsx, note the data hooks it already uses**

```bash
sed -n '1,200p' src/routes/WeekView.tsx
```

- [ ] **Step 2: Replace the JSX with the new layout**

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PhaseStrip, ExerciseThumb, MiniBars } from '@/components/redesign';
import { useActiveProgram } from '@/lib/user';
import { getPhaseForWeek } from '@/lib/program';

// existing data hooks unchanged...

const program = useActiveProgram();
const totalWeeks = program?.durationWeeks ?? 12;
const phases = program?.phases ?? [];

const [week, setWeek] = useState<number>(currentWeek);
const sessions = sessionsForWeek(week); // already present
const volumeByWeek = volumeAllWeeks();  // already present

return (
  <div className='space-y-5'>
    <header className='flex items-end justify-between'>
      <div>
        <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
          Programa · {totalWeeks} sem.
        </div>
        <h1 className='mt-1 text-[22px] font-normal tracking-tight'>
          Semana <span className='num'>{week}</span>
        </h1>
      </div>
      <div className='flex items-center gap-2 text-txt-faint'>
        <button onClick={() => setWeek(Math.max(1, week - 1))} aria-label='Semana anterior'>
          <ChevronLeft className='h-5 w-5' />
        </button>
        <span className='num text-sm text-txt'>{String(week).padStart(2, '0')}</span>
        <button onClick={() => setWeek(Math.min(totalWeeks, week + 1))} aria-label='Próxima semana'>
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>
    </header>

    <PhaseStrip total={totalWeeks} current={week} />
    {phases.length > 0 && (
      <div className='-mt-3 flex justify-between text-[9px] uppercase tracking-[0.15em] text-txt-faint'>
        {phases.map((p) => (
          <span key={p.name}>{p.name}</span>
        ))}
      </div>
    )}

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Sessões
      </h2>
      <div className='space-y-2'>
        {sessions.map((s) => (
          <Link
            key={s.id}
            to={`/session/${s.id}`}
            className={`block rounded-[12px] bg-bg-1 p-3.5 ${s.isToday ? 'border border-lime' : ''}`}
          >
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-base font-medium tracking-tight'>
                  Treino {s.code} · {s.title}
                  {s.isToday && <span className='ml-1 text-lime'>●</span>}
                </h3>
                <div className='mt-1 text-[10px] uppercase tracking-[0.15em] text-txt-faint'>
                  {s.dayName} · {s.exerciseCount} exercícios
                  {s.isToday && ' · hoje'}
                </div>
              </div>
              <span className='rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-txt-dim'>
                {s.done ? '✓ feito' : `${s.totalSets} séries`}
              </span>
            </div>
            <div className='mt-2 flex gap-1 overflow-hidden'>
              {s.exercisePreviews.slice(0, 6).map((ex, i) => (
                <ExerciseThumb key={i} src={ex.imageUrl} alt={ex.name} size='sm' />
              ))}
              {s.exercisePreviews.length > 6 && (
                <span className='self-center text-[10px] tracking-wider text-txt-faint'>
                  +{s.exercisePreviews.length - 6}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Volume semanal
      </h2>
      <div className='rounded-card bg-bg-1 p-3.5'>
        <MiniBars values={volumeByWeek} current={week - 1} />
      </div>
    </section>
  </div>
);
```

`sessionsForWeek`, `volumeAllWeeks`, `currentWeek` map to existing selectors. If `s.exercisePreviews` (an array of `{ name, imageUrl }`) doesn't yet exist, extend the selector to project the first six exercises of each session template — change confined to the existing `sessionsForWeek` shape, no new files.

- [ ] **Step 3: Smoke check in dev server**

Visit `/week`. Expected: 12-segment strip with current week lime, three session cards each with up to 6 thumbs, weekly bar chart.

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/WeekView.tsx src/lib
git commit -m "feat(redesign): Semana layout with PhaseStrip + thumb strips + volume chart"
```

---

# Phase 6 — Sessão

## Task 17: Restyle SetRow

**Files:**
- Modify: `src/components/SetRow.tsx`
- Modify: `src/components/SetRow.test.tsx` (only if existing assertions break on new markup)

- [ ] **Step 1: Inspect existing SetRow + tests**

```bash
sed -n '1,200p' src/components/SetRow.tsx
sed -n '1,200p' src/components/SetRow.test.tsx
```

Identify the props in use (likely `setNumber`, `weight`, `reps`, `prev`, `done`, `onChange`, etc.). Keep prop API identical. Only restyle.

- [ ] **Step 2: Rewrite the rendered markup**

```tsx
// Inside SetRow's return:
<div
  className={`grid items-center gap-2 border-b border-line px-1 py-2.5 ${
    isActive ? 'bg-lime/5' : ''
  } ${isFuture ? 'opacity-50' : ''}`}
  style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}
>
  <div
    className={`rounded-[5px] py-1 text-center text-[11px] font-medium ${
      isActive ? 'bg-lime text-black' : 'bg-bg-2 text-txt-dim'
    }`}
  >
    {setNumber}
  </div>

  <div>
    <input
      inputMode='decimal'
      value={weight ?? ''}
      onChange={onWeightChange}
      placeholder={prev?.weight?.toString() ?? '—'}
      className='w-full bg-transparent text-[14px] font-medium tabular-nums outline-none placeholder:text-txt-faint'
    />
    {prev && (
      <div className='mt-0.5 text-[10px] text-txt-faint'>
        prev {prev.weight}
      </div>
    )}
  </div>

  <div>
    <input
      inputMode='numeric'
      value={reps ?? ''}
      onChange={onRepsChange}
      placeholder={prev?.reps?.toString() ?? '—'}
      className='w-full bg-transparent text-[14px] font-medium tabular-nums outline-none placeholder:text-txt-faint'
    />
    {prev && (
      <div className='mt-0.5 text-[10px] text-txt-faint'>
        prev {prev.reps}
      </div>
    )}
  </div>

  <button
    type='button'
    onClick={onToggleDone}
    aria-label={done ? 'Marcar como pendente' : 'Concluir série'}
    className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] ${
      done ? 'border-lime bg-lime text-black' : 'border-txt-faint text-txt-faint'
    }`}
  >
    {done && '✓'}
  </button>
</div>
```

- [ ] **Step 3: Update tests if assertions check colors/classes**

Adjust assertions that pin to old class names. Behavior assertions (`onWeightChange` fires, `done` toggles) stay the same.

- [ ] **Step 4: Run SetRow tests**

```bash
npm run test:run -- src/components/SetRow.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/SetRow.tsx src/components/SetRow.test.tsx
git commit -m "refactor(redesign): SetRow grid layout with active/future states"
```

---

## Task 18: RestTimerOverlay

**Files:**
- Modify: `src/components/RestTimerCard.tsx` (rename internal logic) OR
- Create: `src/components/redesign/RestTimerOverlay.tsx`
- Create: `src/components/redesign/RestTimerOverlay.test.tsx`

We keep `RestTimerCard` for backwards-compat in case other places consume it, but introduce a thin wrapper `RestTimerOverlay` so layout owns the absolute positioning.

- [ ] **Step 1: Test the overlay**

```tsx
// src/components/redesign/RestTimerOverlay.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RestTimerOverlay } from './RestTimerOverlay';

describe('RestTimerOverlay', () => {
  it('renders nothing when remaining is null', () => {
    const { container } = render(<RestTimerOverlay remaining={null} target={90} onStop={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
  it('formats seconds as mm:ss', () => {
    render(<RestTimerOverlay remaining={72} target={90} onStop={() => {}} />);
    expect(screen.getByText('01:12')).toBeInTheDocument();
    expect(screen.getByText('90s')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, fail**

- [ ] **Step 3: Implement**

```tsx
// src/components/redesign/RestTimerOverlay.tsx
import { Pause } from 'lucide-react';

function format(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function RestTimerOverlay({
  remaining,
  target,
  onStop,
}: {
  remaining: number | null;
  target: number;
  onStop: () => void;
}) {
  if (remaining === null) return null;
  return (
    <div className='fixed bottom-[88px] left-1/2 z-20 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]'>
      <div className='flex items-center justify-between rounded-[12px] bg-lime px-4 py-3 text-black shadow-[0_6px_24px_rgba(163,230,53,0.25)]'>
        <div>
          <div className='text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70'>
            Descanso
          </div>
          <div className='mt-0.5 text-[24px] font-light tracking-tight num'>{format(remaining)}</div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[11px] opacity-70 num'>{target}s</span>
          <button
            type='button'
            onClick={onStop}
            aria-label='Pausar descanso'
            className='flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black text-lime'
          >
            <Pause className='h-3.5 w-3.5 fill-current' aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, pass**

- [ ] **Step 5: Export from barrel**

Add to `src/components/redesign/index.ts`:

```ts
export { RestTimerOverlay } from './RestTimerOverlay';
```

- [ ] **Step 6: Commit**

```bash
git add src/components/redesign/RestTimerOverlay.* src/components/redesign/index.ts
git commit -m "feat(redesign): RestTimerOverlay sticky lime overlay"
```

---

## Task 19: Restyle SessionDetail route

**Files:**
- Modify: `src/routes/SessionDetail.tsx`

- [ ] **Step 1: Read SessionDetail, list its props/hooks**

```bash
sed -n '1,250p' src/routes/SessionDetail.tsx
```

- [ ] **Step 2: Wire the new layout**

```tsx
import { useNavigate } from 'react-router-dom';
import { X, MoreVertical } from 'lucide-react';
import { ExerciseHero, ExerciseThumb, RestTimerOverlay } from '@/components/redesign';
import { SetRow } from '@/components/SetRow';

// hooks unchanged: useSession(), useActiveExercise(), useRestTimer(), etc.

const navigate = useNavigate();

return (
  <div className='space-y-4'>
    <header className='flex items-center justify-between'>
      <button onClick={() => navigate(-1)} aria-label='Fechar sessão' className='text-txt-faint'>
        <X className='h-5 w-5' />
      </button>
      <div className='text-center'>
        <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
          {sessionLabel /* "Treino B · 12:34" */}
        </div>
        <div className='mt-0.5 text-sm font-medium'>{sessionSubtitle /* "Pull · Semana 4" */}</div>
      </div>
      <button aria-label='Mais opções' className='text-txt-faint'>
        <MoreVertical className='h-5 w-5' />
      </button>
    </header>

    {/* Exercise progress segments */}
    <div className='flex gap-1'>
      {exercises.map((ex, i) => {
        const state =
          i < activeIndex ? 'done' : i === activeIndex ? 'current' : 'future';
        const cls =
          state === 'done'
            ? 'bg-lime'
            : state === 'current'
            ? 'bg-lime opacity-50'
            : 'bg-bg-1';
        return <div key={ex.id} className={`h-[3px] flex-1 rounded-[2px] ${cls}`} />;
      })}
    </div>

    <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
      Exercício {activeIndex + 1} de {exercises.length}
    </div>

    <ExerciseHero
      name={activeExercise.name}
      prescription={activeExercise.prescriptionText}
      imageUrl={activeExercise.imageUrl}
      videoUrl={activeExercise.videoUrl}
      ratio='16-10'
    />

    {/* Sets */}
    <div className='rounded-card bg-bg-1'>
      <div
        className='grid gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-txt-faint'
        style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}
      >
        <span>Set</span>
        <span>Kg</span>
        <span>Reps</span>
        <span />
      </div>
      {activeExercise.sets.map((set, i) => (
        <SetRow
          key={set.id}
          setNumber={i + 1}
          /* existing props ... */
        />
      ))}
    </div>

    <button
      type='button'
      onClick={onAddSet}
      className='w-full rounded-card border-[1.5px] border-dashed border-txt-faint p-3 text-[12px] uppercase tracking-[0.15em] text-txt-faint'
    >
      + adicionar série
    </button>

    {/* Up next */}
    {upcoming.length > 0 && (
      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Próximo
        </h2>
        <div className='space-y-1.5'>
          {upcoming.map((u) => (
            <div key={u.id} className='flex items-center gap-2.5 rounded-card bg-bg-1 p-2.5 opacity-70'>
              <ExerciseThumb src={u.imageUrl} alt={u.name} />
              <div className='flex-1'>
                <div className='text-[13px] font-medium'>{u.name}</div>
                <div className='mt-0.5 text-[9px] uppercase tracking-[0.15em] text-txt-faint'>
                  {u.prescriptionShort}
                </div>
              </div>
              <span className='text-sm text-txt-faint'>›</span>
            </div>
          ))}
        </div>
      </section>
    )}

    <RestTimerOverlay
      remaining={restRemaining}
      target={restTarget}
      onStop={onStopRest}
    />
  </div>
);
```

`prescriptionText`, `prescriptionShort`, and any missing projections come from existing `lib/program.ts` helpers; extend them only if a piece truly doesn't exist.

- [ ] **Step 3: Smoke check**

```bash
npm run dev
```

Open a session URL (or click "Iniciar treino" from `/`). Expected: hero with exercise image and play link if available, set rows in new style, rest timer appears at bottom when active.

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/SessionDetail.tsx src/lib
git commit -m "feat(redesign): Sessão layout with ExerciseHero + upnext + rest overlay"
```

---

# Phase 7 — Histórico

## Task 20: Restyle Progress route (list)

**Files:**
- Modify: `src/routes/Progress.tsx`

- [ ] **Step 1: Inspect Progress.tsx**

```bash
sed -n '1,200p' src/routes/Progress.tsx
```

- [ ] **Step 2: New layout**

```tsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { ExerciseThumb, Sparkline } from '@/components/redesign';

// existing hook returning exercises with stats unchanged

const groups = ['TODOS','PUSH','PULL','LEGS'] as const;
const [filter, setFilter] = useState<typeof groups[number]>('TODOS');
const [q, setQ] = useState('');

const visible = exercises
  .filter((e) => (filter === 'TODOS' ? true : e.group === filter))
  .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));

return (
  <div className='space-y-4'>
    <header>
      <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
        Progresso por exercício
      </div>
      <h1 className='mt-1 text-[22px] font-normal tracking-tight'>Histórico</h1>
    </header>

    <div className='flex items-center gap-2 rounded-card border border-line px-3 py-2'>
      <Search className='h-4 w-4 text-txt-faint' aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Buscar exercício…'
        className='w-full bg-transparent text-[13px] outline-none placeholder:text-txt-faint'
      />
    </div>

    <div className='-mx-1 flex gap-1.5 overflow-x-auto px-1'>
      {groups.map((g) => (
        <button
          key={g}
          onClick={() => setFilter(g)}
          className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.1em] ${
            filter === g ? 'bg-lime font-semibold text-black' : 'bg-bg-1 text-txt-dim'
          }`}
        >
          {g}
        </button>
      ))}
    </div>

    <div className='space-y-2'>
      {visible.map((e) => (
        <Link
          key={e.id}
          to={`/exercise/${e.id}`}
          className='flex items-center gap-3 rounded-card bg-bg-1 p-3'
        >
          <ExerciseThumb src={e.imageUrl} alt={e.name} size='tall' />
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-sm font-medium tracking-tight'>{e.name}</h3>
            <div className='mt-0.5 text-[10px] uppercase tracking-[0.15em] text-txt-faint'>
              PR {e.prWeight} × {e.prReps} · {e.sessionCount} sessões
            </div>
          </div>
          <Sparkline values={e.history} className='w-[60px]' />
        </Link>
      ))}
    </div>
  </div>
);
```

If `e.group`, `e.history`, `e.prReps`, `e.sessionCount` aren't already projected, extend the existing selector to include them, sourced from logs already in IndexedDB.

- [ ] **Step 3: Smoke check**

Visit `/progress`. Expected: search field, 4 filter pills, exercise rows with thumb + meta + sparkline.

- [ ] **Step 4: Tests**

```bash
npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/Progress.tsx src/lib
git commit -m "feat(redesign): Histórico list with thumbs + search + group filter"
```

---

## Task 21: Restyle ExerciseHistory route (detail)

**Files:**
- Modify: `src/routes/ExerciseHistory.tsx`
- Modify: `src/routes/ExerciseHistory.test.tsx` (if assertions check class names)

- [ ] **Step 1: Inspect existing route**

```bash
sed -n '1,200p' src/routes/ExerciseHistory.tsx
```

- [ ] **Step 2: New layout**

```tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { ExerciseHero, MiniBars } from '@/components/redesign';

const navigate = useNavigate();
const [metric, setMetric] = useState<'CARGA' | 'VOLUME' | 'REPS'>('CARGA');

return (
  <div className='space-y-4'>
    <header className='flex items-center justify-between'>
      <button onClick={() => navigate(-1)} aria-label='Voltar' className='text-txt-faint'>
        <ChevronLeft className='h-5 w-5' />
      </button>
      <button aria-label='Mais opções' className='text-txt-faint'>
        <MoreVertical className='h-5 w-5' />
      </button>
    </header>

    <ExerciseHero
      name={exercise.name}
      prescription={`${exercise.group} · ${stats.sessionCount} sessões`}
      imageUrl={exercise.imageUrl}
      videoUrl={exercise.videoUrl}
      ratio='16-9'
    />

    <div className='flex gap-1.5'>
      {(['CARGA','VOLUME','REPS'] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMetric(m)}
          className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.1em] ${
            metric === m ? 'bg-lime font-semibold text-black' : 'bg-bg-1 text-txt-dim'
          }`}
        >
          {m}
        </button>
      ))}
    </div>

    <div className='rounded-card bg-bg-1 p-3.5'>
      <div className='mb-2 flex items-end justify-between'>
        <div>
          <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>PR atual</div>
          <div className='mt-1 text-[32px] font-extralight leading-none num'>
            {stats.prWeight}
            <span className='ml-1 text-sm text-txt-faint'>kg</span>
          </div>
          <div className='mt-1 text-[11px] text-txt-dim'>
            × {stats.prReps} reps · {stats.prDate}
          </div>
        </div>
        <div className='text-[13px] font-medium text-lime num'>
          {stats.delta30dLabel}
          <span className='ml-1 text-txt-faint'>/ 30d</span>
        </div>
      </div>
      <MiniBars values={seriesFor(metric)} current={seriesFor(metric).length - 1} height={80} />
    </div>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Últimas sessões
      </h2>
      <div className='rounded-card bg-bg-1'>
        {recentLogs.map((l) => (
          <div
            key={l.id}
            className='flex items-center justify-between border-b border-line px-3.5 py-3 text-[13px] last:border-0'
          >
            <span className='text-txt-faint'>{l.dateLabel}</span>
            <span className='num'>
              {l.bestSet.weight}kg × {l.bestSet.reps}
            </span>
          </div>
        ))}
      </div>
    </section>
  </div>
);
```

- [ ] **Step 3: Smoke check**

Visit `/exercise/<id>`. Expected: hero with play link, metric pills, PR card with bar chart, recent sessions table.

- [ ] **Step 4: Run tests**

```bash
npm run test:run
```

Adjust `ExerciseHistory.test.tsx` only if assertions check stale class names. Keep semantic assertions intact.

- [ ] **Step 5: Commit**

```bash
git add src/routes/ExerciseHistory.tsx src/routes/ExerciseHistory.test.tsx src/lib
git commit -m "feat(redesign): Histórico detail with hero + metric toggle + bar chart"
```

---

# Phase 8 — Corpo

## Task 22: Restyle BodyMetrics route

**Files:**
- Modify: `src/routes/BodyMetrics.tsx`

- [ ] **Step 1: Inspect**

```bash
sed -n '1,200p' src/routes/BodyMetrics.tsx
```

- [ ] **Step 2: New layout**

```tsx
import { Plus } from 'lucide-react';
import { MetricCard } from '@/components/redesign';
import { PhotoGallery } from '@/components/PhotoGallery';

// existing hooks unchanged — measurements, deltas, photos

return (
  <div className='space-y-5'>
    <header className='flex items-center justify-between'>
      <div>
        <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
          Métricas corporais
        </div>
        <h1 className='mt-1 text-[22px] font-normal tracking-tight'>Corpo</h1>
      </div>
      <button
        onClick={onAddMetric}
        aria-label='Adicionar métrica'
        className='text-lime'
      >
        <Plus className='h-5 w-5' />
      </button>
    </header>

    <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>Hoje</div>
    <div className='grid grid-cols-2 gap-2'>
      <MetricCard
        label='Peso'
        value={fmt(latest.weight)}
        unit='kg'
        delta={deltas.weight7d}
        history={history.weight}
      />
      <MetricCard
        label='Cintura'
        value={fmt(latest.waist)}
        unit='cm'
        delta={deltas.waist30d}
        history={history.waist}
      />
      <MetricCard label='Peito' value={fmt(latest.chest)} unit='cm' delta={deltas.chest30d} history={history.chest} />
      <MetricCard label='Braço' value={fmt(latest.arms)} unit='cm' delta={deltas.arms30d} history={history.arms} />
    </div>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Fotos de progresso
      </h2>
      <PhotoGallery photos={photos} userId={activeUserId} />
      <button
        type='button'
        onClick={onAddPhoto}
        className='mt-2 w-full rounded-card border-[1.5px] border-dashed border-txt-faint p-3 text-[12px] uppercase tracking-[0.15em] text-txt-faint'
      >
        + adicionar foto
      </button>
    </section>
  </div>
);
```

**Field mapping (must match `BodyMetric` in `src/types.ts`):** `weight, waist, hips, chest, arms` are the only stored measurements. Choose any four for the grid (the example shows Peso / Cintura / Peito / Braço; swap in Quadril if preferred). Do not reference `bf` or `arm` — those don't exist in the type. `fmt`, `deltas`, `history` come from existing selectors used by today's BodyMetrics route; extend them to project per-field 7-day history and 30-day deltas, sourced from the same Dexie `bodyMetrics` table. `photos` and `activeUserId` are the same values the existing route already passes to `PhotoGallery` (see its current props in `src/components/PhotoGallery.tsx`). Do not introduce new database fields.

- [ ] **Step 3: Smoke check**

Visit `/corpo`. Expected: 2×2 metric grid, photo gallery, add-photo dashed button.

- [ ] **Step 4: Tests**

```bash
npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/BodyMetrics.tsx
git commit -m "feat(redesign): Corpo with metric grid + photo gallery"
```

---

# Phase 9 — Mais (Settings + Profiles)

## Task 23: Restyle Settings as Mais

**Files:**
- Modify: `src/routes/Settings.tsx`

- [ ] **Step 1: Inspect**

```bash
sed -n '1,200p' src/routes/Settings.tsx
```

- [ ] **Step 2: New layout**

```tsx
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useActiveUserProfile } from '@/lib/user';
import { useWorkoutStore } from '@/store/workoutStore';
import { db } from '@/db/client';
import { ProfileRow } from '@/components/redesign';

// existing inspection (Step 1) will reveal the exact action names used to
// switch and create profiles on useWorkoutStore. Common shape:
//   const setActiveUserId = useWorkoutStore((s) => s.setActiveUserId);
//   const createProfile   = useWorkoutStore((s) => s.createProfile);
// Use whatever names exist there — do not rename them inline.

const active = useActiveUserProfile();
const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? [];
const setActiveUserId = useWorkoutStore((s) => s.setActiveUserId);

return (
  <div className='space-y-5'>
    <header>
      <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
        Conta · ajustes
      </div>
      <h1 className='mt-1 text-[22px] font-normal tracking-tight'>Mais</h1>
    </header>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Perfis
      </h2>
      {profiles.map((p) => (
        <ProfileRow
          key={p.id}
          name={p.name}
          status={p.statusLabel /* derive in selector — e.g. "Ativo · semana 4" */}
          active={p.id === active?.id}
          onSelect={() => setActiveUserId(p.id)}
        />
      ))}
      <button
        type='button'
        onClick={onAddProfile}
        className='w-full rounded-card border-[1.5px] border-dashed border-txt-faint p-3 text-[12px] uppercase tracking-[0.15em] text-txt-faint'
      >
        + novo perfil
      </button>
    </section>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Programa
      </h2>
      <div className='rounded-card bg-bg-1'>
        <div className='flex items-center justify-between border-b border-line px-3.5 py-3 text-[13px]'>
          <span>Data de início</span>
          <span className='text-txt-faint num'>{startDateLabel}</span>
        </div>
        <div className='flex items-center justify-between border-b border-line px-3.5 py-3 text-[13px]'>
          <span>Recuperação +1 série</span>
          {/* keep existing Switch from shadcn but pass new theme via className */}
          <RecoverySwitch />
        </div>
        <div className='flex items-center justify-between px-3.5 py-3 text-[13px]'>
          <span>Lembretes</span>
          <RemindersSwitch />
        </div>
      </div>
    </section>

    <section>
      <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
        Dados
      </h2>
      <div className='rounded-card bg-bg-1'>
        <button
          type='button'
          onClick={onExport}
          className='flex w-full items-center justify-between border-b border-line px-3.5 py-3 text-left text-[13px]'
        >
          <span>Exportar JSON</span>
          <span className='text-txt-faint'>↓</span>
        </button>
        <button
          type='button'
          onClick={onImport}
          className='flex w-full items-center justify-between border-b border-line px-3.5 py-3 text-left text-[13px]'
        >
          <span>Importar JSON</span>
          <span className='text-txt-faint'>↑</span>
        </button>
        <button
          type='button'
          onClick={onReset}
          className='flex w-full items-center justify-between px-3.5 py-3 text-left text-[13px] text-red'
        >
          <span>Resetar logs</span>
          <span>⌫</span>
        </button>
      </div>
    </section>

    <Link
      to='/templates'
      className='block rounded-card bg-bg-1 px-3.5 py-3 text-[13px]'
    >
      <div className='flex items-center justify-between'>
        <span>Templates personalizados</span>
        <span className='text-txt-faint'>›</span>
      </div>
    </Link>

    <div className='pt-2 text-center text-[9px] uppercase tracking-[0.18em] text-txt-faint'>
      Diário Dani · v2.0
    </div>
  </div>
);
```

- [ ] **Step 3: Smoke check**

Visit `/settings`. Expected: profile list with active border, program card, data card, templates link, version footer.

- [ ] **Step 4: Tests**

```bash
npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/Settings.tsx
git commit -m "feat(redesign): Mais layout (profiles + program + data + templates link)"
```

---

# Phase 10 — Integration

## Task 24: Remove stale UI from Layout

**Files:**
- Modify: `src/components/Layout.tsx` (final cleanup)

- [ ] **Step 1: Verify the Layout shell no longer references the old 6-item nav or the legacy header**

```bash
grep -n 'ProfileSwitcher\|h1.*Dani\|navItems' src/components/Layout.tsx
```

Expected: no matches. If any remain (header `<h1>Dani</h1>`, the old `nav` block, or the `ProfileSwitcher` import), remove them.

- [ ] **Step 2: Confirm the `IOSInstallBanner` still mounts** (it should, just inside the shell)

If removed in Task 2, re-add it inside the main `<div>`:

```tsx
import { iOSInstallBanner as IOSInstallBanner } from './iOSInstallBanner';
// ...
{!isSession && <IOSInstallBanner />}
```

- [ ] **Step 3: Run all tests + lint**

```bash
npm run test:run
npm run lint
```

- [ ] **Step 4: Smoke check**

`npm run dev` and walk through every tab + open a session.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "chore(redesign): finalize Layout cleanup"
```

---

## Task 25: Playwright smoke test (optional — skip if time-constrained)

**Files:**
- Create: `tests/e2e/redesign-smoke.spec.ts` (path depends on existing Playwright config)

> **Note:** `package.json` declares only `playwright` (the library), not `@playwright/test` (the test runner). The runner is required before this task can run.

- [ ] **Step 1: Install the Playwright test runner**

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Check whether Playwright is already configured**

```bash
ls playwright.config.* 2>/dev/null
ls tests/ 2>/dev/null
```

If no config exists, create a minimal one:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:5173', ...devices['iPhone 14'] },
  webServer: { command: 'npm run dev', port: 5173, reuseExistingServer: true },
});
```

- [ ] **Step 3: Write the smoke test**

```ts
// tests/e2e/redesign-smoke.spec.ts
import { test, expect } from '@playwright/test';

test('tab navigation visits every primary surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Iniciar treino/i)).toBeVisible();

  await page.getByRole('link', { name: /Semana/ }).click();
  await expect(page).toHaveURL(/\/week/);
  await expect(page.getByText(/Sessões/i)).toBeVisible();

  await page.getByRole('link', { name: /Histórico/ }).click();
  await expect(page).toHaveURL(/\/progress/);

  await page.getByRole('link', { name: /Corpo/ }).click();
  await expect(page).toHaveURL(/\/corpo/);

  await page.getByRole('link', { name: /Mais/ }).click();
  await expect(page).toHaveURL(/\/settings/);
  await expect(page.getByText(/Perfis/i)).toBeVisible();
});
```

- [ ] **Step 4: Run**

```bash
npx playwright test
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e playwright.config.ts package.json package-lock.json
git commit -m "test(redesign): Playwright tab navigation smoke"
```

---

## Task 26: Final cleanup — remove dead styles + verify

**Files:**
- Modify: `src/index.css` (delete any remaining unused tailwind layers from the old theme)

- [ ] **Step 1: Audit `src/index.css`**

```bash
sed -n '1,200p' src/index.css
```

Remove rules that referenced the old palette (`bg-surface`, `text-foreground`, `bg-background`) **only if** no remaining component references them. Search before deleting:

```bash
grep -rn 'bg-surface\|bg-background\|text-foreground' src/
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors, no Tailwind purge warnings.

- [ ] **Step 3: Run all tests one more time**

```bash
npm run test:run
```

- [ ] **Step 4: Final commit**

```bash
git add src/index.css
git commit -m "chore(redesign): drop stale token aliases"
```

---

# Verification checklist

After Task 26, walk through this checklist manually in `npm run dev`:

- [ ] **Hoje** — greeting, big workout name, lime CTA, prescription card, aderência dots, PR card.
- [ ] **Semana** — phase strip with current week lime, 3 session cards each with thumb strip, weekly bar chart.
- [ ] **Sessão** — open from CTA, exercise hero with play link, set-logging grid, +adicionar série, próximo list, rest timer overlay appears after marking a set done.
- [ ] **Histórico** — search, group filters, exercise rows with thumb + sparkline.
- [ ] **Histórico detalhe** — hero + play, metric pills, PR card + bar chart, recent sessions table.
- [ ] **Corpo** — 2×2 metric grid with sparklines, photo gallery, + adicionar foto.
- [ ] **Mais** — profile rows (active bordered lime), program card with toggles, data card (export/import/red reset), templates link, version footer.
- [ ] **Tab bar** — present on all tabs, absent on Sessão. Active tab is lime.
- [ ] **Lighthouse mobile** — open chrome devtools, run a quick mobile audit. No regressions in performance or accessibility vs. main.

---

# What this plan deliberately does not change

- IndexedDB schema, Dexie migrations, Zustand store shape — untouched.
- Routing URLs — same. Only the layout component owns the nav now.
- The `treinoDani.ts` program data — untouched.
- Templates flow (`/templates`) — only its visual shell changes (it inherits the new tokens automatically); a deeper restyle is out of scope and can be a follow-up.
- Service worker, PWA manifest — unchanged.

Follow-up tickets to file (not part of this plan):

1. Restyle Templates flow end-to-end.
2. Self-hosted exercise GIFs (replace YouTube search redirects).
3. Onboarding micro-flow for first-time profile creation.
