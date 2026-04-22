import { create } from 'zustand'
import Dexie from 'dexie'
import { db } from '@/db/client'
import type { BodyMetric, ProgressPhoto } from '@/types'

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

const getUserMetrics = (userId: string) =>
  db.bodyMetrics
    .where('[userId+date]')
    .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
    .reverse()
    .toArray()

const getUserPhotos = (userId: string) =>
  db.progressPhotos
    .where('[userId+date]')
    .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
    .reverse()
    .toArray()

type BodyMetricsStore = {
  entries: BodyMetric[]
  photos: ProgressPhoto[]
  activeUserId: string
  loading: boolean
  error: string | null
  loadForUser: (userId: string) => Promise<void>
  addEntry: (entry: Omit<BodyMetric, 'id'>) => Promise<void>
  updateEntry: (id: string, patch: Partial<BodyMetric>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  addPhoto: (photo: Omit<ProgressPhoto, 'id'>) => Promise<void>
  deletePhoto: (id: string) => Promise<void>
}

export const useBodyMetricsStore = create<BodyMetricsStore>((set, get) => ({
  entries: [],
  photos: [],
  activeUserId: '',
  loading: false,
  error: null,

  loadForUser: async (userId) => {
    set({ loading: true, activeUserId: userId })
    try {
      const [entries, photos] = await Promise.all([
        getUserMetrics(userId),
        getUserPhotos(userId),
      ])
      set({ entries, photos, loading: false, error: null })
    } catch (err) {
      console.error(err)
      set({ loading: false, error: 'Falha ao carregar dados locais. Reinicie ou limpe o cache.' })
    }
  },

  addEntry: async (entry) => {
    const full: BodyMetric = { ...entry, id: makeId() }
    try {
      await db.bodyMetrics.add(full)
      const entries = await getUserMetrics(get().activeUserId)
      set({ entries, error: null })
    } catch (err) {
      console.error(err)
      set({ error: 'Nao foi possivel salvar. Tente novamente.' })
    }
  },

  updateEntry: async (id, patch) => {
    try {
      await db.bodyMetrics.update(id, patch)
      const entries = await getUserMetrics(get().activeUserId)
      set({ entries, error: null })
    } catch (err) {
      console.error(err)
      set({ error: 'Nao foi possivel salvar. Tente novamente.' })
    }
  },

  deleteEntry: async (id) => {
    try {
      await db.bodyMetrics.delete(id)
      const entries = await getUserMetrics(get().activeUserId)
      set({ entries, error: null })
    } catch (err) {
      console.error(err)
      set({ error: 'Nao foi possivel salvar. Tente novamente.' })
    }
  },

  addPhoto: async (photo) => {
    const full: ProgressPhoto = { ...photo, id: makeId() }
    try {
      await db.progressPhotos.add(full)
      const photos = await getUserPhotos(get().activeUserId)
      set({ photos, error: null })
    } catch (err) {
      console.error(err)
      if ((err as Error).name === 'QuotaExceededError') {
        set({ error: 'Armazenamento cheio. Exclua algumas fotos para continuar.' })
      } else {
        set({ error: 'Nao foi possivel salvar. Tente novamente.' })
      }
    }
  },

  deletePhoto: async (id) => {
    try {
      await db.progressPhotos.delete(id)
      const photos = await getUserPhotos(get().activeUserId)
      set({ photos, error: null })
    } catch (err) {
      console.error(err)
      set({ error: 'Nao foi possivel salvar. Tente novamente.' })
    }
  },
}))
