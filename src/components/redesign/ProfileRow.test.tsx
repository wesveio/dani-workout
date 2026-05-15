import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileRow } from './ProfileRow';

describe('ProfileRow', () => {
  it('renders name, status, and avatar initial', () => {
    render(<ProfileRow name='Dani' status='Ativo · semana 4' active />);
    expect(screen.getByText('Dani')).toBeInTheDocument();
    expect(screen.getByText(/semana 4/i)).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('fires onSelect on click', () => {
    const onSelect = vi.fn();
    render(<ProfileRow name='Wesley' onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
