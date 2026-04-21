import { describe, expect, it } from 'vitest'
import { epley } from './epley'

describe('epley', () => {
  it('calculates 1RM for normal inputs', () => {
    expect(epley(80, 10)).toBe(107)
    expect(epley(100, 1)).toBe(103)
  })

  it('returns 0 when weight is 0', () => {
    expect(epley(0, 10)).toBe(0)
  })

  it('returns 0 when reps is 0', () => {
    expect(epley(80, 0)).toBe(0)
  })

  it('calculates 1RM for other valid inputs', () => {
    expect(epley(60, 5)).toBe(70)
  })
})
