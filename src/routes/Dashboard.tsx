import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { AlertTriangle, ArrowRight, Flame, PlayCircle } from 'lucide-react'
import { getSessionForDate, getCurrentWeekNumber } from '@/lib/date'
import { getSessionTemplate, getWeekInfo } from '@/lib/program'
import { useActiveProgram } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const formatDay = (day: string) => day.slice(0, 3)

const legend = [
  {
    sigla: 'RIR',
    texto: 'Reps in Reserve. Quantas repetições sobrariam antes da falha. Ex.: RIR 2 = poderia fazer +2 reps.',
  },
  {
    sigla: 'Deload',
    texto: 'Semana de redução de volume/carga (60–70%) para recuperar. Nesta planilha: semanas 4 e 8.',
  },
  {
    sigla: 'Composto',
    texto: 'Exercício multiarticular, mais músculos envolvidos. Descanso maior (2–3 min).',
  },
  {
    sigla: 'Isolador / Pump',
    texto: 'Movimento focado em um grupo ou pump. Descanso 60–90s, execução controlada.',
  },
  {
    sigla: 'Progressão dupla',
    texto: 'Suba carga só quando todas as séries baterem o topo da faixa de reps com forma limpa.',
  },
]

export default function Dashboard() {
  const workouts = useWorkoutStore((s) => s.workouts)
  const settings = useWorkoutStore((s) => s.settings)
  const program = useActiveProgram()
  const weekNumber = getCurrentWeekNumber(settings.programStart, program.durationWeeks)
  const weekInfo = getWeekInfo(program, weekNumber)
  const today = dayjs()
  const todaySession = getSessionForDate(today, program.schedule)
  const sessionTemplate = getSessionTemplate(program, todaySession.sessionId)
  const isRestDay = todaySession.next
  const expectedSessions = Math.min(weekNumber, program.durationWeeks) * program.schedule.length
  const adherence = Math.min(100, Math.round((workouts.length / expectedSessions) * 100))
  const recent = workouts.slice(0, 3)
  const ctaPrimary = isRestDay
    ? { to: `/session/${sessionTemplate.id}/${weekNumber}`, label: `Adiantar sessão ${sessionTemplate.id}` }
    : { to: `/session/${sessionTemplate.id}/${weekNumber}`, label: `Iniciar sessão ${sessionTemplate.id}` }
  const ctaSecondary = isRestDay
    ? { to: '/week', label: 'Manter descanso / planejar' }
    : { to: '/week', label: 'Ver semana' }

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-r from-neutral via-surface to-neutral shadow-soft border border-neutral/50">
        <CardContent className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-center p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={weekInfo.deload ? 'muted' : 'default'}>
                Semana {weekNumber} · {weekInfo.phase}
              </Badge>
              {isRestDay ? <Badge variant="outline">Dia de descanso</Badge> : <Badge variant="outline">Sessão do dia</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">
                {isRestDay ? 'Recupere hoje' : today.format('dddd, D [de] MMM')}
              </CardTitle>
              {program.deload.weeks.includes(weekNumber) && (
                <span className="flex items-center gap-2 rounded-full bg-neutral/60 px-3 py-1 text-xs font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  Deload
                </span>
              )}
            </div>
            <CardDescription className="text-foreground">
              {isRestDay ? todaySession.label : 'Hoje'} · Sessão {sessionTemplate.id} — {sessionTemplate.subtitle}
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{weekInfo.emphasis}</Badge>
              <Badge variant="outline">{program.warmup.duration} aquecimento</Badge>
              <Badge variant="outline">
                {sessionTemplate.exercises.length} exercícios · {sessionTemplate.exercises[0].rest} descanso
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" variant={isRestDay ? 'default' : 'default'}>
                <Link
                  to={ctaPrimary.to}
                  aria-label={ctaPrimary.label}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {ctaPrimary.label}
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to={ctaSecondary.to} aria-label={ctaSecondary.label}>
                  {ctaSecondary.label}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-full bg-neutral/70" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${adherence >= 70 ? '#4EFF74' : '#4495FF'} ${adherence}%, rgba(255,255,255,0.08) ${adherence}%)`,
                }}
              />
              <div className="absolute inset-3 rounded-full bg-surface grid place-items-center text-center">
                <div className="text-3xl font-bold">{adherence}%</div>
                <div className="text-xs text-muted">aderência</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Regras do programa</CardTitle>
            <CardDescription>Lembretes rápidos para treinar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground/90">
            {program.rules.map((rule) => (
              <div key={rule} className="flex gap-2">
                <Flame className="mt-0.5 h-4 w-4 text-accent" />
                <span>{rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda semanal</CardTitle>
            <CardDescription>{program.schedule.map((day) => formatDay(day.day)).join(' / ')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {program.schedule.map((day) => (
              <Link
                key={day.day}
                to={`/session/${day.sessionId}/${weekNumber}`}
                className="group rounded-2xl border border-neutral/50 bg-surface px-3 py-3 shadow-soft transition hover:-translate-y-1 hover:border-accent text-foreground"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="muted" className="text-xs">{formatDay(day.day)}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted group-hover:text-foreground" />
                </div>
                <div className="mt-2 text-sm font-semibold">
                  Sessão {day.sessionId}
                </div>
                <div className="text-xs text-muted">
                  {getSessionTemplate(program, day.sessionId).subtitle}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos registros</CardTitle>
            <CardDescription>3 sessões mais recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && <div className="text-sm text-muted">Nenhum registro ainda.</div>}
            {recent.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-neutral/30 bg-surface px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold">
                    Sessão {log.sessionType} · {dayjs(log.date).format('D MMM')}
                  </div>
                  <div className="text-xs text-muted">Semana {log.weekNumber}</div>
                </div>
                <Badge variant={log.deload ? 'muted' : 'outline'}>
                  {log.deload ? 'Deload' : 'Registrado'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legenda rápida</CardTitle>
          <CardDescription>Siglas e termos usados no programa.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {legend.map((item) => (
            <div
              key={item.sigla}
              className="rounded-xl border border-neutral/50 bg-surface px-3 py-3 shadow-soft text-sm text-foreground/90"
            >
              <div className="font-semibold text-foreground">{item.sigla}</div>
              <div className="text-foreground/80">{item.texto}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aquecimento (antes de cada sessão)</CardTitle>
          <CardDescription>{program.warmup.duration}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-foreground/90">
            {program.warmup.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {program.deload.weeks.includes(weekNumber) && (
            <div className="mt-4 rounded-xl border border-neutral/60 bg-neutral/70 px-4 py-3 text-sm text-foreground/90 shadow-inner shadow-neutral/20">
              <strong>Lembrete de deload:</strong> {program.deload.guidance}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
