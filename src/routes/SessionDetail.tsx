import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { SetRow } from '@/components/SetRow';
import dayjs from 'dayjs';
import {
  BookmarkPlus,
  Check,
  MoreVertical,
  X,
} from 'lucide-react';
import { computeTargetsForWeek, formatTargetText, getWeekInfo } from '@/lib/program';
import { getCurrentWeekNumber } from '@/lib/date';
import { useActiveProgram } from '@/lib/user';
import { useWorkoutStore } from '@/store/workoutStore';
import type { ExerciseLog, SetEntry, SessionType, WorkoutTemplate } from '@/types';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useRestTimer } from '@/hooks/useRestTimer';
import { ExerciseRestSheet } from '@/components/ExerciseRestSheet';
import { ExerciseHero, ExerciseThumb, RestTimerOverlay } from '@/components/redesign';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { exerciseCatalog } from '@/data/exerciseCatalog';

type ExerciseState = {
  sets: SetEntry[];
  notes: string;
};

type SessionFooterProps = {
  progress: { total: number; completed: number; percent: number };
  onFinish: () => void;
  onBack: () => void;
};

const SessionFooter = memo(function SessionFooter({
  progress,
  onFinish,
  onBack,
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
          <div className='flex flex-wrap gap-2'>
            <Button onClick={onFinish} size='lg'>
              <Check className='mr-2 h-5 w-5' />
              Finalizar sessão
            </Button>
            <Button variant='secondary' onClick={onBack}>
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
  const location = useLocation();
  const templateExercisesFromState = (location.state as { exercises?: WorkoutTemplate['exercises'] } | null)?.exercises;
  const isTemplateMode = sessionId === 'template';
  const sessionType = isTemplateMode
    ? null
    : sessionId === undefined
      ? 'A'
      : sessionId === 'A' || sessionId === 'B' || sessionId === 'C'
        ? sessionId
        : null;
  const program = useActiveProgram();
  const settings = useWorkoutStore((s) => s.settings);
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs);
  const logSession = useWorkoutStore((s) => s.logSession);
  const saveTemplate = useWorkoutStore((s) => s.saveTemplate);
  const activeUserId = useWorkoutStore((s) => s.activeUserId);
  const navigate = useNavigate();

  const [exerciseState, setExerciseState] = useState<
    Record<string, ExerciseState>
  >({});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const fallbackWeek = getCurrentWeekNumber(
    settings.programStart,
    program?.durationWeeks
  );
  const parsedWeek = weekParam ? Number(weekParam) : fallbackWeek;
  const hasInvalidWeekParam =
    Number.isNaN(parsedWeek) ||
    parsedWeek < 1 ||
    parsedWeek > (program?.durationWeeks ?? 12);
  const activeWeek = hasInvalidWeekParam ? fallbackWeek : parsedWeek;
  const session = sessionType
    ? (program?.sessions.find((item) => item.id === sessionType) ?? null)
    : null;

  const templateSession = useMemo(() => {
    if (!isTemplateMode || !templateExercisesFromState) return null;
    return {
      id: 'A' as const,
      title: 'Template',
      subtitle: 'Treino via Template',
      exercises: templateExercisesFromState.map((te) => {
        const catalogEntry = exerciseCatalog.find((e) => e.id === te.exerciseId);
        return {
          id: te.exerciseId,
          name: catalogEntry?.name ?? te.exerciseId,
          focus: catalogEntry?.focus ?? ('compound' as const),
          rest: `${te.restSeconds ?? 90}s`,
          rir: '2',
          prescriptions: [] as never[],
        };
      }),
    };
  }, [isTemplateMode, templateExercisesFromState]);

  const effectiveSession = isTemplateMode ? templateSession : session;
  const activeSessionType = (effectiveSession?.id ?? 'A') as SessionType;
  const weekInfo = program ? getWeekInfo(program, activeWeek) : undefined;
  const lastLogsByExercise = useMemo(() => {
    const map = new Map<string, ExerciseLog>();
    exerciseLogs.forEach((log) => {
      if (!map.has(log.exerciseId)) {
        map.set(log.exerciseId, log);
      }
    });
    return map;
  }, [exerciseLogs]);
  // bestWeightByExercise — for PR detection (LOG-04)
  const bestWeightByExercise = useMemo(() => {
    const map = new Map<string, number>()
    exerciseLogs.forEach((log) => {
      const best = log.sets.reduce((max, s) => Math.max(max, s.weight), 0)
      map.set(log.exerciseId, Math.max(map.get(log.exerciseId) ?? 0, best))
    })
    return map
  }, [exerciseLogs])

  const [prBySet, setPrBySet] = useState<Record<string, boolean[]>>({})

  const { active: timerActive, remaining: timerRemaining, start: startTimer, skip: skipTimer } = useRestTimer()
  const exerciseRestConfig = useWorkoutStore((s) => s.settings.exerciseRestConfig)
  const defaultRestSeconds = useWorkoutStore((s) => s.settings.defaultRestSeconds)
  const setExerciseRestSeconds = useWorkoutStore((s) => s.setExerciseRestSeconds)
  const [restSheetExerciseId, setRestSheetExerciseId] = useState<string | null>(null)
  const draftKey = `session-draft-${activeUserId}-${activeSessionType}-${activeWeek}`;
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
    if (!effectiveSession) return map;
    effectiveSession.exercises.forEach((exercise) => {
      map.set(
        exercise.id,
        computeTargetsForWeek(exercise, activeWeek, settings.recoveryExcellent),
      );
    });
    return map;
  }, [activeWeek, effectiveSession, settings.recoveryExcellent]);

  const generateTemplateName = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const now = new Date();
    return `Treino ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  };

  const initialExerciseState = useMemo(() => {
    if (isTemplateMode && templateExercisesFromState) {
      const nextState: Record<string, ExerciseState> = {};
      templateExercisesFromState.forEach((te) => {
        nextState[te.exerciseId] = {
          sets: te.defaultSets.map((s) => ({ ...s, completed: false })),
          notes: '',
        };
      });
      return nextState;
    }
    if (!effectiveSession) return {};
    const nextState: Record<string, ExerciseState> = {};
    effectiveSession.exercises.forEach((ex) => {
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
    isTemplateMode,
    templateExercisesFromState,
    lastLogsByExercise,
    effectiveSession,
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

  const { lastSavedAt } = useDraftAutosave(draftKey, exerciseState, {
    delayMs: 500,
    enabled:
      hasUnsaved &&
      !celebrating &&
      Object.keys(exerciseState).length > 0 &&
      Boolean(effectiveSession),
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
    // Auto-start rest timer on set completion (D-11, LOG-05)
    if (field === 'completed' && value === true) {
      const restSecs = (exerciseRestConfig && exerciseRestConfig[exerciseId]) ?? defaultRestSeconds ?? 90
      startTimer(restSecs)

      // PR detection (LOG-04)
      const currentSet = exerciseState[exerciseId]?.sets[setIndex]
      const best = bestWeightByExercise.get(exerciseId) ?? 0
      if (currentSet && currentSet.weight > best) {
        setPrBySet((prevPr) => {
          const exercisePrs = [...(prevPr[exerciseId] ?? [])]
          exercisePrs[setIndex] = true
          return { ...prevPr, [exerciseId]: exercisePrs }
        })
      }

      // Auto-advance focus (LOG-03) — scans all exercises in session order
      requestAnimationFrame(() => {
        if (!effectiveSession) return
        for (const ex of effectiveSession.exercises) {
          const state = exerciseState[ex.id]
          if (!state) continue
          for (let i = 0; i < state.sets.length; i++) {
            if (!state.sets[i].completed) {
              if (ex.id !== exerciseId || i > setIndex) {
                document.getElementById(`set-input-${ex.id}-${i}`)?.focus()
                return
              }
            }
          }
        }
      })
    }
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

  const addSet = (exerciseId: string) => {
    setExerciseState((prev) => {
      const current = prev[exerciseId];
      if (!current) return prev;
      if (!effectiveSession) return prev;
      const exercise = effectiveSession.exercises.find((e) => e.id === exerciseId);
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

  const finishSession = async () => {
    if (!effectiveSession) return;
    try {
      const workoutDate = dayjs().toISOString();
      await logSession({
        workout: {
          date: workoutDate,
          weekNumber: activeWeek,
          sessionType: activeSessionType,
          deload: program?.deload.weeks.includes(activeWeek) ?? false,
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

  const exercises = useMemo(
    () => effectiveSession?.exercises ?? [],
    [effectiveSession],
  );

  // Determine active exercise index: first exercise with at least one uncompleted set
  // (must be above the early return to satisfy rules-of-hooks)
  const activeIndex = useMemo(() => {
    for (let i = 0; i < exercises.length; i++) {
      const state = exerciseState[exercises[i].id];
      if (state && state.sets.some((s) => !s.completed)) return i;
    }
    return exercises.length > 0 ? exercises.length - 1 : 0;
  }, [exercises, exerciseState]);

  const activeExercise = exercises[activeIndex] ?? null;
  const upcoming = exercises.slice(activeIndex + 1, activeIndex + 3);

  const sessionLabel = effectiveSession?.subtitle ?? `Sessão ${effectiveSession?.id ?? ''}`;
  const sessionSubtitle = `Semana ${activeWeek}${weekInfo ? ` · ${weekInfo.phase}` : ''}`;

  const restTarget = activeExercise
    ? ((exerciseRestConfig && exerciseRestConfig[activeExercise.id]) ?? defaultRestSeconds ?? 90)
    : (defaultRestSeconds ?? 90);

  if ((!effectiveSession || hasInvalidWeekParam || !sessionType) && !isTemplateMode) {
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
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => {
                    setTemplateName(generateTemplateName());
                    setSaveTemplateOpen(true);
                  }}
                >
                  <BookmarkPlus className='mr-1 h-4 w-4' />
                  Salvar como Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className='bg-surface border-neutral/50 max-w-sm'>
          <DialogHeader>
            <DialogTitle>Salvar como Template</DialogTitle>
          </DialogHeader>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder='Nome do treino...'
            className='min-h-[44px]'
          />
          <div className='flex gap-2 mt-3'>
            <Button
              className='flex-1 min-h-[44px]'
              disabled={!templateName.trim()}
              onClick={async () => {
                const templateExercises = Object.entries(exerciseState).map(([exerciseId, state]) => ({
                  exerciseId,
                  restSeconds: settings.exerciseRestConfig?.[exerciseId] ?? settings.defaultRestSeconds,
                  defaultSets: state.sets.map((s) => ({
                    weight: Number.isFinite(s.weight) ? Number(s.weight) : 0,
                    reps: Number.isFinite(s.reps) ? Number(s.reps) : 0,
                    rir: Number.isFinite(s.rir) ? Number(s.rir) : 0,
                    completed: false,
                  })),
                }));
                await saveTemplate({ userId: activeUserId, name: templateName.trim(), exercises: templateExercises });
                setSaveTemplateOpen(false);
                toast({ title: 'Template salvo com sucesso.' });
              }}
            >
              Salvar Template
            </Button>
            <Button variant='ghost' className='min-h-[44px]' onClick={() => setSaveTemplateOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top bar */}
      <header className='flex items-center justify-between'>
        <button
          type='button'
          onClick={navigateBack}
          aria-label='Fechar sessão'
          className='text-txt-faint'
        >
          <X className='h-5 w-5' />
        </button>
        <div className='text-center'>
          <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
            {sessionLabel}
          </div>
          <div className='mt-0.5 text-sm font-medium'>{sessionSubtitle}</div>
        </div>
        <button type='button' aria-label='Mais opções' className='text-txt-faint'>
          <MoreVertical className='h-5 w-5' />
        </button>
      </header>

      {hasUnsaved && (
        <div className='text-center text-[10px] text-txt-faint'>
          {lastSavedAt
            ? `rascunho salvo ${dayjs(lastSavedAt).format('HH:mm')}`
            : 'rascunho pendente'}
        </div>
      )}

      {/* Exercise progress segments */}
      <div className='flex gap-1'>
        {exercises.map((ex, i) => {
          const segState =
            i < activeIndex ? 'done' : i === activeIndex ? 'current' : 'future';
          const cls =
            segState === 'done'
              ? 'bg-lime'
              : segState === 'current'
              ? 'bg-lime opacity-50'
              : 'bg-bg-1';
          return <div key={ex.id} className={`h-[3px] flex-1 rounded-[2px] ${cls}`} />;
        })}
      </div>

      <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
        Exercício {activeIndex + 1} de {exercises.length}
      </div>

      {activeExercise && (
        <>
          <ExerciseHero
            name={activeExercise.name}
            prescription={
              (() => {
                const targets = targetsByExercise.get(activeExercise.id) ?? [];
                if (!targets.length) return undefined;
                return targets.map((t) => formatTargetText(t)).join(' · ');
              })()
            }
            imageUrl={'imageUrl' in activeExercise ? activeExercise.imageUrl : undefined}
            videoUrl={'videoUrl' in activeExercise ? activeExercise.videoUrl : undefined}
            ratio='16-10'
          />

          {/* Sets */}
          <div className='rounded-card bg-bg-1'>
            <div
              className='grid gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-txt-faint'
              style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}
            >
              <span>Set</span>
              <span>Kg</span>
              <span>Reps</span>
              <span />
            </div>
            {(() => {
              const state = exerciseState[activeExercise.id];
              if (!state) return null;
              return state.sets.map((set, absoluteIndex) => {
                const lastLog = lastLogsByExercise.get(activeExercise.id);
                const isActive = !set.completed;
                return (
                  <SetRow
                    key={`${activeExercise.id}-set-${absoluteIndex}`}
                    exerciseId={activeExercise.id}
                    absoluteIndex={absoluteIndex}
                    set={set}
                    previousSet={lastLog?.sets[absoluteIndex]}
                    unitLabel='repetições'
                    unitLabelDisplay='Repetições'
                    hasPr={prBySet[activeExercise.id]?.[absoluteIndex] ?? false}
                    isActive={isActive}
                    onSetChange={(field, value) => handleSetChange(activeExercise.id, absoluteIndex, field, value)}
                    onAdjust={(field, delta) => adjustSetValue(activeExercise.id, absoluteIndex, field, delta)}
                    onCopyPrevious={() => copyPreviousSet(activeExercise.id, absoluteIndex)}
                  />
                );
              });
            })()}
          </div>

          <button
            type='button'
            onClick={() => addSet(activeExercise.id)}
            className='w-full rounded-card border-[1.5px] border-dashed border-txt-faint p-3 text-[12px] uppercase tracking-[0.15em] text-txt-faint'
          >
            + adicionar série
          </button>
        </>
      )}

      {/* Up next */}
      {upcoming.length > 0 && (
        <section>
          <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
            Próximo
          </h2>
          <div className='space-y-1.5'>
            {upcoming.map((u) => {
              const uTargets = targetsByExercise.get(u.id) ?? [];
              const prescriptionShort = uTargets.length
                ? formatTargetText(uTargets[0])
                : u.rest;
              return (
                <div key={u.id} className='flex items-center gap-2.5 rounded-card bg-bg-1 p-2.5 opacity-70'>
                  <ExerciseThumb src={'imageUrl' in u ? u.imageUrl : undefined} alt={u.name} />
                  <div className='flex-1'>
                    <div className='text-[13px] font-medium'>{u.name}</div>
                    <div className='mt-0.5 text-[9px] uppercase tracking-[0.15em] text-txt-faint'>
                      {prescriptionShort}
                    </div>
                  </div>
                  <span className='text-sm text-txt-faint'>›</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <RestTimerOverlay
        remaining={timerActive ? timerRemaining : null}
        target={restTarget}
        onStop={skipTimer}
      />

      <SessionFooter
        progress={progress}
        onFinish={finishSession}
        onBack={navigateBack}
      />
      <ExerciseRestSheet
        open={restSheetExerciseId !== null}
        onOpenChange={(open) => { if (!open) setRestSheetExerciseId(null) }}
        currentSeconds={restSheetExerciseId ? ((exerciseRestConfig && exerciseRestConfig[restSheetExerciseId]) ?? defaultRestSeconds ?? 90) : (defaultRestSeconds ?? 90)}
        onSave={(seconds) => {
          if (restSheetExerciseId) {
            setExerciseRestSeconds(restSheetExerciseId, seconds)
          }
        }}
      />
    </div>
  );
}
