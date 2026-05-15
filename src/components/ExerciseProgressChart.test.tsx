import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ExerciseProgressChart } from './ExerciseProgressChart'
import type { ChartDatum } from './ExerciseProgressChart'

const sampleData: ChartDatum[] = [
  { date: 'Jan 1', volume: 1000, topWeight: 80, e1rm: 90 },
  { date: 'Jan 8', volume: 1200, topWeight: 85, e1rm: 96 },
]

describe('ExerciseProgressChart', () => {
  it('renders without crashing for metric=volume', () => {
    const { container } = render(<ExerciseProgressChart chartData={sampleData} metric="volume" />)
    // Recharts renders a recharts-wrapper div in jsdom
    expect(container.firstChild).toBeTruthy()
  })

  it('renders without crashing for metric=topWeight', () => {
    const { container } = render(<ExerciseProgressChart chartData={sampleData} metric="topWeight" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders without crashing for metric=e1rm', () => {
    const { container } = render(<ExerciseProgressChart chartData={sampleData} metric="e1rm" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with empty chartData without crashing', () => {
    const { container } = render(<ExerciseProgressChart chartData={[]} metric="volume" />)
    expect(container.firstChild).toBeTruthy()
  })
})
