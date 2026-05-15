# Phase 6: Body Metrics + PWA Safety - Research

**Researched:** 2026-04-22
**Domain:** IndexedDB body metrics storage, image compression, Recharts multi-line charts, iOS PWA install banner
**Confidence:** HIGH

## Summary

Phase 6 builds on a well-established foundation. The `BodyMetric` type, `bodyMetrics` Dexie table (version 4 schema), Zod validation schema, and export bundle support are all already present in the codebase — they just need a UI surface and store actions wired up. The bottom nav has 5 tabs with a clear slot for a 6th "Corpo" tab. Recharts is already at v3.6.0 with an established AreaChart pattern in `ExerciseProgressChart.tsx`; body metrics charts will use LineChart (not AreaChart) with multiple data series.

The two genuinely new technical domains are: (1) client-side image compression via Canvas API for progress photos, and (2) the iOS Safari "Add to Home Screen" banner, which cannot use the standard `beforeinstallprompt` event (iOS does not fire it) and requires user-agent sniffing combined with `window.navigator.standalone` detection. Both have straightforward, well-known implementations.

Progress photos require a new Dexie table (`progressPhotos`) since `BodyMetric` stores numbers and text only — blobs/base64 strings should not be co-mingled with metric records. The table will be a version 5 schema migration.

**Primary recommendation:** Add a `bodyMetricsStore` (separate from `workoutStore`) for CRUD operations on body metrics and photos. Wire to existing Dexie tables + new v5 photos table. All UI components are Claude's discretion per CONTEXT.md.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Camera + gallery — `<input type="file" accept="image/*" capture="environment">`
- **D-02:** Timeline gallery layout — photos sorted by date (newest first), scrollable grid. Tap to view full-size.
- **D-03:** Auto-compress photos to ~200KB before storing. Show storage usage indicator. Warn user when approaching iOS IndexedDB quota.
- **D-04:** Photos included in export/import bundles as base64. Export file will be larger but backup is complete.
- **D-05:** Quick-log form — primary input is bodyweight (kg). Expandable "Medidas" section for waist/hips/chest/arms (all optional). Notes field.
- **D-06:** New bottom nav tab — dedicated "Corpo" tab for body metrics.
- **D-07:** Edit + delete past entries with confirmation dialog. Tap to edit, long-press or swipe to delete.
- **D-08:** Metric units only — kg for weight, cm for measurements. No imperial conversion.
- **D-09:** Bodyweight trend: line chart with period selector tabs (1M/3M/6M/1Y/All). Reuse Recharts + match ExerciseProgressChart patterns.
- **D-10:** Measurements chart: single multi-line chart with toggleable lines for waist/hips/chest/arms.
- **D-11:** No goal line — keep charts simple, show actual data only.
- **D-12 (base):** iOS install banner — details at Claude's discretion (see below).

### Claude's Discretion

- iOS install banner full implementation (D-12): placement, timing, dismissal, standalone detection, re-prompt logic
- Progress photo grid layout (columns, thumbnail size, spacing)
- ProgressPhoto type definition (extend from existing BodyMetric pattern)
- New Dexie table for photos (or extend bodyMetrics — Claude decides)
- Image compression library choice and implementation
- Storage quota estimation approach
- Chart styling, colors, and responsive behavior
- Nav tab icon and label choice
- Entry form component structure and animations
- Empty states for charts and photo gallery

### Deferred Ideas (OUT OF SCOPE)

