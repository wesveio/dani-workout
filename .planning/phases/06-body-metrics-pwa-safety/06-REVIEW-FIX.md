---
phase: 06-body-metrics-pwa-safety
fixed_at: 2026-04-22T00:00:00Z
review_path: .planning/phases/06-body-metrics-pwa-safety/06-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-04-22
**Source review:** .planning/phases/06-body-metrics-pwa-safety/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: BodyMetricSheet state is stale on re-open for a new entry

**Files modified:** `src/routes/BodyMetrics.tsx`
**Commit:** 36388af
**Applied fix:** Added `key={editingEntry?.id ?? 'new'}` prop to BodyMetricSheet so React remounts the component when switching between edit targets, resetting all useState initializers.

### WR-02: Image compression scaling does not guarantee output is under targetBytes

**Files modified:** `src/lib/imageCompression.ts`
**Commit:** d64a30b
**Applied fix:** Refactored to use an `encode` helper. After initial 0.8 quality encode, if blob exceeds targetBytes, re-encodes at 0.6 quality. Added onerror handler on FileReader.

### WR-03: deleteProfile does not delete the user's progressPhotos

**Files modified:** `src/store/workoutStore.ts`
**Commit:** 3e886cc
**Applied fix:** Added `db.progressPhotos` to the transaction scope and added `await db.progressPhotos.where('userId').equals(userId).delete()` inside the transaction.

### WR-04: Quota warning toast fires repeatedly due to unstable toast reference

**Files modified:** `src/components/PhotoGallery.tsx`
**Commit:** b4e2f3c
**Applied fix:** Added a `quotaToastShown` ref guard so the toast fires only once. Removed `toast` from the dependency array with an eslint-disable comment.

---

_Fixed: 2026-04-22_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
