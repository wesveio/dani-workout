import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MiniBars } from './MiniBars';

describe('MiniBars', () => {
  it('renders one bar per value', () => {
    render(<MiniBars values={[1,2,3]} current={1} />);
    expect(screen.getAllByTestId('minibar')).toHaveLength(3);
  });
  it('highlights current index', () => {
    render(<MiniBars values={[10,20]} current={1} />);
    const bars = screen.getAllByTestId('minibar');
    expect(bars[1]).toHaveClass('bg-lime');
    expect(bars[1].className).toContain('shadow');
  });
});
