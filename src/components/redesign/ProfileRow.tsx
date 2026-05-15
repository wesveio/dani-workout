// src/components/redesign/ProfileRow.tsx
import { Check } from 'lucide-react';

export function ProfileRow({
  name,
  status,
  active,
  onSelect,
}: {
  name: string;
  status?: string;
  active?: boolean;
  onSelect?: () => void;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`mb-1.5 flex w-full items-center gap-3 rounded-card bg-bg-1 p-3 text-left ${
        active ? 'border border-lime' : ''
      }`}
    >
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lime to-[#65a30d] text-[12px] font-semibold text-black'>
        {initial}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm font-medium'>{name}</div>
        {status && (
          <div className='mt-0.5 text-[10px] uppercase tracking-[0.1em] text-txt-faint'>
            {status}
          </div>
        )}
      </div>
      {active && <Check className='h-4 w-4 text-lime' aria-hidden />}
    </button>
  );
}
