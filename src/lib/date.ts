import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import type { ScheduleDay } from '@/data/treinoDani'
import type { SessionType } from '@/types'

dayjs.locale('pt-br')

export const formatDisplayDate = (iso: string) => dayjs(iso).format('ddd, D [de] MMM')

export const getCurrentWeekNumber = (programStart: string, totalWeeks = 12) => {
  const start = dayjs(programStart)
  if (!start.isValid()) return 1
  const diff = dayjs().diff(start, 'week')
  const week = diff + 1
  if (week < 1) return 1
  if (week > totalWeeks) return totalWeeks
  return week
}

export const isDeloadWeek = (weekNumber: number) => weekNumber === 4 || weekNumber === 8

const dayOrder = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const

export const getSessionForDate = (
  date: dayjs.Dayjs,
  schedule: ScheduleDay[],
): { sessionId: SessionType; label: string; next: boolean } => {
  const dayName = dayOrder[date.day()]
  const match = schedule.find((s) => s.day.toLowerCase() === dayName)
  if (match) {
    return { sessionId: match.sessionId, label: match.day, next: false }
  }
  // Find next scheduled day
  const upcoming = schedule
    .map((item) => ({
      ...item,
      offset:
        (dayOrder.indexOf(item.day.toLowerCase() as (typeof dayOrder)[number]) - date.day() + dayOrder.length) %
          dayOrder.length || dayOrder.length,
    }))
    .sort((a, b) => a.offset - b.offset)[0]
  return {
    sessionId: upcoming.sessionId,
    label: `Próximo: ${upcoming.day}`,
    next: true,
  }
}
