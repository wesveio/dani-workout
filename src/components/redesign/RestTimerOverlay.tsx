import { Pause } from 'lucide-react';

function format(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function RestTimerOverlay({
  remaining,
  target,
  onStop,
}: {
  remaining: number | null;
  target: number;
  onStop: () => void;
}) {
  if (remaining === null) return null;
  return (
    <div className='fixed bottom-[88px] left-1/2 z-20 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]'>
      <div className='flex items-center justify-between rounded-[12px] bg-lime px-4 py-3 text-black shadow-[0_6px_24px_rgba(163,230,53,0.25)]'>
        <div>
          <div className='text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70'>
            Descanso
          </div>
          <div className='mt-0.5 text-[24px] font-light tracking-tight'>{format(remaining)}</div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[11px] opacity-70'>{target}s</span>
          <button
            type='button'
            onClick={onStop}
            aria-label='Pausar descanso'
            className='flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black text-lime'
          >
            <Pause className='h-3.5 w-3.5 fill-current' aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
