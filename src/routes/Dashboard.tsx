import { useEffect } from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { getSessionForDate, getCurrentWeekNumber } from '@/lib/date'
import { getSessionTemplate, getWeekInfo, getWeekStates, getRecentPr, findExerciseById, getNextSession, computeTargetsForWeek, getWeekTonnage, getStreak, getLastWorkoutSummary, getLatestWeightTrend } from '@/lib/program'
import { useActiveProgram, useActiveUserProfile } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { PrimaryCTA, AderenciaDots, Sparkline, ProgressBar, ExercisePreviewList, MetricCard } from '@/components/redesign'
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
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  const bodyEntries = useBodyMetricsStore((s) => s.entries)
  const bodyActiveUserId = useBodyMetricsStore((s) => s.activeUserId)
  const loadBodyMetricsForUser = useBodyMetricsStore((s) => s.loadForUser)
  const profile = useActiveUserProfile()
  const program = useActiveProgram()

  // The body metrics store is only auto-populated when the user visits /corpo
  // (see src/routes/BodyMetrics.tsx:30-32). The home card needs the same data,
  // and must refresh whenever the active profile changes.
  useEffect(() => {
    if (!activeUserId) return
    if (bodyActiveUserId !== activeUserId) {
      void loadBodyMetricsForUser(activeUserId)
    }
  }, [activeUserId, bodyActiveUserId, loadBodyMetricsForUser])

  if (!program) return null

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

  const nextSession = getNextSession(today, program.schedule)
  const previewItems = sessionTemplate.exercises.map((ex) => {
    // Use computeTargetsForWeek so finishers / pump sets / volume bumps are included.
    const targets = computeTargetsForWeek(ex, weekNumber, settings.recoveryExcellent)
    const setsText = targets.length === 0
      ? '—'
      : targets.map((t) => `${t.targetSets}x${t.repRange[0]}–${t.repRange[1]}`).join(' + ')
    return { id: ex.id, name: ex.name, setsText }
  })

  // Aderência dots — current week Mon–Sun
  // Force Monday: dayjs startOf('week') is Sunday in some locales
  const monday = dayjs().subtract((today.day() + 6) % 7, 'day').startOf('day')
  const weekStartStr = monday.format('YYYY-MM-DD')
  const scheduledIndices = program.schedule.map((d) => dayNameToIndex[d.day.toLowerCase()] ?? -1).filter((i) => i >= 0)
  // Scope adherence to current cycle: ignore logs from before programStart
  const cycleWorkouts = workouts.filter((w) => w.date >= settings.programStart)
  const rawStates = getWeekStates(cycleWorkouts, weekStartStr, scheduledIndices)
  const weekStates: DayState[] = rawStates

  const streak = getStreak(workouts.filter((w) => w.date >= settings.programStart), today)
  const lastWorkout = getLastWorkoutSummary(workouts, exerciseLogs, today)

  const tonnage = getWeekTonnage(
    exerciseLogs.filter((l) => l.date >= settings.programStart),
    weekStartStr,
  )

  // Adherence count for current week
  const weekDoneCount = weekStates.filter((s) => s === 'done').length
  const weekTotalScheduled = scheduledIndices.length

  // Recent PR
  const recentPr = getRecentPr(exerciseLogs, (id) => findExerciseById(program, id)?.name)

  // Only compute the trend after the store has loaded the active profile's entries.
  // Otherwise we'd briefly show the previous profile's weight after a switchUser().
  const bodyMetricsReady = bodyActiveUserId === activeUserId
  const weightTrend = bodyMetricsReady ? getLatestWeightTrend(bodyEntries, today) : null

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

      <ProgressBar
        current={weekNumber}
        total={program.durationWeeks}
        label='Programa'
      />

      {/* Today's session block */}
      <div className='flex flex-col gap-1'>
        <p className='text-[11px] font-semibold uppercase tracking-widest text-txt-faint'>
          {isRestDay ? 'Próxima sessão' : 'Hoje'}
        </p>
        <h1 className='text-[28px] font-bold leading-tight'>
          {sessionTemplate.title}
        </h1>
        <p className='text-sm text-txt-faint'>{sessionTemplate.subtitle}</p>
        {nextSession && (
          <p className='text-xs text-txt-faint'>
            Próximo: Treino {nextSession.sessionId} · {nextSession.dayLabel}
            {nextSession.daysAhead === 1 ? ' (amanhã)' : ''}
          </p>
        )}
      </div>

      {/* Primary CTA */}
      <PrimaryCTA
        label='Iniciar treino'
        to={`/session/${sessionTemplate.id}/${weekNumber}`}
      />

      <ExercisePreviewList
        items={previewItems}
        href={`/session/${sessionTemplate.id}/${weekNumber}`}
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
        <div className='flex items-center justify-between border-t border-white/10 pt-2 text-sm'>
          <span className='text-txt-faint'>Tonelagem</span>
          <span className='font-semibold'>{tonnage.current.toLocaleString('pt-BR')} kg</span>
        </div>
        {tonnage.deltaPct !== null && (
          <div className='flex items-center justify-between text-xs'>
            <span className='text-txt-faint'>vs semana anterior</span>
            <span className={tonnage.delta >= 0 ? 'text-lime' : 'text-red-400'}>
              {tonnage.delta >= 0 ? '+' : ''}
              {tonnage.deltaPct}%
            </span>
          </div>
        )}
      </div>

      {/* Streak + Last workout */}
      <div className='grid grid-cols-2 gap-3'>
        <MetricCard
          label='Sequência'
          value={String(streak)}
          unit={streak === 1 ? 'dia' : 'dias'}
        />
        {lastWorkout ? (
          <MetricCard
            label='Último treino'
            value={`Treino ${lastWorkout.sessionType}`}
            unit={lastWorkout.daysAgo === 0 ? 'hoje' : `há ${lastWorkout.daysAgo}d`}
            delta={lastWorkout.topWeight > 0 ? `máx. ${lastWorkout.topWeight}kg · ${lastWorkout.completedSets} séries` : undefined}
          />
        ) : (
          <MetricCard label='Último treino' value='—' />
        )}
      </div>

      {/* Body weight card */}
      {weightTrend && (
        <Link to='/corpo' className='block active:opacity-80'>
          <MetricCard
            label='Peso corporal'
            value={weightTrend.latest.toString()}
            unit='kg'
            delta={
              weightTrend.delta30d === null
                ? undefined
                : `${weightTrend.delta30d >= 0 ? '+' : ''}${weightTrend.delta30d.toFixed(1)} kg em 30d`
            }
            history={weightTrend.history}
          />
        </Link>
      )}

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
