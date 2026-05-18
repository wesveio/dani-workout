import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import { getWeekStates, getRecentPr, getNextSession, getStreak, getWeekTonnage, getLastWorkoutSummary } from './program'
import type { ExerciseLog } from '@/types'
import { treinoDani } from '@/data/treinoDani'

describe('getWeekStates', () => {
  const monday = '2024-01-01' // a Monday

  it('returns 7 "none" states with no logs and no scheduled days', () => {
    const states = getWeekStates([], monday, [])
    expect(states).toHaveLength(7)
    expect(states.every((s) => s === 'none')).toBe(true)
  })

  it('marks a day "done" when a log exists for that date', () => {
    const states = getWeekStates([{ date: '2024-01-01' }], monday, [])
    expect(states[0]).toBe('done')
  })

  it('marks "done" for correct day index', () => {
    // 2024-01-03 is Wednesday = index 2
    const states = getWeekStates([{ date: '2024-01-03' }], monday, [2])
    expect(states[2]).toBe('done')
    expect(states[0]).toBe('none')
  })

  it('marks a scheduled past day "miss" when no log', () => {
    // Use a week far in the past so all days are before today
    const pastMonday = '2023-01-02'
    const states = getWeekStates([], pastMonday, [0, 2, 4]) // Mon, Wed, Fri
    expect(states[0]).toBe('miss')
    expect(states[2]).toBe('miss')
    expect(states[4]).toBe('miss')
    expect(states[1]).toBe('none')
    expect(states[3]).toBe('none')
    expect(states[6]).toBe('none')
  })

  it('does not mark future scheduled day as miss', () => {
    // Use a week far in the future so all days are after today
    const futureMonday = '2099-01-05'
    const states = getWeekStates([], futureMonday, [0])
    expect(states[0]).toBe('none')
  })

  it('prefers "done" over "miss" when log exists on scheduled day', () => {
    const pastMonday = '2023-01-02'
    const states = getWeekStates([{ date: '2023-01-02' }], pastMonday, [0])
    expect(states[0]).toBe('done')
  })
})

describe('getRecentPr', () => {
  const makelog = (
    exerciseId: string,
    date: string,
    weight: number,
    reps: number,
  ): ExerciseLog => ({
    id: `${exerciseId}-${date}`,
    workoutId: 'w1',
    exerciseId,
    date,
    weekNumber: 1,
    sessionType: 'A',
    userId: 'user1',
    sets: [{ weight, reps, rir: 2, completed: true }],
  })

  it('returns null for empty logs', () => {
    expect(getRecentPr([], () => undefined)).toBeNull()
  })

  it('returns null if all sets are not completed', () => {
    const log: ExerciseLog = {
      id: 'l1',
      workoutId: 'w1',
      exerciseId: 'squat',
      date: '2024-01-01',
      weekNumber: 1,
      sessionType: 'A',
      userId: 'u1',
      sets: [{ weight: 100, reps: 5, rir: 2, completed: false }],
    }
    expect(getRecentPr([log], () => 'Squat')).toBeNull()
  })

  it('returns the exercise with highest weight', () => {
    const logs = [
      makelog('squat', '2024-01-01', 80, 5),
      makelog('bench', '2024-01-02', 100, 5),
    ]
    const pr = getRecentPr(logs, (id) => id)
    expect(pr?.exerciseId).toBe('bench')
    expect(pr?.weight).toBe(100)
  })

  it('builds weeklyMaxes array', () => {
    const logs = [
      makelog('squat', '2024-01-01', 80, 5), // week 2023-12-31
      makelog('squat', '2024-01-08', 90, 5), // next week
    ]
    const pr = getRecentPr(logs, () => 'Squat')
    expect(pr?.weeklyMaxes).toHaveLength(2)
    expect(pr?.weeklyMaxes[1]).toBe(90)
  })

  it('uses findName to resolve exercise name', () => {
    const logs = [makelog('hip-thrust', '2024-01-01', 70, 8)]
    const pr = getRecentPr(logs, (id) => (id === 'hip-thrust' ? 'Hip Thrust' : undefined))
    expect(pr?.exerciseName).toBe('Hip Thrust')
  })
})

