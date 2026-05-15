import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExerciseSilhouette } from './ExerciseSilhouette';

describe('ExerciseSilhouette', () => {
  it('renders an svg with aria-hidden', () => {
    const { container } = render(<ExerciseSilhouette />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
