import { describe, it, expect, vi } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'

async function makeStore() {
  const indexedDB = new IDBFactory()
  const { WorkoutDB } = await import('@/db/client')
  const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
  await fakeDb.open()
  vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
  vi.resetModules()
  const { useWorkoutStore } = await import('./workoutStore')
  // Set an active user
  useWorkoutStore.setState({ activeUserId: 'user-test' })
  return { store: useWorkoutStore.getState(), fakeDb, useWorkoutStore }
}

const sampleExercises = [
  {
    exerciseId: 'hack-squat',
    restSeconds: 150,
    defaultSets: [{ weight: 60, reps: 10, rir: 2, completed: false }],
  },
]

describe('saveTemplate', () => {
  it('creates a template in store.templates with generated id and createdAt', async () => {
    const { store, useWorkoutStore, fakeDb } = await makeStore()
    const id = await store.saveTemplate({
      userId: 'user-test',
      name: 'Treino A Pesado',
      exercises: sampleExercises,
    })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    const templates = useWorkoutStore.getState().templates
    expect(templates).toHaveLength(1)
    expect(templates[0].id).toBe(id)
    expect(templates[0].name).toBe('Treino A Pesado')
    expect(typeof templates[0].createdAt).toBe('string')
    expect(templates[0].createdAt.length).toBeGreaterThan(0)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('deleteTemplate', () => {
  it('removes a template from store.templates by id', async () => {
    const { store, useWorkoutStore, fakeDb } = await makeStore()
    const id = await store.saveTemplate({
      userId: 'user-test',
      name: 'Treino para remover',
      exercises: sampleExercises,
    })
    expect(useWorkoutStore.getState().templates).toHaveLength(1)
    await useWorkoutStore.getState().deleteTemplate(id)
    expect(useWorkoutStore.getState().templates).toHaveLength(0)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('updateTemplate', () => {
  it('patches name/exercises of an existing template', async () => {
    const { store, useWorkoutStore, fakeDb } = await makeStore()
    const id = await store.saveTemplate({
      userId: 'user-test',
      name: 'Template Original',
      exercises: sampleExercises,
    })
    await useWorkoutStore.getState().updateTemplate(id, { name: 'Template Atualizado' })
    const templates = useWorkoutStore.getState().templates
    const updated = templates.find((t) => t.id === id)
    expect(updated).toBeDefined()
    expect(updated!.name).toBe('Template Atualizado')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('duplicateTemplate', () => {
  it('creates a copy with "(copia)" suffix and a new id', async () => {
    const { store, useWorkoutStore, fakeDb } = await makeStore()
    const originalId = await store.saveTemplate({
      userId: 'user-test',
      name: 'Treino Base',
      exercises: sampleExercises,
    })
    const copyId = await useWorkoutStore.getState().duplicateTemplate(originalId)
    expect(typeof copyId).toBe('string')
    expect(copyId).not.toBe(originalId)
    const templates = useWorkoutStore.getState().templates
    expect(templates).toHaveLength(2)
    const copy = templates.find((t) => t.id === copyId)
    expect(copy).toBeDefined()
    expect(copy!.name).toBe('Treino Base (copia)')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})
