import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SetRow } from './SetRow'
import type { SetEntry } from '@/types'

type SetRowProps = {
  exerciseId: string
  absoluteIndex: number
  set: SetEntry
  previousSet?: SetEntry
  unitLabel: string
  unitLabelDisplay: string
  onSetChange: (field: keyof SetEntry, value: number | boolean) => void
  onAdjust: (field: 'weight' | 'reps' | 'rir', delta: number) => void
  onCopyPrevious?: () => void
  hasPr: boolean
}

const defaultProps: SetRowProps = {
  exerciseId: 'bench-press',
  absoluteIndex: 0,
  set: { weight: 80, reps: 10, rir: 2, completed: false },
  unitLabel: 'reps',
  unitLabelDisplay: 'Reps',
  onSetChange: vi.fn(),
  onAdjust: vi.fn(),
  hasPr: false,
}

describe('SetRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders weight input with value 80', () => {
    render(<SetRow {...defaultProps} />)
    expect(screen.getByDisplayValue('80')).toBeTruthy()
  })

  it('renders reps input with value 10', () => {
    render(<SetRow {...defaultProps} />)
    expect(screen.getByDisplayValue('10')).toBeTruthy()
  })

  it('renders ghost values when previousSet is provided', () => {
    render(
      <SetRow
        {...defaultProps}
        previousSet={{ weight: 60, reps: 8, rir: 2, completed: true }}
      />
    )
    expect(screen.getByText(/Ant: 60 kg/)).toBeTruthy()
    expect(screen.getByText(/Ant: 8/)).toBeTruthy()
  })

  it('does not render ghost values when previousSet is undefined', () => {
    render(<SetRow {...defaultProps} />)
    expect(screen.queryByText(/Ant:/)).toBeNull()
  })

  it('renders PrBadge when hasPr is true', () => {
    render(<SetRow {...defaultProps} hasPr={true} />)
    expect(screen.getByText('PR!')).toBeTruthy()
  })

  it('does not render PrBadge when hasPr is false', () => {
    render(<SetRow {...defaultProps} hasPr={false} />)
    expect(screen.queryByText('PR!')).toBeNull()
  })

  it('weight input has correct id', () => {
    const { container } = render(<SetRow {...defaultProps} />)
    const input = container.querySelector('#set-input-bench-press-0')
    expect(input).toBeTruthy()
  })
})
