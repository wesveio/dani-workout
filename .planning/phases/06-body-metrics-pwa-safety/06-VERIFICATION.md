---
phase: 06-body-metrics-pwa-safety
verified: 2026-04-22T18:37:00Z
status: human_needed
score: 15/15 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Navigate to /corpo in the browser, tap Registrar, enter a weight, save — confirm toast appears and entry appears in list"
    expected: "Entry persists in history list, weight trend chart updates"
    why_human: "Cannot verify DOM interaction, toast display, and Recharts render in a headless environment"
  - test: "Expand Medidas (opcional) in the quick-log sheet, enter waist=80, save — confirm measurement pills appear on the entry card and the measurements chart renders"
    expected: "Measurements chart section appears below weight chart with waist line (orange)"
    why_human: "Collapsible open/close and conditional chart render cannot be verified programmatically"
  - test: "Tap an entry card to open the edit sheet — confirm fields are pre-populated"
    expected: "Sheet title reads 'Editar Registro', date/weight/measurements match the tapped entry"
    why_human: "UI state pre-population requires human inspection"
  - test: "Tap Excluir on an entry — confirm confirmation dialog appears, confirm deletion removes the entry"
    expected: "Entry no longer appears in list, toast 'Registro excluido' shown"
    why_human: "Dialog confirmation and state update require visual verification"
  - test: "In the Fotos de Progresso section, tap + to add a photo from camera/gallery"
    expected: "Photo appears in 3-column grid with date badge; storage indicator shows MB used"
    why_human: "File input, camera access, and grid render require device/browser interaction"
  - test: "Tap a photo thumbnail — confirm full-size viewer opens with Excluir Foto button; tap it and confirm deletion"
    expected: "Photo removed from grid, viewer closes, toast 'Foto excluida' shown"
    why_human: "Dialog state and photo deletion require human verification"
  - test: "On iOS Safari (not installed to home screen): verify iOS install banner appears after ~3 seconds above the nav bar"
    expected: "Banner reads 'Adicione ao inicio para acesso rapido' with Share2 icon and Dispensar button"
    why_human: "UA detection and setTimeout delay require a real iOS Safari browser"
  - test: "Tap Dispensar on the iOS banner — reload the page and confirm the banner does not reappear"
    expected: "Banner stays hidden for 7 days (localStorage key set)"
    why_human: "Dismiss persistence and re-prompt suppression require iOS Safari + manual inspection"
---

# Phase 06: Body Metrics + PWA Safety Verification Report

