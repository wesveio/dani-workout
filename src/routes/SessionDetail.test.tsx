import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import SessionDetail from './SessionDetail'
import { useWorkoutStore } from '@/store/workoutStore'

const initialStore = useWorkoutStore.getState()

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
    expect(screen.getByText(/sessão a/i)).toBeInTheDocument()

    confirmSpy.mockRestore()
  })
})
