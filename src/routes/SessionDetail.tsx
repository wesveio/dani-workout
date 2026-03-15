import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  AlertCircle,
  Check,
  PlayCircle,
  Plus,
  RefreshCw,
  Timer,
} from 'lucide-react';
import { computeTargetsForWeek, focusLabels, formatTargetText, getWeekInfo } from '@/lib/program';
import { cn } from '@/lib/utils';
import { getCurrentWeekNumber } from '@/lib/date';
import { useActiveProgram } from '@/lib/user';
import { useWorkoutStore } from '@/store/workoutStore';
import type { ExerciseLog, SetEntry, SessionType } from '@/types';
import { parseRestDuration, formatRestClock } from '@/lib/rest';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

type ExerciseState = {
  sets: SetEntry[];
  notes: string;
};

type SessionFooterProps = {
  progress: { total: number; completed: number; percent: number };
  restRunning: boolean;
  restSeconds: number;
  defaultRestText?: string;
  onStartRest: (restText?: string) => void;
  onResetRest: () => void;
  onFinish: () => void;
  onBack: () => void;
  formatClock: (seconds: number) => string;
};

const SessionFooter = memo(function SessionFooter({
  progress,
  restRunning,
  restSeconds,
  defaultRestText,
  onStartRest,
  onResetRest,
  onFinish,
  onBack,
  formatClock,
}: SessionFooterProps) {
  return (
    <div className='sticky bottom-0 z-10'>
      <Card className='border-neutral/60 bg-surface/90 backdrop-blur'>
        <CardContent className='flex flex-wrap items-center gap-3'>
          <div className='flex min-w-[200px] flex-1 flex-col gap-1'>
            <div className='flex items-center justify-between text-xs text-foreground/70'>
              <span>
                {progress.completed}/{progress.total || 0} séries
              </span>
              <span>{progress.percent}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-neutral/70'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-accent to-accentSecondary transition-all'
                style={{ width: `${progress.percent}%` }}
                aria-label='Progresso da sessão'
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => onStartRest(defaultRestText)}
            >
              <Timer className='mr-2 h-4 w-4' />
              {restRunning ? formatClock(restSeconds) : 'Iniciar descanso'}
            </Button>
            <div className='flex items-center gap-1'>
              {[60, 90, 120].map((preset) => (
                <Button
                  key={preset}
                  variant='ghost'
                  size='sm'
                  className='px-2 text-xs'
                  onClick={() => onStartRest(String(preset))}
                  aria-label={`Iniciar ${preset} segundos de descanso`}
                >
                  {preset / 60}m
                </Button>
              ))}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onResetRest}
              disabled={!restSeconds}
            >
              Limpar
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button onClick={onFinish} size='lg'>
              <Check className='mr-2 h-5 w-5' />
              Finalizar sessão
            </Button>
            <Button variant='secondary' onClick={onBack}>
              <Timer className='mr-2 h-4 w-4' />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

const sparkPositions = [
  { left: 10, top: 18 },
  { left: 22, top: 32 },
  { left: 35, top: 12 },
  { left: 48, top: 28 },
  { left: 62, top: 16 },
  { left: 74, top: 30 },
  { left: 88, top: 20 },
  { left: 18, top: 58 },
  { left: 32, top: 72 },
  { left: 46, top: 60 },
  { left: 60, top: 78 },
  { left: 76, top: 62 },
  { left: 28, top: 86 },
  { left: 64, top: 90 },
];

const unsavedMessage =
  'Você tem alterações não salvas. Deseja descartar e sair da sessão?';

const createDefaultSets = (
  total: number,
  repRange: [number, number],
  lastLog?: SetEntry[]
): SetEntry[] => {
  if (lastLog && lastLog.length) {
    const clone = lastLog.map((s) => ({ ...s, completed: false }));
    while (clone.length < total) {
      clone.push({ weight: 0, reps: repRange[0], rir: 2, completed: false });
    }
    return clone.slice(0, total);
  }
  return Array.from({ length: total }).map(() => ({
    weight: 0,
    reps: repRange[0],
    rir: 2,
    completed: false,
  }));
};

export default function SessionDetail() {
  const { sessionId, weekNumber: weekParam } = useParams();
  const sessionType =
    sessionId === undefined
      ? 'A'
      : sessionId === 'A' || sessionId === 'B' || sessionId === 'C'
        ? sessionId
        : null;
  const program = useActiveProgram();
  const settings = useWorkoutStore((s) => s.settings);
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs);
  const logSession = useWorkoutStore((s) => s.logSession);
  const activeUserId = useWorkoutStore((s) => s.activeUserId);
  const navigate = useNavigate();

  const [exerciseState, setExerciseState] = useState<
    Record<string, ExerciseState>
  >({});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const fallbackWeek = getCurrentWeekNumber(
    settings.programStart,
    program.durationWeeks
  );
  const parsedWeek = weekParam ? Number(weekParam) : fallbackWeek;
  const hasInvalidWeekParam =
    Number.isNaN(parsedWeek) ||
    parsedWeek < 1 ||
    parsedWeek > program.durationWeeks;
  const activeWeek = hasInvalidWeekParam ? fallbackWeek : parsedWeek;
  const session = sessionType
    ? program.sessions.find((item) => item.id === sessionType) ?? null
    : null;
  const activeSessionType = (session?.id ?? 'A') as SessionType;
  const weekInfo = getWeekInfo(program, activeWeek);
  const lastLogsByExercise = useMemo(() => {
    const map = new Map<string, ExerciseLog>();
    exerciseLogs.forEach((log) => {
      if (!map.has(log.exerciseId)) {
        map.set(log.exerciseId, log);
      }
    });
    return map;
  }, [exerciseLogs]);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const draftKey = `session-draft-${activeUserId}-${activeSessionType}-${activeWeek}`;
  const startRestTimer = (restText?: string) => {
    setRestSeconds(parseRestDuration(restText));
    setRestRunning(true);
  };
  const resetRestTimer = () => {
    setRestRunning(false);
    setRestSeconds(0);
  };
  const scrollToNextSet = () => {
    if (!session) return;
    for (const ex of session.exercises) {
      const state = exerciseState[ex.id];
      if (!state) continue;
      const idx = state.sets.findIndex((s) => !s.completed);
      if (idx !== -1) {
        const target = document.getElementById(`exercise-${ex.id}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
    }
  };
  const progress = useMemo(() => {
    const totals = Object.values(exerciseState).reduce(
      (acc, ex) => {
        acc.total += ex.sets.length;
        acc.completed += ex.sets.filter((s) => s.completed).length;
        return acc;
      },
      { total: 0, completed: 0 }
    );
    return {
      ...totals,
      percent: totals.total
        ? Math.round((totals.completed / totals.total) * 100)
        : 0,
    };
  }, [exerciseState]);
  const targetsByExercise = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeTargetsForWeek>>();
    if (!session) return map;
    session.exercises.forEach((exercise) => {
      map.set(
        exercise.id,
        computeTargetsForWeek(exercise, activeWeek, settings.recoveryExcellent),
      );
    });
    return map;
  }, [activeWeek, session, settings.recoveryExcellent]);

  const initialExerciseState = useMemo(() => {
    if (!session) return {};
    const nextState: Record<string, ExerciseState> = {};
    session.exercises.forEach((ex) => {
      const targets = targetsByExercise.get(ex.id) ?? [];
      const totalSets = targets.reduce((sum, t) => sum + t.targetSets, 0);
      const lastLog = lastLogsByExercise.get(ex.id);
      nextState[ex.id] = {
        sets: createDefaultSets(
          totalSets,
          targets[0]?.repRange ?? [8, 12],
          lastLog?.sets
        ),
        notes: '',
      };
    });
    return nextState;
  }, [
    lastLogsByExercise,
    session,
    targetsByExercise,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExerciseState(initialExerciseState);
    const stored = localStorage.getItem(draftKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, ExerciseState>;
        setExerciseState(parsed);
        setHasUnsaved(true);
      } catch (err) {
        console.warn('Draft inválido, removendo.', err);
        localStorage.removeItem(draftKey);
      }
    }
  }, [initialExerciseState, draftKey]);

  useEffect(() => {
    if (!restRunning || restSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [restRunning, restSeconds]);

  const { lastSavedAt } = useDraftAutosave(draftKey, exerciseState, {
    delayMs: 500,
    enabled:
      hasUnsaved &&
      !celebrating &&
      Object.keys(exerciseState).length > 0 &&
      Boolean(session),
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsaved && !celebrating) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsaved, celebrating]);

  const navigateBack = () => {
    if (hasUnsaved && !celebrating) {
      const shouldLeave = window.confirm(unsavedMessage);
      if (!shouldLeave) return;
    }
    const historyIndex =
      typeof window !== 'undefined' && window.history.state && typeof window.history.state.idx === 'number'
        ? window.history.state.idx
        : 0;
    if (historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate('/week');
  };

  const handleSetChange = (
    exerciseId: string,
    setIndex: number,
    field: keyof SetEntry,
    value: number | boolean
  ) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      const nextSets = current.sets.map((s, idx) =>
        idx === setIndex
          ? {
              ...s,
              [field]:
                field === 'completed' ? Boolean(value) : (value as number),
            }
          : s
      ) as SetEntry[];
      return { ...prev, [exerciseId]: { ...current, sets: nextSets } };
    });
    setHasUnsaved(true);
  };

  const adjustSetValue = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps' | 'rir',
    delta: number
  ) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      const nextSets = current.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        const nextVal = Math.max(
          0,
          field === 'rir'
            ? Math.min((s[field] as number) + delta, 5)
            : (s[field] as number) + delta
        );
        return { ...s, [field]: nextVal };
      });
      return { ...prev, [exerciseId]: { ...current, sets: nextSets } };
    });
    setHasUnsaved(true);
  };

  const copyPreviousSet = (exerciseId: string, setIndex: number) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current || setIndex === 0) return prev;
      const prevSet = current.sets[setIndex - 1];
      if (!prevSet) return prev;
      const nextSets = current.sets.map((s, idx) =>
        idx === setIndex
          ? {
              ...s,
              weight: prevSet.weight,
              reps: prevSet.reps,
              rir: prevSet.rir,
            }
          : s
      );
      return { ...prev, [exerciseId]: { ...current, sets: nextSets } };
    });
    setHasUnsaved(true);
  };

  const validateNumericInput = (
    value: string,
    allowDecimal: boolean = false
  ): string => {
    if (value === '') return '';
    const normalized = value.replace(',', '.');
    if (!allowDecimal) {
      return normalized.replace(/[^0-9]/g, '');
    }

    const filtered = normalized.replace(/[^0-9.]/g, '');
    const [first, ...rest] = filtered.split('.');
    if (rest.length === 0) return first;
    return `${first}.${rest.join('')}`;
  };

  const addSet = (exerciseId: string) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      if (!session) return prev;
      const exercise = session.exercises.find((e) => e.id === exerciseId);
      if (!exercise) return prev;
      const targets = targetsByExercise.get(exercise.id) ?? [];
      let repRange: [number, number] = [10, 12];
      if (targets.length) {
        let idx = current.sets.length;
        repRange = targets[targets.length - 1].repRange;
        for (const target of targets) {
          if (idx < target.targetSets) {
            repRange = target.repRange;
            break;
          }
          idx -= target.targetSets;
        }
      }
      const lastSet = current.sets[current.sets.length - 1];
      const baseSet = lastSet
        ? { ...lastSet, completed: false }
        : { weight: 0, reps: repRange[0], rir: 2, completed: false };
      return {
        ...prev,
        [exerciseId]: {
          ...current,
          sets: [
            ...current.sets,
            {
              ...baseSet,
              reps: baseSet.reps || repRange[0],
              rir: Number.isFinite(baseSet.rir) ? baseSet.rir : 2,
            },
          ],
        },
      };
    });
    setHasUnsaved(true);
  };

  const copyLastLog = (exerciseId: string) => {
    const last = lastLogsByExercise.get(exerciseId);
    if (!last) return;
    setHasUnsaved(true);
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      return {
        ...prev,
        [exerciseId]: {
          ...current,
          sets: last.sets.map((s) => ({ ...s, completed: false })),
          notes: last.notes ?? '',
        },
      };
    });
  };

  const handleNotesChange = (exerciseId: string, value: string) => {
    setHasUnsaved(true);
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      return { ...prev, [exerciseId]: { ...current, notes: value } };
    });
  };

  const finishSession = async () => {
    if (!session) return;
    try {
      const workoutDate = dayjs().toISOString();
      await logSession({
        workout: {
          date: workoutDate,
          weekNumber: activeWeek,
          sessionType: activeSessionType,
          deload: program.deload.weeks.includes(activeWeek),
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
      });
      toast({
        title: 'Sessão salva',
        description: 'Bom trabalho! Progresso salvo offline.',
      });
      localStorage.removeItem(draftKey);
      setHasUnsaved(false);
      setCelebrating(true);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Não foi possível salvar',
        description: 'Falha ao gravar no cache offline. Tente novamente.',
        className: 'border-red-500/50 bg-red-500/10',
      });
    }
  };

  if (!session || hasInvalidWeekParam || !sessionType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessão inválida</CardTitle>
          <CardDescription>
            O link da sessão não está válido para o programa atual.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Button onClick={() => navigate('/week')}>Voltar para semana</Button>
          <Button variant='secondary' onClick={() => navigate('/')}>
            Ir para início
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {celebrating && (
        <div className='fixed inset-0 z-30'>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />
          <div className='absolute inset-0 overflow-hidden'>
            {sparkPositions.map((pos, idx) => (
              <span
                key={idx}
                className='absolute h-2 w-2 rounded-full bg-accent shadow-soft'
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animation: `float-spark 1.1s ease-out forwards`,
                  animationDelay: `${idx * 40}ms`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
          <div className='relative z-10 flex h-full items-center justify-center'>
            <div
              className='rounded-3xl bg-surface/90 px-6 py-5 text-center shadow-soft border border-accent/40'
              style={{ animation: 'celebration-pop 0.9s ease-out' }}
              role='status'
              aria-live='polite'
            >
              <div className='text-sm uppercase tracking-[0.2em] text-accent'>
                Concluído
              </div>
              <div className='text-2xl font-bold text-foreground'>
                Treino salvo! 🎉
              </div>
              <div className='text-sm text-foreground/80'>
                Boa! Recuperação e hidratação agora.
              </div>
              <div className='mt-4 flex flex-wrap justify-center gap-2'>
                <Button
                  size='sm'
                  onClick={() => {
                    setCelebrating(false);
                    navigate('/');
                  }}
                >
                  Voltar ao início
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => setCelebrating(false)}
                >
                  Continuar na sessão
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <div className='text-sm uppercase tracking-[0.2em] text-muted'>
            Sessão {session.id}
          </div>
          <h1 className='text-2xl font-bold text-foreground'>
            {session.subtitle}
          </h1>
          <div className='text-sm text-foreground/80'>
            Semana {activeWeek} · {weekInfo.phase}
          </div>
        </div>
        <div className='flex flex-wrap gap-2 items-center'>
          <Badge variant={weekInfo.deload ? 'muted' : 'default'}>
            {weekInfo.deload ? 'Deload' : 'Semana-alvo'}
          </Badge>
          <Button
            variant='secondary'
            size='sm'
            className='hidden sm:flex'
            onClick={scrollToNextSet}
          >
            Ir para próxima série
          </Button>
          {hasUnsaved && (
            <Badge variant='outline' className='text-xs'>
              {lastSavedAt
                ? `rascunho salvo ${dayjs(lastSavedAt).format('HH:mm')}`
                : 'rascunho pendente'}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Aqueça primeiro</CardTitle>
            <CardDescription className='text-foreground/80'>
              {program.warmup.duration}
            </CardDescription>
          </div>
          <Badge variant='outline'>Essencial</Badge>
        </CardHeader>
        <CardContent>
          <Collapsible>
            <CollapsibleTrigger className='flex w-full items-center justify-between rounded-xl border border-neutral/60 bg-neutral/60 px-4 py-3 text-left text-sm font-semibold shadow-soft'>
              <span>Ver passos do aquecimento</span>
              <Plus className='h-4 w-4' />
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-3 space-y-2 rounded-xl border border-neutral/40 bg-surface px-4 py-3 text-sm text-foreground/90'>
              {program.warmup.items.map((item) => (
                <div key={item} className='flex items-start gap-2'>
                  <div className='mt-1 h-2 w-2 rounded-full bg-foreground' />
                  <span>{item}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          {program.deload.weeks.includes(activeWeek) && (
            <div className='mt-3 flex items-start gap-2 rounded-xl border border-neutral/60 bg-neutral/70 px-4 py-3 text-sm text-foreground/90 shadow-inner shadow-neutral/20'>
              <AlertCircle className='mt-0.5 h-4 w-4 text-foreground' />
              <span>
                Dica de deload: {program.deload.guidance} (
                {program.deload.reductionNote})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {session.exercises.map((exercise) => {
          const targets = targetsByExercise.get(exercise.id) ?? [];
          const state = exerciseState[exercise.id];
          if (!state) return null;
          const lastLogAvailable = lastLogsByExercise.get(exercise.id);
          let cursor = 0;
          return (
            <div
              key={exercise.id}
              className='relative pl-3'
              id={`exercise-${exercise.id}`}
            >
              <span
                className='absolute left-0 top-4 h-full w-[3px] rounded-full bg-gradient-to-b from-accent to-accentSecondary opacity-60'
                aria-hidden
              />
              <Card>
                <CardHeader className='gap-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <CardTitle>{exercise.name}</CardTitle>
                    <Badge variant='muted'>{focusLabels[exercise.focus]}</Badge>
                    {exercise.optionalVolumeBump &&
                      exercise.optionalVolumeBump.weeks.includes(activeWeek) &&
                      settings.recoveryExcellent && (
                        <Badge variant='success'>+1 série ativa</Badge>
                      )}
                  </div>
                  <CardDescription className='flex flex-wrap gap-3 text-xs'>
                    <span>{exercise.rest} de descanso</span>
                    <span>{exercise.rir}</span>
                    {exercise.notes && (
                      <span className='text-foreground/80'>
                        {exercise.notes}
                      </span>
                    )}
                    {exercise.videoUrl && (
                      <Button
                        asChild
                        variant='secondary'
                        size='sm'
                        className='h-9 gap-2 px-3 border-accent text-accent hover:bg-accent hover:text-foreground'
                      >
                        <a
                          href={exercise.videoUrl}
                          target='_blank'
                          rel='noreferrer noopener'
                        >
                          <PlayCircle className='h-4 w-4' />
                          Ver vídeo
                        </a>
                      </Button>
                    )}
                    <Button
                      variant='secondary'
                      size='sm'
                      className='h-9 gap-2 px-3'
                      onClick={() => startRestTimer(exercise.rest)}
                    >
                      <Timer className='h-4 w-4' />
                      Descanso
                    </Button>
                    {lastLogAvailable && (
                      <Button
                        variant='secondary'
                        size='sm'
                        className='h-9 gap-2 px-3'
                        onClick={() => copyLastLog(exercise.id)}
                      >
                        <RefreshCw className='h-4 w-4' />
                        Usar último treino
                      </Button>
                    )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {exercise.imageUrl && (
                <div className='overflow-hidden rounded-xl border border-neutral/40 bg-neutral/70 shadow-soft'>
                  <img
                    src={exercise.imageUrl}
                    alt={`Execução de ${exercise.name}`}
                    className='h-40 w-full object-cover'
                    loading='lazy'
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/thumbs/chest-press.webp';
                    }}
                  />
                </div>
              )}
              <div className='flex flex-wrap gap-2 text-xs'>
                {targets.map((t, idx) => (
                  <Badge key={idx} variant='outline'>
                    {t.label ? `${t.label}: ` : ''}
                    {formatTargetText(t)}
                        {exercise.optionalVolumeBump &&
                          exercise.optionalVolumeBump.weeks.includes(
                            activeWeek
                          ) &&
                          settings.recoveryExcellent &&
                          idx === 0 && (
                            <span className='ml-1 text-[10px]'>(+1 série)</span>
                          )}
                      </Badge>
                    ))}
                  </div>

                  <div className='space-y-2'>
                    {targets.map((target, targetIdx) => {
                      const setsForTarget = state.sets.slice(
                        cursor,
                        cursor + target.targetSets
                      );
                      const startIndex = cursor;
                      cursor += target.targetSets;
                      const unitLabel = target.label
                        ?.toLowerCase()
                        .includes('segundo')
                        ? 'segundos'
                        : 'repetições';
                      const unitLabelDisplay =
                        unitLabel === 'segundos' ? 'Segundos' : 'Repetições';
                      return (
                        <div
                          key={targetIdx}
                          className='rounded-xl border border-neutral/50 bg-neutral/60 px-3 py-3 shadow-inner shadow-neutral/20'
                        >
                          <div className='mb-2 flex items-center justify-between text-sm font-semibold text-foreground'>
                            <div>
                              {target.label ?? 'Séries'} · {target.repRange[0]}–
                              {target.repRange[1]} {unitLabel}
                            </div>
                            <div className='text-xs text-foreground/70'>
                              Séries {startIndex + 1}–
                              {startIndex + target.targetSets}
                            </div>
                          </div>
                          <div className='space-y-2'>
                            {setsForTarget.map((set, idx) => {
                              const absoluteIndex = startIndex + idx;
                              return (
                                <div
                                  key={`${exercise.id}-set-${absoluteIndex}`}
                                  className='grid grid-cols-2 sm:grid-cols-12 items-center gap-2 rounded-lg border border-neutral/10 bg-card px-3 py-2'
                                >
                                  <div className='col-span-2 sm:col-span-3 text-xs font-semibold'>
                                    Série {absoluteIndex + 1}
                                  </div>
                                  <div className='col-span-2 sm:col-span-3'>
                                    <Label className='text-[11px]'>Carga</Label>
                                    <Input
                                      aria-label={`${exercise.name} série ${
                                        absoluteIndex + 1
                                      } carga`}
                                      type='text'
                                      inputMode='decimal'
                                      value={set.weight}
                                      onChange={(e) => {
                                        const validated = validateNumericInput(
                                          e.target.value,
                                          true
                                        );
                                        handleSetChange(
                                          exercise.id,
                                          absoluteIndex,
                                          'weight',
                                          validated === ''
                                            ? 0
                                            : Number(validated)
                                        );
                                      }}
                                    />
                                    <div className='mt-1 flex gap-1 text-[11px]'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2'
                                        onClick={() =>
                                          adjustSetValue(
                                            exercise.id,
                                            absoluteIndex,
                                            'weight',
                                            -2.5
                                          )
                                        }
                                      >
                                        -2.5
                                      </Button>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2'
                                        onClick={() =>
                                          adjustSetValue(
                                            exercise.id,
                                            absoluteIndex,
                                            'weight',
                                            2.5
                                          )
                                        }
                                      >
                                        +2.5
                                      </Button>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2'
                                        onClick={() =>
                                          adjustSetValue(
                                            exercise.id,
                                            absoluteIndex,
                                            'weight',
                                            5
                                          )
                                        }
                                      >
                                        +5
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='col-span-2 sm:col-span-2'>
                                    <Label className='text-[11px]'>
                                      {unitLabelDisplay}
                                    </Label>
                                    <Input
                                      aria-label={`${exercise.name} série ${
                                        absoluteIndex + 1
                                      } ${unitLabel}`}
                                      type='text'
                                      inputMode='numeric'
                                      value={set.reps}
                                      onChange={(e) => {
                                        const validated = validateNumericInput(
                                          e.target.value,
                                          false
                                        );
                                        handleSetChange(
                                          exercise.id,
                                          absoluteIndex,
                                          'reps',
                                          validated === ''
                                            ? 0
                                            : Number(validated)
                                        );
                                      }}
                                    />
                                    <div className='mt-1 flex gap-1 text-[11px]'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2'
                                        onClick={() =>
                                          adjustSetValue(
                                            exercise.id,
                                            absoluteIndex,
                                            'reps',
                                            -1
                                          )
                                        }
                                      >
                                        -1
                                      </Button>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2'
                                        onClick={() =>
                                          adjustSetValue(
                                            exercise.id,
                                            absoluteIndex,
                                            'reps',
                                            1
                                          )
                                        }
                                      >
                                        +1
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='col-span-2 sm:col-span-2'>
                                    <Label className='text-[11px]'>RIR</Label>
                                    <div className='flex items-center gap-2'>
                                      <input
                                        aria-label={`${exercise.name} série ${
                                          absoluteIndex + 1
                                        } RIR`}
                                        type='range'
                                        min={0}
                                        max={5}
                                        step={1}
                                        value={set.rir}
                                        onChange={(e) =>
                                          handleSetChange(
                                            exercise.id,
                                            absoluteIndex,
                                            'rir',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                      <span className='text-xs font-semibold w-6 text-center'>
                                        {set.rir}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='col-span-2 sm:col-span-2 flex items-center gap-2'>
                                    <Button
                                      type='button'
                                      variant='default'
                                      size='sm'
                                      className={cn(
                                        'h-9 px-3 text-xs font-semibold',
                                        set.completed
                                          ? ''
                                          : 'opacity-80 hover:opacity-100'
                                      )}
                                      aria-label={`${exercise.name} série ${
                                        absoluteIndex + 1
                                      } concluída`}
                                      aria-pressed={Boolean(set.completed)}
                                      onClick={() =>
                                        handleSetChange(
                                          exercise.id,
                                          absoluteIndex,
                                          'completed',
                                          !set.completed
                                        )
                                      }
                                    >
                                      {set.completed ? 'Feito' : 'Marcar feito'}
                                    </Button>
                                    {absoluteIndex > 0 && (
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='px-2 text-xs'
                                        onClick={() =>
                                          copyPreviousSet(
                                            exercise.id,
                                            absoluteIndex
                                          )
                                        }
                                      >
                                        Copiar anterior
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => addSet(exercise.id)}
                    aria-label='Adicionar série extra'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Adicionar série
                  </Button>

                  <div className='space-y-1'>
                    <Label className='text-foreground'>Notas</Label>
                    <Textarea
                      aria-label={`${exercise.name} notas`}
                      placeholder='Dicas de técnica, tempo, o que lembrar.'
                      value={state.notes}
                      onChange={(e) =>
                        handleNotesChange(exercise.id, e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <SessionFooter
        progress={progress}
        restRunning={restRunning}
        restSeconds={restSeconds}
        defaultRestText={session.exercises[0]?.rest}
        onStartRest={startRestTimer}
        onResetRest={resetRestTimer}
        onFinish={finishSession}
        onBack={navigateBack}
        formatClock={formatRestClock}
      />
    </div>
  );
}