- Side-by-side photo comparison (before/after transformation view)
- Pose categorization (front/side/back tagging)
- Goal weight line on chart
- Imperial unit support
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BODY-01 | User can log bodyweight and see trend chart over time | BodyMetric type + bodyMetrics table exist; need store CRUD actions + BodyMetricScreen route + WeightTrendChart component |
| BODY-02 | User can log manual body measurements (waist, hips, chest, arms) | Same BodyMetric type covers these fields; quick-log form with Collapsible "Medidas" section; MeasurementsChart with 4 Lines |
| BODY-03 | User can take and store progress photos with date stamps | New ProgressPhoto type + Dexie v5 photos table + Canvas compression + file input + photo gallery grid |
| UI-04 | iOS Safari users see persistent "Add to Home Screen" banner | iOS UA detection + navigator.standalone + localStorage dismissal flag + fixed banner above nav |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Body metrics CRUD | Browser/Client (IndexedDB) | — | Offline-first, no backend |
| Image compression | Browser/Client (Canvas API) | — | Must run before IndexedDB write |
| Progress photo storage | Browser/Client (IndexedDB blob/base64) | — | Offline-first; base64 in Dexie |
| Trend chart rendering | Browser/Client (Recharts) | — | Stateless transform of IndexedDB data |
| iOS install banner | Browser/Client | — | UA sniffing + standalone detection is client-only |
| Export/import with photos | Browser/Client | — | Extend existing ExportBundle in workoutStore |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie | 4.2.1 | IndexedDB ORM — photos + body metrics | Already in use, v5 schema migration needed [VERIFIED: package.json] |
| Recharts | 3.6.0 | Line charts for weight + measurement trends | Already in use, ExerciseProgressChart pattern established [VERIFIED: package.json] |
| Canvas API | browser-native | Image compression before IndexedDB write | No library needed — `HTMLCanvasElement.toBlob()` with quality param |
| Zod | 4.2.1 | ProgressPhoto + updated ExportBundle schema | Already in use in workoutStore [VERIFIED: package.json] |
| Zustand | 5.0.9 | Body metrics store state | Already in use [VERIFIED: package.json] |
| shadcn/ui | manual | Collapsible, Dialog, Tabs, Badge, Button | Already installed [VERIFIED: 06-UI-SPEC.md] |
| Lucide React | 0.562.0 | Scale icon for Corpo nav tab | Already in use [VERIFIED: package.json] |

### No New Dependencies Needed
All required libraries are already installed. Image compression uses the native Canvas API. The iOS banner is pure DOM/CSS — no library required.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas API compression | `browser-image-compression` npm | Library adds ~12KB but is easier. Canvas API is simpler and avoids new dep — preferred per project philosophy. |
| Separate bodyMetricsStore | Extend workoutStore | workoutStore is already large. Separate store keeps concerns isolated and matches project pattern where templates are in workoutStore but body metrics are logically distinct. Either works — Claude's discretion. |

---

## Architecture Patterns

### System Architecture Diagram

```
User action
    │
    ▼
BodyMetricScreen (route: /corpo)
    │
    ├── Quick-log Sheet (open on "Registrar")
    │       │
    │       ├── Weight + Measurements form fields
    │       ├── [Image input] → Canvas compression → base64 blob
    │       └── Save → bodyMetricsStore.addEntry() / addPhoto()
    │
    ├── WeightTrendChart
    │       └── reads bodyMetrics[userId+date] via Dexie liveQuery or store
    │
    ├── MeasurementsChart (4 Lines: Cintura/Quadril/Peitoral/Braços)
    │       └── same data source, filtered for metric fields
    │
    ├── Entry log list (edit/delete per entry)
    │
    └── Photo gallery grid
            └── reads progressPhotos[userId+date] from Dexie v5 table

iOSInstallBanner (fixed, rendered in Layout.tsx above nav)
    └── UA detection + standalone check + localStorage dismissal flag
```

### Recommended Project Structure
```
src/
├── routes/
│   └── BodyMetrics.tsx          # Main screen (lazy-loaded in App.tsx)
├── components/
│   ├── WeightTrendChart.tsx      # LineChart wrapping Recharts
│   ├── MeasurementsChart.tsx     # Multi-line LineChart
│   ├── BodyMetricSheet.tsx       # Quick-log bottom sheet (Dialog or Sheet)
│   ├── PhotoGallery.tsx          # 3-column grid + add placeholder
│   └── iOSInstallBanner.tsx      # Fixed banner, handles its own detection
├── store/
│   └── bodyMetricsStore.ts       # Zustand store: CRUD for metrics + photos
└── lib/
    └── imageCompression.ts       # Canvas-based resize/compress util
```

### Pattern 1: Dexie v5 Schema — ProgressPhoto Table

Add version 5 to `src/db/client.ts`:

