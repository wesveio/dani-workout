import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { AlertCircle, Check, PlayCircle, Plus, Timer } from 'lucide-react'
import { treinoDani } from '@/data/treinoDani'
import { computeTargetsForWeek, focusLabels, formatTargetText, getSessionTemplate, getWeekInfo } from '@/lib/program'
import { getCurrentWeekNumber, isDeloadWeek } from '@/lib/date'
import { useWorkoutStore } from '@/store/workoutStore'
import type { SetEntry, SessionType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

type ExerciseState = {
  sets: SetEntry[]
  notes: string
}

const createDefaultSets = (
  total: number,
  repRange: [number, number],
  lastLog?: SetEntry[],
): SetEntry[] => {
  if (lastLog && lastLog.length) {
    const clone = lastLog.map((s) => ({ ...s, completed: false }))
    while (clone.length < total) {
      clone.push({ weight: 0, reps: repRange[0], rir: 2, completed: false })
    }
    return clone.slice(0, total)
  }
  return Array.from({ length: total }).map(() => ({
    weight: 0,
    reps: repRange[0],
    rir: 2,
    completed: false,
  }))
}

export default function SessionDetail() {
  const { sessionId, weekNumber: weekParam } = useParams()
  const sessionType = (sessionId ?? 'A') as SessionType
  const settings = useWorkoutStore((s) => s.settings)
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const logSession = useWorkoutStore((s) => s.logSession)
  const navigate = useNavigate()

  const [exerciseState, setExerciseState] = useState<Record<string, ExerciseState>>({})
  const activeWeek = Number(weekParam) || getCurrentWeekNumber(settings.programStart, treinoDani.durationWeeks)
  const session = getSessionTemplate(sessionType)
  const weekInfo = getWeekInfo(activeWeek)

  useEffect(() => {
    const nextState: Record<string, ExerciseState> = {}
    session.exercises.forEach((ex) => {
      const targets = computeTargetsForWeek(ex, activeWeek, settings.recoveryExcellent)
      const totalSets = targets.reduce((sum, t) => sum + t.targetSets, 0)
      const lastLog = exerciseLogs.find((l) => l.exerciseId === ex.id)
      nextState[ex.id] = {
        sets: createDefaultSets(totalSets, targets[0]?.repRange ?? [8, 12], lastLog?.sets),
        notes: '',
      }
    })
    setExerciseState(nextState)
  }, [sessionType, activeWeek, settings.recoveryExcellent, exerciseLogs, session.exercises])

  const handleSetChange = (
    exerciseId: string,
    setIndex: number,
    field: keyof SetEntry,
    value: number | boolean,
  ) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId]
      if (!current) return prev
      const nextSets = current.sets.map((s, idx) =>
        idx === setIndex
          ? {
              ...s,
              [field]: field === 'completed' ? Boolean(value) : (value as number),
            }
          : s,
      ) as SetEntry[]
      return { ...prev, [exerciseId]: { ...current, sets: nextSets } }
    })
  }

  const addSet = (exerciseId: string) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId]
      if (!current) return prev
      const repRange = session.exercises.find((e) => e.id === exerciseId)?.prescriptions[0].targets[0].repRange ?? [
        10, 12,
      ]
      return {
        ...prev,
        [exerciseId]: {
          ...current,
          sets: [...current.sets, { weight: 0, reps: repRange[0], rir: 2, completed: false }],
        },
      }
    })
  }

  const handleNotesChange = (exerciseId: string, value: string) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId]
      if (!current) return prev
      return { ...prev, [exerciseId]: { ...current, notes: value } }
    })
  }

  const finishSession = async () => {
    const workoutDate = dayjs().toISOString()
    await logSession({
      workout: {
        date: workoutDate,
        weekNumber: activeWeek,
        sessionType,
        deload: isDeloadWeek(activeWeek),
      },
      exercises: Object.entries(exerciseState).map(([exerciseId, state]) => ({
        exerciseId,
        sets: state.sets.map((s) => ({
          weight: Number.isFinite(s.weight) ? Number(s.weight) : 0,
          reps: Number.isFinite(s.reps) ? Number(s.reps) : 0,
          rir: Number.isFinite(s.rir) ? Number(s.rir) : 0,
          completed: Boolean(s.completed),
        })),
        notes: state.notes,
      })),
    })
    toast({ title: 'Sessão salva', description: 'Bom trabalho! Progresso salvo offline.' })
    navigate('/')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-neutral">Sessão {session.id}</div>
          <h1 className="text-2xl font-bold">{session.subtitle}</h1>
          <div className="text-sm text-neutral">
            Semana {activeWeek} · {weekInfo.phase}
          </div>
        </div>
        <Badge variant={weekInfo.deload ? 'muted' : 'default'}>{weekInfo.deload ? 'Deload' : 'Semana-alvo'}</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Aqueça primeiro</CardTitle>
            <CardDescription>{treinoDani.warmup.duration}</CardDescription>
          </div>
          <Badge variant="outline">Essencial</Badge>
        </CardHeader>
        <CardContent>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-neutral/30 bg-white px-4 py-3 text-left text-sm font-semibold shadow-soft">
              <span>Ver passos do aquecimento</span>
              <Plus className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 rounded-xl border border-neutral/20 bg-card px-4 py-3 text-sm text-neutral">
              {treinoDani.warmup.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          {isDeloadWeek(activeWeek) && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-neutral/30 bg-white px-4 py-3 text-sm text-neutral shadow-inner shadow-neutral/10">
              <AlertCircle className="mt-0.5 h-4 w-4 text-foreground" />
              <span>
                Dica de deload: {treinoDani.deload.guidance} ({treinoDani.deload.reductionNote})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {session.exercises.map((exercise) => {
          const targets = computeTargetsForWeek(exercise, activeWeek, settings.recoveryExcellent)
          const state = exerciseState[exercise.id]
          if (!state) return null
          let cursor = 0
          return (
            <Card key={exercise.id}>
              <CardHeader className="gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{exercise.name}</CardTitle>
                  <Badge variant="muted">{focusLabels[exercise.focus]}</Badge>
                  {exercise.optionalVolumeBump &&
                    exercise.optionalVolumeBump.weeks.includes(activeWeek) &&
                    settings.recoveryExcellent && (
                      <Badge variant="success">+1 série ativa</Badge>
                    )}
                </div>
                <CardDescription className="flex flex-wrap gap-3 text-xs">
                  <span>{exercise.rest} de descanso</span>
                  <span>{exercise.rir}</span>
                  {exercise.notes && <span>{exercise.notes}</span>}
                  {exercise.videoUrl && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="h-9 gap-2 px-3 border-accent text-accent hover:bg-accent hover:text-foreground"
                    >
                      <a href={exercise.videoUrl} target="_blank" rel="noreferrer noopener">
                        <PlayCircle className="h-4 w-4" />
                        Ver vídeo
                      </a>
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  {targets.map((t, idx) => (
                    <Badge key={idx} variant="outline">
                      {t.label ? `${t.label}: ` : ''}
                      {formatTargetText(t)}
                      {exercise.optionalVolumeBump &&
                        exercise.optionalVolumeBump.weeks.includes(activeWeek) &&
                        settings.recoveryExcellent &&
                        idx === 0 && <span className="ml-1 text-[10px]">(+1 série)</span>}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  {targets.map((target, targetIdx) => {
                    const setsForTarget = state.sets.slice(cursor, cursor + target.targetSets)
                    const startIndex = cursor
                    cursor += target.targetSets
                    return (
                      <div key={targetIdx} className="rounded-xl border border-neutral/20 bg-white px-3 py-3 shadow-inner shadow-neutral/10">
                        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                          <div>
                            {target.label ?? 'Séries de trabalho'} · {target.repRange[0]}–{target.repRange[1]} repetições
                          </div>
                          <div className="text-xs text-neutral">
                            Séries {startIndex + 1}–{startIndex + target.targetSets}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {setsForTarget.map((set, idx) => {
                            const absoluteIndex = startIndex + idx
                            return (
                              <div
                                key={`${exercise.id}-set-${absoluteIndex}`}
                                className="grid grid-cols-2 sm:grid-cols-12 items-center gap-2 rounded-lg border border-neutral/10 bg-card px-3 py-2"
                              >
                                <div className="col-span-2 sm:col-span-3 text-xs font-semibold">
                                  Série {absoluteIndex + 1}
                                </div>
                                <div className="col-span-2 sm:col-span-3">
                                  <Label className="text-[11px]">Carga</Label>
                                  <Input
                                    aria-label={`${exercise.name} série ${absoluteIndex + 1} carga`}
                                    type="number"
                                    inputMode="decimal"
                                    value={set.weight}
                                    onChange={(e) =>
                                      handleSetChange(exercise.id, absoluteIndex, 'weight', Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-2">
                                  <Label className="text-[11px]">Repetições</Label>
                                  <Input
                                    aria-label={`${exercise.name} série ${absoluteIndex + 1} repetições`}
                                    type="number"
                                    inputMode="numeric"
                                    value={set.reps}
                                    onChange={(e) =>
                                      handleSetChange(exercise.id, absoluteIndex, 'reps', Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-2">
                                  <Label className="text-[11px]">RIR</Label>
                                  <Input
                                    aria-label={`${exercise.name} série ${absoluteIndex + 1} RIR`}
                                    type="number"
                                    min={0}
                                    max={5}
                                    inputMode="numeric"
                                    value={set.rir}
                                    onChange={(e) =>
                                      handleSetChange(exercise.id, absoluteIndex, 'rir', Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
                                  <Checkbox
                                    aria-label={`${exercise.name} série ${absoluteIndex + 1} concluída`}
                                    checked={Boolean(set.completed)}
                                    onCheckedChange={(checked) =>
                                      handleSetChange(exercise.id, absoluteIndex, 'completed', Boolean(checked))
                                    }
                                  />
                                  <span className="text-xs text-neutral">Feito</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Button variant="secondary" size="sm" onClick={() => addSet(exercise.id)} aria-label="Adicionar série extra">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar série
                </Button>

                <div className="space-y-1">
                  <Label>Notas</Label>
                  <Textarea
                    aria-label={`${exercise.name} notas`}
                    placeholder="Dicas de técnica, tempo, o que lembrar."
                    value={state.notes}
                    onChange={(e) => handleNotesChange(exercise.id, e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={finishSession} size="lg">
          <Check className="mr-2 h-5 w-5" />
          Finalizar sessão
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <Timer className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  )
}
