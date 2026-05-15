import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseHero } from './ExerciseHero';

describe('ExerciseHero', () => {
  it('renders name and prescription', () => {
    render(<ExerciseHero name='Remada' prescription='4 × 8 · RIR 2' />);
    expect(screen.getByText('Remada')).toBeInTheDocument();
    expect(screen.getByText(/4 × 8/)).toBeInTheDocument();
  });

  it('renders play link when videoUrl is present', () => {
    render(<ExerciseHero name='Remada' videoUrl='https://x.com/v' />);
    const link = screen.getByRole('link', { name: /vídeo/i });
    expect(link).toHaveAttribute('href', 'https://x.com/v');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('omits play link without videoUrl', () => {
    render(<ExerciseHero name='Remada' />);
    expect(screen.queryByRole('link', { name: /vídeo/i })).toBeNull();
  });

  it('uses 16:9 ratio when ratio="16-9"', () => {
    const { container } = render(<ExerciseHero name='x' ratio='16-9' />);
    expect(container.firstChild).toHaveClass('aspect-[16/9]');
  });
});
