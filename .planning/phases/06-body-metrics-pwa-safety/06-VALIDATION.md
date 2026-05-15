---
phase: 6
slug: body-metrics-pwa-safety
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | BODY-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | BODY-02 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | BODY-03 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | UI-04 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for body metrics CRUD operations (BODY-01, BODY-02)
- [ ] Test stubs for progress photo storage (BODY-03)
- [ ] Test stubs for iOS install banner logic (UI-04)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iOS Safari install banner display | UI-04 | Requires real iOS Safari device/UA | Open app in iOS Safari, verify banner appears, dismiss, verify 7-day suppression |
| Progress photo camera capture | BODY-03 | Requires device camera access | Use mobile device to take photo via app, verify storage and retrieval |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
