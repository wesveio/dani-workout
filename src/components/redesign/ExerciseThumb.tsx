// src/components/redesign/ExerciseThumb.tsx
import { useState } from 'react';
import { ExerciseSilhouette } from './ExerciseSilhouette';

type Size = 'sm' | 'md' | 'tall';
const sizes: Record<Size, string> = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-11 w-11 rounded-thumb',
  tall: 'h-[54px] w-[54px] rounded-[10px]',
};

export function ExerciseThumb({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src?: string;
  alt: string;
  size?: Size;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const cls = `relative overflow-hidden bg-bg-1 ${sizes[size]} ${className}`;
  if (!src || error) {
    return (
      <div className={cls}>
        <ExerciseSilhouette className='h-full w-full' />
      </div>
    );
  }
  return (
    <div className={cls}>
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className='h-full w-full object-cover'
      />
    </div>
  );
}
