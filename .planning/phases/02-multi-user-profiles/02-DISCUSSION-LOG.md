# Phase 2: Multi-User Profiles - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 02-multi-user-profiles
**Areas discussed:** Profile creation flow, Profile switching UX, Avatar & identity, Profile deletion safety

---

## Profile creation flow

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Quick modal overlay — name field + avatar picker, stays on current screen | ✓ |
| Dedicated screen | Full-page profile creation with more room for fields | |
| Bottom sheet | Slides up from bottom — mobile-native feel, swipe-to-dismiss | |

**User's choice:** Modal dialog
**Notes:** shadcn Dialog component available

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Just name — avatar color auto-assigned, can edit later | ✓ |
| Name + avatar color | Name required, color picker shown during creation | |
| Name + avatar color + emoji | Name, color, and optional emoji/icon | |

**User's choice:** Name only
**Notes:** Fastest creation, zero friction

| Option | Description | Selected |
|--------|-------------|----------|
| Inside profile switcher | "+ Novo perfil" at bottom of profile list/dropdown | ✓ |
| Settings screen | "Gerenciar perfis" section in Settings | |
| Both places | Quick-add in switcher + full management in Settings | |

**User's choice:** Inside profile switcher
**Notes:** Discoverable right where you switch profiles

---

## Profile switching UX

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown menu | Tap avatar → dropdown with profile list + '+ Novo perfil' | ✓ |
| Bottom sheet | Slides up with profile cards, mobile-native feel | |
| Full-screen picker | Dedicated screen with large profile cards | |

**User's choice:** Dropdown menu
**Notes:** Styled with shadcn DropdownMenu, minimal UI change from current

| Option | Description | Selected |
|--------|-------------|----------|
| Block switch, show warning | Must finish or cancel workout first | ✓ |
| Auto-save draft, then switch | Save current workout as draft, switch immediately | |
| Confirm dialog, then switch | Warning that workout will be lost | |

**User's choice:** Block switch, show warning
**Notes:** Prevents accidental data loss during active workout

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, persist last active | Store activeUserId in settings table | ✓ |
| Always show profile picker | Force selection on every app open | |

**User's choice:** Yes, persist last active
**Notes:** Current behavior maintained, already stored in settings table

---

## Avatar & identity

| Option | Description | Selected |
|--------|-------------|----------|
| Color circle + initial | First letter + background color from preset palette | ✓ |
| Emoji avatar | User picks emoji as avatar | |
| Color + optional emoji | Color circle with initial, replaceable with emoji | |

**User's choice:** Color circle + initial
**Notes:** Preset palette of 6-8 colors, simple and consistent

| Option | Description | Selected |
|--------|-------------|----------|
| Settings screen | "Meu Perfil" section in Settings | ✓ |
| Long-press avatar | Inline edit popover from header | |
| Profile detail screen | Dedicated /profile/:id route | |

**User's choice:** Settings screen
**Notes:** Centralized, clean, matches expected account management location

---

## Profile deletion safety

| Option | Description | Selected |
|--------|-------------|----------|
| Type profile name to confirm | GitHub-style destructive action pattern | ✓ |
| Simple confirm dialog | "Tem certeza?" + Confirm/Cancel | |
| Two-step confirm | First tap warning, second tap confirms | |

**User's choice:** Type profile name to confirm
**Notes:** Prevents accidental deletion, clear this is irreversible

| Option | Description | Selected |
|--------|-------------|----------|
| Block deletion | Disable delete button when only 1 profile | ✓ |
| Allow, auto-create default | Delete, then auto-create fresh empty profile | |
| Allow, show onboarding | Delete last → show first-time setup | |

**User's choice:** Block deletion of last profile
**Notes:** App needs at least one profile to function

| Option | Description | Selected |
|--------|-------------|----------|
| Switch to first remaining | Auto-switch to first profile in list | ✓ |
| Show profile picker | Force user to pick next profile | |
| Switch to most recently used | Track timestamps, switch to most recent | |

**User's choice:** Switch to first remaining
**Notes:** Simple, deterministic

## Claude's Discretion

- Preset color palette values
- Avatar color auto-assignment algorithm
- shortName and avatarInitial derivation
- Dropdown menu animation details
- Hardcoded data → DB migration strategy
- Settings "Meu Perfil" layout

## Deferred Ideas

None — discussion stayed within phase scope.