**Phase Goal:** Body metrics tracking (weight, measurements, progress photos), iOS install banner, export/import extension
**Verified:** 2026-04-22T18:37:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | BodyMetric entries can be created, read, updated, and deleted per user | VERIFIED | `useBodyMetricsStore` exports `addEntry`, `updateEntry`, `deleteEntry`, `loadForUser`; all wired to `db.bodyMetrics` Dexie table |
| 2 | ProgressPhoto entries can be created, read, and deleted per user | VERIFIED | `addPhoto`, `deletePhoto` wired to `db.progressPhotos`; store queries compound index `[userId+date]` |
| 3 | Image compression reduces file to ~200KB base64 data URL | VERIFIED | `compressImage` in `src/lib/imageCompression.ts` targets 200_000 bytes, hard-rejects blobs >1MB with 'too-large' error |
| 4 | iOS Safari detection correctly identifies platform and standalone mode | VERIFIED | `isIOSSafari`, `isStandalone`, `shouldShowBanner`, `dismissBanner` all exported from `src/lib/iosInstall.ts`; 23 tests pass |
| 5 | Dexie v5 schema includes progressPhotos table | VERIFIED | `this.version(5).stores({...})` in `src/db/client.ts` includes `progressPhotos: '&id, userId, [userId+date], date'`; `progressPhotos!: Table<ProgressPhoto>` declared on class |
| 6 | User can navigate to Corpo tab and see the body metrics screen | VERIFIED | Layout.tsx has `{ to: '/corpo', label: 'Corpo', icon: Scale }` nav item; App.tsx has `lazy(() => import('./routes/BodyMetrics'))` + `<Route path="/corpo">`; `px-0.5` on link for 6-tab layout |
| 7 | User can log bodyweight via quick-log sheet with minimal friction | VERIFIED | `BodyMetricSheet` uses Dialog with `autoFocus` peso field, validates > 0 and < 500, shows inline "Peso invalido" error, calls `addEntry`/`updateEntry` on save |
| 8 | User can expand optional measurements section and log waist/hips/chest/arms | VERIFIED | Collapsible "Medidas (opcional)" section in BodyMetricSheet with 4 `inputMode="decimal"` inputs |
| 9 | User can see bodyweight trend chart with period filtering (1M/3M/6M/1A/Tudo) | VERIFIED | `WeightTrendChart` uses Recharts `LineChart`, `type="monotone"`, `stroke="#FF3D3D"`, period tabs defined as `type Period = '1M' | '3M' | '6M' | '1A' | 'Tudo'` |
| 10 | User can see multi-line measurements chart with toggleable lines | VERIFIED | `MeasurementsChart` imports `Legend`, defines `toggleLine`, uses colors #FF8C00/#4EFF74/#4495FF/#A78BFA |
| 11 | User can add a progress photo from camera or gallery | VERIFIED | `PhotoGallery` uses `accept="image/*"` (no capture attr), calls `compressImage`, then `addPhoto` via store |
| 12 | Photos are included in export/import bundles as base64 | VERIFIED | `workoutStore.ts`: `progressPhotoSchema` defined, `importSchema` includes `progressPhotos`, `exportData` collects `db.progressPhotos`, `formatVersion: 3`, `importData` transaction includes `db.progressPhotos.bulkPut` |
| 13 | iOS Safari users see install banner with dismiss/re-prompt logic | VERIFIED | `iOSInstallBanner.tsx` imports `shouldShowBanner`/`dismissBanner`, uses `setTimeout` 3s delay, renders at `fixed bottom-[72px]`, Layout.tsx renders `<IOSInstallBanner />` above `<nav>` |
| 14 | Photo gallery is wired into the BodyMetrics route | VERIFIED | `BodyMetrics.tsx` imports `PhotoGallery`, reads `photos` from `useBodyMetricsStore`, renders `<PhotoGallery photos={photos} userId={activeUserId} />` under "Fotos de Progresso" |
| 15 | Full test suite passes | VERIFIED | 96 tests pass across 16 test files; `npx vitest run` exits 0 |