```typescript
// [VERIFIED: src/db/client.ts pattern]
this.version(5).stores({
  // all prior tables unchanged (repeat schemas)
  progressPhotos: '&id, userId, [userId+date], date',
})
```

ProgressPhoto type:
```typescript
export type ProgressPhoto = {
  id: string
  userId: string
  date: string         // ISO date string (YYYY-MM-DD)
  dataUrl: string      // base64 compressed image
  fileSizeBytes: number
}
```

### Pattern 2: Canvas Image Compression

```typescript
// [ASSUMED] — standard browser Canvas API pattern, well-established
export async function compressImage(file: File, targetBytes = 200_000): Promise<string> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  let { width, height } = img
  const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size > 1_000_000) { reject(new Error('too-large')); return }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.8
    )
  })
}
```

### Pattern 3: iOS Install Banner Detection

```typescript
// [ASSUMED] — documented iOS behavior, well-known pattern
function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  return isIOS && isSafari
}

function isStandalone(): boolean {
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

const DISMISS_KEY = 'ios-banner-dismissed-until'
function shouldShowBanner(): boolean {
  if (!isIOSSafari() || isStandalone()) return false
  const until = localStorage.getItem(DISMISS_KEY)
  if (!until) return true
  return Date.now() > Number(until)
}

function dismissBanner(): void {
  const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem(DISMISS_KEY, String(sevenDays))
}
```

### Pattern 4: Recharts Multi-Line Chart (MeasurementsChart)

Based on existing `ExerciseProgressChart.tsx` pattern, switching from AreaChart to LineChart:

```typescript
// [VERIFIED: ExerciseProgressChart.tsx — adapting to multi-line]
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

// Chart datum shape:
type MeasurementDatum = {
  date: string
  waist?: number
  hips?: number
  chest?: number
  arms?: number
}

// Colors from UI-SPEC (locked):
const COLORS = {
  waist: '#FF8C00',   // accent secondary
  hips:  '#4EFF74',   // chart line 2
  chest: '#4495FF',   // chart line 3
  arms:  '#A78BFA',   // chart line 4
}
```

### Pattern 5: bodyMetricsStore (Zustand)

Following `workoutStore` pattern for consistency:

```typescript
// [VERIFIED: workoutStore.ts pattern]
import { create } from 'zustand'
import Dexie from 'dexie'
import { db } from '@/db/client'
import type { BodyMetric, ProgressPhoto } from '@/types'

type BodyMetricsStore = {
  entries: BodyMetric[]
  photos: ProgressPhoto[]
  activeUserId: string
  loadForUser: (userId: string) => Promise<void>
  addEntry: (entry: Omit<BodyMetric, 'id'>) => Promise<void>
  updateEntry: (id: string, patch: Partial<BodyMetric>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  addPhoto: (photo: Omit<ProgressPhoto, 'id'>) => Promise<void>
  deletePhoto: (id: string) => Promise<void>
  storageUsageBytes: () => number
}
```

### Pattern 6: Period Filtering for Charts

```typescript
// [ASSUMED] — standard date arithmetic with dayjs (already in deps)
import dayjs from 'dayjs'

function filterByPeriod(entries: BodyMetric[], period: '1M' | '3M' | '6M' | '1Y' | 'All'): BodyMetric[] {
  if (period === 'All') return entries
  const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }[period]
  const cutoff = dayjs().subtract(months, 'month').toISOString()
  return entries.filter(e => e.date >= cutoff)
}
```

### Pattern 7: Storage Usage Estimation

```typescript
// [ASSUMED] — navigator.storage.estimate() is available in all modern browsers
async function getStorageUsage(): Promise<{ usedMB: number; quotaMB: number; percentUsed: number }> {
  const est = await navigator.storage.estimate()
  const used = est.usage ?? 0
  const quota = est.quota ?? 0
  return {
    usedMB: used / 1_000_000,
    quotaMB: quota / 1_000_000,
    percentUsed: quota > 0 ? (used / quota) * 100 : 0,
  }
}
```

### Anti-Patterns to Avoid

