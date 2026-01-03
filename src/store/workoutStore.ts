import { create } from 'zustand'
import dayjs from 'dayjs'
import { z } from 'zod'
import { db } from '@/db/client'
import { defaultUserId } from '@/data/users'
import type { ExerciseLog, ExportBundle, SettingsState, SetEntry, UserId, WorkoutLog } from '@/types'

const defaultSettings: SettingsState = {
  recoveryExcellent: false,
  programStart: dayjs().startOf('week').add(1, 'day').toISOString(),
}

const sortWorkouts = (workouts: WorkoutLog[]) =>
  workouts
    .slice()
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())

const sortExerciseLogs = (logs: ExerciseLog[]) =>
  logs
    .slice()
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())

const userIdSchema = z.union([z.literal('dani'), z.literal('wesley')])
const setEntrySchema = z.object({
  weight: z.coerce.number().nonnegative(),
  reps: z.coerce.number().nonnegative(),
  rir: z.coerce.number().min(0).max(5),
  completed: z.coerce.boolean(),
})

const workoutSchema = z.object({
  id: z.string(),
  date: z.string(),
  weekNumber: z.number().min(1).max(20),
  sessionType: z.union([z.literal('A'), z.literal('B'), z.literal('C')]),
  deload: z.boolean(),
  notes: z.string().optional(),
  userId: userIdSchema.optional(),
})

const exerciseLogSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  exerciseId: z.string(),
  sets: z.array(setEntrySchema),
  notes: z.string().optional(),
  date: z.string(),
  weekNumber: z.number().min(1).max(20),
  sessionType: z.union([z.literal('A'), z.literal('B'), z.literal('C')]),
  userId: userIdSchema.optional(),
})

const settingsSchema = z.object({
  recoveryExcellent: z.boolean(),
  programStart: z.string(),
})

const importSchema = z.object({
  userId: userIdSchema.optional(),
  workouts: z.array(workoutSchema),
  exerciseLogs: z.array(exerciseLogSchema),
  settings: settingsSchema.optional(),
})

type WorkoutStore = {
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  settings: SettingsState
  activeUserId: UserId
  loading: boolean
  error: string | null
  init: () => Promise<void>
  switchUser: (userId: UserId) => Promise<void>
  logSession: (payload: {
    workout: Omit<WorkoutLog, 'id' | 'userId'>
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

export const useWorkoutStore = create<WorkoutStore>((set, get) => {
  const loadUserData = async (userId: UserId) => {
    const [workouts, exerciseLogs, settingsRecord] = await Promise.all([
      db.workouts.where('userId').equals(userId).toArray(),
      db.exerciseLogs.where('userId').equals(userId).toArray(),
      db.settings.get(`user:${userId}`),
    ])
    const settings = (settingsRecord?.value as SettingsState | undefined) ?? defaultSettings
    if (!settingsRecord) {
      await db.settings.put({ key: `user:${userId}`, value: settings })
    }
    return {
      workouts: sortWorkouts(workouts),
      exerciseLogs: sortExerciseLogs(exerciseLogs),
      settings,
    }
  }

  return {
    workouts: [],
    exerciseLogs: [],
    settings: defaultSettings,
    activeUserId: defaultUserId,
    loading: true,
    error: null,
    init: async () => {
      try {
        const appSettings = await db.settings.get('app')
        const activeUserId =
          (appSettings?.value as { activeUserId?: UserId } | undefined)?.activeUserId ?? defaultUserId
        const data = await loadUserData(activeUserId)
        await db.settings.put({ key: 'app', value: { activeUserId } })
        set({ ...data, activeUserId, loading: false, error: null })
      } catch (err) {
        console.error(err)
        set({
          workouts: [],
          exerciseLogs: [],
          settings: defaultSettings,
          activeUserId: defaultUserId,
          loading: false,
          error: 'Falha ao carregar dados locais. Reinicie ou limpe o cache.',
        })
      }
    },
    switchUser: async (userId) => {
      set({ loading: true })
      try {
        const data = await loadUserData(userId)
        await db.settings.put({ key: 'app', value: { activeUserId: userId } })
        set({ ...data, activeUserId: userId, loading: false, error: null })
      } catch (err) {
        console.error(err)
        set({ loading: false, error: 'Não foi possível trocar de usuário agora.' })
      }
    },
    logSession: async ({ workout, exercises }) => {
      const workoutId = makeId()
      const userId = get().activeUserId
      const workoutEntry: WorkoutLog = { ...workout, id: workoutId, userId }
      const exerciseEntries: ExerciseLog[] = exercises.map((ex, index) => ({
        id: `${workoutId}-${ex.exerciseId}-${index}`,
        workoutId,
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        notes: ex.notes,
        date: workout.date,
        weekNumber: workout.weekNumber,
        sessionType: workout.sessionType,
        userId,
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
      const activeUserId = get().activeUserId
      const next = { ...get().settings, ...partial }
      await db.settings.put({ key: `user:${activeUserId}`, value: next })
      await db.settings.put({ key: 'app', value: { activeUserId } })
      set({ settings: next })
    },
    exportData: async () => {
      const activeUserId = get().activeUserId
      const [workouts, exerciseLogs, settingsRecord] = await Promise.all([
        db.workouts.where('userId').equals(activeUserId).toArray(),
        db.exerciseLogs.where('userId').equals(activeUserId).toArray(),
        db.settings.get(`user:${activeUserId}`),
      ])
      return {
        userId: activeUserId,
        workouts,
        exerciseLogs,
        settings: (settingsRecord?.value as SettingsState | undefined) ?? get().settings,
      }
    },
    importData: async (data) => {
      const parsed = importSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error('Invalid data format')
      }
      const bundle = parsed.data
      const targetUserId = bundle.userId ?? get().activeUserId
      const existingSettings = await db.settings.get(`user:${targetUserId}`)
      const workouts = sortWorkouts(
        bundle.workouts.map((w) => ({ ...w, userId: w.userId ?? targetUserId })),
      )
      const exerciseLogs = sortExerciseLogs(
        bundle.exerciseLogs.map((ex) => ({ ...ex, userId: ex.userId ?? targetUserId })),
      )
      const settings =
        bundle.settings ??
        ((existingSettings?.value as SettingsState | undefined) ?? defaultSettings)
      await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, async () => {
        await db.workouts.where('userId').equals(targetUserId).delete()
        await db.exerciseLogs.where('userId').equals(targetUserId).delete()
        await db.workouts.bulkAdd(workouts)
        await db.exerciseLogs.bulkAdd(exerciseLogs)
        await db.settings.put({ key: `user:${targetUserId}`, value: settings })
        await db.settings.put({ key: 'app', value: { activeUserId: targetUserId } })
      })
      set({
        workouts,
        exerciseLogs,
        settings,
        activeUserId: targetUserId,
      })
    },
    reset: async () => {
      const activeUserId = get().activeUserId
      await db.transaction('rw', db.workouts, db.exerciseLogs, async () => {
        await db.workouts.where('userId').equals(activeUserId).delete()
        await db.exerciseLogs.where('userId').equals(activeUserId).delete()
      })
      set({ workouts: [], exerciseLogs: [] })
    },
  }
})
