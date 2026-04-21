export type UserId = string
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
  defaultRestSeconds: number
  exerciseRestConfig: Record<string, number>  // exerciseId -> seconds
}

export type Profile = {
  id: string
  name: string
  shortName: string
  avatarInitial: string
  avatarColor: string
}

export type WorkoutTemplate = {
  id: string
  userId: string
  name: string
  exercises: Array<{ exerciseId: string; defaultSets: SetEntry[] }>
  createdAt: string
}

export type BodyMetric = {
  id: string
  userId: string
  date: string
  weight?: number
  waist?: number
  hips?: number
  chest?: number
  arms?: number
  notes?: string
}

export type ExportBundle = {
  userId: UserId
  formatVersion: number
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
  profiles?: Profile[]
  templates?: WorkoutTemplate[]
  bodyMetrics?: BodyMetric[]
}
