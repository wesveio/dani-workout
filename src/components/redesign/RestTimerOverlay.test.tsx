import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RestTimerOverlay } from './RestTimerOverlay';

describe('RestTimerOverlay', () => {
  it('renders nothing when remaining is null', () => {
    const { container } = render(<RestTimerOverlay remaining={null} target={90} onStop={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
  it('formats seconds as mm:ss', () => {
    render(<RestTimerOverlay remaining={72} target={90} onStop={() => {}} />);
    expect(screen.getByText('01:12')).toBeInTheDocument();
    expect(screen.getByText('90s')).toBeInTheDocument();
  });
});
