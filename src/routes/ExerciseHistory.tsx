import { Link, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ArrowLeft, PlayCircle, Trophy, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Formatter, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { findExerciseById, focusLabels } from '@/lib/program'
import { useWorkoutStore } from '@/store/workoutStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExerciseLog } from '@/types'

type ChartDatum = {
  date: string
  volume: number
  topWeight: number
}

const computeVolume = (log: ExerciseLog) =>
  log.sets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0)

export default function ExerciseHistory() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const exercise = exerciseId ? findExerciseById(exerciseId) : undefined

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

  const logs = exerciseLogs
    .filter((log) => log.exerciseId === exercise.id)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  const chartData: ChartDatum[] = logs.map((log) => ({
    date: dayjs(log.date).format('MMM D'),
    volume: computeVolume(log),
    topWeight: log.sets.reduce((max, set) => Math.max(max, set.weight), 0),
  }))

  const bestVolume = Math.max(0, ...chartData.map((d) => d.volume))
  const bestWeight = Math.max(0, ...chartData.map((d) => d.topWeight))

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
          <div className="flex gap-2">
            <Badge variant="outline">Melhor carga: {bestWeight || '--'} kg</Badge>
            <Badge variant="outline">Maior volume: {Math.round(bestVolume) || '--'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-foreground/80 text-sm">Ainda sem registros.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18D02E" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#18D02E" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #454132', background: '#F2F1EF' }}
                  formatter={
                    ((value, name) => {
                      const numeric =
                        typeof value === 'number'
                          ? value
                          : Array.isArray(value)
                            ? Number(value[0]) || 0
                            : Number(value) || 0
                      return name === 'topWeight'
                        ? [`${numeric} kg`, 'Melhor carga']
                        : [Math.round(numeric), 'Volume']
                    }) as Formatter<any, NameType>
                  }
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#18D02E"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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

      <div className="flex gap-2">
        <Badge variant="success" className="flex items-center gap-1 text-xs">
          <Trophy className="h-4 w-4" /> Melhor carga {bestWeight || '--'} kg
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <TrendingUp className="h-4 w-4" /> Maior volume {Math.round(bestVolume) || '--'}
        </Badge>
      </div>

      <Button asChild variant="secondary">
        <Link to="/week">Voltar para semanas</Link>
      </Button>
    </div>
  )
}
