import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrBadge } from './PrBadge'

describe('PrBadge', () => {
  it('renders PR! text', () => {
    render(<PrBadge />)
    expect(screen.getByText('PR!')).toBeTruthy()
  })

  it('renders a Trophy svg icon', () => {
    const { container } = render(<PrBadge />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('has aria-live="polite" on the container', () => {
    const { container } = render(<PrBadge />)
    const span = container.querySelector('[aria-live="polite"]')
    expect(span).toBeTruthy()
  })
})