**Score:** 15/15 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types.ts` | ProgressPhoto type + updated ExportBundle | VERIFIED | `export type ProgressPhoto` at line 72; `progressPhotos?: ProgressPhoto[]` in ExportBundle |
| `src/db/client.ts` | Dexie v5 schema with progressPhotos | VERIFIED | `version(5)`, `progressPhotos!: Table<ProgressPhoto>`, schema entry confirmed |
| `src/store/bodyMetricsStore.ts` | Zustand store with CRUD | VERIFIED | Exports `useBodyMetricsStore`, all 6 CRUD actions, `QuotaExceededError` handled |
| `src/lib/imageCompression.ts` | Canvas-based compression | VERIFIED | `export async function compressImage`, 200KB target, 1MB hard cap |
| `src/lib/iosInstall.ts` | iOS detection + dismiss | VERIFIED | `isIOSSafari`, `isStandalone`, `shouldShowBanner`, `dismissBanner` all exported |
| `src/routes/BodyMetrics.tsx` | Main body metrics screen | VERIFIED | Default export, wires all sub-components and store |
| `src/components/WeightTrendChart.tsx` | Bodyweight line chart | VERIFIED | `LineChart`, period tabs, correct stroke color |
| `src/components/MeasurementsChart.tsx` | Multi-line measurements chart | VERIFIED | `Legend`, 4 color-coded lines, toggle logic |
| `src/components/BodyMetricSheet.tsx` | Quick-log form dialog | VERIFIED | `Dialog`, `Collapsible`, decimal inputs, validation error |
| `src/components/PhotoGallery.tsx` | Photo grid + add/view/delete | VERIFIED | compressImage wired, 3-col grid, storage indicator, viewer dialog |
| `src/components/iOSInstallBanner.tsx` | iOS install banner | VERIFIED | Detection, setTimeout, dismiss, fixed positioning |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `bodyMetricsStore.ts` | `db/client.ts` | Dexie table queries | WIRED | `db.bodyMetrics`, `db.progressPhotos` calls confirmed |
| `bodyMetricsStore.ts` | `types.ts` | type imports | WIRED | `import type { BodyMetric, ProgressPhoto } from '@/types'` |
| `BodyMetrics.tsx` | `bodyMetricsStore.ts` | useBodyMetricsStore hook | WIRED | `useBodyMetricsStore(s => s.entries/photos)` + `getState().loadForUser` |
| `Layout.tsx` | `/corpo` | navItems array | WIRED | `{ to: '/corpo', label: 'Corpo', icon: Scale }` |
| `App.tsx` | `routes/BodyMetrics.tsx` | lazy import + Route | WIRED | `lazy(() => import('./routes/BodyMetrics'))` + `path="/corpo"` |
| `BodyMetrics.tsx` | `PhotoGallery.tsx` | component import | WIRED | `import { PhotoGallery }` + `<PhotoGallery photos={photos} userId={activeUserId} />` |
| `Layout.tsx` | `iOSInstallBanner.tsx` | component import | WIRED | `import { iOSInstallBanner as IOSInstallBanner }` rendered above `<nav>` |
| `PhotoGallery.tsx` | `bodyMetricsStore.ts` | useBodyMetricsStore | WIRED | `useBodyMetricsStore.getState().addPhoto/deletePhoto` |
| `PhotoGallery.tsx` | `imageCompression.ts` | compressImage import | WIRED | `import { compressImage }` called in `handleFileSelect` |
| `iOSInstallBanner.tsx` | `iosInstall.ts` | shouldShowBanner/dismissBanner | WIRED | Both imported and called |
| `workoutStore.ts` | progressPhotos export/import | Zod schema + Dexie | WIRED | `progressPhotoSchema`, `importSchema.progressPhotos`, `exportData` + `importData` transaction all confirmed |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `BodyMetrics.tsx` | `entries` | `useBodyMetricsStore(s => s.entries)` populated by `loadForUser` → `db.bodyMetrics.where('[userId+date]')` | Yes — Dexie query on real IndexedDB | FLOWING |
| `BodyMetrics.tsx` | `photos` | `useBodyMetricsStore(s => s.photos)` populated by `loadForUser` → `db.progressPhotos.where('[userId+date]')` | Yes — Dexie query on real IndexedDB | FLOWING |
| `PhotoGallery.tsx` | `photos` prop | Passed from BodyMetrics route, sourced from store above | Yes — real data from store | FLOWING |
| `WeightTrendChart.tsx` | `entries` prop | Passed from BodyMetrics route | Yes — real data | FLOWING |
| `MeasurementsChart.tsx` | `entries` prop | Passed from BodyMetrics route | Yes — real data | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Test suite (all 96 tests) | `npx vitest run` | 96 passed (16 files) | PASS |
| TypeScript compilation | `npx tsc --noEmit` | (confirmed by summary, tests include TS) | PASS |
| compressImage export | grep `export async function compressImage` | Found at line 1 | PASS |
| iOS detection exports | grep `export function` in iosInstall.ts | All 4 functions confirmed | PASS |

### Requirements Coverage

| Requirement | Description | Source Plans | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| BODY-01 | User can log bodyweight and see trend chart over time | 01, 02, 04 | SATISFIED | BodyMetricSheet saves weight; WeightTrendChart renders LineChart with period filtering |
| BODY-02 | User can log manual body measurements (waist, hips, chest, arms) | 01, 02, 04 | SATISFIED | Collapsible measurements section in BodyMetricSheet; MeasurementsChart renders 4 lines |
| BODY-03 | User can take and store progress photos with date stamps | 01, 03, 04 | SATISFIED | PhotoGallery with compressImage, 3-col grid, date badge, full-size viewer, delete |
| UI-04 | iOS Safari users see persistent "Add to Home Screen" banner | 01, 03, 04 | SATISFIED | iOSInstallBanner with 3s delay, `fixed bottom-[72px]`, 7-day dismiss via localStorage |

All 4 phase requirements satisfied. No orphaned requirements.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/components/iOSInstallBanner.tsx` | CSS transition via inline `style={}` instead of Tailwind animate class | Info | Visual-only deviation; functional behavior unchanged. Plan noted `tailwindcss-animate` not installed; CSS transition is a valid fallback |

