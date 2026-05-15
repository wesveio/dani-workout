// src/components/redesign/PrimaryCTA.tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Common = { label: string; className?: string };
type AsButton = Common & { to?: undefined; onClick: () => void };
type AsLink = Common & { to: string; onClick?: undefined };

export function PrimaryCTA(props: AsButton | AsLink) {
  const body = (
    <>
      <span className='text-[15px] font-semibold tracking-tight'>{props.label}</span>
      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-black text-lime'>
        <ArrowRight className='h-4 w-4' aria-hidden />
      </span>
    </>
  );
  const cls =
    'flex items-center justify-between rounded-[14px] bg-lime px-5 py-[18px] text-black active:opacity-90 ' +
    (props.className ?? '');
  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type='button' onClick={props.onClick} className={cls}>
      {body}
    </button>
  );
}
