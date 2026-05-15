import dayjs from 'dayjs'
import type { Exercise, Phase, Program, SessionTemplate, SetTarget } from '@/data/programTypes'
import type { ExerciseLog, SessionType } from '@/types'

export type DayStateValue = 'done' | 'miss' | 'none'

/**
 * Returns an array of 7 DayState values (Mon–Sun) for the week containing `weekStart`.
 * `weekStart` must be a Monday ISO string (YYYY-MM-DD).
 * A day is 'done' if a workoutDate falls on it, 'miss' if it was scheduled but past with no log,
 * 'none' otherwise.
 */
export const getWeekStates = (
  logs: Array<{ date: string }>,
  weekStart: string,
  scheduledDayIndices: number[], // 0=Mon…6=Sun
): DayStateValue[] => {
  const monday = dayjs(weekStart)
  const today = dayjs().startOf('day')
  const logDates = new Set(logs.map((l) => l.date.slice(0, 10)))
  return Array.from({ length: 7 }, (_, i) => {
    const day = monday.add(i, 'day')
    const iso = day.format('YYYY-MM-DD')
    if (logDates.has(iso)) return 'done'
    if (scheduledDayIndices.includes(i) && day.isBefore(today)) return 'miss'
    return 'none'
  })
}

export type RecentPr = {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  /** Last N weekly max weights for sparkline */
  weeklyMaxes: number[]
}

/**
 * Returns the most recently PR'd exercise derived from exerciseLogs.
 * PR = highest (weight * reps) 1RM estimate per exercise. Returns null if no logs.
 */
export const getRecentPr = (
  exerciseLogs: ExerciseLog[],
  findName: (id: string) => string | undefined,
): RecentPr | null => {
  if (exerciseLogs.length === 0) return null

  // Group by exerciseId
  const byExercise = new Map<string, ExerciseLog[]>()
  for (const log of exerciseLogs) {
    const list = byExercise.get(log.exerciseId) ?? []
    list.push(log)
    byExercise.set(log.exerciseId, list)
  }

  let bestId = ''
  let bestWeight = 0
  let bestReps = 0
  let bestDate = ''

  for (const [id, logs] of byExercise) {
    for (const log of logs) {
      for (const set of log.sets) {
        if (!set.completed) continue
        if (set.weight > bestWeight || (set.weight === bestWeight && set.reps > bestReps)) {
          bestId = id
          bestWeight = set.weight
          bestReps = set.reps
          bestDate = log.date
        }
      }
    }
  }

  if (!bestId) return null

  // Build weekly max weights (up to 8 weeks) for sparkline
  const logsForBest = byExercise.get(bestId) ?? []
  const weeklyMap = new Map<string, number>()
  for (const log of logsForBest) {
    const weekKey = dayjs(log.date).startOf('week').format('YYYY-MM-DD')
    const currentMax = weeklyMap.get(weekKey) ?? 0
    for (const set of log.sets) {
      if (set.completed && set.weight > currentMax) {
        weeklyMap.set(weekKey, set.weight)
      }
    }
  }
  const weeklyMaxes = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([, v]) => v)

  void bestDate
  return {
    exerciseId: bestId,
    exerciseName: findName(bestId) ?? bestId,
    weight: bestWeight,
    reps: bestReps,
    weeklyMaxes,
  }
}

export type ComputedTarget = SetTarget & { targetSets: number }

export const focusLabels: Record<Exercise['focus'], string> = {
  compound: 'Composto',
  isolation: 'Isolador',
  pump: 'Pump',
}

export const getSessionTemplate = (program: Program, sessionId: SessionType): SessionTemplate => {
  const found = program.sessions.find((s) => s.id === sessionId)
  if (!found) {
    throw new Error(`Session ${sessionId} not found`)
  }
  return found
}

export const getWeekInfo = (program: Program, weekNumber: number) =>
  program.weeks.find((w) => w.number === weekNumber) ?? program.weeks[0]

export const findExerciseById = (program: Program, id: string): Exercise | undefined => {
  for (const session of program.sessions) {
    const found = session.exercises.find((e) => e.id === id)
    if (found) return found
  }
  return undefined
}

export const computeTargetsForWeek = (
  exercise: Exercise,
  weekNumber: number,
  recoveryExcellent: boolean,
): ComputedTarget[] => {
  const prescription = exercise.prescriptions.find(
    (p) => weekNumber >= p.weekRange[0] && weekNumber <= p.weekRange[1],
  )
  const targets = prescription?.targets ?? exercise.prescriptions[0]?.targets ?? []
  return targets.map((target, idx) => {
    const baseSets = target.setRange ? target.setRange[1] ?? target.setRange[0] : target.sets
    const shouldBump =
      idx === 0 &&
      exercise.optionalVolumeBump &&
      recoveryExcellent &&
      exercise.optionalVolumeBump.weeks.includes(weekNumber)
    const bonus = shouldBump ? exercise.optionalVolumeBump?.extraSets ?? 0 : 0
    return {
      ...target,
      targetSets: baseSets + bonus,
    }
  })
}

export const getPhaseForWeek = (program: Program, week: number): Phase | undefined =>
  program.phases.find((p) => p.weeks.includes(week))

export const formatTargetText = (target: SetTarget) => {
  const setText = target.setRange
    ? `${target.setRange[0]}–${target.setRange[1]} séries`
    : `${target.sets} séries`
  const repsText = `${target.repRange[0]}–${target.repRange[1]} repetições`
  return `${setText} x ${repsText}`
}
