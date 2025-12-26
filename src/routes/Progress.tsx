import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { BarChart3, ChevronRight } from 'lucide-react'
import { treinoDani } from '@/data/treinoDani'
import { focusLabels } from '@/lib/program'
import { useWorkoutStore } from '@/store/workoutStore'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const exercises = treinoDani.sessions.flatMap((s) => s.exercises)

export default function Progress() {
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-neutral">Progresso</div>
        <h1 className="text-2xl font-bold">Histórico por exercício</h1>
        <p className="text-sm text-neutral">Abra qualquer exercício para ver tendências e PRs.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {exercises.map((exercise) => {
          const logs = exerciseLogs.filter((log) => log.exerciseId === exercise.id)
          const lastLog = logs[0]
          const bestWeight = Math.max(0, ...logs.map((log) => Math.max(...log.sets.map((s) => s.weight))))
          const lastDate = lastLog ? dayjs(lastLog.date).format('MMM D') : '—'
          return (
            <Link key={exercise.id} to={`/exercise/${exercise.id}`}>
              <Card className="transition hover:-translate-y-1 hover:border-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription>{focusLabels[exercise.focus]}</CardDescription>
                  </div>
                  <Badge variant="muted">{exercise.rest} de descanso</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Melhor carga</div>
                    <div className="text-lg font-bold">{bestWeight || '--'} kg</div>
                    <div className="text-xs text-neutral">Último: {lastDate}</div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-soft">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </CardContent>
                <div className="flex items-center justify-between border-t border-neutral/10 px-4 py-2 text-xs text-neutral">
                  {logs.length} registro(s)
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
