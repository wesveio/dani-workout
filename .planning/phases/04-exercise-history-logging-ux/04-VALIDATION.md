---
phase: 4
slug: exercise-history-logging-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 4 — Validation Strategy

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
| 04-01-01 | 01 | 1 | LOG-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | LOG-02 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | LOG-03 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | LOG-04 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | HIST-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | HIST-02 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | HIST-03 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for LOG-01 through LOG-04 (set logging UX)
- [ ] Test stubs for HIST-01 through HIST-03 (exercise history)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cursor auto-advance between sets | LOG-03 | DOM focus behavior | Log a set, verify cursor moves to next input |
| PR badge visual appearance | LOG-04 | Visual styling | Log a PR weight, verify badge renders |
| Chart interaction (zoom/hover) | HIST-03 | Touch/mouse interaction | Open history, hover chart points |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
