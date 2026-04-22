---
phase: 06-body-metrics-pwa-safety
reviewed: 2026-04-22T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - src/App.tsx
  - src/components/BodyMetricSheet.tsx
  - src/components/Layout.tsx
  - src/components/MeasurementsChart.tsx
  - src/components/PhotoGallery.tsx
  - src/components/WeightTrendChart.tsx
  - src/components/iOSInstallBanner.tsx
  - src/db/client.ts
  - src/lib/imageCompression.ts
  - src/lib/iosInstall.ts
  - src/routes/BodyMetrics.tsx
  - src/store/bodyMetricsStore.ts
  - src/store/workoutStore.ts
  - src/types.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-04-22
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed all 14 files introduced or modified in the body metrics + PWA safety phase. The overall quality is solid: IndexedDB schema migrations are careful, error handling is consistent, and the quota-warning flow is a good touch. Four warnings were found — all bugs or silent failure modes rather than style preferences.

The most significant issues are: (1) `BodyMetricSheet` state is never reset when reopened for a new entry while `initialEntry` changes, causing stale values from a prior edit session to appear; (2) `compressImage` applies a scaling formula that can leave the result above the 200 KB target when the source is already near `targetBytes`; (3) `deleteProfile` does not delete the user's progress photos from IndexedDB; (4) the quota warning toast fires on every render cycle when `quotaWarning` is `true` because the `useEffect` dependency on `toast` is unstable.

---

## Warnings

### WR-01: BodyMetricSheet state is stale on re-open for a new entry

**File:** `src/components/BodyMetricSheet.tsx:32-50`

**Issue:** All form fields are initialised from `initialEntry` via `useState`, which only runs on the first mount. If the dialog is kept mounted in the DOM (as it is in `BodyMetrics.tsx` — `BodyMetricSheet` is always rendered, with `open` toggled), closing an edit dialog and then opening a blank "add" dialog will display the previous entry's values. `useState` initial values are ignored on subsequent renders when `initialEntry` changes.

**Fix:** Reset all fields whenever `open` transitions from `false` to `true`, or key the component on the entry being edited:

```tsx
// Option A — reset on open (in BodyMetricSheet):
useEffect(() => {
  if (open) {
    setDate(initialEntry?.date ?? dayjs().format('YYYY-MM-DD'))
    setWeight(initialEntry?.weight != null ? String(initialEntry.weight) : '')
    setWaist(initialEntry?.waist != null ? String(initialEntry.waist) : '')
    setHips(initialEntry?.hips != null ? String(initialEntry.hips) : '')
    setChest(initialEntry?.chest != null ? String(initialEntry.chest) : '')
    setArms(initialEntry?.arms != null ? String(initialEntry.arms) : '')
    setNotes(initialEntry?.notes ?? '')
    setWeightError(false)
  }
}, [open]) // eslint-disable-line react-hooks/exhaustive-deps

// Option B — key in BodyMetrics.tsx (simpler):
<BodyMetricSheet
  key={editingEntry?.id ?? 'new'}
  open={sheetOpen}
  onOpenChange={handleSheetOpenChange}
  initialEntry={editingEntry}
/>
```

Option B (key) is simpler and idiomatic React.

---

### WR-02: Image compression scaling does not guarantee output is under targetBytes

**File:** `src/lib/imageCompression.ts:4`

**Issue:** The scale factor is computed as `Math.min(1, Math.sqrt(targetBytes / file.size))`. This assumes that output file size scales proportionally to pixel area, which holds roughly for uncompressed images. However, when the input is already a compressed JPEG close to `targetBytes`, `scale` will be near 1, and the re-encoded JPEG at 0.8 quality can easily exceed `targetBytes` (200 KB). The 1 MB hard cap catches extreme cases but not the silent 200 KB–1 MB range where photos are stored larger than intended.

This is an admitted imprecision rather than a crash, but it means storage usage can silently grow faster than the user expects.

**Fix:** After encoding, compare `blob.size` to `targetBytes` and re-encode with lower quality if needed:

```ts
export async function compressImage(file: File, targetBytes = 200_000): Promise<string> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const encode = (quality: number) =>
    new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))

  let blob = await encode(0.8)
  if (!blob) throw new Error('too-large')
  if (blob.size > targetBytes) {
    blob = await encode(0.6)
  }
  if (!blob || blob.size > 1_000_000) throw new Error('too-large')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('too-large'))
    reader.readAsDataURL(blob!)
  })
}
```

---

### WR-03: deleteProfile does not delete the user's progressPhotos

**File:** `src/store/workoutStore.ts:285-292`

**Issue:** The `deleteProfile` transaction deletes workouts, exerciseLogs, bodyMetrics, templates, and settings for the removed user — but not `progressPhotos`. Photos stored under the deleted userId will persist in IndexedDB indefinitely and waste quota.