- **Storing full-resolution photos:** Compress BEFORE writing to IndexedDB. iOS IndexedDB quota for non-installed PWAs is ~50MB. At installed state it grows, but still finite. Uncompressed photos will exhaust quota within days.
- **Putting photo blobs in the BodyMetric type:** Keep photos in a separate `progressPhotos` table. BodyMetric is for numeric measurements only. Mixing types complicates queries and the Zod schema.
- **Using `beforeinstallprompt` for iOS:** This event never fires on iOS Safari. iOS install must be detected by UA sniffing + standalone property.
- **Relying on setInterval for the dismiss timer:** Use `localStorage` with an absolute timestamp. Same pattern as rest timer (Phase 3, Date.now delta).
- **Extending workoutStore further:** It's already 400+ lines. Add a dedicated `bodyMetricsStore.ts` for body metrics domain.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-line chart with legend | Custom SVG chart | Recharts LineChart + Legend | Already in codebase, toggling handled natively |
| Date formatting in charts | Manual date string manipulation | `dayjs.format('DD/MM')` | Already in deps, locale-aware |
| Dialog for confirmations | Custom modal | shadcn Dialog (already installed) | Accessible, keyboard-trapped |
| Bottom sheet / drawer | Custom CSS animation | shadcn Dialog positioned at bottom OR add Sheet component | Radix already imported |
| Storage quota check | Guess or hardcode | `navigator.storage.estimate()` | Browser API, accurate per-origin |

**Key insight:** Almost nothing in this phase needs new libraries. The complexity is in stitching together browser APIs (Canvas, File, storage.estimate) with existing Dexie + Recharts + Zustand infrastructure.

---

## Common Pitfalls

### Pitfall 1: iOS IndexedDB Quota Behavior

**What goes wrong:** Users on iOS Safari (not installed) hit a 50MB soft quota. When exceeded, IndexedDB writes fail silently or throw with `QuotaExceededError`. Photos stored without compression exhaust this quickly.
**Why it happens:** iOS applies stricter storage limits to browser-accessed PWAs vs. installed home-screen apps.
**How to avoid:** Compress to ~200KB before write (Canvas API). After compression, check `blob.size > 1_000_000` and reject. Show storage indicator using `navigator.storage.estimate()`. Warn at 80% of quota per UI-SPEC.
**Warning signs:** Dexie `put()` throwing `QuotaExceededError` exception. Catch this specifically and show "Armazenamento cheio" toast.

### Pitfall 2: iOS Safari Standalone Detection Timing

**What goes wrong:** Banner appears briefly even after user installs the app, because `window.navigator.standalone` may not update until page reload.
**Why it happens:** `navigator.standalone` is set at load time. If checked before install is registered, it returns false.
**How to avoid:** Check `standalone` on component mount, not on every render. Accept this as expected behavior — the banner will not show on next visit after installation since the page reloads in standalone mode.

### Pitfall 3: `capture="environment"` on iOS Restricts to Camera Only

**What goes wrong:** Using `capture="environment"` on iOS forces camera-only — user cannot pick from photo library.
**Why it happens:** iOS interprets `capture` attribute as "camera only" — this differs from Android behavior.
**How to avoid:** Omit the `capture` attribute and rely on `accept="image/*"` alone. iOS will show a sheet letting user choose camera or library. Per D-01, user should be able to "snap or pick from gallery" — dropping `capture` achieves this. [ASSUMED — known iOS behavior, not verified in this session]

### Pitfall 4: Recharts Legend Toggle State

**What goes wrong:** Recharts legend click-to-hide only works with controlled state if you need to reset or persist visibility.
**Why it happens:** Default Recharts `Legend` + `onClick` requires manual state management for which lines are hidden.
**How to avoid:** Use `useState` array of hidden keys. Pass `hide={hiddenKeys.includes('waist')}` to each `<Line>`. Wire `<Legend onClick>` to toggle array.

### Pitfall 5: ExportBundle base64 Size

**What goes wrong:** A full backup with 50 photos × 200KB = 10MB base64 JSON. This is large but not pathological; however the JSON parse on import will be slow on older devices.
**Why it happens:** base64 inflates binary data by ~33%.
**How to avoid:** This is accepted (D-04). Ensure import reads with `JSON.parse` not streaming — acceptable for v1 scale. No action needed, just awareness.

### Pitfall 6: Bottom Nav Now Has 6 Items

