import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('shows label, value, unit, delta and sparkline', () => {
    render(<MetricCard label='Peso' value='72.4' unit='kg' delta='-0.6 / 7d' history={[1,2,3]} />);
    expect(screen.getByText('Peso')).toBeInTheDocument();
    expect(screen.getByText('72.4')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('-0.6 / 7d')).toBeInTheDocument();
    expect(screen.getAllByTestId('spark-bar')).toHaveLength(3);
  });
  it('hides sparkline when history is empty', () => {
    render(<MetricCard label='X' value='1' />);
    expect(screen.queryAllByTestId('spark-bar')).toHaveLength(0);
  });
});
