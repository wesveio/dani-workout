import { describe, it, expect, vi } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'

// Import schemas directly (Option A — schemas must be exported from workoutStore.ts)
import { userIdSchema, importSchema } from './workoutStore'

// Fixtures
const v1Bundle = {
  userId: 'dani',
  workouts: [],
  exerciseLogs: [],
}

const v2Bundle = {
  formatVersion: 2,
  userId: 'newuser123',
  workouts: [],
  exerciseLogs: [],
  profiles: [],
  templates: [],
  bodyMetrics: [],
}

describe('userIdSchema', () => {
  it('accepts arbitrary non-empty string (e.g. alice)', () => {
    const result = userIdSchema.safeParse('alice')
    expect(result.success).toBe(true)
  })

  it('rejects empty string', () => {
    const result = userIdSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('importSchema', () => {
  it('parses v1 bundle (no formatVersion) and defaults formatVersion to 1', () => {
    const result = importSchema.safeParse(v1Bundle)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.formatVersion).toBe(1)
    }
  })

  it('parses v2 bundle with formatVersion=2, profiles, templates, bodyMetrics', () => {
    const result = importSchema.safeParse(v2Bundle)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.formatVersion).toBe(2)
      expect(result.data.profiles).toEqual([])
      expect(result.data.templates).toEqual([])
      expect(result.data.bodyMetrics).toEqual([])
    }
  })

  it('accepts bundle where userId is a dynamic string (newuser123)', () => {
    const result = importSchema.safeParse({ ...v1Bundle, userId: 'newuser123' })
    expect(result.success).toBe(true)
  })
})

describe('exportData', () => {
  it('returns object with formatVersion=2', async () => {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()

    // Mock the db module so workoutStore uses our fake DB
    vi.doMock('@/db/client', () => ({
      WorkoutDB,
      db: fakeDb,
    }))

    // Reset module so workoutStore re-imports the mocked db
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    const store = useWorkoutStore.getState()

    const bundle = await store.exportData()
    expect(bundle.formatVersion).toBe(2)

    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})
