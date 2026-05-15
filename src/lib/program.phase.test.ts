import { describe, expect, it } from 'vitest';
import { getPhaseForWeek } from './program';
import type { Program } from '@/data/programTypes';

const program = {
  name: 'Demo',
  durationWeeks: 12,
  phases: [
    { label: 'Fase 1 · Volume', weeks: [1, 2, 3, 4, 5, 6], description: '' },
    { label: 'Fase 2 · Força', weeks: [7, 8, 9, 10, 11, 12], description: '' },
  ],
  weeks: [],
  schedule: [],
  sessions: [],
  warmup: { duration: '', items: [] },
  deload: { weeks: [], guidance: '', reductionNote: '' },
  rules: [],
  volumeAdjustments: [],
} as unknown as Program;

describe('getPhaseForWeek', () => {
  it('returns the matching phase for an in-range week', () => {
    expect(getPhaseForWeek(program, 3)?.label).toBe('Fase 1 · Volume');
    expect(getPhaseForWeek(program, 9)?.label).toBe('Fase 2 · Força');
  });
  it('returns undefined when the program has no phases', () => {
    const p = { ...program, phases: [] } as Program;
    expect(getPhaseForWeek(p, 1)).toBeUndefined();
  });
  it('returns undefined for out-of-range weeks', () => {
    expect(getPhaseForWeek(program, 0)).toBeUndefined();
    expect(getPhaseForWeek(program, 13)).toBeUndefined();
  });
});