**What goes wrong:** Adding "Corpo" tab gives 6 nav items. The current nav uses `justify-between` in a fixed-width container (`max-w-[360px]`). 6 items at 11px label + 20px icon each can crowd.
**Why it happens:** Current Layout.tsx was designed for 5 items.
**How to avoid:** Reduce per-tab padding from `px-1` to `px-0.5` and verify 6 tabs still clear 44px touch target height. Alternatively, Settings tab can be accessed via profile icon only — but that changes existing UI, so prefer the padding adjustment. [ASSUMED — requires visual verification]

---

## Code Examples

### Existing Recharts Pattern (from ExerciseProgressChart.tsx)

```typescript
// [VERIFIED: src/components/ExerciseProgressChart.tsx]
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
// Tooltip style (match this exactly):
contentStyle={{ borderRadius: 12, border: '1px solid #2A2A2A', background: '#1A1A1A' }}
// Axis style:
tickLine={false} axisLine={false}
```

### Existing Dexie Query Pattern

```typescript
// [VERIFIED: src/store/workoutStore.ts lines 153-157]
db.workouts
  .where('[userId+date]')
  .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
  .reverse()
  .toArray()

// Apply same pattern for bodyMetrics:
db.bodyMetrics
  .where('[userId+date]')
  .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
  .reverse()
  .toArray()
```

### Lazy Route Registration (App.tsx pattern)

```typescript
// [VERIFIED: src/App.tsx]
const BodyMetrics = lazy(() => import('./routes/BodyMetrics'))
// Add route:
<Route path="/corpo" element={<BodyMetrics />} />
```

### Nav Tab Addition (Layout.tsx pattern)

```typescript
// [VERIFIED: src/components/Layout.tsx]
import { Scale } from 'lucide-react'
// Add to navItems array:
{ to: '/corpo', label: 'Corpo', icon: Scale },
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `beforeinstallprompt` for iOS install | UA sniffing + `navigator.standalone` | iOS never supported it | Must use detection pattern, not the web standard |
| `canvas.toDataURL()` | `canvas.toBlob()` with FileReader | Long-standing | `toBlob` is async and more memory-efficient for large images |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Omitting `capture` attribute on iOS shows camera/gallery choice sheet | Pitfall 3 | If wrong, user may be camera-only or library-only on some iOS versions — test on device |
| A2 | Canvas-based compression approach (scale by sqrt of ratio) produces ~200KB output reliably | Pattern 2 | If wrong, some photos may remain over target; add iterative quality reduction loop |
| A3 | `navigator.storage.estimate()` returns meaningful values on iOS Safari | Pattern 7 | iOS may return 0 or undefined for quota — fall back to showing raw usage bytes only |
| A4 | 6 nav items fit at reduced padding within 360px container | Pitfall 6 | If too cramped, Settings must move elsewhere or labels must be dropped |
| A5 | `window.navigator.standalone` is typed as optional on TypeScript; cast needed | Pattern 3 | TypeScript will error without the cast — already shown in code example |

---

## Open Questions

1. **Sheet component availability**
   - What we know: Dialog is installed. UI-SPEC lists "Sheet" as a component to use.
   - What's unclear: Sheet is not listed in the installed shadcn components in the codebase scan. The UI-SPEC notes "— new, use Dialog as base or add Sheet".
   - Recommendation: Implement quick-log as a Dialog positioned at bottom with rounded top corners. This avoids adding a new shadcn component and matches the existing `@radix-ui/react-dialog` already installed.

2. **Export bundle version bump**
   - What we know: `ExportBundle` already has `bodyMetrics?: BodyMetric[]`. Photos need to be added.
   - What's unclear: Whether `formatVersion` should increment (currently 2 in tests).
   - Recommendation: Add `progressPhotos?: ProgressPhoto[]` to `ExportBundle` and bump `formatVersion` to 3 in `importSchema` default.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vitest | Tests | ✓ | 4.1.0 | — |
| fake-indexeddb | Dexie store tests | ✓ | 6.2.5 | — |
| Canvas API | Image compression | ✓ (browser) | native | No fallback — required; test with jsdom limitation (jsdom Canvas is limited) |
| navigator.storage | Quota estimation | ✓ (browser) | native | Graceful degradation: skip indicator if returns 0 |
| navigator.standalone | iOS detection | ✓ (iOS Safari) | native | Undefined on non-iOS: treat as false = don't show banner |

**Missing dependencies with no fallback:** None.

**Note:** `canvas.toBlob()` is not implemented in jsdom. Image compression tests must use mocks or be integration/e2e only.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (`test: { environment: 'jsdom' }`) |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BODY-01 | BodyMetric CRUD store actions (add, update, delete) | unit | `npx vitest run src/store/bodyMetricsStore.test.ts` | ❌ Wave 0 |
| BODY-01 | filterByPeriod date range logic | unit | `npx vitest run src/lib/bodyMetrics.test.ts` | ❌ Wave 0 |
| BODY-02 | Zod schema accepts partial measurements (all optional) | unit | extend `workoutStore.test.ts` bodyMetricSchema tests | ✅ (partial — schema exists, no test for partial fields) |
| BODY-03 | compressImage returns dataUrl < 1MB, rejects oversized | unit | `npx vitest run src/lib/imageCompression.test.ts` | ❌ Wave 0 (Canvas mock needed) |
| BODY-03 | ProgressPhoto Dexie table present in v5 schema | unit | `npx vitest run src/db/client.test.ts` | ✅ (extend existing) |
| UI-04 | isIOSSafari() / isStandalone() / shouldShowBanner() logic | unit | `npx vitest run src/lib/iosInstall.test.ts` | ❌ Wave 0 |
| UI-04 | Banner not shown on desktop (manual) | manual | — | — |

### Sampling Rate

- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/store/bodyMetricsStore.test.ts` — covers BODY-01 CRUD
- [ ] `src/lib/bodyMetrics.test.ts` — covers filterByPeriod
- [ ] `src/lib/imageCompression.test.ts` — covers BODY-03 (requires Canvas mock via `vi.spyOn`)
- [ ] `src/lib/iosInstall.test.ts` — covers UI-04 detection logic

