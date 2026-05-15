import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AderenciaDots } from './AderenciaDots';

describe('AderenciaDots', () => {
  it('renders 7 day cells with letters S T Q Q S S D', () => {
    render(<AderenciaDots states={['done','done','none','done','none','done','none']} />);
    const cells = screen.getAllByTestId('aderencia-dot');
    expect(cells).toHaveLength(7);
    expect(cells.map((c) => c.textContent)).toEqual(['S','T','Q','Q','S','S','D']);
  });

  it('applies done style when state is done', () => {
    render(<AderenciaDots states={['done','none','none','none','none','none','none']} />);
    expect(screen.getAllByTestId('aderencia-dot')[0]).toHaveClass('bg-lime');
  });
});
