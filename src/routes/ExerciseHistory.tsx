import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import { findExerciseById, focusLabels } from '@/lib/program'
import { useActiveProgram } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { epley } from '@/lib/epley'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ExerciseHero, MiniBars } from '@/components/redesign'
import type { ExerciseLog } from '@/types'

const computeVolume = (log: ExerciseLog) =>
  log.sets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0)

type Metric = 'volume' | 'topWeight' | 'e1rm'

export default function ExerciseHistory() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const program = useActiveProgram()
  const exercise = exerciseId ? findExerciseById(program, exerciseId) : undefined

  const [metric, setMetric] = useState<Metric>('topWeight')

  const logs = useMemo(
    () =>
      !exercise
        ? []
        : exerciseLogs
            .filter((log) => log.exerciseId === exercise.id)
            .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    [exercise, exerciseLogs],
  )

  const bestWeight = useMemo(
    () => logs.reduce((max, log) => Math.max(max, ...log.sets.map((s) => s.weight)), 0),
    [logs],
  )
  const bestVolume = useMemo(
    () =>
      logs.reduce(
        (max, log) => Math.max(max, log.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)),
        0,
      ),
    [logs],
  )
  const best1RM = useMemo(
    () =>
      logs.reduce((max, log) => Math.max(max, ...log.sets.map((s) => epley(s.weight, s.reps))), 0),
    [logs],
  )

  // PR details
  const prLog = useMemo(() => {
    let prWeight = 0
    let prReps = 0
    let prDate = ''
    for (const log of logs) {
      for (const set of log.sets) {
        if (set.weight > prWeight || (set.weight === prWeight && set.reps > prReps)) {
          prWeight = set.weight
          prReps = set.reps
          prDate = log.date
        }
      }
    }
    return { prWeight, prReps, prDate: prDate ? dayjs(prDate).format('D MMM YYYY') : '—' }
  }, [logs])

  // Delta over last 30 days
  const delta30dLabel = useMemo(() => {
    const cutoff = dayjs().subtract(30, 'day')
    const recent = logs.filter((l) => dayjs(l.date).isAfter(cutoff))
    const older = logs.filter((l) => !dayjs(l.date).isAfter(cutoff))
    if (recent.length === 0 || older.length === 0) return null
    const recentMax = recent.reduce(
      (max, log) => Math.max(max, ...log.sets.map((s) => s.weight)),
      0,
    )
    const olderMax = older.reduce(
      (max, log) => Math.max(max, ...log.sets.map((s) => s.weight)),
      0,
    )
    if (olderMax === 0) return null
    const pct = Math.round(((recentMax - olderMax) / olderMax) * 100)
    return pct >= 0 ? `+${pct}%` : `${pct}%`
  }, [logs])

  // Series values for MiniBars
  const seriesFor = (m: Metric): number[] => {
    if (m === 'topWeight') return logs.map((log) => log.sets.reduce((max, s) => Math.max(max, s.weight), 0))
    if (m === 'volume') return logs.map((log) => computeVolume(log))
    return logs.map((log) => log.sets.reduce((max, s) => Math.max(max, epley(s.weight, s.reps)), 0))
  }

  // Recent logs (last 10, newest first)
  const recentLogs = useMemo(
    () =>
      [...logs]
        .reverse()
        .slice(0, 10)
        .map((log) => ({
          id: log.id,
          dateLabel: dayjs(log.date).format('D MMM YYYY'),
          topWeight: log.sets.reduce((max, s) => Math.max(max, s.weight), 0),
          topReps: log.sets.reduce(
            (reps, s, _, arr) =>
              s.weight === arr.reduce((m, x) => Math.max(m, x.weight), 0) ? s.reps : reps,
            0,
          ),
        })),
    [logs],
  )

  if (!exercise) {
    return (
      <div className="space-y-3">
        <p className="text-foreground/80">Exercício não encontrado.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    )
  }

  const series = seriesFor(metric)

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="Voltar" className="text-txt-faint">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button aria-label="Mais opções" className="text-txt-faint">
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {/* Hero */}
      <ExerciseHero
        name={exercise.name}
        prescription={`${focusLabels[exercise.focus]} · ${exercise.rest}`}
        imageUrl={exercise.imageUrl}
        videoUrl={exercise.videoUrl ?? undefined}
        ratio="16-9"
      />

      {/* Metric toggle */}
      <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
        <TabsList>
          <TabsTrigger value="topWeight">Carga</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="e1rm">1RM Est.</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* PR card */}
      {logs.length > 0 ? (
        <div className="rounded-card bg-bg-1 p-3.5">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-txt-faint">PR atual</div>
              <div className="mt-1 text-[32px] font-extralight leading-none">
                <span className="text-[12px] text-txt-faint">Melhor carga:</span>{' '}
                <span>{bestWeight}</span>
                <span className="ml-1 text-sm text-txt-faint">kg</span>
              </div>
              <div className="mt-1 text-[11px] text-txt-dim">
                × {prLog.prReps} reps · {prLog.prDate}
              </div>
              <div className="mt-1 text-[11px] text-txt-faint">
                <span className="text-[12px]">Maior volume:</span>{' '}
                <span className="font-semibold">{bestVolume}</span>
              </div>
              <div className="mt-1 text-[11px] text-txt-faint">
                1RM Est. max: <span className="font-semibold">{best1RM} kg</span>
              </div>
            </div>
            {delta30dLabel && (
              <div className="text-[13px] font-medium text-lime">
                {delta30dLabel}
                <span className="ml-1 text-txt-faint">/ 30d</span>
              </div>
            )}
          </div>
          <MiniBars values={series} current={series.length - 1} height={80} />
        </div>
      ) : null}

      {/* Últimas sessões */}
      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint">
          Últimas sessões
        </h2>
        <div className="rounded-card bg-bg-1">
          {logs.length === 0 ? (
            <div className="grid place-items-center py-8 text-sm text-foreground/80">
              Ainda sem registros.
            </div>
          ) : (
            recentLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between border-b border-line px-3.5 py-3 text-[13px] last:border-0"
              >
                <span className="text-txt-faint">{l.dateLabel}</span>
                <span>
                  {l.topWeight}kg × {l.topReps}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
