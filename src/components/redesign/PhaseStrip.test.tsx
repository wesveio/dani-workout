import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhaseStrip } from './PhaseStrip';

describe('PhaseStrip', () => {
  it('renders given number of segments with proper classes', () => {
    render(<PhaseStrip total={12} current={4} />);
    const segs = screen.getAllByTestId('phase-seg');
    expect(segs).toHaveLength(12);
    // 1..3 done, 4 current, 5..12 future
    expect(segs[0]).toHaveClass('bg-lime', 'opacity-40');
    expect(segs[3]).toHaveClass('bg-lime');
    expect(segs[3]).not.toHaveClass('opacity-40');
    expect(segs[11]).toHaveClass('bg-bg-1');
  });
});
