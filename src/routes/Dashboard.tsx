import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { getSessionForDate, getCurrentWeekNumber } from '@/lib/date'
import { getSessionTemplate, getWeekInfo, getWeekStates, getRecentPr, findExerciseById } from '@/lib/program'
import { useActiveProgram, useActiveUserProfile } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { PrimaryCTA, AderenciaDots, Sparkline } from '@/components/redesign'
import type { DayState } from '@/components/redesign'

// Day-of-week index (0=Mon…6=Sun) for each Portuguese day name
const dayNameToIndex: Record<string, number> = {
  'segunda-feira': 0,
  'terça-feira': 1,
  'quarta-feira': 2,
  'quinta-feira': 3,
  'sexta-feira': 4,
  'sábado': 5,
  'domingo': 6,
}

export default function Dashboard() {
  const workouts = useWorkoutStore((s) => s.workouts)
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const settings = useWorkoutStore((s) => s.settings)
  const profile = useActiveUserProfile()
  const program = useActiveProgram()

  const weekNumber = getCurrentWeekNumber(settings.programStart, program.durationWeeks)
  const weekInfo = getWeekInfo(program, weekNumber)
  const today = dayjs()
  const todaySession = getSessionForDate(today, program.schedule)
  const sessionTemplate = getSessionTemplate(program, todaySession.sessionId)
  const isRestDay = todaySession.next
  const isDeload = program.deload.weeks.includes(weekNumber)

  // Prescription card values — use first exercise of the session as representative
  const firstExercise = sessionTemplate.exercises[0]
  const sessionVolume = sessionTemplate.exercises.reduce((acc, ex) => {
    const p = ex.prescriptions.find(
      (pr) => weekNumber >= pr.weekRange[0] && weekNumber <= pr.weekRange[1],
    ) ?? ex.prescriptions[0]
    const sets = p?.targets[0]?.sets ?? 0
    return acc + sets
  }, 0)

  // Aderência dots — current week Mon–Sun
  // Force Monday: dayjs startOf('week') is Sunday in some locales
  const monday = dayjs().subtract((today.day() + 6) % 7, 'day').startOf('day')
  const weekStartStr = monday.format('YYYY-MM-DD')
  const scheduledIndices = program.schedule.map((d) => dayNameToIndex[d.day.toLowerCase()] ?? -1).filter((i) => i >= 0)
  const rawStates = getWeekStates(workouts, weekStartStr, scheduledIndices)
  const weekStates: DayState[] = rawStates

  // Adherence count for current week
  const weekDoneCount = weekStates.filter((s) => s === 'done').length
  const weekTotalScheduled = scheduledIndices.length

  // Recent PR
  const recentPr = getRecentPr(exerciseLogs, (id) => findExerciseById(program, id)?.name)

  return (
    <div className='flex flex-col gap-4 p-4 pb-24'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black'
          style={{ background: profile?.avatarColor ?? '#4EFF74' }}
        >
          {profile?.avatarInitial ?? '?'}
        </div>
        <div>
          <p className='text-xs text-txt-faint'>Olá,</p>
          <p className='text-sm font-semibold leading-tight'>{profile?.name ?? 'Atleta'}</p>
        </div>
      </div>

      {/* Today's session block */}
      <div className='flex flex-col gap-1'>
        <p className='text-[11px] font-semibold uppercase tracking-widest text-txt-faint'>
          {isRestDay ? 'Próxima sessão' : 'Hoje'}
        </p>
        <h1 className='text-[28px] font-bold leading-tight'>
          {sessionTemplate.title}
        </h1>
        <p className='text-sm text-txt-faint'>{sessionTemplate.subtitle}</p>
      </div>

      {/* Primary CTA */}
      <PrimaryCTA
        label='Iniciar treino'
        to={`/session/${sessionTemplate.id}/${weekNumber}`}
      />

      {/* Prescription card */}
      <div className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3'>
        <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
          Prescrição — Semana {weekNumber}
        </p>
        <div className='flex flex-col gap-2'>
          <PrescRow label='Volume previsto' value={`~${sessionVolume} séries`} />
          <PrescRow label='RIR alvo' value={firstExercise?.rir ?? '—'} />
          <PrescRow label='Duração estimada' value={`${program.warmup.duration} + treino`} />
          <PrescRow
            label='Deload'
            value={isDeload ? 'Sim — reduza 30–40%' : 'Não'}
            highlight={isDeload}
          />
        </div>
        {weekInfo && (
          <p className='text-[11px] text-txt-faint'>
            {weekInfo.phase} · {weekInfo.emphasis}
          </p>
        )}
      </div>

      {/* Aderência */}
      <div className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
            Aderência esta semana
          </p>
          <p className='text-sm font-semibold'>
            {weekDoneCount}/{weekTotalScheduled}
          </p>
        </div>
        <AderenciaDots states={weekStates} />
      </div>

      {/* Recent PR card */}
      {recentPr ? (
        <Link
          to={`/history`}
          className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3 active:opacity-80'
        >
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
              PR recente
            </p>
            <span className='text-[10px] text-lime font-semibold'>ver histórico →</span>
          </div>
          <div className='flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold leading-tight'>{recentPr.exerciseName}</p>
              <p className='text-xs text-txt-faint'>
                {recentPr.weight} kg × {recentPr.reps} reps
              </p>
            </div>
            {recentPr.weeklyMaxes.length > 1 && (
              <Sparkline values={recentPr.weeklyMaxes} className='w-24' />
            )}
          </div>
        </Link>
      ) : null}
    </div>
  )
}

function PrescRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-sm text-txt-faint'>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-lime' : ''}`}>{value}</span>
    </div>
  )
}
