// src/components/redesign/MetricCard.tsx
import { Sparkline } from './Sparkline';

export function MetricCard({
  label,
  value,
  unit,
  delta,
  history,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  history?: number[];
}) {
  return (
    <div className='rounded-card bg-bg-1 p-3'>
      <div className='text-[9px] uppercase tracking-[0.15em] text-txt-faint'>{label}</div>
      <div className='mt-1 text-[22px] font-light leading-none tracking-tight num'>
        {value}
        {unit && <span className='ml-0.5 text-[11px] text-txt-faint'>{unit}</span>}
      </div>
      {delta && <div className='mt-0.5 text-[10px] text-lime'>{delta}</div>}
      {history && history.length > 0 && <Sparkline values={history} className='mt-1.5' />}
    </div>
  );
}
