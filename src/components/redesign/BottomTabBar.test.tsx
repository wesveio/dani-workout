// src/components/redesign/BottomTabBar.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BottomTabBar } from './BottomTabBar';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomTabBar />
    </MemoryRouter>
  );
}

describe('BottomTabBar', () => {
  it('renders five tabs in order', () => {
    renderAt('/');
    const labels = screen.getAllByRole('link').map((a) => a.textContent);
    expect(labels).toEqual([
      expect.stringContaining('Hoje'),
      expect.stringContaining('Semana'),
      expect.stringContaining('Histórico'),
      expect.stringContaining('Corpo'),
      expect.stringContaining('Mais'),
    ]);
  });

  it('marks the active tab via aria-current=page', () => {
    renderAt('/week');
    const active = screen.getByRole('link', { current: 'page' });
    expect(active).toHaveTextContent(/Semana/);
  });

  it('treats /progress and /exercise as Histórico tab', () => {
    renderAt('/progress');
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(/Histórico/);
  });
});
