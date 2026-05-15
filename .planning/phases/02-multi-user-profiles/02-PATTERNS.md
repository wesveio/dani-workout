# Phase 2: Multi-User Profiles - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ProfileSwitcher.tsx` | component | request-response | `src/components/Layout.tsx` (avatar + select block, lines 55-79) | role-match |
| `src/components/CreateProfileDialog.tsx` | component | CRUD | `src/routes/Settings.tsx` (reset Dialog, lines 151-176) | role-match |
| `src/components/Layout.tsx` | component | request-response | `src/components/Layout.tsx` itself | self (modification) |
| `src/lib/user.ts` | hook/utility | request-response | `src/lib/user.ts` itself | self (modification) |
| `src/store/workoutStore.ts` | store | CRUD | `src/store/workoutStore.ts` itself (importData, reset, switchUser) | self (modification) |
| `src/routes/Settings.tsx` | component | CRUD | `src/routes/Settings.tsx` itself (Dialog section, lines 151-176) | self (modification) |
| `src/data/users.ts` | utility | — | `src/data/users.ts` itself | self (teardown/migration) |

---

## Pattern Assignments

### `src/components/ProfileSwitcher.tsx` (component, request-response)

**Analog:** `src/components/Layout.tsx` lines 55-79 (existing avatar + `<select>` block being replaced)

**Imports pattern** — copy from `src/components/Layout.tsx` lines 1-14 and extend:
```typescript
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check } from 'lucide-react'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateProfileDialog } from './CreateProfileDialog'
```

**Live query pattern** — same pattern used implicitly across the codebase for Dexie reads; align with store's `db.profiles` usage (`workoutStore.ts` lines 248, 280-289):
```typescript
const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []
```

**Avatar trigger pattern** — copy from `src/components/Layout.tsx` lines 56-58 (the avatar `div`), wrap as DropdownMenuTrigger:
```typescript
<DropdownMenuTrigger asChild>
  <button
    className="h-11 w-11 rounded-2xl grid place-items-center font-bold text-white"
    style={{ backgroundColor: activeProfile?.avatarColor ?? '#666' }}
    aria-label="Trocar perfil"
  >
    {activeProfile?.avatarInitial ?? '?'}
  </button>
</DropdownMenuTrigger>
```

**Active-workout guard pattern** — copy from `src/store/workoutStore.ts` `switchUser` action (lines 196-206); the component should call `switchUser` from the store which already has error state:
```typescript
// In ProfileSwitcher: read session state from store
const isSessionActive = useWorkoutStore((s) => !!s.activeSession) // or equivalent flag
// Before switching: if isSessionActive, show toast/warning instead of calling switchUser
```

---

### `src/components/CreateProfileDialog.tsx` (component, CRUD)

**Analog:** `src/routes/Settings.tsx` lines 151-176 (reset confirm Dialog)

**Dialog open/close state pattern** (`Settings.tsx` lines 22, 151-153):
```typescript
const [open, setOpen] = useState(false)
// ...
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Novo perfil</DialogTitle>
      <DialogDescription>Escolha um nome para começar.</DialogDescription>
    </DialogHeader>
    {/* name input */}
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button onClick={handleCreate}>Criar perfil</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Input + validation pattern** (`Settings.tsx` lines 93-106 for date input / inline guard before Dexie write):
```typescript
const [name, setName] = useState('')
const handleCreate = async () => {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 50) return
  await createProfile(trimmed)
  setName('')
  onOpenChange(false)
}
```

**Toast feedback pattern** (`Settings.tsx` lines 33, 44, 53):
```typescript
import { toast } from '@/components/ui/use-toast'
toast({ title: 'Perfil criado', description: `${trimmed} adicionado.` })
```

---

### `src/components/Layout.tsx` (modification)

**What changes:** Lines 8 (`import { userList }`) and lines 55-79 (avatar + `<select>` block) are replaced.

**Replacement pattern:**
```typescript
// Remove: import { userList } from '@/data/users'
// Remove: <select>...</select> block (lines 60-77)
// Add:
import { ProfileSwitcher } from './ProfileSwitcher'
// In JSX, replace the avatar div + select div with:
<ProfileSwitcher />
```

**Program null-guard pattern** — `program` from `useActiveProgram()` may return `null` for new profiles (lines 35-38 of Layout.tsx need guarding):
```typescript
// Existing (line 35): program.durationWeeks — will crash if program is null
// Pattern: guard all program-dependent expressions
const weekNumber = program ? getCurrentWeekNumber(settings.programStart, program.durationWeeks) : 0
const weekInfo = program?.weeks.find((w) => w.number === weekNumber)
const scheduleLabel = program?.schedule.map((day) => day.day.slice(0, 3)).join(' / ') ?? ''
```

---

### `src/lib/user.ts` (modification)

**Analog:** `src/lib/user.ts` itself (full file, 13 lines)

**Current pattern (lines 1-13):**
```typescript
import { useMemo } from 'react'
import { getUserProfile } from '@/data/users'
import { useWorkoutStore } from '@/store/workoutStore'

