import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ArrowLeft, PlayCircle, Trophy, TrendingUp } from 'lucide-react'
import { findExerciseById, focusLabels } from '@/lib/program'
import { useActiveProgram } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { epley } from '@/lib/epley'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExerciseProgressChart, type ChartDatum } from '@/components/ExerciseProgressChart'
import type { ExerciseLog } from '@/types'

const computeVolume = (log: ExerciseLog) =>
  log.sets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0)

export default function ExerciseHistory() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const program = useActiveProgram()
  const exercise = exerciseId ? findExerciseById(program, exerciseId) : undefined

  const [metric, setMetric] = useState<'volume' | 'topWeight' | 'e1rm'>('volume')

  const logs = useMemo(
    () =>
      !exercise
        ? []
        : exerciseLogs
            .filter((log) => log.exerciseId === exercise.id)
            .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    [exercise, exerciseLogs],
  )

  const chartData: ChartDatum[] = useMemo(
    () =>
      logs.map((log) => ({
        date: dayjs(log.date).format('MMM D'),
        volume: computeVolume(log),
        topWeight: log.sets.reduce((max, set) => Math.max(max, set.weight), 0),
        e1rm: log.sets.reduce((max, set) => Math.max(max, epley(set.weight, set.reps)), 0),
      })),
    [logs],
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Exercício</div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <div className="text-sm text-foreground/80">{focusLabels[exercise.focus]} · {exercise.rest} de descanso</div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="rounded-xl bg-[#2A2A2A] p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <div>
              <div className="text-[12px] text-muted">Melhor carga:</div>
              <div className="text-base font-semibold">{bestWeight} kg</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <div>
              <div className="text-[12px] text-muted">Maior volume:</div>
              <div className="text-base font-semibold">{bestVolume}</div>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-muted">1RM Est. max:</div>
            <div className="text-base font-semibold">{best1RM} kg</div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>Progresso</CardTitle>
            <CardDescription>Tendência de carga e volume</CardDescription>
            {exercise.videoUrl && (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="px-3 h-9 gap-2 border-accent text-accent hover:bg-accent hover:text-foreground"
              >
                <a href={exercise.videoUrl} target="_blank" rel="noreferrer noopener">
                  <PlayCircle className="h-4 w-4" />
                  Ver vídeo do exercício
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
            <TabsList className="mb-4">
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="topWeight">Carga</TabsTrigger>
              <TabsTrigger value="e1rm">1RM Est.</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="h-64">
            {chartData.length === 0
              ? <div className="grid h-full place-items-center text-foreground/80 text-sm">Ainda sem registros.</div>
              : <ExerciseProgressChart chartData={chartData} metric={metric} />
            }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>Últimas {logs.length} sessões</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {logs.length === 0 && <div className="text-sm text-foreground/80">Nenhuma entrada ainda.</div>}
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-neutral/50 bg-surface px-3 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {dayjs(log.date).format('D MMM, YYYY')} · Sessão {log.sessionType} (Semana {log.weekNumber})
                </div>
                <Badge variant="muted">Vol {Math.round(computeVolume(log))}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-foreground/80 md:grid-cols-4">
                {log.sets.map((set, idx) => (
                  <div key={idx} className="rounded-lg border border-neutral/10 bg-card px-2 py-2">
                    Série {idx + 1}: {set.weight} kg x {set.reps} @ RIR {set.rir}{' '}
                    {set.completed ? '✔' : ''}
                  </div>
                ))}
              </div>
              {log.notes && <div className="mt-2 text-sm text-foreground/80">Notas: {log.notes}</div>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button asChild variant="secondary">
        <Link to="/week">Voltar para semanas</Link>
      </Button>
    </div>
  )
}
