# Domain Pitfalls

**Domain:** Offline-first PWA workout tracker — adding multi-user profiles, rest timers, photo storage, UI redesign, Dexie schema migrations
**Researched:** 2026-04-21
**Stack:** React 19 / Vite / TypeScript / TailwindCSS / Dexie (IndexedDB) / Zustand / Netlify

---

## Critical Pitfalls

Mistakes that cause data loss, rewrites, or app-breaking bugs.

---

### Pitfall 1: Changing Primary Keys During Dexie Migration

**What goes wrong:** Attempting to change the primary key of an existing Dexie table in a version upgrade causes an `UpgradeError: Not yet support for changing primary key`. The migration silently fails or throws, leaving the database in a broken state for returning users.

**Why it happens:** IndexedDB itself does not allow primary key changes on existing object stores. Dexie respects this constraint. This becomes relevant when retrofitting `userId` scoping onto existing tables — e.g., changing `id` to a compound key `[userId+id]`.

**Consequences:** App crashes on open for existing users. Data may be inaccessible. Forced to ship a breaking change with a manual migration path.

**Prevention:**
- Never change a table's primary key. Instead, create a new table with the desired schema, migrate data in `upgrade()`, then delete the old table.
- Design the user-scoped schema upfront: use `userId` as a plain indexed field (not part of the primary key) for filtering.
- For multi-user: `workouts` table keeps `++id` as PK, adds `userId` as an indexed field. Query always filters by `userId`.

**Detection:** Test migrations on a populated database before shipping. Keep a local copy of production-schema data for testing.

**Phase:** Schema migration phase (before multi-user work begins).

---

### Pitfall 2: Shared IndexedDB Namespace for Multi-User Profiles

**What goes wrong:** All users' data lives in a single database with no `userId` field on records, or records have `userId` but queries forget to filter by it. User A sees User B's workout history.

**Why it happens:** Retrofitting multi-user onto a single-user schema is easy to get wrong. Queries added before the `userId` filter was established miss it.

**Consequences:** Data leakage between profiles. Corrupted progression history. Hard to debug because data looks correct in aggregate.

**Prevention:**
- Use a single database (not per-user databases — that creates migration complexity and cross-tab lock issues).
- Add `userId` as an indexed field on every user-data table: `workouts`, `exercises`, `bodyMetrics`, `photos`, `programs`.
- Wrap all DB queries in a helper that always injects the current `userId`: `db.workouts.where('userId').equals(activeUserId)`.
- Keep a `profiles` table separate with no `userId` field (it IS the user record).
- Add a lint rule or code review check: no `db.[table]` query without `.where('userId')`.

**Detection:** Write integration tests that create two users, add data for each, and assert neither sees the other's data.

**Phase:** Multi-user profile implementation.

---

### Pitfall 3: Indexing Binary/Blob Data in Dexie

**What goes wrong:** Storing body metric photos as Base64 strings or Blobs in an indexed field causes IndexedDB to become progressively slower and eventually crash. A single 800MB database can take 3+ seconds to initialize.

**Why it happens:** IndexedDB indexes ALL declared fields. Indexing a large Base64 string means the index holds a copy of the data. The Dexie.js author explicitly warns against this pattern.

**Consequences:** App becomes unusable with accumulated photos. Startup time degrades invisibly over months.

**Prevention:**
- Store photo Blobs in a dedicated `photos` table with `++id, userId, date` as the only indexed fields.
- Store the Blob itself in an unindexed `data` field (Dexie ignores unindexed fields for indexing).
- Never store Base64 — store raw Blobs. IndexedDB handles Blob natively on all modern browsers.
- Keep a `photoMetadata` record (separate or in the same row) for thumbnail generation: store a small resized thumbnail Blob alongside the full image.
- Compress/resize photos on capture before storing: target under 500KB per photo using `canvas.toBlob()` at 0.8 quality.

**Detection:** Monitor `navigator.storage.estimate()` after adding photos. Log database init time on app open.

**Phase:** Body metrics / photo storage implementation.

---

### Pitfall 4: Safari ITP Storage Eviction for Non-Installed PWA

