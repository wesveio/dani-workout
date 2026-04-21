import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRestTimer } from './useRestTimer'

describe('useRestTimer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('starts with active=false and remaining=0', () => {
    const { result } = renderHook(() => useRestTimer())
    expect(result.current.active).toBe(false)
    expect(result.current.remaining).toBe(0)
  })

  it('start(90) sets active=true and remaining=90', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => { result.current.start(90) })
    expect(result.current.active).toBe(true)
    expect(result.current.remaining).toBe(90)
  })

  it('skip() stops the timer', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => { result.current.start(90) })
    act(() => { result.current.skip() })
    expect(result.current.active).toBe(false)
  })

  it('remaining decreases after time passes (Date.now delta)', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => { result.current.start(90) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.remaining).toBeLessThanOrEqual(86)
    expect(result.current.remaining).toBeGreaterThanOrEqual(84)
  })

  it('timer expires when remaining reaches 0', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => { result.current.start(3) })
    act(() => { vi.advanceTimersByTime(4000) })
    expect(result.current.active).toBe(false)
    expect(result.current.remaining).toBe(0)
  })

  it('returns duration alongside remaining', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => { result.current.start(90) })
    expect(result.current.duration).toBe(90)
  })
})
