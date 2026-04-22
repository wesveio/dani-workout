import { create } from 'zustand'
import Dexie from 'dexie'
import { z } from 'zod'
import { db } from '@/db/client'
import { pickColor } from '@/lib/profile-constants'
import type { ExerciseLog, ExportBundle, Profile, SettingsState, SetEntry, UserId, WorkoutLog, WorkoutTemplate } from '@/types'

const getCurrentMondayISO = () => {
  const date = new Date()
  const day = date.getDay()
  const diffToMonday = (day + 6) % 7
  date.setDate(date.getDate() - diffToMonday)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

const defaultSettings: SettingsState = {
  recoveryExcellent: false,
  programStart: getCurrentMondayISO(),
  defaultRestSeconds: 90,
  exerciseRestConfig: {},
}

const sortWorkouts = (workouts: WorkoutLog[]) =>
  workouts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))

const sortExerciseLogs = (logs: ExerciseLog[]) =>
  logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))

export const userIdSchema = z.string().min(1)
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
  defaultRestSeconds: z.number().min(10).max(600).optional(),
  exerciseRestConfig: z.record(z.string(), z.number().min(10).max(600)).optional(),
})

const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  shortName: z.string(),
  avatarInitial: z.string(),
  avatarColor: z.string(),
})

const templateSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    restSeconds: z.number().optional(),
    defaultSets: z.array(z.object({
      weight: z.number(),
      reps: z.number(),
      completed: z.boolean(),
    })),
  })),
  createdAt: z.string(),
})

const bodyMetricSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  date: z.string(),
  weight: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  chest: z.number().optional(),
  arms: z.number().optional(),
  notes: z.string().optional(),
})

const progressPhotoSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  date: z.string(),
  dataUrl: z.string().min(1),
  fileSizeBytes: z.number(),
})

export const importSchema = z.object({
  formatVersion: z.number().optional().default(1),
  userId: userIdSchema.optional(),
  workouts: z.array(workoutSchema),
  exerciseLogs: z.array(exerciseLogSchema),
  settings: settingsSchema.optional(),
  profiles: z.array(profileSchema).optional(),
  templates: z.array(templateSchema).optional(),
  bodyMetrics: z.array(bodyMetricSchema).optional(),
  progressPhotos: z.array(progressPhotoSchema).optional(),
})