**What goes wrong:** Safari deletes ALL IndexedDB data (workouts, profiles, photos) after 7 days of inactivity if the app is accessed via browser tab (not installed to home screen).

**Why it happens:** Safari's Intelligent Tracking Prevention applies a 7-day cap on all script-writable storage for browser tabs. This eviction policy does NOT apply to home screen-installed PWAs.

**Consequences:** User's entire workout history, all profiles, and all photos are silently deleted. No warning shown by the browser.

**Prevention:**
- Display a persistent, prominent "Add to Home Screen" prompt on iOS Safari. This is the single most important UX action for data safety.
- Show the prompt on first launch AND resurface it if the user dismisses it.
- Implement export/backup functionality (already in scope) and remind users to export periodically.
- Show a warning banner: "Dados salvos localmente — adicione à tela inicial para proteger seu histórico."

**Detection:** Test on Safari iOS without home screen install. Verify data survives 7+ days by checking storage timestamps.

**Phase:** PWA installation UX (should be addressed in redesign phase, before photo storage).

---

### Pitfall 5: Rest Timer Killed in iOS Background

**What goes wrong:** The rest timer stops or fires incorrectly when the user locks their phone or switches apps mid-rest. iOS throttles/pauses `setInterval` and `setTimeout` for backgrounded browser tabs and even home-screen PWAs.

**Why it happens:** iOS aggressively suspends JavaScript execution in the background. The Web Background Sync API is not reliably supported on iOS. Service workers cannot run general-purpose timers.

**Consequences:** Timer shows wrong countdown on resume. Rest period finishes without notification. User misses their rest window.

**Prevention:**
- Do NOT rely on `setInterval` for the countdown display. Instead, record `startTime = Date.now()` when the timer starts, and on each render/focus event calculate `remaining = duration - (Date.now() - startTime)`.
- On `visibilitychange` to `visible`, recalculate elapsed time and update display immediately.
- For audio/vibration alert at timer end: use the Web Notifications API (works for installed PWAs on iOS 16.4+) OR vibrate on resume if the timer has elapsed.
- As a fallback: show "O descanso terminou X segundos atrás" if the app regains focus after the timer expired.
- Do NOT use a service worker for timer logic — it has no reliable execution window for this use case on iOS.

**Detection:** Test by starting a 60s timer, immediately locking phone for 90s, then reopening. Verify the app shows "timer expired" not "30s remaining."

**Phase:** Rest timer implementation.

---

## Moderate Pitfalls

---

### Pitfall 6: Zustand Store Not Scoped to Active User

**What goes wrong:** Zustand store caches the previous user's workout data in memory after switching profiles. The new user temporarily sees the old user's data until the next DB fetch.

**Prevention:**
- On profile switch, explicitly clear all user-data slices in the Zustand store before loading the new user's data.
- Consider a single `activeUserId` atom; all derived data selectors use it. Switching `activeUserId` triggers reactive re-fetch.
- Never persist user-data slices to `localStorage` via `zustand/persist` without namespacing by `userId`.

**Phase:** Multi-user profile implementation.

---

### Pitfall 7: Dexie `upgrade()` Running Async Operations Outside Transaction

**What goes wrong:** Calling `fetch()`, `setTimeout()`, or any async operation that yields outside the IndexedDB transaction inside a Dexie `upgrade()` callback causes the transaction to auto-commit before the migration completes. Data is partially migrated.

**Prevention:**
- Keep all `upgrade()` logic synchronous or use only Dexie/IndexedDB operations (which extend the transaction).
- If you need to transform data, do it in a single chained Dexie operation: `tx.table.toCollection().modify(...)`.
- No external API calls, no `setTimeout`, no file reads inside upgrade callbacks.

**Phase:** Any Dexie schema version bump.

---

### Pitfall 8: UI Redesign Breaking Existing Component Data Contracts

**What goes wrong:** During the full UI redesign, component props and state shapes are changed without updating the Dexie data-access layer. Existing features (workout logging, export/import) break silently.

**Prevention:**
- Treat the Dexie access layer (query functions, types) as a separate module from UI components. Redesign UI components without touching the DB layer first.
- Keep the existing data types stable until the schema migration is explicitly planned.
- Run a smoke test of existing features (log workout, export, import) after each redesign phase before merging.

