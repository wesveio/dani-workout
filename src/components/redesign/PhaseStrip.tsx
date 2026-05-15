// src/components/redesign/PhaseStrip.tsx
export function PhaseStrip({ total, current }: { total: number; current: number }) {
  return (
    <div className='flex gap-[3px]'>
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const cls =
          idx < current
            ? 'bg-lime opacity-40'
            : idx === current
            ? 'bg-lime'
            : 'bg-bg-1';
        return <div key={i} data-testid='phase-seg' className={`h-1.5 flex-1 rounded-[2px] ${cls}`} />;
      })}
    </div>
  );
}