export const useActiveUserProfile = () => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  return useMemo(() => getUserProfile(activeUserId), [activeUserId])
}

export const useActiveProgram = () => {
  const profile = useActiveUserProfile()
  return profile.program
}
```

**New pattern — replace `useActiveUserProfile` with Dexie live query:**
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import type { Profile } from '@/types'

export const useActiveUserProfile = (): Profile | undefined => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  return useLiveQuery(() => db.profiles.get(activeUserId), [activeUserId])
}
```

**New pattern — `useActiveProgram` decoupled from `data/users.ts`** (keep hardcoded by known ID until Phase 5):
```typescript
import { treinoDani } from '@/data/treinoDani'
import { treinoWesley } from '@/data/treinoWesley'

export const useActiveProgram = () => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  if (activeUserId === 'dani') return treinoDani
  if (activeUserId === 'wesley') return treinoWesley
  return null
}
```

---

### `src/store/workoutStore.ts` (modification)

**Analog:** `src/store/workoutStore.ts` itself — new actions follow existing action patterns

**Type extension pattern** — add new actions to the `WorkoutStore` type (lines 113-130):
```typescript
type WorkoutStore = {
  // ... existing fields ...
  createProfile: (name: string) => Promise<void>
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatarColor'>>) => Promise<void>
  deleteProfile: (userId: UserId) => Promise<void>
}
```

**`createProfile` action** — follows `logSession` pattern (lines 207-234): build object, write to Dexie, then update reactive state:
```typescript
createProfile: async (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return
  const profiles = await db.profiles.toArray()
  const AVATAR_COLORS = [
    '#e11d48', '#2563eb', '#16a34a', '#d97706',
    '#9333ea', '#0891b2', '#ea580c', '#4f46e5',
  ]
  const profile: Profile = {
    id: makeId(),
    name: trimmed,
    shortName: trimmed.split(' ')[0],
    avatarInitial: trimmed.charAt(0).toUpperCase(),
    avatarColor: AVATAR_COLORS[profiles.length % AVATAR_COLORS.length],
  }
  await db.profiles.put(profile)
  await get().switchUser(profile.id)
},
```

**`updateProfile` action** — follows `saveSettings` pattern (lines 235-241): read → merge → write:
```typescript
updateProfile: async (id, patch) => {
  const existing = await db.profiles.get(id)
  if (!existing) return
  const updated = { ...existing, ...patch }
  if (patch.name) {
    updated.shortName = patch.name.trim().split(' ')[0]
    updated.avatarInitial = patch.name.trim().charAt(0).toUpperCase()
  }
  await db.profiles.put(updated)
},
```

**`deleteProfile` action** — follows `importData` transaction pattern (lines 280-296) using `db.transaction('rw', ...)`:
```typescript
deleteProfile: async (userId) => {
  const profiles = await db.profiles.toArray()
  if (profiles.length <= 1) return // D-10: block last profile delete
  // D-05 variant: block if deleting the active profile mid-workout
  const { activeUserId } = get()
  // (check for active session here if workoutStore tracks it)
  await db.transaction('rw',
    db.profiles, db.workouts, db.exerciseLogs, db.settings, db.bodyMetrics, db.templates,
    async () => {
      await db.profiles.delete(userId)
      await db.workouts.where('userId').equals(userId).delete()
      await db.exerciseLogs.where('userId').equals(userId).delete()
      await db.settings.delete(`user:${userId}`)
      await db.bodyMetrics.where('userId').equals(userId).delete()
      await db.templates.where('userId').equals(userId).delete()
    }
  )
  // D-11: auto-switch if active profile deleted
  if (activeUserId === userId) {
    const remaining = await db.profiles.toArray()
    if (remaining.length > 0) await get().switchUser(remaining[0].id)
  }
},
```

**Error handling pattern** — copy from `switchUser` (lines 196-206): `set({ loading: true })` → try/catch → `set({ loading: false, error: '...' })`:
```typescript
// Wrap the action body in try/catch matching existing store style:
try {
  // ... action body ...
} catch (err) {
  console.error(err)
  set({ error: 'Não foi possível completar a operação.' })
}
```

**`init` migration** — replace `defaultUserId` fallback (lines 179-180) with first-profile-from-Dexie pattern:
```typescript
// Old (line 180):
const activeUserId = (appSettings?.value as { activeUserId?: UserId } | undefined)?.activeUserId ?? defaultUserId
// New:
const profiles = await db.profiles.toArray()
const fallbackId = profiles[0]?.id ?? 'dani'
const activeUserId = (appSettings?.value as { activeUserId?: UserId } | undefined)?.activeUserId ?? fallbackId
```

---