**Phase:** UI redesign phase.

---

### Pitfall 9: Photos Exceeding Storage Quota Without Warning

**What goes wrong:** User adds body metric photos over months. No quota check means the app eventually fails to write new data silently (IndexedDB `QuotaExceededError`), losing the user's latest data without feedback.

**Prevention:**
- Call `navigator.storage.estimate()` before writing large blobs. If usage exceeds 70% of quota, show a warning with export prompt.
- Implement photo compression (max 800x800px, JPEG at 0.8) on capture. A gym selfie at full resolution is 4-8MB; compressed is under 300KB.
- Consider a "Storage Usage" screen in settings showing current usage and a delete-old-photos option.

**Storage reference (2026):**
- Chrome/Edge: up to 60% of total disk space (PERSISTENT if `StorageManager.persist()` granted)
- Firefox: up to 50% of disk
- Safari (installed PWA): up to 80% of disk (Safari 17+)
- Safari (browser tab): effectively unlimited but eviction after 7 days inactivity

**Phase:** Body metrics / photo storage implementation.

---

## Minor Pitfalls

---

### Pitfall 10: Compound Index Performance on Large Tables

**What goes wrong:** As workout history grows (1000+ entries), queries like "all sets for exercise X for user Y" become slow without a compound index.

**Prevention:** Define compound indexes in Dexie schema upfront: `workoutSets: '++id, [userId+exerciseId], date'`. Cheaper to add now than migrate later.

**Phase:** Schema design (before any data is migrated).

---

### Pitfall 11: `window.Notification` Permission Prompt Timing

**What goes wrong:** Requesting notification permission on app load (for rest timer alerts) causes browsers/iOS to auto-deny because there was no user gesture.

**Prevention:** Request notification permission only after the user explicitly enables "timer sound/notification" in settings or after they start their first rest timer. Never request on app load.

**Phase:** Rest timer implementation.

---

### Pitfall 12: Template vs. Instance Data Confusion

**What goes wrong:** Editing a workout template inadvertently modifies historical workout logs that were created from that template (if both reference the same exercise records by ID).

**Prevention:** When a workout is started from a template, deep-copy all template data into a new workout instance. Log records must be fully self-contained — no foreign key references to template data that could mutate.

**Phase:** Workout templates implementation.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Multi-user profiles | Primary key change attempt | Design `userId` as indexed field, not part of PK |
| Multi-user profiles | Zustand cache not cleared on switch | Clear user-data store slices on profile switch |
| Dexie schema bump | Async ops in `upgrade()` | Use only Dexie operations inside upgrade callbacks |
| UI redesign | Breaking existing data contracts | Keep DB layer decoupled from component layer |
| Rest timer | iOS background throttling | Use `Date.now()` delta, not interval counter |
| Rest timer | Notification permission denied | Request on first use, never on load |
| Photo storage | Indexing blob data | Store blobs in unindexed fields only |
| Photo storage | Quota exceeded silently | Check quota before write, compress on capture |
| PWA (all phases) | Safari 7-day eviction | Persistent "Add to Home Screen" prompt on iOS |
| Templates | Template mutation corrupting history | Deep-copy template into workout instance |

---

## Sources

- [Dexie.js — Version.upgrade() docs](https://dexie.org/docs/Version/Version.upgrade())
- [Dexie.js GitHub — UpgradeError: primary key change](https://github.com/dexie/Dexie.js/issues/1148)
- [Dexie.js — Don't index binary data (author blog)](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7)
- [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [WebKit — Updates to Storage Policy (Safari 17)](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [web.dev — Storage for the web](https://web.dev/articles/storage-for-the-web)
- [RxDB — IndexedDB Max Storage Size Limit](https://rxdb.info/articles/indexeddb-max-storage-limit.html)
- [MDN — Offline and background operation (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [firt.dev — Understanding JavaScript in the background](https://firt.dev/understanding-js-background/)
- [MagicBell — PWA iOS Limitations and Safari Support 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [IndexedDB performance pitfalls — DEV Community](https://dev.to/roverbober/indexeddb-understanding-performance-pitfalls-part-1-434d)
- [GitHub Gist — Pain and anguish of using IndexedDB](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a)
