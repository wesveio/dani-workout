# Redesign — Diário Dani

Date: 2026-05-15
Status: Approved (mockup v2)

## Goal

Reskin the existing workout PWA with a coherent "Minimal Athletic" visual system: dark-only, data-dense, lime accent, mobile-only. Cover all six existing surfaces (Dashboard, Week, Session, Exercise history, Body metrics, Settings/Profiles) without removing features. Preserve exercise media (image thumbnails and YouTube video links) as first-class affordances.

## Non-goals

- New features beyond what already exists in the codebase.
- Light-mode support.
- Desktop layout. Mobile-only PWA. Larger viewports get max-width centering, not a redesigned layout.
- Backend or sync work. Storage stays IndexedDB (Dexie).
- Replacing existing exercise data shape (`imageUrl`, `videoUrl` stay).

## Direction (locked decisions)

| Decision        | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Aesthetic       | Minimal Athletic (Strava / Whoop / Oura / Hevy / Linear)     |
| Theme           | Dark only                                                    |
| Accent          | Lime `#a3e635`                                               |
| Navigation      | Bottom tab bar, 5 items: Hoje · Semana · Histórico · Corpo · Mais |
| Viewport        | Mobile-only, max-width 480px content area centered           |
| Typography      | Inter Variable, tabular numerals on all numeric values       |
| Photo/video     | Hero (16:10 / 16:9) on Session & History detail; thumbs (44–54px) elsewhere |

## References (top 5, what to steal)

1. **Hevy** — set-logging row: `[set# pill] [prev ghosted] [kg] [reps] [check]`; tap-to-complete; sticky rest timer overlay.
2. **WHOOP** — almost-black bg, one big number per card, 3-color semantic palette (lime / amber / red), no decorative gray.
3. **Strava** — weekly bar chart with the active day highlighted lime; tap a bar to drill into the session.
4. **Oura** — equal-weight metric cards with big-number + 7-day sparkline; hierarchy through luminance, not size.
5. **Linear** — Inter Variable, tight letter-spacing, tabular numerals, three-token color system (base + accent + contrast), accent used sparingly.

What NOT to take: neumorphism, additional accent colors, 5+ tab nav with deep nesting, light mode, decorative icons, illustrations.

Full reference notes: `.planning/redesign/RESEARCH.md`.

## Information architecture

```
Bottom tabs (5):
  Hoje       → Dashboard (today's session + week glance + recent PR)
  Semana     → 12-week program view, sessions per week, weekly volume chart
  Histórico  → Exercise list + per-exercise detail (PR, chart, sessions)
  Corpo      → Body metrics grid + progress photos
  Mais       → Profile switcher, program config, data import/export/reset

Modal (fullscreen, on top of tabs):
  Sessão ativa → triggered from Hoje "Iniciar treino" CTA
```

Session is intentionally a fullscreen modal, not a tab. Running a workout is a focused mode; the user shouldn't accidentally lose progress by tab-switching.

## Design tokens

```css
/* color */
--bg:       #0a0a0a;   /* page background */
--bg-1:     #111111;   /* card surface */
--bg-2:     #171717;   /* inner surface (input chip, pill) */
--line:     #1f1f1f;   /* row dividers, borders */
--txt:      #e5e5e5;   /* primary text */
--txt-dim:  #9ca3af;   /* secondary text */
--txt-faint:#525252;   /* tertiary / placeholders / inactive icons */

--lime:     #a3e635;   /* primary accent: active, success, CTA */
--amber:    #fbbf24;   /* warning (RIR drift, deload nudge) */
--red:      #f87171;   /* destructive, missed session */

/* type */
--font:     'Inter Variable', 'Inter', system-ui, sans-serif;
--feat:     'cv11', 'ss01', 'tnum';

/* radius */
--r-card:   10px;
--r-hero:   14px;
--r-thumb:  8px;
--r-pill:   999px;

/* spacing scale (existing Tailwind 4-based) is fine */
```

Three accent-color rule: lime + amber + red. No others. Any additional color in mockups counts as a bug.

## Typography scale

