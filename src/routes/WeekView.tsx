import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PhaseStrip, ExerciseThumb, MiniBars } from '@/components/redesign';
import { getCurrentWeekNumber } from '@/lib/date';
import { getSessionTemplate, getPhaseForWeek } from '@/lib/program';
import { useActiveProgram } from '@/lib/user';
import { useWorkoutStore } from '@/store/workoutStore';

export default function WeekView() {
  const settings = useWorkoutStore((s) => s.settings);
  const program = useActiveProgram();
  const workouts = useWorkoutStore((s) => s.workouts);
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs);

  const totalWeeks = program?.durationWeeks ?? 12;
  const currentWeek = program
    ? getCurrentWeekNumber(settings.programStart, program.durationWeeks)
    : 1;

  const [week, setWeek] = useState(currentWeek);

  useEffect(() => {
    setWeek(currentWeek);
  }, [currentWeek]);

  // Scope logs to the current program cycle so a restart doesn't surface old-cycle data
  const programStart = settings.programStart;
  const cycleWorkouts = useMemo(
    () => workouts.filter((w) => w.date >= programStart),
    [workouts, programStart],
  );
  const cycleExerciseLogs = useMemo(
    () => exerciseLogs.filter((l) => l.date >= programStart),
    [exerciseLogs, programStart],
  );

  // Sessions for the selected week: one entry per schedule day
  const sessions = useMemo(() => {
    if (!program) return [];
    return program.schedule.map((day) => {
      const session = getSessionTemplate(program, day.sessionId);
      const weeklyWorkout = cycleWorkouts.find(
        (w) => w.weekNumber === week && w.sessionType === session.id
      );
      const totalSets = session.exercises.reduce((sum, ex) => {
        const p = ex.prescriptions.find(
          (pr) => week >= pr.weekRange[0] && week <= pr.weekRange[1]
        );
        const targets = p?.targets ?? ex.prescriptions[0]?.targets ?? [];
        return sum + targets.reduce((s, t) => s + t.sets, 0);
      }, 0);
      const exercisePreviews = session.exercises.map((ex) => ({
        name: ex.name,
        imageUrl: ex.imageUrl,
      }));
      return {
        id: `${day.day}-${session.id}`,
        code: session.id,
        title: session.title,
        dayName: day.day,
        exerciseCount: session.exercises.length,
        done: !!weeklyWorkout,
        totalSets,
        exercisePreviews,
        isToday: week === currentWeek,
      };
    });
  }, [program, week, cycleWorkouts, currentWeek]);

  // Volume per week: sum of weight × reps for completed sets
  const volumeByWeek = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, i) => {
      const wn = i + 1;
      const logsForWeek = cycleExerciseLogs.filter((l) => l.weekNumber === wn);
      return logsForWeek.reduce((total, log) => {
        return (
          total +
          log.sets.reduce((s, set) => {
            return s + (set.completed ? set.weight * set.reps : 0);
          }, 0)
        );
      }, 0);
    });
  }, [cycleExerciseLogs, totalWeeks]);

  if (!program) return null;

  const phases = program.phases;

  return (
    <div className='space-y-5'>
      <header className='flex items-end justify-between'>
        <div>
          <div className='text-[10px] uppercase tracking-[0.18em] text-txt-faint'>
            Programa · {totalWeeks} sem.
          </div>
          <h1 className='mt-1 text-[22px] font-normal tracking-tight'>
            Semana <span className='num'>{week}</span>
          </h1>
        </div>
        <div className='flex items-center gap-2 text-txt-faint'>
          <button
            onClick={() => setWeek(Math.max(1, week - 1))}
            aria-label='Semana anterior'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <span className='num text-sm text-txt'>{String(week).padStart(2, '0')}</span>
          <button
            onClick={() => setWeek(Math.min(totalWeeks, week + 1))}
            aria-label='Próxima semana'
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      </header>

      <PhaseStrip total={totalWeeks} current={week} />
      {phases.length > 0 && (
        <div className='-mt-3 flex justify-between text-[9px] uppercase tracking-[0.15em] text-txt-faint'>
          {phases.map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
        </div>
      )}

      {getPhaseForWeek(program, week) && (
        <div className='text-xs text-txt-faint'>
          {getPhaseForWeek(program, week)?.description}
        </div>
      )}

      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Sessões
        </h2>
        <div className='space-y-2'>
          {sessions.map((s) => (
            <Link
              key={s.id}
              to={`/session/${s.code}/${week}`}
              className={`block rounded-[12px] bg-bg-1 p-3.5 ${s.isToday ? 'border border-lime' : ''}`}
            >
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='text-base font-medium tracking-tight'>
                    Treino {s.code} · {s.title}
                    {s.isToday && <span className='ml-1 text-lime'>●</span>}
                  </h3>
                  <div className='mt-1 text-[10px] uppercase tracking-[0.15em] text-txt-faint'>
                    {s.dayName} · {s.exerciseCount} exercícios
                    {s.isToday && ' · hoje'}
                  </div>
                </div>
                <span className='rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-txt-dim'>
                  {s.done ? '✓ feito' : `${s.totalSets} séries`}
                </span>
              </div>
              <div className='mt-2 flex gap-1 overflow-hidden'>
                {s.exercisePreviews.slice(0, 6).map((ex, i) => (
                  <ExerciseThumb key={i} src={ex.imageUrl} alt={ex.name} size='sm' />
                ))}
                {s.exercisePreviews.length > 6 && (
                  <span className='self-center text-[10px] tracking-wider text-txt-faint'>
                    +{s.exercisePreviews.length - 6}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Volume semanal
        </h2>
        <div className='rounded-card bg-bg-1 p-3.5'>
          <MiniBars values={volumeByWeek} current={week - 1} />
        </div>
      </section>
    </div>
  );
}
