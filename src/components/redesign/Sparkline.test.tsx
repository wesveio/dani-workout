import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('renders a bar per value', () => {
    render(<Sparkline values={[1,2,3,4]} />);
    expect(screen.getAllByTestId('spark-bar')).toHaveLength(4);
  });
  it('handles all-zero gracefully (no NaN)', () => {
    const { container } = render(<Sparkline values={[0,0,0]} />);
    expect(container.textContent).not.toContain('NaN');
  });
});
