export type UserId = 'dani' | 'wesley'
export type SessionType = 'A' | 'B' | 'C'

export type SetEntry = {
  weight: number
  reps: number
  rir: number
  completed: boolean
}

export type WorkoutLog = {
  id: string
  date: string
  weekNumber: number
  sessionType: SessionType
  deload: boolean
  notes?: string
  userId: UserId
}

export type ExerciseLog = {
  id: string
  workoutId: string
  exerciseId: string
  sets: SetEntry[]
  notes?: string
  date: string
  weekNumber: number
  sessionType: SessionType
  userId: UserId
}

export type SettingsState = {
  recoveryExcellent: boolean
  programStart: string
}

export type ExportBundle = {
  userId: UserId
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
}