type WorkoutStore = {
  workouts: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  templates: WorkoutTemplate[]
  settings: SettingsState
  activeUserId: UserId
  loading: boolean
  error: string | null
  init: () => Promise<void>
  switchUser: (userId: UserId) => Promise<void>
  createProfile: (name: string) => Promise<void>
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatarColor'>>) => Promise<void>
  deleteProfile: (userId: UserId) => Promise<void>
  logSession: (payload: {
    workout: Omit<WorkoutLog, 'id' | 'userId'>
    exercises: Array<{ exerciseId: string; sets: SetEntry[]; notes?: string }>
  }) => Promise<string>
  saveSettings: (partial: Partial<SettingsState>) => Promise<void>
  setExerciseRestSeconds: (exerciseId: string, seconds: number) => Promise<void>
  exportData: () => Promise<ExportBundle>
  importData: (data: unknown) => Promise<void>
  reset: () => Promise<void>
  saveTemplate: (payload: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => Promise<string>
  deleteTemplate: (id: string) => Promise<void>
  updateTemplate: (id: string, patch: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>) => Promise<void>
  duplicateTemplate: (id: string) => Promise<string>
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => {
  const getUserWorkouts = (userId: UserId) =>
    db.workouts
      .where('[userId+date]')
      .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
      .reverse()
      .toArray()

  const getUserExerciseLogs = (userId: UserId) =>
    db.exerciseLogs
      .where('[userId+date]')
      .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
      .reverse()
      .toArray()

  const getUserTemplates = (userId: UserId) =>
    db.templates
      .where('userId')
      .equals(userId)
      .toArray()

  const loadUserData = async (userId: UserId) => {
    const [workouts, exerciseLogs, settingsRecord, templates] = await Promise.all([
      getUserWorkouts(userId),
      getUserExerciseLogs(userId),
      db.settings.get(`user:${userId}`),
      getUserTemplates(userId),
    ])
    const settings = (settingsRecord?.value as SettingsState | undefined) ?? defaultSettings
    if (!settingsRecord) {
      await db.settings.put({ key: `user:${userId}`, value: settings })
    }
    return {
      workouts: sortWorkouts(workouts),
      exerciseLogs: sortExerciseLogs(exerciseLogs),
      settings,
      templates,
    }
  }

  return {
    workouts: [],
    exerciseLogs: [],
    templates: [],
    settings: defaultSettings,
    activeUserId: 'dani',
    loading: true,
    error: null,
    init: async () => {
      try {
        const appSettings = await db.settings.get('app')
        const profiles = await db.profiles.toArray()
        const fallbackId = profiles[0]?.id ?? 'dani'
        const activeUserId =
          (appSettings?.value as { activeUserId?: UserId } | undefined)?.activeUserId ?? fallbackId
        const data = await loadUserData(activeUserId)
        await db.settings.put({ key: 'app', value: { activeUserId } })
        set({ ...data, activeUserId, loading: false, error: null })
      } catch (err) {
        console.error(err)
        set({
          workouts: [],
          exerciseLogs: [],
          settings: defaultSettings,
          activeUserId: 'dani',
          loading: false,
          error: 'Falha ao carregar dados locais. Reinicie ou limpe o cache.',
        })
      }
    },
    switchUser: async (userId) => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/session')) {
        set({ error: 'Finalize ou descarte o treino antes de trocar de perfil' })
        return
      }
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
    createProfile: async (name) => {
      const trimmed = name.trim()
      if (!trimmed || trimmed.length > 50) return
      try {
        const profiles = await db.profiles.toArray()
        const profile: Profile = {
          id: makeId(),
          name: trimmed,
          shortName: trimmed.split(' ')[0],
          avatarInitial: trimmed.charAt(0).toUpperCase(),
          avatarColor: pickColor(profiles.length),
        }
        await db.profiles.put(profile)
        await get().switchUser(profile.id)
      } catch (err) {
        console.error(err)
        set({ error: 'Não foi possível criar o perfil.' })
      }
    },
    updateProfile: async (id, patch) => {
      try {
        const existing = await db.profiles.get(id)
        if (!existing) return
        const updated: Profile = { ...existing, ...patch }
        if (patch.name) {
          const trimmed = patch.name.trim()
          updated.name = trimmed
          updated.shortName = trimmed.split(' ')[0]
          updated.avatarInitial = trimmed.charAt(0).toUpperCase()
        }
        await db.profiles.put(updated)
      } catch (err) {
        console.error(err)
        set({ error: 'Não foi possível atualizar o perfil.' })
      }
    },
    deleteProfile: async (userId) => {
      try {
        const profiles = await db.profiles.toArray()
        if (profiles.length <= 1) return
        await db.transaction('rw', db.profiles, db.workouts, db.exerciseLogs, db.settings, db.bodyMetrics, db.templates, db.progressPhotos, async () => {
          await db.profiles.delete(userId)
          await db.workouts.where('userId').equals(userId).delete()
          await db.exerciseLogs.where('userId').equals(userId).delete()
          await db.bodyMetrics.where('userId').equals(userId).delete()
          await db.progressPhotos.where('userId').equals(userId).delete()
          await db.templates.where('userId').equals(userId).delete()
          await db.settings.delete(`user:${userId}`)
        })
        if (userId === get().activeUserId) {
          const remaining = await db.profiles.toArray()
          if (remaining.length > 0) {
            await get().switchUser(remaining[0].id)
          }
        }
      } catch (err) {
        console.error(err)
        set({ error: 'Não foi possível remover o perfil.' })
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
    setExerciseRestSeconds: async (exerciseId, seconds) => {
      const { settings, activeUserId } = get()
      const nextConfig = { ...settings.exerciseRestConfig, [exerciseId]: seconds }
      const next = { ...settings, exerciseRestConfig: nextConfig }
      await db.settings.put({ key: `user:${activeUserId}`, value: next })
      set({ settings: next })
    },
    exportData: async () => {
      const activeUserId = get().activeUserId
      const [workouts, exerciseLogs, settingsRecord, profiles, templates, bodyMetrics, progressPhotos] = await Promise.all([
        getUserWorkouts(activeUserId),
        getUserExerciseLogs(activeUserId),
        db.settings.get(`user:${activeUserId}`),
        db.profiles.where('id').equals(activeUserId).toArray(),
        db.templates.where('userId').equals(activeUserId).toArray(),
        db.bodyMetrics.where('userId').equals(activeUserId).toArray(),
        db.progressPhotos.where('userId').equals(activeUserId).toArray(),
      ])
      return {
        formatVersion: 3,
        userId: activeUserId,
        workouts,
        exerciseLogs,
        settings: (settingsRecord?.value as SettingsState | undefined) ?? get().settings,
        profiles,
        templates,
        bodyMetrics,
        progressPhotos,
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
      const settings: SettingsState = {
        ...defaultSettings,
        ...((existingSettings?.value as SettingsState | undefined) ?? {}),
        ...(bundle.settings ?? {}),
      }
      await db.transaction('rw', db.workouts, db.exerciseLogs, db.settings, db.profiles, db.templates, db.bodyMetrics, db.progressPhotos, async () => {
        await db.workouts.where('userId').equals(targetUserId).delete()
        await db.exerciseLogs.where('userId').equals(targetUserId).delete()
        await db.workouts.bulkAdd(workouts)
        await db.exerciseLogs.bulkAdd(exerciseLogs)
        await db.settings.put({ key: `user:${targetUserId}`, value: settings })
        await db.settings.put({ key: 'app', value: { activeUserId: targetUserId } })
        if (bundle.profiles?.length) {
          await db.profiles.bulkPut(bundle.profiles)
        }
        if (bundle.templates?.length) {
          await db.templates.bulkPut(bundle.templates)
        }
        if (bundle.bodyMetrics?.length) {
          await db.bodyMetrics.bulkPut(bundle.bodyMetrics)
        }
        if (bundle.progressPhotos?.length) {
          await db.progressPhotos.bulkPut(bundle.progressPhotos)
        }
      })
      set({
        workouts,
        exerciseLogs,
        settings,
        activeUserId: targetUserId,
      })
    },
    saveTemplate: async ({ userId, name, exercises }) => {
      const id = makeId()
      const template: WorkoutTemplate = { id, userId, name, exercises, createdAt: new Date().toISOString() }
      await db.templates.put(template)
      set((state) => ({ templates: [template, ...state.templates] }))
      return id
    },
    deleteTemplate: async (id) => {
      try {
        await db.templates.delete(id)
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
      } catch (err) {
        console.error(err)
        set({ error: 'Nao foi possivel remover o template.' })
      }
    },
    updateTemplate: async (id, patch) => {
      try {
        const existing = get().templates.find((t) => t.id === id)
        if (!existing) return
        const updated = { ...existing, ...patch }
        await db.templates.put(updated)
        set((state) => ({ templates: state.templates.map((t) => t.id === id ? updated : t) }))
      } catch (err) {
        console.error(err)
        set({ error: 'Nao foi possivel atualizar o template.' })
      }
    },
    duplicateTemplate: async (id) => {
      const original = get().templates.find((t) => t.id === id)
      if (!original) return ''
      return get().saveTemplate({
        userId: original.userId,
        name: `${original.name} (copia)`,
        exercises: original.exercises,
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
