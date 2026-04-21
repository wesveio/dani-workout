import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import Dexie from 'dexie'

describe('WorkoutDB v4 migration', () => {
  beforeEach(async () => {
    // Delete the database before each test to ensure clean state
    await Dexie.delete('dani-training-db')
  })

  it('opens at version 4', async () => {
    const { db } = await import('./client')
    await db.open()
    expect(db.verno).toBe(4)
    await db.close()
  })

  it('has all 6 expected tables', async () => {
    const { db } = await import('./client')
    await db.open()
    const tableNames = db.tables.map((t) => t.name)
    expect(tableNames).toContain('profiles')
    expect(tableNames).toContain('templates')
    expect(tableNames).toContain('bodyMetrics')
    expect(tableNames).toContain('workouts')
    expect(tableNames).toContain('exerciseLogs')
    expect(tableNames).toContain('settings')
    await db.close()
  })

  it('seeds dani profile on first open', async () => {
    const { db } = await import('./client')
    await db.open()
    const dani = await db.profiles.get('dani')
    expect(dani).toBeDefined()
    expect(dani?.name).toBe('Daniela Sotilo')
    expect(dani?.avatarColor).toBe('#e11d48')
    await db.close()
  })

  it('seeds wesley profile on first open', async () => {
    const { db } = await import('./client')
    await db.open()
    const wesley = await db.profiles.get('wesley')
    expect(wesley).toBeDefined()
    expect(wesley?.name).toBe('Wesley')
    expect(wesley?.avatarColor).toBe('#2563eb')
    await db.close()
  })

  it('existing workouts survive migration (zero data loss)', async () => {
    // Simulate pre-existing workouts at v3 schema
    const tempDb = new Dexie('dani-training-db')
    tempDb.version(3).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
    })
    await tempDb.open()
    await tempDb.table('workouts').add({
      id: 'workout-001',
      date: '2024-01-01',
      weekNumber: 1,
      sessionType: 'A',
      deload: false,
      userId: 'dani',
    })
    await tempDb.close()

    // Now open with v4 migration
    const { db } = await import('./client')
    await db.open()
    const workout = await db.workouts.get('workout-001')
    expect(workout).toBeDefined()
    expect(workout?.id).toBe('workout-001')
    await db.close()
  })

  it('existing exerciseLogs survive migration (zero data loss)', async () => {
    // Simulate pre-existing exerciseLogs at v3 schema
    const tempDb = new Dexie('dani-training-db')
    tempDb.version(3).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
    })
    await tempDb.open()
    await tempDb.table('exerciseLogs').add({
      id: 'log-001',
      workoutId: 'workout-001',
      exerciseId: 'squat',
      sets: [],
      date: '2024-01-01',
      weekNumber: 1,
      sessionType: 'A',
      userId: 'dani',
    })
    await tempDb.close()

    // Now open with v4 migration
    const { db } = await import('./client')
    await db.open()
    const log = await db.exerciseLogs.get('log-001')
    expect(log).toBeDefined()
    expect(log?.id).toBe('log-001')
    await db.close()
  })
})