describe('getNextSession', () => {
  it('returns the next scheduled session after today even if today is a training day', () => {
    // 2026-05-17 is a Sunday — pick a known Monday for determinism
    const monday = dayjs('2026-05-18')
    const result = getNextSession(monday, treinoDani.schedule)
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.sessionId).toBeDefined()
    expect(result.dayLabel).toBeTruthy()
    expect(result.daysAhead).toBeGreaterThan(0)
  })

  it('handles rest day by returning the very next training day', () => {
    // Find a rest day in the schedule
    const restDay = dayjs('2026-05-17') // Sunday — typically rest
    const result = getNextSession(restDay, treinoDani.schedule)
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.daysAhead).toBeGreaterThanOrEqual(1)
  })

  it('returns null for empty schedule', () => {
    expect(getNextSession(dayjs('2026-05-18'), [])).toBeNull()
  })
})

describe('getStreak', () => {
  const mk = (date: string) => ({ date })

  it('returns 0 when no workouts', () => {
    expect(getStreak([], dayjs('2026-05-17'))).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const today = dayjs('2026-05-17')
    const logs = [
      mk('2026-05-17'),
      mk('2026-05-16'),
      mk('2026-05-15'),
    ]
    expect(getStreak(logs, today)).toBe(3)
  })

  it('does not break when today is missing but yesterday is present', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-16'), mk('2026-05-15')]
    expect(getStreak(logs, today)).toBe(2)
  })

  it('breaks when yesterday is also missing', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-15'), mk('2026-05-14')]
    expect(getStreak(logs, today)).toBe(0)
  })

  it('deduplicates multiple workouts on the same day', () => {
    const today = dayjs('2026-05-17')
    const logs = [mk('2026-05-17'), mk('2026-05-17'), mk('2026-05-16')]
    expect(getStreak(logs, today)).toBe(2)
  })
})

describe('getWeekTonnage', () => {
  const baseSet = { weight: 40, reps: 10, rir: 2, completed: true }
  const mk = (date: string, sets = [baseSet]) => ({
    date,
    sets,
    completed: true,
  })

  it('returns zeros when no logs', () => {
    expect(getWeekTonnage([], '2026-05-11')).toEqual({
      current: 0,
      previous: 0,
      delta: 0,
      deltaPct: null,
    })
  })

  it('sums weight*reps for completed sets in current week', () => {
    const logs = [
      mk('2026-05-11'), // Monday current
      mk('2026-05-13', [baseSet, baseSet]),
    ]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.current).toBe(40 * 10 + 40 * 10 * 2)
    expect(result.previous).toBe(0)
  })

  it('ignores incomplete sets', () => {
    const logs = [
      { date: '2026-05-11', sets: [{ weight: 40, reps: 10, rir: 2, completed: false }] },
    ]
    expect(getWeekTonnage(logs, '2026-05-11').current).toBe(0)
  })

  it('computes delta and deltaPct vs previous week', () => {
    const logs = [
      mk('2026-05-11'), // current week start (Mon)
      mk('2026-05-04'), // previous week
    ]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.current).toBe(400)
    expect(result.previous).toBe(400)
    expect(result.delta).toBe(0)
    expect(result.deltaPct).toBe(0)
  })

  it('deltaPct is null when previous week is 0', () => {
    const logs = [mk('2026-05-11')]
    const result = getWeekTonnage(logs, '2026-05-11')
    expect(result.deltaPct).toBeNull()
  })
})

describe('getLastWorkoutSummary', () => {
  it('returns null with no workouts', () => {
    expect(getLastWorkoutSummary([], [], dayjs('2026-05-17'))).toBeNull()
  })

  it('returns the most recent workout with set count and top weight', () => {
    const today = dayjs('2026-05-17')
    const workouts = [
      { id: 'w1', date: '2026-05-15', sessionType: 'A' as const },
      { id: 'w2', date: '2026-05-10', sessionType: 'B' as const },
    ]
    const exerciseLogs = [
      { workoutId: 'w1', sets: [
        { weight: 50, reps: 8, completed: true },
        { weight: 60, reps: 6, completed: true },
        { weight: 60, reps: 5, completed: false },
      ] },
      { workoutId: 'w2', sets: [
        { weight: 70, reps: 5, completed: true },
      ] },
    ]
    const result = getLastWorkoutSummary(workouts, exerciseLogs, today)
    expect(result).toMatchObject({
      sessionType: 'A',
      daysAgo: 2,
      completedSets: 2,
      topWeight: 60,
    })
  })
})
