// src/components/redesign/Sparkline.tsx
export function Sparkline({ values, className = '' }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className={`flex h-6 items-end gap-[2px] ${className}`}>
      {values.map((v, i) => {
        const h = max > 0 ? Math.max(8, (v / max) * 100) : 8;
        const last = i === values.length - 1;
        return (
          <div
            key={i}
            data-testid='spark-bar'
            className={`flex-1 rounded-[1px] bg-lime ${last ? 'opacity-100' : 'opacity-60'}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
