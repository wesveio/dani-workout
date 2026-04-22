---
phase: 5
slug: workout-templates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
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
| 05-01-01 | 01 | 1 | TMPL-04 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | TMPL-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | TMPL-03 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | TMPL-02 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for exercise catalog (TMPL-04)
- [ ] Test stubs for template CRUD store actions (TMPL-01, TMPL-03)
- [ ] Test stubs for start-from-template flow (TMPL-02)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Template card swipe/long-press actions | TMPL-03 | Touch gesture interaction | On mobile: swipe left on template card, verify edit/duplicate/delete actions appear |
| Save-as-template dialog from session | TMPL-01 | Post-workout flow timing | Complete workout, verify "Salvar como Template" appears in post-session flow |
| Template preview + edit before start | TMPL-02 | Multi-step visual flow | Select template, verify preview shows exercises, modify one, start session |
| Bottom nav Templates tab | TMPL-03 | Visual placement | Verify Templates tab appears in bottom nav with correct icon |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
