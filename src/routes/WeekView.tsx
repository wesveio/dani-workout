import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock4, Dumbbell } from 'lucide-react'
import { treinoDani } from '@/data/treinoDani'
import { getCurrentWeekNumber, isDeloadWeek } from '@/lib/date'
import { getSessionTemplate } from '@/lib/program'
import { useWorkoutStore } from '@/store/workoutStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function WeekView() {
  const settings = useWorkoutStore((s) => s.settings)
  const [week, setWeek] = useState(
    getCurrentWeekNumber(settings.programStart, treinoDani.durationWeeks),
  )
  const weekInfo = useMemo(
    () => treinoDani.weeks.find((w) => w.number === week) ?? treinoDani.weeks[0],
    [week],
  )

  useEffect(() => {
    setWeek(getCurrentWeekNumber(settings.programStart, treinoDani.durationWeeks))
  }, [settings.programStart])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-2xl">Semana {week}</CardTitle>
            <Badge variant={weekInfo.deload ? 'muted' : 'outline'}>
              {weekInfo.phase}
            </Badge>
          </div>
          <CardDescription>{weekInfo.emphasis}</CardDescription>
          {isDeloadWeek(week) && (
            <div className="flex items-center gap-2 rounded-xl border border-neutral/60 bg-neutral/70 px-3 py-2 text-sm text-foreground/90 shadow-inner shadow-neutral/20">
              <Clock4 className="h-4 w-4" />
              {treinoDani.deload.guidance}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: treinoDani.durationWeeks }).map((_, idx) => {
              const num = idx + 1
              const active = num === week
              return (
                <Button
                  key={num}
                  variant={active ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setWeek(num)}
                  aria-label={`Selecionar semana ${num}`}
                >
                  {num}
                </Button>
              )
            })}
          </div>
          <div className="flex flex-col gap-3">
            {treinoDani.schedule.map((day) => {
              const session = getSessionTemplate(day.sessionId)
              return (
                <Link
                  key={day.day}
                  to={`/session/${session.id}/${week}`}
                  className="group rounded-2xl border border-neutral/40 bg-surface px-4 py-4 shadow-soft transition hover:-translate-y-1 hover:border-accent text-foreground"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="muted">{day.day}</Badge>
                    <Dumbbell className="h-4 w-4 text-muted group-hover:text-foreground" />
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    Sessão {session.id}
                  </div>
                  <div className="text-sm text-foreground/80">{session.subtitle}</div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linha do tempo das fases</CardTitle>
          <CardDescription>Entenda o foco de cada bloco.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {treinoDani.phases.map((phase) => (
            <div
              key={phase.label + phase.weeks.join('-')}
              className="flex items-start gap-3 rounded-xl border border-neutral/50 bg-surface px-3 py-3 shadow-soft"
            >
              <Calendar className="mt-1 h-4 w-4 text-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{phase.label}</span>
                  <Badge variant="outline">Semanas {phase.weeks.join(', ')}</Badge>
                </div>
                <div className="text-sm text-foreground/80">{phase.description}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
