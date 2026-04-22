---
phase: 06-body-metrics-pwa-safety
plan: 03
subsystem: ui-components
tags: [photo-gallery, ios-install, export-import, compression]
dependency_graph:
  requires: [06-01]
  provides: [PhotoGallery, iOSInstallBanner, progressPhotos-export-import]
  affects: [src/store/workoutStore.ts, src/components/PhotoGallery.tsx, src/components/iOSInstallBanner.tsx]
tech_stack:
  added: []
  patterns: [navigator.storage.estimate, useRef file input, Zod schema extension]
key_files:
  created:
    - src/components/PhotoGallery.tsx
    - src/components/iOSInstallBanner.tsx
  modified:
    - src/store/workoutStore.ts
    - src/store/workoutStore.test.ts
decisions:
  - "Used nested confirmDelete state instead of a second Dialog to keep delete confirmation inline in the viewer"
  - "Used CSS transition on iOSInstallBanner instead of tailwindcss-animate (not installed) — slide-in-from-bottom-4 classes would be no-ops"
  - "formatVersion bumped to 3 to signal progressPhotos inclusion in export bundle"
metrics:
  duration: ~20min
  completed: 2026-04-22
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
---

# Phase 06 Plan 03: Photo Gallery + iOS Install Banner + Export Extension Summary

Photo gallery component with camera/gallery input, image compression, and storage indicator; iOS install banner with 3s delayed detection and 7-day dismiss; export/import extended to include progress photos with Zod validation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PhotoGallery component | 7ba225d | src/components/PhotoGallery.tsx |
| 2 | iOSInstallBanner + export/import | 48a91b4 | src/components/iOSInstallBanner.tsx, src/store/workoutStore.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated test expectation for formatVersion bump**
- **Found during:** Task 2 verification (vitest run)
- **Issue:** `workoutStore.test.ts` expected `formatVersion: 2` but plan requires bumping to 3
- **Fix:** Updated `toBe(2)` to `toBe(3)` and updated the test description string
- **Files modified:** src/store/workoutStore.test.ts
- **Commit:** 48a91b4

**2. [Rule 2 - Missing] CSS transition fallback for iOSInstallBanner animation**
- **Found during:** Task 2 implementation
- **Issue:** Plan called for `animate-in slide-in-from-bottom-4 duration-200` (tailwindcss-animate classes), but `tailwindcss-animate` is not installed — no `plugins` in tailwind.config.js
- **Fix:** Used inline `style={{ transition: 'transform 0.2s ease, opacity 0.2s ease' }}` instead. The `data-[state=open]:animate-in` pattern in existing components (dropdown-menu.tsx) works via Radix data attributes, not tailwindcss-animate — the banner uses a simpler visibility toggle so Radix state attributes don't apply
- **Files modified:** src/components/iOSInstallBanner.tsx

## Known Stubs

None — all functionality is wired to real store/library calls.

## Threat Flags

No new security-relevant surface beyond what the threat model covers. All T-06-07, T-06-08, T-06-09, T-06-10 mitigations are implemented:
- `accept="image/*"` with no `capture` attribute (T-06-07)
- `compressImage` outputs JPEG only, `<img src={...}>` never innerHTML (T-06-07)
- `progressPhotoSchema` Zod validation on import (T-06-08)
- `navigator.storage.estimate()` 80% quota warning (T-06-09)
- iOSInstallBanner accepted as best-effort UA sniff (T-06-10)

## Self-Check: PASSED

- src/components/PhotoGallery.tsx: FOUND
- src/components/iOSInstallBanner.tsx: FOUND
- Commit 7ba225d: FOUND
- Commit 48a91b4: FOUND
