import Dexie, { type Table } from 'dexie'
import type { BodyMetric, ExerciseLog, Profile, ProgressPhoto, SettingsState, UserId, WorkoutLog, WorkoutTemplate } from '@/types'

type ActiveUserState = { activeUserId: UserId }
type SettingsRecord = {
  key: string
  value: SettingsState | ActiveUserState
}

export class WorkoutDB extends Dexie {
  workouts!: Table<WorkoutLog>
  exerciseLogs!: Table<ExerciseLog>
  settings!: Table<SettingsRecord>
  profiles!: Table<Profile>
  templates!: Table<WorkoutTemplate>
  bodyMetrics!: Table<BodyMetric>
  progressPhotos!: Table<ProgressPhoto>

  constructor(options?: ConstructorParameters<typeof Dexie>[1]) {
    super('dani-training-db', options)
    this.version(1).stores({
      workouts: 'id, date, weekNumber, sessionType',
      exerciseLogs: 'id, exerciseId, workoutId, date, sessionType, weekNumber',
      settings: '&key',
    })
    this.version(2)
      .stores({
        workouts: 'id, userId, date, weekNumber, sessionType',
        exerciseLogs: 'id, userId, exerciseId, workoutId, date, sessionType, weekNumber',
        settings: '&key',
      })
      .upgrade(async (tx) => {
        await tx.table('workouts').toCollection().modify((item) => {
          if (!('userId' in item)) {
            (item as WorkoutLog).userId = 'dani'
          }
        })
        await tx.table('exerciseLogs').toCollection().modify((item) => {
          if (!('userId' in item)) {
            (item as ExerciseLog).userId = 'dani'
          }
        })
        const settingsTable = tx.table<SettingsRecord>('settings')
        const legacy = await settingsTable.get('app')
        if (legacy && !('activeUserId' in (legacy.value as ActiveUserState))) {
          await settingsTable.put({ key: 'user:dani', value: legacy.value as SettingsState })
          await settingsTable.put({ key: 'app', value: { activeUserId: 'dani' } satisfies ActiveUserState })
        }
      })
    this.version(3).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
    })
    this.version(4)
      .stores({
        workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
        exerciseLogs:
          'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
        settings: '&key',
        profiles: '&id, name',
        templates: '&id, userId, [userId+name]',
        bodyMetrics: '&id, userId, [userId+date], date',
      })
      .upgrade(async (tx) => {
        // Seed profiles for existing users upgrading from v3
        await tx.table('profiles').bulkPut([
          { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', avatarColor: '#e11d48' },
          { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', avatarColor: '#2563eb' },
        ])
      })

    this.version(5).stores({
      workouts: 'id, userId, [userId+date], date, weekNumber, sessionType',
      exerciseLogs:
        'id, userId, exerciseId, workoutId, [userId+date], [userId+exerciseId], [userId+exerciseId+date], date, sessionType, weekNumber',
      settings: '&key',
      profiles: '&id, name',
      templates: '&id, userId, [userId+name]',
      bodyMetrics: '&id, userId, [userId+date], date',
      progressPhotos: '&id, userId, [userId+date], date',
    })

    // Seed profiles on fresh DB creation (upgrade() does not run on initial create)
    this.on('populate', async (tx) => {
      await tx.table('profiles').bulkPut([
        { id: 'dani', name: 'Daniela Sotilo', shortName: 'Dani', avatarInitial: 'D', avatarColor: '#e11d48' },
        { id: 'wesley', name: 'Wesley', shortName: 'Wesley', avatarInitial: 'W', avatarColor: '#2563eb' },
      ])
    })
  }
}

export const db = new WorkoutDB()
