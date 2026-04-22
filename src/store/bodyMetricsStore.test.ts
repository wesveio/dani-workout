import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'

async function makeStore() {
  const indexedDB = new IDBFactory()
  const { WorkoutDB } = await import('@/db/client')
  const fakeDb = new WorkoutDB({ indexedDB, IDBKeyRange })
  await fakeDb.open()
  vi.doMock('@/db/client', () => ({ WorkoutDB, db: fakeDb }))
  vi.resetModules()
  const { useBodyMetricsStore } = await import('./bodyMetricsStore')
  return { store: useBodyMetricsStore.getState(), useBodyMetricsStore, fakeDb }
}

describe('bodyMetricsStore - loadForUser', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('populates entries array with BodyMetric records for that userId only', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()

    await fakeDb.bodyMetrics.bulkAdd([
      { id: 'bm-1', userId: 'dani', date: '2026-01-01', weight: 60 },
      { id: 'bm-2', userId: 'dani', date: '2026-01-02', weight: 61 },
      { id: 'bm-3', userId: 'other', date: '2026-01-01', weight: 70 },
    ])

    await store.loadForUser('dani')
    const { entries } = useBodyMetricsStore.getState()
    expect(entries).toHaveLength(2)
    expect(entries.every((e) => e.userId === 'dani')).toBe(true)
  })

  it('populates photos array with ProgressPhoto records for that userId only', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()

    await fakeDb.progressPhotos.bulkAdd([
      { id: 'ph-1', userId: 'dani', date: '2026-01-01', dataUrl: 'data:image/jpeg;base64,abc', fileSizeBytes: 10000 },
      { id: 'ph-2', userId: 'other', date: '2026-01-01', dataUrl: 'data:image/jpeg;base64,xyz', fileSizeBytes: 5000 },
    ])

    await store.loadForUser('dani')
    const { photos } = useBodyMetricsStore.getState()
    expect(photos).toHaveLength(1)
    expect(photos[0].userId).toBe('dani')
  })
})

describe('bodyMetricsStore - addEntry', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates a BodyMetric in Dexie and appends to entries state', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().addEntry({ userId: 'dani', date: '2026-01-01', weight: 65 })

    const all = await fakeDb.bodyMetrics.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].weight).toBe(65)

    const { entries } = useBodyMetricsStore.getState()
    expect(entries).toHaveLength(1)
  })

  it('generates a unique id', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().addEntry({ userId: 'dani', date: '2026-01-01', weight: 65 })
    await useBodyMetricsStore.getState().addEntry({ userId: 'dani', date: '2026-01-02', weight: 66 })

    const all = await fakeDb.bodyMetrics.toArray()
    expect(all[0].id).toBeTruthy()
    expect(all[1].id).toBeTruthy()
    expect(all[0].id).not.toBe(all[1].id)
  })
})

describe('bodyMetricsStore - updateEntry', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('patches a BodyMetric by id in Dexie and updates entries state', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await fakeDb.bodyMetrics.add({ id: 'bm-1', userId: 'dani', date: '2026-01-01', weight: 60 })
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().updateEntry('bm-1', { weight: 65 })

    const updated = await fakeDb.bodyMetrics.get('bm-1')
    expect(updated?.weight).toBe(65)

    const { entries } = useBodyMetricsStore.getState()
    expect(entries.find((e) => e.id === 'bm-1')?.weight).toBe(65)
  })
})

describe('bodyMetricsStore - deleteEntry', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('removes a BodyMetric by id from Dexie and entries state', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await fakeDb.bodyMetrics.add({ id: 'bm-1', userId: 'dani', date: '2026-01-01', weight: 60 })
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().deleteEntry('bm-1')

    const remaining = await fakeDb.bodyMetrics.toArray()
    expect(remaining).toHaveLength(0)

    const { entries } = useBodyMetricsStore.getState()
    expect(entries).toHaveLength(0)
  })
})

describe('bodyMetricsStore - addPhoto', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates a ProgressPhoto in Dexie and appends to photos state', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().addPhoto({ userId: 'dani', date: '2026-01-01', dataUrl: 'data:image/jpeg;base64,abc', fileSizeBytes: 10000 })

    const all = await fakeDb.progressPhotos.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].dataUrl).toBe('data:image/jpeg;base64,abc')

    const { photos } = useBodyMetricsStore.getState()
    expect(photos).toHaveLength(1)
  })
})

describe('bodyMetricsStore - deletePhoto', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('removes a ProgressPhoto by id from Dexie and photos state', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await fakeDb.progressPhotos.add({ id: 'ph-1', userId: 'dani', date: '2026-01-01', dataUrl: 'data:image/jpeg;base64,abc', fileSizeBytes: 10000 })
    await store.loadForUser('dani')

    await useBodyMetricsStore.getState().deletePhoto('ph-1')

    const remaining = await fakeDb.progressPhotos.toArray()
    expect(remaining).toHaveLength(0)

    const { photos } = useBodyMetricsStore.getState()
    expect(photos).toHaveLength(0)
  })
})

describe('bodyMetricsStore - error handling', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('sets error state on Dexie failure', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()
    await store.loadForUser('dani')

    vi.spyOn(fakeDb.bodyMetrics, 'add').mockRejectedValueOnce(new Error('Dexie error'))

    await useBodyMetricsStore.getState().addEntry({ userId: 'dani', date: '2026-01-01', weight: 65 })

    const { error } = useBodyMetricsStore.getState()
    expect(error).toBeTruthy()
  })
})

describe('bodyMetricsStore - sort order', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('entries are sorted by date descending (newest first)', async () => {
    const { store, useBodyMetricsStore, fakeDb } = await makeStore()

    await fakeDb.bodyMetrics.bulkAdd([
      { id: 'bm-1', userId: 'dani', date: '2026-01-01', weight: 60 },
      { id: 'bm-2', userId: 'dani', date: '2026-01-03', weight: 62 },
      { id: 'bm-3', userId: 'dani', date: '2026-01-02', weight: 61 },
    ])

    await store.loadForUser('dani')
    const { entries } = useBodyMetricsStore.getState()

    expect(entries[0].date).toBe('2026-01-03')
    expect(entries[1].date).toBe('2026-01-02')
    expect(entries[2].date).toBe('2026-01-01')
  })
})
