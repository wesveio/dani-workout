# Technology Stack — New Additions

**Project:** Dani Workout v1.0 Full Redesign
**Researched:** 2026-04-21
**Scope:** New capabilities only. Existing stack (React 19, Vite, TypeScript, TailwindCSS, shadcn/ui, Zustand, Dexie, vite-plugin-pwa, Recharts, Zod, dayjs, lucide-react, React Router v7) is validated and unchanged.

---

## What's Already Covered by Existing Stack

| New Feature | Covered By |
|-------------|-----------|
| Exercise history charts | Recharts (already installed) |
| Body metrics charts | Recharts |
| Form validation (templates, metrics) | Zod |
| Date/time display | dayjs |
| Icons throughout redesign | lucide-react |
| Photo storage (blob) | Dexie — IndexedDB natively stores Blobs via Structured Clone |
| Multi-user profile data isolation | Dexie — add `userId` field to all tables, filter all queries by active profile stored in Zustand |
| Workout templates/programs | Dexie schema additions only, no new library |
| Dark theme | TailwindCSS `darkMode: 'class'` + CSS custom properties in shadcn/ui |

No new libraries needed for these. They are schema and UI work, not dependency work.

---

## New Additions Required

### Rest Timer — Notification + Haptic Feedback

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `react-timer-hook` | ^3.0.7 | `useTimer` hook — countdown state, start/pause/resume/restart | Avoids re-implementing setInterval + cleanup logic. Lightweight, no deps, works with React hooks model. v3 is stable; v4.0.5 exists but last published ~1 year ago — use latest stable. |

**Timer architecture note:** The countdown itself runs via `react-timer-hook`. When the timer expires, fire `navigator.vibrate([200, 100, 200])` (Android/Chrome) and `new Notification(...)` via the Web Notifications API (requires user permission prompt, one-time). iOS Safari does not support Vibration API — degrade gracefully (audio beep via `AudioContext` as fallback). No extra library needed for notifications or vibration — both are native browser APIs.

```
Install: npm install react-timer-hook
```

### Audio Feedback (Rest Timer Expiry — iOS Fallback)

No library needed. Use the Web Audio API (`AudioContext`) directly. A short beep on timer completion covers iOS where Vibration API is unsupported. ~15 lines of code, no dependency justified.

---

## Dark Theme Redesign — No New Libraries

shadcn/ui is already configured with CSS variables. The bold/energetic dark theme (Hevy/Strong aesthetic) is achieved by:

1. Setting `darkMode: 'class'` in `tailwind.config.ts` (likely already set)
2. Overriding shadcn/ui CSS custom properties in `globals.css` for the dark palette:
   - Background: `#0a0a0a` / `#111111`
   - Surface: `#1a1a1a` / `#222222`
   - Accent (energetic): `#f97316` (orange-500) or `#a855f7` (purple-500) — decide in design phase
   - Text: white / `#e5e5e5`
3. Forcing dark mode always-on (gym app, never needs light mode) — set `<html class="dark">` unconditionally, no theme toggle needed.

**No `next-themes` or any theme-switching library.** Single dark theme, always on.

---

## Multi-User Profiles — Implementation Pattern (No New Library)

Dexie already handles this via table-level filtering. Pattern:

1. Add a `profiles` table to Dexie schema: `{ id, name, avatarColor, createdAt }`
2. Add `profileId` field to all data tables (workouts, exercises, bodyMetrics, templates)
3. Store `activeProfileId` in Zustand (persisted to localStorage via `zustand/middleware` `persist`)
4. All Dexie queries filter by `activeProfileId` — Dexie's `.where('profileId').equals(id)` index

No separate DB per user. Single DB, partitioned by profileId. Simpler schema migrations, easier export/import.

---

## Body Metrics Photos — No New Library

Dexie stores `Blob` natively. Pattern:

1. `<input type="file" accept="image/*" capture="environment">` for camera access
2. Compress before storing: use `browser-image-compression` (see below) to reduce size
3. Store compressed Blob directly in Dexie `bodyMetrics` table

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `browser-image-compression` | ^2.0.2 | Compress photos before IndexedDB storage | IndexedDB has browser storage quotas (~50% of available disk). Gym progress photos uncompressed will hit limits fast. This lib is pure JS, no WASM, ~30KB, well-maintained. |

```
Install: npm install browser-image-compression
```

---

## Summary of New Dependencies

| Package | Version | Feature |
|---------|---------|---------|
| `react-timer-hook` | ^3.0.7 | Rest timer countdown |
| `browser-image-compression` | ^2.0.2 | Body metrics photo storage |

**Total new production dependencies: 2**

---

## Explicitly NOT Needed

| Rejected Addition | Reason |
|-------------------|--------|
| Dexie Cloud | Offline-only, no sync. Local profileId isolation is sufficient. |
| next-themes | Single always-dark theme. Overhead not justified. |
| framer-motion | shadcn/ui has built-in Radix transitions. Add only if specific animations prove necessary. |
| react-query / TanStack Query | No server. Zustand + Dexie handles all async state. |
| date-fns | dayjs already installed. Two date libraries is waste. |
| react-hook-form | shadcn/ui form + Zod + React state is the existing pattern. Don't add another form library. |
| Howler.js / Tone.js | Web Audio API is sufficient for a single beep. |

---

## Sources

- [react-timer-hook npm](https://www.npmjs.com/package/react-timer-hook) — MEDIUM confidence (npm page, last publish ~1yr)
- [browser-image-compression npm](https://www.npmjs.com/package/browser-image-compression) — MEDIUM confidence (widely cited)
- [Building Offline-Friendly Image Upload — Smashing Magazine, Apr 2025](https://www.smashingmagazine.com/2025/04/building-offline-friendly-image-upload-system/) — HIGH confidence (official source, current)
- [Vibration API — whatpwacando.today](https://whatpwacando.today/vibration/) — HIGH confidence (browser capability reference)
- [Tailwind dark mode docs](https://tailwindcss.com/docs/dark-mode) — HIGH confidence (official)
- [Dexie.js](https://dexie.org/) — HIGH confidence (official docs, IndexedDB Blob storage is native capability)
