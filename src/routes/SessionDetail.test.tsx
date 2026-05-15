import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import SessionDetail from './SessionDetail'
import { useWorkoutStore } from '@/store/workoutStore'
import type { ExerciseLog } from '@/types'

const initialStore = useWorkoutStore.getState()

const makeExerciseLog = (exerciseId: string, weights: number[]): ExerciseLog => ({
  id: `log-${exerciseId}`,
  workoutId: 'workout-hist',
  exerciseId,
  sets: weights.map((w) => ({ weight: w, reps: 8, rir: 2, completed: true })),
  date: dayjs().subtract(7, 'day').toISOString(),
  weekNumber: 1,
  sessionType: 'A',
  userId: 'dani',
})

describe('SessionDetail integration', () => {
  beforeEach(() => {
    localStorage.clear()
    useWorkoutStore.setState(initialStore, true)
    useWorkoutStore.setState({
      loading: false,
      error: null,
      activeUserId: 'dani',
      workouts: [],
      exerciseLogs: [],
      settings: {
        recoveryExcellent: false,
        programStart: dayjs().startOf('week').add(1, 'day').toISOString(),
        defaultRestSeconds: 90,
        exerciseRestConfig: {},
      },
      logSession: vi.fn(async () => 'workout-1'),
    })
  })

  const renderSession = () =>
    render(
      <MemoryRouter initialEntries={['/week', '/session/A/1']} initialIndex={1}>
        <Routes>
          <Route path='/week' element={<div>Página Semana</div>} />
          <Route path='/session/:sessionId/:weekNumber?' element={<SessionDetail />} />
        </Routes>
      </MemoryRouter>,
    )

  it('marca rascunho pendente ao adicionar série', async () => {
    const user = userEvent.setup()
    renderSession()

    const addSetButtons = await screen.findAllByRole('button', {
      name: /adicionar série/i,
    })
    await user.click(addSetButtons[0])

    expect(await screen.findByText(/rascunho/i)).toBeInTheDocument()
  })

  it('bloqueia navegação interna quando há alterações não salvas', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => false)

    renderSession()

    const addSetButtons = await screen.findAllByRole('button', {
      name: /adicionar série/i,
    })
    await user.click(addSetButtons[0])

    await user.click(screen.getByRole('button', { name: /voltar/i }))

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: /fechar sessão/i })).toBeInTheDocument()

    confirmSpy.mockRestore()
  })

  it('PR badge aparece quando peso supera melhor histórico', async () => {
    const user = userEvent.setup()
    // hack-squat is the first exercise in session A of treinoDani
    useWorkoutStore.setState({
      exerciseLogs: [makeExerciseLog('hack-squat', [60, 60, 60])],
    })

    renderSession()

    // Wait for render, then target hack-squat set 0 by element id
    await waitFor(() => {
      expect(document.getElementById('set-input-hack-squat-0')).toBeTruthy()
    })
    const weightInput = document.getElementById('set-input-hack-squat-0') as HTMLInputElement
    await user.clear(weightInput)
    await user.type(weightInput, '65')

    // Click complete on first set of hack-squat (aria-label: "série 1 concluída")
    // There are multiple "série 1 concluída" buttons — target the one inside hack-squat by id
    const completeBtn = weightInput.closest('.grid')?.querySelector('button[aria-label="série 1 concluída"]') as HTMLElement
    expect(completeBtn).toBeTruthy()
    await user.click(completeBtn)

    await waitFor(() => {
      expect(screen.getByText('PR!')).toBeInTheDocument()
    })
  })

  it('PR badge não aparece em empate com melhor histórico', async () => {
    const user = userEvent.setup()
    useWorkoutStore.setState({
      exerciseLogs: [makeExerciseLog('hack-squat', [60, 60, 60])],
    })

    renderSession()

    await waitFor(() => {
      expect(document.getElementById('set-input-hack-squat-0')).toBeTruthy()
    })
    const weightInput = document.getElementById('set-input-hack-squat-0') as HTMLInputElement
    await user.clear(weightInput)
    await user.type(weightInput, '60')

    const completeBtn = weightInput.closest('.grid')?.querySelector('button[aria-label="série 1 concluída"]') as HTMLElement
    expect(completeBtn).toBeTruthy()
    await user.click(completeBtn)

    await waitFor(() => {
      expect(screen.queryByText('PR!')).toBeNull()
    })
  })

  it('auto-advance foca próxima série incompleta ao completar uma série', async () => {
    const user = userEvent.setup()
    renderSession()

    // Complete set 0 of hack-squat — focus should move to set-input-hack-squat-1
    await waitFor(() => {
      expect(document.getElementById('set-input-hack-squat-0')).toBeTruthy()
    })
    const weightInput = document.getElementById('set-input-hack-squat-0') as HTMLInputElement
    const completeBtn = weightInput.closest('.grid')?.querySelector('button[aria-label="série 1 concluída"]') as HTMLElement
    expect(completeBtn).toBeTruthy()
    await user.click(completeBtn)

    await waitFor(() => {
      const nextInput = document.getElementById('set-input-hack-squat-1')
      expect(nextInput).toBeTruthy()
      expect(document.activeElement).toBe(nextInput)
    })
  })
})
