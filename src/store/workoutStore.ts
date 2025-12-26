import { create } from 'zustand'
import dayjs from 'dayjs'
import { z } from 'zod'
import { db } from '@/db/client'
import type { ExerciseLog, ExportBundle, SettingsState, SetEntry, WorkoutLog } from '@/types'

const defaultSettings: SettingsState = {
  recoveryExcellent: false,
  programStart: dayjs().startOf('week').add(1, 'day').toISOString(),
}

const setEntrySchema = z.object({
  weight: z.coerce.number().nonnegative(),
  reps: z.coerce.number().nonnegative(),
  rir: z.coerce.number().min(0).max(5),
  completed: z.coerce.boolean(),
})

const workoutSchema = z.object({
  id: z.string(),
  date: z.string(),
  weekNumber: z.number().min(1).max(12),
  sessionType: z.union([z.literal('A'), z.literal('B'), z.literal('C')]),
  deload: z.boolean(),
  notes: z.string().optional(),
})

const exerciseLogSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  exerciseId: z.string(),
  sets: z.array(setEntrySchema),
  notes: z.string().optional(),
  date: z.string(),
  weekNumber: z.number().min(1).max(12),
  sessionType: z.union([z.literal('A'), z.literal('B'), z.literal('C')]),
})

const settingsSchema = z.object({
  recoveryExcellent: z.boolean(),
  programStart: z.string(),
})

const importSchema = z.object({
  workouts: z.array(workoutSchema),
  exerciseLogs: z.array(exerciseLogSchema),
  settings: settingsSchema.optional(),
})

type WorkoutStore = {
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
  loading: boolean
  init: () => Promise<void>
  logSession: (payload: {
    workout: Omit<WorkoutLog, 'id'>
    exercises: Array<{ exerciseId: string; sets: SetEntry[]; notes?: string }>
  }) => Promise<string>
  saveSettings: (partial: Partial<SettingsState>) => Promise<void>
  exportData: () => Promise<ExportBundle>
  importData: (data: unknown) => Promise<void>
  reset: () => Promise<void>
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  exerciseLogs: [],
  settings: defaultSettings,
  loading: true,
  init: async () => {
    const [workouts, exerciseLogs, settings] = await Promise.all([
      db.workouts.toArray(),
      db.exerciseLogs.toArray(),
      db.settings.get('app'),
    ])
    const sortedWorkouts = workouts.sort((a, b) => (dayjs(b.date).valueOf() - dayjs(a.date).valueOf()))
    const sortedExerciseLogs = exerciseLogs.sort(
      (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
    )
    set({
      workouts: sortedWorkouts,
      exerciseLogs: sortedExerciseLogs,
      settings: settings?.value ?? defaultSettings,
      loading: false,
    })
  },
  logSession: async ({ workout, exercises }) => {
    const workoutId = makeId()
    const workoutEntry: WorkoutLog = { ...workout, id: workoutId }
    const exerciseEntries: ExerciseLog[] = exercises.map((ex, index) => ({
      id: `${workoutId}-${ex.exerciseId}-${index}`,
      workoutId,
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      notes: ex.notes,
      date: workout.date,
      weekNumber: workout.weekNumber,
      sessionType: workout.sessionType,
    }))

    await db.transaction('rw', db.workouts, db.exerciseLogs, async () => {
      await db.workouts.put(workoutEntry)
      await db.exerciseLogs.bulkPut(exerciseEntries)
    })

    set((state) => ({
      workouts: [workoutEntry, ...state.workouts],
      exerciseLogs: [...exerciseEntries, ...state.exerciseLogs],
    }))

    return workoutId
  },
  saveSettings: async (partial) => {
    const next = { ...get().settings, ...partial }
    await db.settings.put({ key: 'app', value: next })
    set({ settings: next })
  },
  exportData: async () => {
    const [workouts, exerciseLogs, settingsRecord] = await Promise.all([
      db.workouts.toArray(),
      db.exerciseLogs.toArray(),
      db.settings.get('app'),
    ])
    return {
      workouts,
      exerciseLogs,
      settings: settingsRecord?.value ?? get().settings,
    }
  },
  importData: async (data) => {
    const parsed = importSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error('Invalid data format')
    }
    const bundle = parsed.data
    await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, async () => {
      await Promise.all([db.workouts.clear(), db.exerciseLogs.clear(), db.settings.clear()])
      await db.workouts.bulkAdd(bundle.workouts)
      await db.exerciseLogs.bulkAdd(bundle.exerciseLogs)
      await db.settings.put({ key: 'app', value: bundle.settings ?? get().settings })
    })
    set({
      workouts: bundle.workouts,
      exerciseLogs: bundle.exerciseLogs,
      settings: bundle.settings ?? get().settings,
    })
  },
  reset: async () => {
    await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, async () => {
      await Promise.all([db.workouts.clear(), db.exerciseLogs.clear()])
    })
    set({ workouts: [], exerciseLogs: [] })
  },
}))