| Token  | Use                                        | Size  | Weight | Tracking |
| ------ | ------------------------------------------ | ----- | ------ | -------- |
| h-big  | Screen title (today's workout name)        | 36px  | 200    | -1.5px   |
| h-mid  | Sub-title, screen-name in tab headers      | 22px  | 400    | -0.5px   |
| h-sec  | Section label (UPPERCASE)                  | 11px  | 600    | +2px     |
| body   | Default text                               | 13px  | 400    | 0        |
| kicker | Tiny uppercase label above value           | 10px  | 400    | +2.5px   |
| meta   | Tiny uppercase metadata (date, set count)  | 10px  | 400    | +1.5px   |
| num    | Any numeric value                          | inherits | inherits | tabular-nums |

## Components

### Bottom tab bar
- Fixed bottom, blur backdrop (`rgba(10,10,10,.92)` + `backdrop-filter: blur(20px)`), top border `--line`.
- 5 items, equal flex. Each: 20×20 icon + 9px uppercase label.
- Active: lime icon fill + lime label. Inactive: `--txt-faint`.

### Primary CTA
- Lime background `#a3e635`, black text, 14px radius, 18×20 padding. Right-side circular arrow chip (black bg, lime arrow).

### Card
- `--bg-1` background, `--r-card` radius, 14px padding, no border by default. Optional `.lined` variant: transparent bg + 1px `--line` border.

### Row (inside card)
- Flex, label left (`--txt-faint`), value right (`--txt`, tabular if numeric), 9px vertical padding, 1px bottom border `--line`, last row borderless.

### Hero media (Session, History detail)
- Aspect ratio 16:10 (session) or 16:9 (history detail).
- Background: exercise `imageUrl` (object-cover) with bottom-fade gradient `linear-gradient(180deg, transparent 40%, rgba(0,0,0,.85) 100%)`.
- Bottom-left overlay: exercise name (18px, 500) + prescription meta (10px uppercase, `--txt-faint`).
- Bottom-right: lime 44×44 play button (only when `videoUrl` exists). Tap opens video in a new tab or sheet.
- Fallback (no `imageUrl`): monochrome silhouette (SVG) at 6% opacity, centered.

### Thumb
- 44×44 (lists, "Próximo" rows) or 54×54 (Histórico list rows). Radius 8–10px. Object-cover. Same fallback rule as hero.

### Thumb strip (Semana sessions)
- Horizontal row of 32×32 thumbs, 4px gap, up to 6 visible, overflow with "+N".

### Set-logging row (Sessão)
- Grid `28px | 1fr | 1fr | 36px`: pill (set #) · kg input + ghost "prev" caption · reps input + ghost "prev" caption · check circle.
- Active row: 5% lime tint background, lime pill background, set # text black.
- Completed row: check filled lime with black ✓; inputs keep their values.
- Future row: 50% opacity, placeholder `—`.

### Rest timer (Sessão only)
- Absolute, anchored 90px from bottom (above tab area). Lime background, black text. Big tabular `mm:ss`, target seconds shown small on the right. Tap pauses/resumes; long-press resets.

### Aderência dots (Hoje week glance)
- 7 squares 22×22, radius 5. Done = lime + black letter, miss = `--bg-2` + faint red letter, future = `--bg-2` + faint letter.

### Phase strip (Semana)
- 12 horizontal segments, 6px tall. Done = lime 40% opacity, current = lime 100%, future = `--bg-1`.

### Metric mini-card (Corpo)
- `--bg-1` 10px radius. Layout: kicker label (PESO, BF%, etc) · big-number `22px/300` with small unit · 7-bar sparkline lime 60% opacity (full-opacity for the latest bar) · optional delta line in lime/amber.

### Profile row (Mais)
- 32×32 avatar + name + status meta. Active variant: 1px lime border + lime check on the right.

## Screens

Each screen below lists: purpose · layout outline · referenced components · what changed vs. current.

### Hoje (Tab 1)
- Purpose: surface today's session + quick context to start training in one tap.
- Layout: header (avatar + greeting + menu) → kicker "Quarta · Semana 4/12" → `h-big` workout name → `h-mid` muscle group → lime CTA "Iniciar treino" → prescription card (volume, RIR, duration, deload) → "SEMANA" section: aderência card (count + 7-dot row) → "PR RECENTE" card (exercise name + value + sparkline).
- Changes: replaces existing dashboard "Hoje" card with a hierarchy-driven layout. Quick warm-up shortcut and rules move into the session screen.

### Semana (Tab 2)
- Purpose: see the 12-week arc + which session lands which weekday.
- Layout: header (program · semana N) ← week stepper → 12-segment phase strip → phase labels (Fase 1 · Volume / Fase 2 · Força) → "SESSÕES" three cards (A · Push, B · Pull, C · Legs), each with day name, exercise count, prescription pill, and a 6-thumb exercise strip → "VOLUME SEMANAL" 12-bar chart with current week highlighted.
- Changes: replaces existing Semana with explicit phase strip + thumb strips for visual recognition of sessions.

### Sessão ativa (modal)
- Purpose: log sets quickly with minimal scroll, see what's next.
- Layout: top bar (×, "Treino B · 12:34", ⋯) → exercise progress segments (one per exercise in the session) → kicker "Exercício 3 de 6" → hero media (16:10) with play button → set-logging table with header row → "+ adicionar série" → "PRÓXIMO" section showing the next 1–2 exercises as upnext rows (thumb + name + prescription).
- Sticky bottom: rest timer (only when active).
- Changes: hero media is new; rest timer becomes a persistent overlay (existed but redesigned); prev-set ghosts replace separate "history" toggle.

### Histórico lista (Tab 3)
- Purpose: pick an exercise to inspect progress.
- Layout: header → search field → group filter pills (TODOS · PUSH · PULL · LEGS) → list of exercise rows (thumb + name + "PR X × Y · N sessões" + 7-bar sparkline on the right).
- Changes: list-with-thumb replaces the current text-heavy list; group filter is new.

### Histórico detalhe
- Purpose: see PR, trend, and recent sessions for one exercise.
- Layout: top bar (‹, ⋯) → hero (16:9) with play → metric toggle pills (CARGA · VOLUME · REPS) → PR card (big-number + delta % over 30d + 12-bar chart) → "ÚLTIMAS SESSÕES" table.
- Changes: hero + play replace the current title bar; bar chart replaces line chart.

### Corpo (Tab 4)
- Purpose: track weight, body-fat, measurements, progress photos.
- Layout: header (+ icon for new entry) → kicker "Hoje" → 2×2 metric grid (Peso, % Gordura, Cintura, Braço) → "FOTOS DE PROGRESSO" 2-col photo grid (with date overlay) → "+ adicionar foto" dashed button.
- Changes: pulls the body-metrics phase (already implemented) into the new tab. Currently no dedicated tab existed.

### Mais (Tab 5)
- Purpose: switch profile, configure program, manage data.
- Layout: header → "PERFIS" section: profile rows (active one is bordered lime, others tappable) + "+ novo perfil" dashed → "PROGRAMA" card (start date, recuperação toggle, lembretes toggle) → "DADOS" card (Exportar / Importar / Resetar, last one in red) → version footer.
- Changes: profiles surface here as a first-class section; settings rows get the new toggle style.

## Implementation notes (no code yet)

- Stack stays React + Vite + TypeScript + Tailwind + shadcn/ui + Dexie + Zustand. No swap.
- Theme: Tailwind config gets the token palette above as CSS variables. Drop existing light tokens.
- Components to add/update:
  - `BottomTabBar`
  - `PrimaryCTA`
  - `ExerciseHero` (covers media + play)
  - `ExerciseThumb`
  - `SetRow` (replaces existing logging row)
  - `RestTimerOverlay`
  - `AderenciaDots`
  - `PhaseStrip`
  - `MetricCard` (with sparkline)
  - `ProfileRow`
- Existing shadcn primitives (`Sheet`, `Dialog`, `Toggle`) keep their roles. Restyle via Tailwind utility classes; do not fork shadcn.
- Inter Variable: load via `@import` from `rsms.me/inter` or local self-host. Set `font-feature-settings: 'cv11', 'ss01', 'tnum'` globally.
- Tabular numerals: apply `font-variant-numeric: tabular-nums` on a `.num` utility used on every numeric span.
- Mobile-only enforcement: wrap the app in `<div class="mx-auto max-w-[480px]">`. No alternative desktop layout.
- Video link: open `videoUrl` in a new tab via `target="_blank" rel="noopener"`. Existing YouTube search-result URLs work as-is.
- Image fallback: SVG silhouette component, rendered when `imageUrl` 404s or is absent.

## Out of scope (explicit)

- New exercise media (no need to source new images/videos; existing fields are used as-is).
- AI / coach features.
- Cloud sync / multi-device.
- Onboarding flow redesign (currently no onboarding; not adding one).
- Light theme.
- New programs beyond the existing 12-week plan.

## Open questions (none blocking)

- Long-term: do we want a self-hosted video preview (instead of YouTube search redirect)? Not in scope here. Stays a YouTube link.
- The thumb-strip on Semana session cards relies on `imageUrl` for every exercise. Plan A: ship with silhouettes for missing ones. Plan B: backfill thumbnails. Default to Plan A — silhouettes are part of the system.

## References

- `.planning/redesign/RESEARCH.md` — full reference notes (13 apps, top-5 curation, grouped steals)
- `.superpowers/brainstorm/10149-1778875414/content/mockup-v2.html` — visual mockup approved 2026-05-15
- `.superpowers/brainstorm/10149-1778875414/content/curation.html` — top-5 ref curation screen
- `.superpowers/brainstorm/10149-1778875414/content/aesthetic-direction.html` — direction selection screen
