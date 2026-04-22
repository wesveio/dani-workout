---
phase: 05-workout-templates
reviewed: 2026-04-22T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - src/App.tsx
  - src/components/ExercisePicker.tsx
  - src/components/TemplateBuilderSheet.tsx
  - src/components/TemplateCard.tsx
  - src/components/TemplatePreviewSheet.tsx
  - src/data/exerciseCatalog.test.ts
  - src/data/exerciseCatalog.ts
  - src/index.css
  - src/routes/Dashboard.tsx
  - src/routes/SessionDetail.tsx
  - src/routes/Templates.tsx
  - src/store/workoutStore.template.test.ts
  - src/store/workoutStore.ts
  - src/types.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

The phase 05 workout-templates feature is well-structured and follows existing project patterns. The store actions (saveTemplate, updateTemplate, deleteTemplate, duplicateTemplate) are correctly implemented with IndexedDB persistence and in-memory Zustand state sync. The UI components are complete and readable.

Four warnings were found — none are security issues, but three can cause incorrect runtime behavior: stale state read during auto-focus, missing state reset when the builder sheet reopens for a new template, a double-deletion path in the template card, and an unvalidated session route in template mode. Four info items flag minor code smells.

## Warnings

### WR-01: Stale exerciseState read inside handleSetChange auto-focus closure

**File:** `src/routes/SessionDetail.tsx:413`
**Issue:** The auto-focus loop on lines 411–424 reads `exerciseState` from the outer closure captured at render time, not the updated state after `setExerciseState` has been called on line 378. When the completed set is the last one in an exercise, the stale snapshot may still show it as incomplete and skip to the wrong set. This is a classic stale-closure issue in React.
**Fix:** Move the auto-focus scan into a separate `useEffect` that depends on `exerciseState`, or read from a ref that is kept in sync with current state:

```ts
// Option: track state in a ref
const exerciseStateRef = useRef(exerciseState)
useEffect(() => { exerciseStateRef.current = exerciseState }, [exerciseState])

// Inside handleSetChange requestAnimationFrame callback:
const state = exerciseStateRef.current[ex.id]
```

---

### WR-02: TemplateBuilderSheet does not reset when switching edit targets

**File:** `src/components/TemplateBuilderSheet.tsx:29-36`
**Issue:** `useState` initialises `name` and `exercises` from `initial` only on mount. When `Templates.tsx` changes `editingTemplate` from one template to another without unmounting the sheet (which can happen if both the builder and a second dialog are open simultaneously, or if two cards call `onEdit` quickly), the builder still shows the first template's data. The comment on line 39 says "Reset state when initial changes" but there is no `useEffect` implementing this.
**Fix:** Add a `useEffect` to sync state when `initial` changes:

```ts
useEffect(() => {
  setName(initial?.name ?? '')
  setExercises(
    initial?.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      restSeconds: e.restSeconds,
      setCount: e.defaultSets.length || 3,
    })) ?? [],
  )
}, [initial])
```

---

### WR-03: TemplateCard exposes two independent delete paths with inconsistent confirmation

**File:** `src/components/TemplateCard.tsx:157-159`
**Issue:** The DropdownMenu "Excluir" item (line 157) calls `onDelete` directly with no confirmation prompt, bypassing the swipe-reveal two-tap confirmation flow entirely. A mis-tap on the dropdown can irreversibly delete a template. Both paths should require confirmation or both should not.
**Fix:** Either add a `window.confirm` guard in the dropdown path, or funnel the dropdown delete to trigger the swipe reveal animation so both paths use the same two-step confirmation:

```tsx
<DropdownMenuItem
  onClick={() => {
    setDropdownOpen(false)
    if (window.confirm('Excluir este template?')) onDelete()
  }}
  className="text-destructive"
>
  Excluir
</DropdownMenuItem>
```

---

### WR-04: Template session mode silently fails when location.state is absent

**File:** `src/routes/SessionDetail.tsx:137-139, 597`
**Issue:** When `sessionId === 'template'` but `location.state` is null or lacks `exercises`, `templateExercisesFromState` is `undefined`, causing `templateSession` to be `null` (line 177). The guard on line 597 only blocks non-template modes, so in template mode with missing state the component falls through and renders an empty session with no exercises and no error message. Navigating directly to `/session/template` produces a blank, silently broken view.
**Fix:** Add an explicit guard for template mode with missing state:

```tsx
if (isTemplateMode && !templateExercisesFromState) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template inválido</CardTitle>
        <CardDescription>Dados do template não encontrados.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate('/templates')}>Ver templates</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Info

### IN-01: templateSchema missing `rir` field from SetEntry

**File:** `src/store/workoutStore.ts:86-92`
**Issue:** The `defaultSets` schema inside `templateSchema` omits the `rir` field that is present in `SetEntry` (defined in `types.ts`). Import validation via `importSchema` will silently strip `rir` from imported template sets, causing template exercises to start at `rir: undefined` instead of the intended value.
**Fix:**
```ts
defaultSets: z.array(z.object({
  weight: z.number(),
  reps: z.number(),
  rir: z.number().optional().default(0),  // add this
  completed: z.boolean(),
})),
```

---

### IN-02: Duplicate exercise entry point in TemplateCard dropdown does not deduplicate

**File:** `src/routes/Templates.tsx:73`
**Issue:** `onDuplicate` is called without `await` and without any user feedback (no toast). If the duplicate operation fails or is slow, the user gets no indication. This is inconsistent with `onDelete` which shows a toast.
**Fix:** Add a toast on success, similar to the delete handler:

```tsx
onDuplicate={async () => {
  await duplicateTemplate(template.id)
  toast({ title: 'Template duplicado' })
}}
```

---

### IN-03: Key instability when duplicate exerciseIds exist in the builder

**File:** `src/components/TemplateBuilderSheet.tsx:131`
**Issue:** The row key is `${ex.exerciseId}-${index}`. The `ExercisePicker` already enforces `excludeIds` to prevent duplicate exercises, so this is not reachable in normal flow. However the key still relies on `index` as the disambiguation, which causes unnecessary remounts during reorder operations (every item below the moved one gets a new key).
**Fix:** Use a stable per-entry ID generated at add time:

```ts
type BuilderExercise = {
  _key: string   // e.g. crypto.randomUUID() on add
  exerciseId: string
  ...
}
```

---

### IN-04: `deleteTemplate` error message missing accents

**File:** `src/store/workoutStore.ts:414, 425`
**Issue:** Error strings `'Nao foi possivel remover o template.'` and `'Nao foi possivel atualizar o template.'` are missing Portuguese accents (`Não foi possível`). All other error strings in the store use correct accents.
**Fix:**
```ts
set({ error: 'Não foi possível remover o template.' })
// and
set({ error: 'Não foi possível atualizar o template.' })
```

---

_Reviewed: 2026-04-22T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
