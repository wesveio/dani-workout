// src/components/redesign/AderenciaDots.tsx
export type DayState = 'done' | 'miss' | 'none';
const labels = ['S','T','Q','Q','S','S','D'];

export function AderenciaDots({ states }: { states: DayState[] }) {
  return (
    <div className='flex gap-1'>
      {labels.map((l, i) => {
        const s = states[i] ?? 'none';
        const cls =
          s === 'done'
            ? 'bg-lime text-black font-semibold'
            : s === 'miss'
            ? 'bg-bg-2 text-red'
            : 'bg-bg-2 text-txt-faint';
        return (
          <div
            key={i}
            data-testid='aderencia-dot'
            className={`flex h-[22px] w-[22px] items-center justify-center rounded-[5px] text-[9px] ${cls}`}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
}
