import { describe, expect, it, vi } from 'vitest'
import { playChime } from './audio'

describe('playChime', () => {
  it('does not throw when AudioContext is unavailable', () => {
    const original = globalThis.AudioContext
    // @ts-expect-error -- deliberately removing for test
    delete globalThis.AudioContext
    expect(() => playChime()).not.toThrow()
    globalThis.AudioContext = original
  })

  it('creates AudioContext inside the call', () => {
    const mockOsc = { connect: vi.fn(), type: '', frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() }
    const mockGain = { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } }
    const mockCtx = { createOscillator: vi.fn(() => mockOsc), createGain: vi.fn(() => mockGain), destination: {}, currentTime: 0 }
    const spy = vi.fn(() => mockCtx)
    globalThis.AudioContext = spy as unknown as typeof AudioContext
    playChime()
    expect(spy).toHaveBeenCalledOnce()
    // Restore
    delete (globalThis as Record<string, unknown>).AudioContext
  })
})
