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
}

export type SettingsState = {
  recoveryExcellent: boolean
  programStart: string
}

export type ExportBundle = {
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
}
