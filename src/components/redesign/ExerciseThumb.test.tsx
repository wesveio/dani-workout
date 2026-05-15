import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseThumb } from './ExerciseThumb';

describe('ExerciseThumb', () => {
  it('renders an img with provided src and alt', () => {
    render(<ExerciseThumb src='/thumbs/sup.webp' alt='Supino' />);
    const img = screen.getByAltText('Supino') as HTMLImageElement;
    expect(img.src).toContain('/thumbs/sup.webp');
  });

  it('renders silhouette fallback when src missing', () => {
    const { container } = render(<ExerciseThumb alt='Sem imagem' />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies tall sizing when size=tall', () => {
    const { container } = render(<ExerciseThumb alt='x' size='tall' />);
    expect(container.firstChild).toHaveClass('h-[54px]');
  });
});
