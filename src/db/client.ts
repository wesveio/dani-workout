import Dexie, { type Table } from 'dexie'
import type { ExerciseLog, SettingsState, WorkoutLog } from '@/types'

type SettingsRecord = {
  key: 'app'
  value: SettingsState
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
  }
}

export const db = new WorkoutDB()
