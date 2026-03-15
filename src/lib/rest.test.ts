import { describe, expect, it } from 'vitest'
import { formatRestClock, parseRestDuration } from './rest'

describe('parseRestDuration', () => {
  it('interpreta segundos corretamente', () => {
    expect(parseRestDuration('90s')).toBe(90)
    expect(parseRestDuration('60–90s')).toBe(60)
    expect(parseRestDuration('75 seg')).toBe(75)
  })

  it('interpreta minutos corretamente', () => {
    expect(parseRestDuration('2 min')).toBe(120)
    expect(parseRestDuration('2–3 min')).toBe(120)
    expect(parseRestDuration('1,5 min')).toBe(90)
  })

  it('usa fallback para entrada inválida', () => {
    expect(parseRestDuration(undefined)).toBe(90)
    expect(parseRestDuration('abc', 75)).toBe(75)
  })
})

describe('formatRestClock', () => {
  it('formata o relógio em mm:ss', () => {
    expect(formatRestClock(0)).toBe('00:00')
    expect(formatRestClock(90)).toBe('01:30')
  })
})
