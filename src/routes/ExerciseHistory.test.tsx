import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import ExerciseHistory from './ExerciseHistory'
import { useWorkoutStore } from '@/store/workoutStore'

// Mock useActiveProgram to return a program with a known exercise
vi.mock('@/lib/user', () => ({
  useActiveProgram: () => ({
    weeks: [
      {
        sessions: [
          {
            exercises: [
              {
                id: 'ex-1',
                name: 'Supino',
                focus: 'chest',
                rest: '90s',
                videoUrl: null,
              },
            ],
          },
        ],
      },
    ],
  }),
}))

// Mock findExerciseById and focusLabels
vi.mock('@/lib/program', () => ({
  findExerciseById: (_program: unknown, exerciseId: string) => {
    if (exerciseId === 'ex-1') {
      return { id: 'ex-1', name: 'Supino', focus: 'chest', rest: '90s', videoUrl: null }
    }
    return undefined
  },
  focusLabels: { chest: 'Peito' },
}))

const initialStore = useWorkoutStore.getState()

const sampleLogs = [
  {
    id: 'log-1',
    workoutId: 'w-1',
    exerciseId: 'ex-1',
    sets: [
      { weight: 80, reps: 8, rir: 2, completed: true },
      { weight: 75, reps: 10, rir: 1, completed: true },
    ],
    notes: '',
    date: dayjs().subtract(7, 'day').toISOString(),
    weekNumber: 1,
    sessionType: 'A' as const,
    userId: 'dani',
  },
]

describe('ExerciseHistory', () => {
  beforeEach(() => {
    useWorkoutStore.setState(initialStore, true)
    useWorkoutStore.setState({
      loading: false,
      error: null,
      activeUserId: 'dani',
      workouts: [],
      exerciseLogs: sampleLogs,
      settings: {
        recoveryExcellent: false,
        programStart: dayjs().startOf('week').add(1, 'day').toISOString(),
        defaultRestSeconds: 90,
        exerciseRestConfig: {},
      },
    })
  })

  const renderHistory = (exerciseId = 'ex-1') =>
    render(
      <MemoryRouter initialEntries={[`/history/${exerciseId}`]}>
        <Routes>
          <Route path="/history/:exerciseId" element={<ExerciseHistory />} />
        </Routes>
      </MemoryRouter>,
    )

  it('renders PR summary row with "Melhor carga:" when logs exist', async () => {
    renderHistory()
    expect(await screen.findByText('Melhor carga:')).toBeInTheDocument()
  })

  it('renders metric tab triggers: Volume, Carga, 1RM Est.', async () => {
    renderHistory()
    expect(await screen.findByRole('tab', { name: 'Volume' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Carga' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '1RM Est.' })).toBeInTheDocument()
  })

  it('renders "Maior volume:" in PR summary when logs exist', async () => {
    renderHistory()
    expect(await screen.findByText('Maior volume:')).toBeInTheDocument()
  })

  it('renders "Ainda sem registros." when no logs exist for exercise', async () => {
    useWorkoutStore.setState({ exerciseLogs: [] })
    renderHistory()
    expect(await screen.findByText('Ainda sem registros.')).toBeInTheDocument()
  })

  it('renders exercise name heading', async () => {
    renderHistory()
    expect(await screen.findByText('Supino')).toBeInTheDocument()
  })
})
