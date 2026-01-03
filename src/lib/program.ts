import type { Exercise, Program, SessionTemplate, SetTarget } from '@/data/programTypes'
import type { SessionType } from '@/types'

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

export const formatTargetText = (target: SetTarget) => {
  const setText = target.setRange
    ? `${target.setRange[0]}–${target.setRange[1]} séries`
    : `${target.sets} séries`
  const repsText = `${target.repRange[0]}–${target.repRange[1]} repetições`
  return `${setText} x ${repsText}`
}
