---
phase: 3
slug: ui-redesign-rest-timer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vite.config.ts` (vitest inline config) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | UI-01 | — | N/A | visual | manual inspection | — | ⬜ pending |
| TBD | TBD | TBD | UI-02 | — | N/A | visual | manual inspection | — | ⬜ pending |
| TBD | TBD | TBD | UI-03 | — | N/A | visual | manual inspection | — | ⬜ pending |
| TBD | TBD | TBD | REST-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | REST-02 | — | N/A | visual | manual inspection | — | ⬜ pending |
| TBD | TBD | TBD | REST-03 | — | N/A | integration | manual inspection | — | ⬜ pending |
| TBD | TBD | TBD | REST-04 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | LOG-05 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/rest-timer.test.ts` — unit tests for timer state machine (REST-01, REST-04, LOG-05)
- [ ] Existing `src/lib/rest.test.ts` — already covers parseRestDuration

*Existing infrastructure covers framework installation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bold dark theme across all screens | UI-01 | Visual design — cannot be unit tested | Open each route, verify dark bg, accent colors, typography |
| Navigation two-tap reach | UI-02 | Interaction flow — requires human navigation | From any screen, verify any other screen reachable in ≤2 taps |
| Touch targets sized for gym use | UI-03 | Physical measurement — min 44px targets | Inspect touch targets via DevTools, verify ≥44px |
| Ring animation countdown | REST-02 | Visual animation — cannot be unit tested | Log a set, observe ring depleting clockwise |
| Vibration + audio alert | REST-03 | Hardware API — requires real device | Lock phone, wait for timer expiry, verify vibration/sound |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