---

## Security Domain

Security enforcement applies. This phase is fully offline-first with no network calls or auth surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Zod schema on import; weight/measurement range validation in form |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed import bundle with photo data | Tampering | Zod `importSchema` validation before any DB write; reject unknown keys |
| XSS via stored photo dataUrl | Tampering | Render with `<img src={dataUrl}>` only — never `innerHTML`. dataUrl is safe in img src. |
| Storage exhaustion (denial-of-self) | Denial of Service | 1MB post-compression hard limit + quota warning at 80% |

---

## Sources

### Primary (HIGH confidence)
- `src/types.ts` — BodyMetric, ExportBundle, Profile types verified
- `src/db/client.ts` — Dexie v4 schema, bodyMetrics table indexes verified
- `src/store/workoutStore.ts` — Zustand store pattern, Dexie query patterns, importSchema verified
- `src/components/ExerciseProgressChart.tsx` — Recharts chart pattern verified
- `src/components/Layout.tsx` — Nav structure verified
- `src/App.tsx` — Route registration pattern verified
- `package.json` — All dependency versions verified
- `vite.config.ts` — VitePWA config verified
- `.planning/phases/06-body-metrics-pwa-safety/06-CONTEXT.md` — All decisions read
- `.planning/phases/06-body-metrics-pwa-safety/06-UI-SPEC.md` — Colors, components, interaction contracts

### Secondary (MEDIUM confidence)
- Canvas API `toBlob()` pattern — widely documented Web API
- `navigator.storage.estimate()` — MDN-documented standard API

### Tertiary (LOW confidence)
- iOS `capture` attribute behavior — [ASSUMED] based on known iOS Safari quirks
- Canvas compression scale formula — [ASSUMED] standard pattern, may need iteration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json; no new deps needed
- Architecture: HIGH — Dexie table + Zustand + Recharts patterns all established in codebase
- iOS banner: MEDIUM — UA sniffing pattern well-known but behavior nuances not verified against a device this session
- Image compression: MEDIUM — Canvas API is standard but jsdom limitations affect test strategy

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (stable domain — Recharts/Dexie/Zustand are not fast-moving)
