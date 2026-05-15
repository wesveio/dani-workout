// src/components/redesign/MiniBars.tsx
export function MiniBars({
  values,
  current,
  height = 100,
}: {
  values: number[];
  current?: number;
  height?: number;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className='flex items-end gap-1.5' style={{ height }}>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const isCurrent = i === current;
        const cls = isCurrent
          ? 'bg-lime shadow-[inset_0_0_0_2px_theme(colors.lime),0_0_0_2px_rgba(163,230,53,.2)]'
          : v > 0
          ? 'bg-bg-1'
          : 'bg-bg-1';
        return (
          <div
            key={i}
            data-testid='minibar'
            className={`flex-1 min-h-[6px] rounded-t-[3px] ${cls}`}
            style={{ height: `${Math.max(6, h)}%` }}
          />
        );
      })}
    </div>
  );
}
