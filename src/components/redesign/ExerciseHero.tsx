// src/components/redesign/ExerciseHero.tsx
import { Play } from 'lucide-react';
import { useState } from 'react';
import { ExerciseSilhouette } from './ExerciseSilhouette';

export function ExerciseHero({
  name,
  prescription,
  imageUrl,
  videoUrl,
  ratio = '16-10',
}: {
  name: string;
  prescription?: string;
  imageUrl?: string;
  videoUrl?: string;
  ratio?: '16-9' | '16-10';
}) {
  const [failed, setFailed] = useState(false);
  const showImg = imageUrl && !failed;
  const aspect = ratio === '16-9' ? 'aspect-[16/9]' : 'aspect-[16/10]';

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-hero bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]`}
    >
      {showImg ? (
        <img
          src={imageUrl}
          alt={name}
          className='absolute inset-0 h-full w-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center text-txt-faint'>
          <ExerciseSilhouette className='h-1/2 w-1/2' />
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent' />
      <div className='absolute inset-x-0 bottom-0 flex items-end justify-between p-4'>
        <div className='min-w-0'>
          <div className='truncate text-lg font-medium leading-tight'>{name}</div>
          {prescription && (
            <div className='mt-1 text-[10px] uppercase tracking-[0.15em] text-txt-faint'>
              {prescription}
            </div>
          )}
        </div>
        {videoUrl && (
          <a
            href={videoUrl}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Assistir vídeo de ${name}`}
            className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-lime text-black shadow-[0_4px_20px_rgba(163,230,53,0.3)]'
          >
            <Play className='h-4 w-4 fill-current' aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
