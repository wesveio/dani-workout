import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PrimaryCTA } from './PrimaryCTA';

describe('PrimaryCTA', () => {
  it('renders label and triggers onClick', () => {
    const onClick = vi.fn();
    render(<PrimaryCTA label='Iniciar treino' onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /iniciar treino/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as Link when "to" is provided', () => {
    render(
      <MemoryRouter>
        <PrimaryCTA label='Go' to='/session/1' />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /go/i });
    expect(link.getAttribute('href')).toBe('/session/1');
  });
});
