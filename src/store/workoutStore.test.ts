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

describe('createProfile', () => {
  async function makeStore() {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()
    vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    return { store: useWorkoutStore.getState(), fakeDb }
  }

  it('writes a Profile to db.profiles with correct derived fields', async () => {
    const { store, fakeDb } = await makeStore()
    await store.createProfile('Ana Maria')
    const profiles = await fakeDb.profiles.toArray()
    const created = profiles.find((p) => p.name === 'Ana Maria')
    expect(created).toBeDefined()
    expect(created!.id).toBeTruthy()
    expect(created!.shortName).toBe('Ana')
    expect(created!.avatarInitial).toBe('A')
    const { AVATAR_COLORS } = await import('@/lib/profile-constants')
    expect(AVATAR_COLORS).toContain(created!.avatarColor)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })

  it('does NOT write to db.profiles for whitespace-only name', async () => {
    const { store, fakeDb } = await makeStore()
    const before = await fakeDb.profiles.count()
    await store.createProfile('   ')
    const after = await fakeDb.profiles.count()
    expect(after).toBe(before)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })

  it('switches to the newly created profile', async () => {
    const { store, fakeDb } = await makeStore()
    await store.createProfile('Carlos')
    const { useWorkoutStore: freshStore } = await import('./workoutStore')
    const activeId = freshStore.getState().activeUserId
    const created = await fakeDb.profiles.filter((p) => p.name === 'Carlos').first()
    expect(activeId).toBe(created!.id)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('updateProfile', () => {
  async function makeStore() {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()
    const profile = { id: 'test-id', name: 'Old Name', shortName: 'Old', avatarInitial: 'O', avatarColor: '#2DD4BF' }
    await fakeDb.profiles.put(profile)
    vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    return { store: useWorkoutStore.getState(), fakeDb }
  }

  it('updates name, recomputes shortName and avatarInitial', async () => {
    const { store, fakeDb } = await makeStore()
    await store.updateProfile('test-id', { name: 'New Name' })
    const updated = await fakeDb.profiles.get('test-id')
    expect(updated!.name).toBe('New Name')
    expect(updated!.shortName).toBe('New')
    expect(updated!.avatarInitial).toBe('N')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })

  it('updates only avatarColor without changing name/shortName/avatarInitial', async () => {
    const { store, fakeDb } = await makeStore()
    await store.updateProfile('test-id', { avatarColor: '#FB7185' })
    const updated = await fakeDb.profiles.get('test-id')
    expect(updated!.avatarColor).toBe('#FB7185')
    expect(updated!.name).toBe('Old Name')
    expect(updated!.shortName).toBe('Old')
    expect(updated!.avatarInitial).toBe('O')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('deleteProfile', () => {
  async function makeStore(profiles: Array<{ id: string; name: string; shortName: string; avatarInitial: string; avatarColor: string }>) {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()
    await fakeDb.profiles.bulkPut(profiles)
    vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    return { store: useWorkoutStore.getState(), fakeDb }
  }

  it('removes profile and all associated data atomically', async () => {
    const profiles = [
      { id: 'user-a', name: 'Alpha', shortName: 'Alpha', avatarInitial: 'A', avatarColor: '#2DD4BF' },
      { id: 'user-b', name: 'Beta', shortName: 'Beta', avatarInitial: 'B', avatarColor: '#818CF8' },
    ]
    const { store, fakeDb } = await makeStore(profiles)
    // Seed some data for user-a
    await fakeDb.workouts.put({ id: 'w1', userId: 'user-a', date: '2024-01-01', weekNumber: 1, sessionType: 'A', deload: false })
    await fakeDb.exerciseLogs.put({ id: 'e1', userId: 'user-a', workoutId: 'w1', exerciseId: 'ex1', sets: [], date: '2024-01-01', weekNumber: 1, sessionType: 'A' })
    await fakeDb.settings.put({ key: 'user:user-a', value: { recoveryExcellent: false, programStart: '2024-01-01', defaultRestSeconds: 90, exerciseRestConfig: {} } })

    await store.deleteProfile('user-a')

    expect(await fakeDb.profiles.get('user-a')).toBeUndefined()
    expect(await fakeDb.workouts.where('userId').equals('user-a').count()).toBe(0)
    expect(await fakeDb.exerciseLogs.where('userId').equals('user-a').count()).toBe(0)
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })

  it('does NOT delete when only 1 profile remains', async () => {
    const profiles = [
      { id: 'only-one', name: 'Sole', shortName: 'Sole', avatarInitial: 'S', avatarColor: '#2DD4BF' },
    ]
    const { store, fakeDb } = await makeStore(profiles)
    // Clear seeded profiles (dani, wesley) so only 'only-one' remains
    await fakeDb.profiles.clear()
    await fakeDb.profiles.put(profiles[0])
    await store.deleteProfile('only-one')
    const remaining = await fakeDb.profiles.get('only-one')
    expect(remaining).toBeDefined()
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })

  it('auto-switches activeUserId to first remaining profile when active profile is deleted', async () => {
    const profiles = [
      { id: 'user-x', name: 'X', shortName: 'X', avatarInitial: 'X', avatarColor: '#2DD4BF' },
      { id: 'user-y', name: 'Y', shortName: 'Y', avatarInitial: 'Y', avatarColor: '#818CF8' },
    ]
    const { store, fakeDb } = await makeStore(profiles)
    // Clear seeded profiles and put only our two test profiles
    await fakeDb.profiles.clear()
    await fakeDb.profiles.bulkPut(profiles)
    // Set activeUserId to user-x on the store we have
    store.activeUserId = 'user-x'
    // Use the same store reference — check state after deleteProfile
    const { useWorkoutStore } = await import('./workoutStore')
    useWorkoutStore.setState({ activeUserId: 'user-x' })
    await useWorkoutStore.getState().deleteProfile('user-x')
    const newActiveId = useWorkoutStore.getState().activeUserId
    expect(newActiveId).toBe('user-y')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('switchUser guard', () => {
  it('blocks switchUser when pathname starts with /session', async () => {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()
    vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    // Simulate being on /session route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/session/abc' },
      writable: true,
    })
    const store = useWorkoutStore.getState()
    store.setState = useWorkoutStore.setState
    const originalUserId = store.activeUserId
    await store.switchUser('other-user')
    expect(useWorkoutStore.getState().activeUserId).toBe(originalUserId)
    expect(useWorkoutStore.getState().error).toBe('Finalize ou descarte o treino antes de trocar de perfil')
    // Reset location
    Object.defineProperty(window, 'location', { value: { pathname: '/' }, writable: true })
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('init fallback', () => {
  it('uses first profile from db.profiles when no app settings exist', async () => {
    const indexedDB = new IDBFactory()
    const { WorkoutDB } = await import('@/db/client')
    const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
    await fakeDb.open()
    // Clear seeded profiles and add a custom one
    await fakeDb.profiles.clear()
    await fakeDb.settings.clear()
    await fakeDb.profiles.put({ id: 'custom-user', name: 'Custom', shortName: 'Custom', avatarInitial: 'C', avatarColor: '#2DD4BF' })
    vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
    vi.resetModules()
    const { useWorkoutStore } = await import('./workoutStore')
    await useWorkoutStore.getState().init()
    expect(useWorkoutStore.getState().activeUserId).toBe('custom-user')
    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})

describe('exportData', () => {
  it('returns object with formatVersion=3', async () => {
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
    expect(bundle.formatVersion).toBe(3)

    fakeDb.close()
    vi.doUnmock('@/db/client')
  })
})
