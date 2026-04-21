import { describe, it, expect } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { WorkoutDB } from './client'

// Each helper creates a WorkoutDB instance backed by a fresh in-memory IDB,
// completely isolated from every other test.
function makeDB() {
  const indexedDB = new IDBFactory()
  return new WorkoutDB({ indexedDB, IDBKeyRange })
}

describe('WorkoutDB v4 migration', () => {
  it('opens at version 4', async () => {
    const db = makeDB()
    await db.open()
    expect(db.verno).toBe(4)
    db.close()
  })

  it('has all 6 expected tables', async () => {
    const db = makeDB()
    await db.open()
    const tableNames = db.tables.map((t) => t.name)
    expect(tableNames).toContain('profiles')
    expect(tableNames).toContain('templates')
    expect(tableNames).toContain('bodyMetrics')
    expect(tableNames).toContain('workouts')
    expect(tableNames).toContain('exerciseLogs')
    expect(tableNames).toContain('settings')
    db.close()
  })

  it('seeds dani profile on first open', async () => {
    const db = makeDB()
    await db.open()
    const dani = await db.profiles.get('dani')
    expect(dani).toBeDefined()
    expect(dani?.name).toBe('Daniela Sotilo')
    expect(dani?.avatarColor).toBe('#e11d48')
    db.close()
  })

  it('seeds wesley profile on first open', async () => {
    const db = makeDB()
    await db.open()
    const wesley = await db.profiles.get('wesley')
    expect(wesley).toBeDefined()
    expect(wesley?.name).toBe('Wesley')
    expect(wesley?.avatarColor).toBe('#2563eb')
    db.close()
  })

  it('existing workouts survive migration (zero data loss)', async () => {
    const indexedDB = new IDBFactory()
    const dbOptions = { indexedDB, IDBKeyRange }

    // Open at v3 and insert a workout
    const { Dexie } = await import('dexie')
    const v3db = new Dexie('dani-training-db', dbOptions)
    v3db.version(3).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
    })
    await v3db.open()
    await v3db.table('workouts').add({
      id: 'workout-001',
      date: '2024-01-01',
      weekNumber: 1,
      sessionType: 'A',
      deload: false,
      userId: 'dani',
    })
    v3db.close()

    // Reopen with v4 via WorkoutDB — same IDB factory, triggers upgrade
    const db = new WorkoutDB(dbOptions)
    await db.open()
    const workout = await db.workouts.get('workout-001')
    expect(workout).toBeDefined()
    expect(workout?.id).toBe('workout-001')
    db.close()
  })

  it('existing exerciseLogs survive migration (zero data loss)', async () => {
    const indexedDB = new IDBFactory()
    const dbOptions = { indexedDB, IDBKeyRange }

    const { Dexie } = await import('dexie')
    const v3db = new Dexie('dani-training-db', dbOptions)
    v3db.version(3).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
    })
    await v3db.open()
    await v3db.table('exerciseLogs').add({
      id: 'log-001',
      workoutId: 'workout-001',
      exerciseId: 'squat',
      sets: [],
      date: '2024-01-01',
      weekNumber: 1,
      sessionType: 'A',
      userId: 'dani',
    })
    v3db.close()

    const db = new WorkoutDB(dbOptions)
    await db.open()
    const log = await db.exerciseLogs.get('log-001')
    expect(log).toBeDefined()
    expect(log?.id).toBe('log-001')
    db.close()
  })
})