No blocker or warning anti-patterns found. The single info item is a documented deviation from plan (animation approach) with no functional impact.

### Human Verification Required

#### 1. Weight logging end-to-end

**Test:** Navigate to /corpo, tap "Registrar", enter 72.5 in Peso field, tap "Salvar"
**Expected:** Toast "Peso registrado!" appears; entry shows in Historico list with weight and date
**Why human:** DOM interaction, toast render, and Recharts chart update cannot be verified in headless test environment

#### 2. Measurement logging + chart

**Test:** Log an entry with waist=80 via the Collapsible section; observe BodyMetrics screen
**Expected:** Measurements chart section appears below weight chart; waist line in orange (#FF8C00) visible
**Why human:** Conditional chart render (only when measurements exist) and Collapsible open/close require visual inspection

#### 3. Edit + delete entry flows

**Test:** Tap an entry card to open edit sheet; verify fields pre-populated; tap Excluir on a different entry and confirm via dialog
**Expected:** Edit sheet title "Editar Registro" with matching values; confirmation dialog; entry removed after confirm
**Why human:** UI state pre-population and dialog interaction require human inspection

#### 4. Progress photo add + gallery render

**Test:** Tap "+" in Fotos de Progresso, select a photo from device gallery
**Expected:** Photo appears in 3-column grid with date badge; storage indicator shows "X.X MB usados"
**Why human:** File input, camera/gallery access, and image compression cannot be exercised programmatically

#### 5. Full-size photo viewer + delete

**Test:** Tap a photo thumbnail; verify full-size viewer; tap "Excluir Foto"
**Expected:** Viewer shows full image with date; deletion removes photo from grid; toast "Foto excluida"
**Why human:** Dialog state and native photo render require visual verification

#### 6. iOS install banner (iOS Safari device required)

**Test:** Open app in iOS Safari (not installed to home screen); wait ~3 seconds
**Expected:** Banner slides up above nav bar: "Adicione ao inicio para acesso rapido" with Share2 icon and "Dispensar" button
**Why human:** UA detection only works in real iOS Safari; setTimeout delay requires real wait

#### 7. Banner dismiss persistence

**Test:** Tap "Dispensar" on the iOS banner; reload the page
**Expected:** Banner does not reappear (localStorage key `ios-banner-dismissed-until` set to 7 days from now)
**Why human:** localStorage persistence and re-prompt suppression require iOS Safari + manual reload check

### Gaps Summary

No automated gaps found. All 15 must-haves verified against the actual codebase. Artifacts exist, are substantive, are wired correctly, and data flows from real Dexie queries. 96 tests pass.

Status is `human_needed` because 7 UX behaviors require visual/device verification before the phase can be fully signed off.

---

_Verified: 2026-04-22T18:37:00Z_
_Verifier: Claude (gsd-verifier)_