```ts
// Current transaction — progressPhotos omitted:
await db.transaction('rw', db.profiles, db.workouts, db.exerciseLogs,
  db.settings, db.bodyMetrics, db.templates, async () => {
  await db.profiles.delete(userId)
  await db.workouts.where('userId').equals(userId).delete()
  await db.exerciseLogs.where('userId').equals(userId).delete()
  await db.bodyMetrics.where('userId').equals(userId).delete()
  await db.templates.where('userId').equals(userId).delete()
  await db.settings.delete(`user:${userId}`)
})
```

**Fix:** Add `db.progressPhotos` to the transaction scope and delete the user's photos:

```ts
await db.transaction('rw', db.profiles, db.workouts, db.exerciseLogs,
  db.settings, db.bodyMetrics, db.templates, db.progressPhotos, async () => {
  await db.profiles.delete(userId)
  await db.workouts.where('userId').equals(userId).delete()
  await db.exerciseLogs.where('userId').equals(userId).delete()
  await db.bodyMetrics.where('userId').equals(userId).delete()
  await db.progressPhotos.where('userId').equals(userId).delete()
  await db.templates.where('userId').equals(userId).delete()
  await db.settings.delete(`user:${userId}`)
})
```

---

### WR-04: Quota warning toast fires repeatedly due to unstable `toast` reference

**File:** `src/components/PhotoGallery.tsx:31-35`

**Issue:** The `useEffect` that fires the toast depends on `[quotaWarning, toast]`. The `toast` function returned by `useToast()` is typically a new reference on each render in shadcn/ui implementations. Combined with `quotaWarning` being `true` permanently once set, any re-render of the component will re-fire the effect and show a new toast notification.

```ts
useEffect(() => {
  if (quotaWarning) {
    toast({ description: 'Espaco quase cheio...' })
  }
}, [quotaWarning, toast]) // toast is a new ref each render → fires every render
```

**Fix:** Remove `toast` from the dependency array (it is stable enough by convention, and ESLint's `exhaustive-deps` rule for `useToast` hooks is commonly suppressed). Alternatively, use a `toastShown` ref to fire only once:

```ts
const quotaToastShown = useRef(false)

useEffect(() => {
  if (quotaWarning && !quotaToastShown.current) {
    quotaToastShown.current = true
    toast({ description: 'Espaco quase cheio. Considere exportar e limpar fotos antigas.' })
  }
}, [quotaWarning]) // eslint-disable-line react-hooks/exhaustive-deps
```

---

## Info

### IN-01: fileSizeBytes measures base64 string length, not actual binary size

**File:** `src/components/PhotoGallery.tsx:46`

**Issue:** `fileSizeBytes: dataUrl.length` records the length of the base64 data URL string. A base64-encoded string is ~33% larger than the underlying binary. The `usageMB` displayed to the user comes from `navigator.storage.estimate()` which is accurate, but the per-photo `fileSizeBytes` stored in the DB will over-report by ~33% if ever used for display or quota calculation.

**Fix:** Store the actual binary size from the blob:

```ts
// In imageCompression.ts, return both:
return { dataUrl: reader.result as string, binaryBytes: blob.size }

// In PhotoGallery.tsx:
const { dataUrl, binaryBytes } = await compressImage(file)
await useBodyMetricsStore.getState().addPhoto({
  userId,
  date: dayjs().format('YYYY-MM-DD'),
  dataUrl,
  fileSizeBytes: binaryBytes,
})
```

---

### IN-02: Non-standard component name casing for iOSInstallBanner

**File:** `src/components/iOSInstallBanner.tsx:6`

**Issue:** The exported function is named `iOSInstallBanner` (lowercase `i`), which violates the React convention that component names must start with an uppercase letter. It works at runtime because the import alias `IOSInstallBanner` is used in `Layout.tsx`, but it is a maintenance hazard — any direct usage of the named export would silently be treated as a plain function by React's reconciler.

**Fix:** Rename the export to `IOSInstallBanner` and update the import in `Layout.tsx`:

```ts
// iOSInstallBanner.tsx
export function IOSInstallBanner() { ... }

// Layout.tsx
import { IOSInstallBanner } from './iOSInstallBanner'
```

---

### IN-03: Measurement inputs have no validation (optional fields accept any number)

**File:** `src/components/BodyMetricSheet.tsx:67-73`

**Issue:** Waist, hips, chest, and arms values are parsed with `parseFloat` but never validated. A user can submit negative values or values in the thousands (e.g., `waist: -5` or `chest: 9999`). The weight field has an explicit range check (`<= 0 || >= 500`), but the four measurement fields have none.

**Fix:** Apply the same guard used for weight:

```ts
const toMeasurement = (s: string) => {
  if (s === '') return undefined
  const v = parseFloat(s)
  return isNaN(v) || v <= 0 || v > 300 ? null : v
}

const w  = weight !== '' ? parseFloat(weight) : undefined
const wt = toMeasurement(waist)
const hp = toMeasurement(hips)
const ch = toMeasurement(chest)
const ar = toMeasurement(arms)

if ((w !== undefined && (isNaN(w) || w <= 0 || w >= 500)) ||
    wt === null || hp === null || ch === null || ar === null) {
  // show error
  return
}
```

---

_Reviewed: 2026-04-22_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
