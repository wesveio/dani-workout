# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 01-foundation
**Areas discussed:** Profile data model, Export format versioning, New table schemas, Migration safety

---

## Profile data model

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it minimal | name + avatar color/emoji only. Programs decouple from profiles. | ✓ |
| Match current fields | name, shortName, avatarInitial, bio — same as existing UserProfile type | |
| Richer profiles | name, avatar image (base64), preferred units, language pref, creation date | |

**User's choice:** Keep it minimal
**Notes:** Programs decouple from profiles (linked separately)

| Option | Description | Selected |
|--------|-------------|----------|
| Own Dexie table | Dedicated `profiles` table with id as primary key | ✓ |
| Settings table | Keep using settings table with key pattern like 'profile:xyz' | |

**User's choice:** Own Dexie table

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-create profiles | Migration auto-creates profile records from hardcoded data | ✓ |
| Fresh start | Users create profiles manually, old data stays unlinked | |
| You decide | Claude picks best approach | |

**User's choice:** Auto-create profiles from hardcoded data during migration

---

## Export format versioning

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-upgrade on import | Detect format version, fill missing fields with defaults | ✓ |
| Reject old format | Require re-export from updated app | |
| You decide | Claude picks safest approach | |

**User's choice:** Auto-upgrade on import

| Option | Description | Selected |
|--------|-------------|----------|
| Per-profile | Each export contains one profile's data | ✓ |
| Whole database | Single export with all profiles | |
| Both options | Let user choose at export time | |

**User's choice:** Per-profile exports

---

## New table schemas

| Option | Description | Selected |
|--------|-------------|----------|
| Claude designs all | Define fields/indexes based on downstream phase requirements | ✓ |
| Discuss each table | Walk through fields for each table one by one | |
| Just profiles table | Discuss profiles, let Claude handle rest | |

**User's choice:** Claude designs all table schemas based on requirements

---

## Migration safety

| Option | Description | Selected |
|--------|-------------|----------|
| Zero data loss | Migration must preserve all existing data. Tests to verify. | ✓ |
| Best effort | Prioritize moving forward, minor edge case data loss acceptable | |
| You decide | Claude picks safest approach | |

**User's choice:** Zero data loss

| Option | Description | Selected |
|--------|-------------|----------|
| Block with message | Detect stale tab, show 'Please refresh' | |
| Don't worry about it | Personal app, not worth complexity | ✓ |
| You decide | Claude picks based on Dexie best practices | |

**User's choice:** Skip multi-tab handling — not worth complexity for personal app

---

## Claude's Discretion

- All table schemas (profiles, templates, bodyMetrics) — fields and indexes
- Dexie version bump strategy
- Export format version marker implementation
- Program decoupling approach
- Zod schema updates

## Deferred Ideas

None — discussion stayed within phase scope.
