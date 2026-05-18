import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ExercisePreviewList } from './ExercisePreviewList';

const items = Array.from({ length: 7 }, (_, i) => ({
  id: `e${i}`,
  name: `Exercise ${i}`,
  setsText: '3 séries x 10',
}));

describe('ExercisePreviewList', () => {
  it('shows the first 5 by default and a Ver todos toggle when more exist', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items} href='/session/A/1' />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId('preview-row')).toHaveLength(5);
    expect(screen.getByRole('button', { name: /ver todos/i })).toBeInTheDocument();
  });

  it('expands to show all when Ver todos is pressed', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items} href='/session/A/1' />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /ver todos/i }));
    expect(screen.getAllByTestId('preview-row')).toHaveLength(7);
  });

  it('does not render the toggle when items fit', () => {
    render(
      <MemoryRouter>
        <ExercisePreviewList items={items.slice(0, 3)} href='/session/A/1' />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /ver todos/i })).toBeNull();
  });
});
