import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
import { useActiveProgram } from '@/lib/user'
import { useWorkoutStore } from '@/store/workoutStore'
import { ExerciseThumb, Sparkline } from '@/components/redesign'
import type { SessionTemplate } from '@/data/programTypes'

type Group = 'TODOS' | 'PUSH' | 'PULL' | 'LEGS'

// Map session id to group: A→LEGS, B→PUSH, C→PULL
const sessionGroupMap: Record<SessionTemplate['id'], Group> = {
  A: 'LEGS',
  B: 'PUSH',
  C: 'PULL',
}

const groups: Group[] = ['TODOS', 'PUSH', 'PULL', 'LEGS']

export default function Progress() {
  const exerciseLogs = useWorkoutStore((s) => s.exerciseLogs)
  const program = useActiveProgram()
  const [filter, setFilter] = useState<Group>('TODOS')
  const [q, setQ] = useState('')

  const exercises = useMemo(
    () =>
      program.sessions.flatMap((s) =>
        s.exercises.map((e) => ({ ...e, group: sessionGroupMap[s.id] ?? 'LEGS' })),
      ),
    [program.sessions],
  )

  const logsByExercise = useMemo(() => {
    const map = new Map<string, typeof exerciseLogs>()
    for (const log of exerciseLogs) {
      const list = map.get(log.exerciseId)
      if (list) {
        list.push(log)
      } else {
        map.set(log.exerciseId, [log])
      }
    }
    return map
  }, [exerciseLogs])

  const enriched = useMemo(
    () =>
      exercises.map((exercise) => {
        const logs = (logsByExercise.get(exercise.id) ?? []).sort(
          (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
        )
        // PR: best single set weight
        let prWeight = 0
        let prReps = 0
        for (const log of logs) {
          for (const set of log.sets) {
            if (set.weight > prWeight || (set.weight === prWeight && set.reps > prReps)) {
              prWeight = set.weight
              prReps = set.reps
            }
          }
        }
        // Last 7 sessions' top weights for sparkline
        const history = logs.slice(-7).map((log) =>
          log.sets.reduce((max, s) => Math.max(max, s.weight), 0),
        )
        return {
          ...exercise,
          prWeight,
          prReps,
          sessionCount: logs.length,
          history,
        }
      }),
    [exercises, logsByExercise],
  )

  const visible = useMemo(
    () =>
      enriched
        .filter((e) => filter === 'TODOS' || e.group === filter)
        .filter((e) => e.name.toLowerCase().includes(q.toLowerCase())),
    [enriched, filter, q],
  )

  return (
    <div className="space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-[0.18em] text-txt-faint">
          Progresso por exercício
        </div>
        <h1 className="mt-1 text-[22px] font-normal tracking-tight">Histórico</h1>
      </header>

      <div className="flex items-center gap-2 rounded-card border border-line px-3 py-2">
        <Search className="h-4 w-4 text-txt-faint" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar exercício…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-txt-faint"
        />
      </div>

      <div className="flex gap-1.5">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.1em] ${
              filter === g ? 'bg-lime font-semibold text-black' : 'bg-bg-1 text-txt-dim'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((e) => (
          <Link
            key={e.id}
            to={`/exercise/${e.id}`}
            className="flex items-center gap-3 rounded-card bg-bg-1 p-3"
          >
            <ExerciseThumb src={e.imageUrl} alt={e.name} size="tall" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium tracking-tight">{e.name}</h3>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-txt-faint">
                {e.prWeight > 0
                  ? `PR ${e.prWeight}kg × ${e.prReps} · ${e.sessionCount} sessões`
                  : `${e.sessionCount} sessões`}
              </div>
            </div>
            <Sparkline values={e.history} className="w-[60px]" />
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="py-8 text-center text-sm text-txt-faint">Nenhum exercício encontrado.</div>
        )}
      </div>
    </div>
  )
}