### `src/routes/Settings.tsx` (modification — add "Meu Perfil" section)

**Analog:** `src/routes/Settings.tsx` itself — new section follows Card pattern (lines 65-106)

**Section structure pattern** — copy Card structure from lines 85-106:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Meu Perfil</CardTitle>
    <CardDescription>Edite nome e cor do avatar.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label>Nome</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
    </div>
    {/* Color picker: row of 8 color swatches, click to select */}
    <Button onClick={handleUpdate}>Salvar</Button>
  </CardContent>
</Card>
```

**Delete button with Dialog** — copy Dialog pattern from `Settings.tsx` lines 151-176, change to type-to-confirm (D-09):
```typescript
<Dialog open={openDelete} onOpenChange={setOpenDelete}>
  <DialogTrigger asChild>
    <Button variant="outline" disabled={profileCount <= 1}>Excluir perfil</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Excluir {profile?.name}?</DialogTitle>
      <DialogDescription>
        Digite <strong>{profile?.name}</strong> para confirmar. Esta ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <Input
      value={confirmName}
      onChange={(e) => setConfirmName(e.target.value)}
      placeholder={profile?.name}
    />
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="secondary" onClick={() => setOpenDelete(false)}>Cancelar</Button>
      <Button
        variant="default"
        disabled={confirmName.trim() !== profile?.name}
        onClick={handleDelete}
      >
        Excluir
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### `src/data/users.ts` (teardown/migration)

**No new pattern needed — this file is phased out.** Its consumers are migrated:

| Export | Consumer | Migration |
|--------|----------|-----------|
| `defaultUserId` | `workoutStore.ts` line 5, 180, 187 | Replaced by `profiles[0]?.id` from Dexie in `init()` |
| `userList` | `Layout.tsx` line 8 | Replaced by `useLiveQuery(() => db.profiles.toArray())` in `ProfileSwitcher` |
| `getUserProfile` | `lib/user.ts` line 2 | Replaced by `db.profiles.get(activeUserId)` in `useActiveUserProfile` |
| `getProgramForUser` | (not imported currently) | Delete — unused |
| `users` | (not imported directly) | Delete — unused after above |

After migration, `data/users.ts` can export only the program lookup shim that `useActiveProgram` still needs until Phase 5, or it can be deleted entirely if `useActiveProgram` is updated to import programs directly.

---

## Shared Patterns

### Dexie Transaction (atomic write)
**Source:** `src/store/workoutStore.ts` lines 223-231 (`logSession`) and lines 280-296 (`importData`)
**Apply to:** `deleteProfile` action, any multi-table write in `createProfile`/`updateProfile`
```typescript
await db.transaction('rw', db.tableA, db.tableB, async () => {
  await db.tableA.put(...)
  await db.tableB.where('userId').equals(id).delete()
})
```

### Store Error Handling
**Source:** `src/store/workoutStore.ts` lines 196-206 (`switchUser`)
**Apply to:** All three new store actions (`createProfile`, `updateProfile`, `deleteProfile`)
```typescript
set({ loading: true })
try {
  // ... action ...
  set({ loading: false, error: null })
} catch (err) {
  console.error(err)
  set({ loading: false, error: 'Mensagem de erro em português.' })
}
```

### Settings Toast Feedback
**Source:** `src/routes/Settings.tsx` lines 33, 44, 53
**Apply to:** `CreateProfileDialog`, `Settings.tsx` "Meu Perfil" section
```typescript
import { toast } from '@/components/ui/use-toast'
toast({ title: 'Ação concluída', description: 'Descrição em português.' })
```

### Dialog controlled open state
**Source:** `src/routes/Settings.tsx` lines 22, 151
**Apply to:** `CreateProfileDialog`, delete profile Dialog in Settings
```typescript
const [open, setOpen] = useState(false)
<Dialog open={open} onOpenChange={setOpen}>
```

### Zustand selector (avoid re-render)
**Source:** `src/components/Layout.tsx` lines 28-31
**Apply to:** All components reading from `useWorkoutStore`
```typescript
const activeUserId = useWorkoutStore((s) => s.activeUserId)
const switchUser = useWorkoutStore((s) => s.switchUser)
// Use individual selectors, not `useWorkoutStore()` (returns full state)
```

---

## No Analog Found

All files have analogs in the codebase. The `src/components/ui/dropdown-menu.tsx` will be generated by `npx shadcn@latest add dropdown-menu` — no codebase analog exists, but the pattern matches all other files in `src/components/ui/` (e.g., `dialog.tsx`, `button.tsx`).

---

## Metadata

**Analog search scope:** `src/store/`, `src/components/`, `src/routes/`, `src/lib/`, `src/data/`, `src/types.ts`
**Files scanned:** 7 (workoutStore.ts, Layout.tsx, Settings.tsx, lib/user.ts, data/users.ts, types.ts, db/client.ts)
**Pattern extraction date:** 2026-04-21
