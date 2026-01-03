import Dexie, { type Table } from 'dexie'
import type { ExerciseLog, SettingsState, UserId, WorkoutLog } from '@/types'

type ActiveUserState = { activeUserId: UserId }
type SettingsRecord = {
  key: string
  value: SettingsState | ActiveUserState
}

class WorkoutDB extends Dexie {
  workouts!: Table<WorkoutLog>
  exerciseLogs!: Table<ExerciseLog>
  settings!: Table<SettingsRecord>

  constructor() {
    super('dani-training-db')
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
  }
}

export const db = new WorkoutDB()
