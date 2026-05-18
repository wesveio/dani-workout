import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders label with current/total and percent fill', () => {
    render(<ProgressBar current={3} total={12} label='Programa' />)
    expect(screen.getByText('Programa')).toBeInTheDocument()
    expect(screen.getByText('Semana 3 / 12')).toBeInTheDocument()
    const fill = screen.getByTestId('progressbar-fill')
    expect(fill.style.width).toBe('25%')
  })

  it('clamps to 0–100 when current exceeds total', () => {
    render(<ProgressBar current={15} total={12} label='X' />)
    expect(screen.getByTestId('progressbar-fill').style.width).toBe('100%')
  })
})
